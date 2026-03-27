import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmContext';
import { apiCache, CACHE_KEYS } from '../utils/apiCache';
import Header from '../components/Header';

export const StudentCourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { success, error, info } = useToast();
  const { showConfirm } = useConfirm();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(location.state?.isEnrolled ?? false);
  const [enrolling, setEnrolling] = useState(false);
  const [unenrolling, setUnenrolling] = useState(false);
  const [hasStartedLearning, setHasStartedLearning] = useState(false);
  const [completedLessonsCount, setCompletedLessonsCount] = useState(0);
  const [totalLessonsCount, setTotalLessonsCount] = useState(0);

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
    } catch (err) {
      console.error('Failed to fetch course:', err);
      error('Failed to load course');
      navigate('/student-dashboard');
    } finally {
      setLoading(false);
    }
  }, [courseId, navigate, error]);

  const checkEnrollmentStatus = useCallback(async () => {
    if (!user) return;
    
    try {
      // Always call API to get fresh enrollment status
      // Don't rely on localStorage as it can become stale
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/courses/${courseId}/check-enrollment`
      );
      setIsEnrolled(response.data.enrolled);
      // Update localStorage with fresh status
      if (response.data.enrolled) {
        localStorage.setItem(`course_${courseId}_enrolled`, 'true');
      } else {
        // Clear the enrolled flag if user is not enrolled
        localStorage.removeItem(`course_${courseId}_enrolled`);
      }
    } catch (error) {
      console.error('Failed to check enrollment status:', error);
    }
  }, [courseId, user]);

  const fetchStudentProgress = useCallback(async () => {
    try {
      console.log('Fetching student progress for course:', courseId);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/courses/${courseId}/progress`
      );
      console.log('Progress response:', response.data);
      if (response.data.success) {
        setCompletedLessonsCount(response.data.data.completed_lessons);
        setTotalLessonsCount(response.data.data.total_lessons);
        console.log('Updated progress - Completed:', response.data.data.completed_lessons, 'Total:', response.data.data.total_lessons);
      }
    } catch (error) {
      console.error('Failed to fetch progress:', error);
      // Fall back to localStorage calculation
    }
  }, [courseId]);

  useEffect(() => {
    fetchCourseDetails();
    
    // Always verify enrollment status with API on component mount/courseId change
    // Don't use stale localStorage data - get fresh status from server
    checkEnrollmentStatus();
    
    // Fetch student progress from backend
    if (user) {
      fetchStudentProgress();
    }
    
    // Check if user has started learning from localStorage
    const started = localStorage.getItem(`course_${courseId}_started`);
    setHasStartedLearning(!!started);

    // Refresh progress when window regains focus (user returns from lesson)
    const handleFocus = () => {
      if (user) {
        fetchStudentProgress();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchCourseDetails, checkEnrollmentStatus, courseId, user, fetchStudentProgress]);

  const handleEnroll = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      setEnrolling(true);
      // axios already has authorization header set from AuthContext
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/courses/${courseId}/enroll`
      );

      if (response.data.success) {
        setIsEnrolled(true);
        // Store enrollment status in localStorage to prevent flash on page reload
        localStorage.setItem(`course_${courseId}_enrolled`, 'true');
        // Update course students count
        if (course) {
          setCourse({
            ...course,
            students_count: (course.students_count || 0) + 1
          });
        }
        // Refresh progress data
        await fetchStudentProgress();
        success('Successfully enrolled in the course!');
        // Clear caches to ensure fresh data on My Courses page
        apiCache.clear(`student:course:${courseId}`);
        apiCache.clearPattern('enrolled:courses');
        apiCache.clearPattern('all:courses');
      }
    } catch (err) {
      console.error('Failed to enroll:', err);
      if (err.response?.status === 409) {
        // Already enrolled
        setIsEnrolled(true);
        info('You are already enrolled in this course');
      } else if (err.response?.data?.message) {
        error(`Error: ${err.response.data.message}`);
      } else if (err.response?.status === 401) {
        error('Session expired. Please login again.');
        navigate('/login');
      } else if (err.message === 'Network Error') {
        error('Network error. Please check your connection and try again.');
      } else {
        error('Failed to enroll. Please try again.');
      }
    } finally {
      setEnrolling(false);
    }
  };

  const handleUnenroll = async () => {
    const confirmed = await showConfirm({
      title: 'Unenroll from Course',
      message: 'Are you sure you want to unenroll from this course? All your progress will be removed.',
      confirmText: 'Unenroll',
      cancelText: 'Cancel',
      isDangerous: true
    });

    if (!confirmed) {
      return;
    }

    try {
      setUnenrolling(true);
      // axios already has authorization header set from AuthContext
      const response = await axios.delete(
        `${import.meta.env.VITE_API_URL}/courses/${courseId}/unenroll`
      );

      if (response.data.success) {
        setIsEnrolled(false);
        
        // Clear all progress data from localStorage
        localStorage.removeItem(`course_${courseId}_enrolled`);
        localStorage.removeItem(`course_${courseId}_completed_lessons`);
        localStorage.removeItem(`course_${courseId}_started`);
        
        // Reset progress counters
        setCompletedLessonsCount(0);
        setTotalLessonsCount(0);
        setHasStartedLearning(false);
        
        // Update course students count
        if (course) {
          setCourse({
            ...course,
            students_count: Math.max(0, (course.students_count || 1) - 1)
          });
        }
        
        success('Successfully unenrolled from the course');
        
        // Clear caches to ensure fresh data on My Courses and All Courses pages
        apiCache.clear(`student:course:${courseId}`);
        apiCache.clearPattern('enrolled:courses');
        apiCache.clearPattern('all:courses');
      }
    } catch (err) {
      console.error('Failed to unenroll:', err);
      if (err.response?.status === 404) {
        setIsEnrolled(false);
        error('You are not enrolled in this course');
      } else if (err.response?.data?.message) {
        error(`Error: ${err.response.data.message}`);
      } else if (err.response?.status === 401) {
        error('Session expired. Please login again.');
        navigate('/login');
      } else {
        error('Failed to unenroll. Please try again.');
      }
    } finally {
      setUnenrolling(false);
    }
  };

  const getCompletedLessons = () => {
    const completed = localStorage.getItem(`course_${courseId}_completed_lessons`);
    return completed ? JSON.parse(completed) : [];
  };

  const getNextIncompleteLesson = () => {
    const completedLessons = getCompletedLessons();
    
    if (!course || !course.chapters || course.chapters.length === 0) {
      return null;
    }

    // Loop through all chapters and lessons to find first incomplete lesson
    for (let chapter of course.chapters) {
      if (chapter.lessons && chapter.lessons.length > 0) {
        for (let lesson of chapter.lessons) {
          if (!completedLessons.includes(lesson.id)) {
            return { chapter, lesson };
          }
        }
      }
    }
    
    return null; // All lessons completed
  };

  const getProgressPercentage = () => {
    if (!course || !course.chapters || course.chapters.length === 0) {
      return 0;
    }

    // If we have API data, use that
    if (totalLessonsCount > 0) {
      return Math.round((completedLessonsCount / totalLessonsCount) * 100);
    }

    // Fall back to localStorage calculation
    let totalLessons = 0;
    for (let chapter of course.chapters) {
      if (chapter.lessons && chapter.lessons.length > 0) {
        totalLessons += chapter.lessons.length;
      }
    }

    if (totalLessons === 0) return 0;

    const completedLessons = getCompletedLessons();
    return Math.round((completedLessons.length / totalLessons) * 100);
  };

  const handleStartLearning = () => {
    const nextLesson = getNextIncompleteLesson();
    
    if (!nextLesson) {
      success('All lessons completed! Great job!');
      return;
    }

    // Mark course as started
    localStorage.setItem(`course_${courseId}_started`, 'true');
    setHasStartedLearning(true);
    navigate(`/course/${courseId}/chapter/${nextLesson.chapter.id}/lesson/${nextLesson.lesson.id}`);
  };

  const handleLessonClick = (chapterId, lessonId, isCompleted) => {
    // Only allow clicking completed lessons
    if (!isCompleted) return;
    navigate(`/course/${courseId}/chapter/${chapterId}/lesson/${lessonId}`);
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
        Back to Dashboard
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
            <div className="mb-8 pb-8 border-b border-slate-200">
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

            {/* Course Structure - Chapters & Lessons */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-slate-900 mb-6">Course Structure</h3>
              {course.chapters && course.chapters.length > 0 ? (
                <div className="space-y-4">
                  {course.chapters.map((chapter, chapterIdx) => (
                    <div key={chapter.id} className="bg-gradient-to-r from-sky-50 to-blue-50 rounded-lg border border-sky-200 overflow-hidden">
                      <div className="p-4 bg-sky-100 border-b border-sky-200">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-full bg-sky-600 text-white flex items-center justify-center text-sm font-bold">{chapterIdx + 1}</span>
                          <h4 className="text-lg font-bold text-slate-900">{chapter.name || chapter.title || `Chapter ${chapterIdx + 1}`}</h4>
                          {chapter.lessons && chapter.lessons.length > 0 && (
                            <span className="ml-auto text-xs font-semibold text-sky-700 bg-white px-3 py-1 rounded-full">
                              {chapter.lessons.length} lesson{chapter.lessons.length !== 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {chapter.lessons && chapter.lessons.length > 0 && (
                        <div className="p-4 space-y-2">
                          {chapter.lessons.map((lesson, lessonIdx) => {
                            const isCompleted = getCompletedLessons().includes(lesson.id);
                            return (
                              <button
                                key={lesson.id}
                                onClick={() => handleLessonClick(chapter.id, lesson.id, isCompleted)}
                                disabled={!isCompleted}
                                className={`w-full text-left flex items-start gap-3 p-3 rounded transition ${
                                  isCompleted
                                    ? 'hover:bg-green-100 cursor-pointer'
                                    : 'cursor-not-allowed opacity-50 bg-gray-50'
                                } ${isCompleted ? 'bg-green-50' : ''}`}
                              >
                                <span className={`font-bold flex-shrink-0 mt-1 ${
                                  isCompleted ? 'text-green-600' : 'text-gray-400'
                                }`}>
                                  {isCompleted ? '✓' : '🔒'}
                                </span>
                                <div className="flex-1 min-w-0">
                                  <p className={`font-medium text-sm ${
                                    isCompleted ? 'text-green-900 line-through' : 'text-gray-500'
                                  }`}>
                                    {lesson.title || `Lesson ${lessonIdx + 1}`}
                                  </p>
                                  {lesson.duration && <p className={`text-xs mt-1 ${isCompleted ? 'text-slate-600' : 'text-gray-400'}`}>{lesson.duration}</p>}
                                  {!isCompleted && <p className="text-xs text-gray-500 mt-1 italic">Complete previous lessons to unlock</p>}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-600 italic">No course structure available yet.</p>
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
                <div className="mb-6 space-y-3">
                  <div className="p-3 bg-green-100 rounded-lg border border-green-300">
                    <p className="text-sm font-semibold text-green-800 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="green" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      You are enrolled ✓
                    </p>
                  </div>

                  {/* Progress Bar */}
                  <div className="p-4 bg-gradient-to-br from-sky-50 to-blue-50 rounded-lg border border-sky-200">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold text-slate-900">Course Progress</p>
                      <p className="text-sm font-bold text-sky-600">{getProgressPercentage()}%</p>
                    </div>
                    <div className="w-full bg-sky-200 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-sky-500 to-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${getProgressPercentage()}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-slate-600 mt-2">
                      {getCompletedLessons().length} of {course.chapters?.reduce((total, ch) => total + (ch.lessons?.length || 0), 0)} lessons completed
                    </p>
                  </div>
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
                <div className="space-y-3">
                  <button
                    onClick={handleStartLearning}
                    className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg hover:from-green-600 hover:to-emerald-700 transition flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {hasStartedLearning ? 'Continue Learning' : 'Start Learning'}
                  </button>

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
                </div>
              )}

            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
