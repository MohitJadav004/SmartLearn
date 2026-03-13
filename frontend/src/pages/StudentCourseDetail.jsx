import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { apiCache, CACHE_KEYS } from '../utils/apiCache';
import Header from '../components/Header';

export const StudentCourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [unenrolling, setUnenrolling] = useState(false);

  const fetchCourseDetails = useCallback(async () => {
    try {
      setLoading(true);
      const cacheKey = `student:course:${courseId}`;
      
      // Check cache first
      const cached = apiCache.get(cacheKey);
      if (cached) {
        setCourse(cached.data);
        setLoading(false);
        return;
      }

      // Fetch from API if not cached
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/courses/${courseId}`);
      
      if (response.data.data) {
        setCourse(response.data.data);
        apiCache.set(cacheKey, response.data, 10 * 60 * 1000);
      }
    } catch (error) {
      console.error('Failed to fetch course:', error);
      alert('Failed to load course');
      navigate('/student-dashboard');
    } finally {
      setLoading(false);
    }
  }, [courseId, navigate]);

  const checkEnrollmentStatus = useCallback(async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/courses/${courseId}/check-enrollment`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      setIsEnrolled(response.data.enrolled);
    } catch (error) {
      console.error('Failed to check enrollment status:', error);
    }
  }, [courseId]);

  useEffect(() => {
    fetchCourseDetails();
    checkEnrollmentStatus();
  }, [fetchCourseDetails, checkEnrollmentStatus]);

  const handleEnroll = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      setEnrolling(true);
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/courses/${courseId}/enroll`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.data.success) {
        setIsEnrolled(true);
        // Update course students count
        if (course) {
          setCourse({
            ...course,
            students_count: (course.students_count || 0) + 1
          });
        }
        alert('Successfully enrolled in the course!');
        // Clear cache
        apiCache.clear(`student:course:${courseId}`);
      }
    } catch (error) {
      console.error('Failed to enroll:', error);
      if (error.response?.status === 409) {
        alert('You are already enrolled in this course');
        setIsEnrolled(true);
      } else {
        alert('Failed to enroll. Please try again.');
      }
    } finally {
      setEnrolling(false);
    }
  };

  const handleUnenroll = async () => {
    if (!window.confirm('Are you sure you want to unenroll from this course?')) {
      return;
    }

    try {
      setUnenrolling(true);
      const response = await axios.delete(
        `${import.meta.env.VITE_API_URL}/courses/${courseId}/unenroll`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.data.success) {
        setIsEnrolled(false);
        // Update course students count
        if (course) {
          setCourse({
            ...course,
            students_count: Math.max(0, (course.students_count || 1) - 1)
          });
        }
        alert('Successfully unenrolled from the course');
        apiCache.clear(`student:course:${courseId}`);
      }
    } catch (error) {
      console.error('Failed to unenroll:', error);
      alert('Failed to unenroll. Please try again.');
    } finally {
      setUnenrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-blue-50 flex items-center justify-center">
        <p className="text-slate-600 text-lg font-medium">Loading course details...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-blue-50">
        <Header user={user} onLogout={logout} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <p className="text-slate-600 text-lg font-medium">Course not found</p>
            <button
              onClick={() => navigate('/student-dashboard')}
              className="mt-4 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-blue-50">
      <Header user={user} onLogout={logout} />

      {/* Back Button */}
      <button
        onClick={() => navigate('/student-dashboard')}
        className="w-full text-left px-6 py-4 font-semibold inline-flex items-center gap-2 transition text-sky-600 hover:text-sky-700 hover:bg-sky-50"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Courses
      </button>

      {/* Title Section */}
      <div className="border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h2 className="text-4xl font-bold text-slate-900">{course.title}</h2>
          <p className="text-slate-600 mt-2">By {course.teacher?.name || 'Unknown Instructor'}</p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2">
            {/* Course Status */}
            <div className="mb-8">
              <div className="flex items-center gap-4">
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                  course.status === 'Published'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {course.status}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="mb-8 pb-8 border-b border-slate-200">
              <h3 className="text-2xl font-bold text-slate-900 mb-4">About This Course</h3>
              <p className="text-slate-700 leading-relaxed text-lg">
                {course.description || 'No description available'}
              </p>
            </div>

            {/* What You Will Learn */}
            <div className="mb-8 pb-8 border-b border-slate-200">
              <h3 className="text-2xl font-bold text-slate-900 mb-4">What You Will Learn</h3>
              {course.what_you_will_learn ? (
                <ul className="space-y-3">
                  {course.what_you_will_learn.split('\n').filter(item => item.trim()).map((item, index) => (
                    <li key={index} className="flex gap-3 text-slate-700">
                      <span className="text-sky-600 font-bold flex-shrink-0">✓</span>
                      <span>{item.trim()}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-slate-600 italic">No learning outcomes defined.</p>
              )}
            </div>

            {/* Requirements */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Requirements</h3>
              {course.requirements ? (
                <ul className="space-y-3">
                  {course.requirements.split('\n').filter(item => item.trim()).map((item, index) => (
                    <li key={index} className="flex gap-3 text-slate-700">
                      <span className="text-sky-600 font-bold flex-shrink-0">•</span>
                      <span>{item.trim()}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-slate-600 italic">No requirements specified.</p>
              )}
            </div>
          </div>

          {/* Right Column - Enrollment Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6 border border-slate-200">
              {/* Course Stats */}
              <div className="mb-6 pb-6 border-b border-slate-200">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase">Students</p>
                    <p className="text-2xl font-bold text-slate-900">{course.students_count || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase">Level</p>
                    <p className="text-sm font-semibold text-slate-900 capitalize">{course.level || 'All'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase">Chapters</p>
                    <p className="text-2xl font-bold text-slate-900">{course.chapters_count || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase">Language</p>
                    <p className="text-sm font-semibold text-slate-900">{course.language || 'English'}</p>
                  </div>
                </div>
              </div>

              {/* Enrollment Status Badge */}
              {isEnrolled && (
                <div className="mb-4 p-3 bg-green-100 rounded-lg border border-green-300">
                  <p className="text-sm font-semibold text-green-800 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="green" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    You are enrolled
                  </p>
                </div>
              )}

              {/* Enrollment Button */}
              {!isEnrolled ? (
                <button
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className="w-full py-3 px-4 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold rounded-lg hover:from-sky-600 hover:to-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {enrolling ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Enrolling...
                    </div>
                  ) : (
                    'Enroll Now'
                  )}
                </button>
              ) : (
                <button
                  onClick={handleUnenroll}
                  disabled={unenrolling}
                  className="w-full py-3 px-4 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {unenrolling ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Unenrolling...
                    </div>
                  ) : (
                    'Unenroll'
                  )}
                </button>
              )}

              {/* Continue Learning Button */}
              {isEnrolled && (
                <button
                  onClick={() => navigate(`/lesson/${course.id}`)}
                  className="w-full mt-3 py-3 px-4 bg-slate-200 text-slate-900 font-bold rounded-lg hover:bg-slate-300 transition"
                >
                  Continue Learning
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
