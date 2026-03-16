import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { apiCache, CACHE_KEYS } from '../utils/apiCache';
import Header from '../components/Header';

export const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCourses, setTotalCourses] = useState(0);
  const [pageSize] = useState(12);

  useEffect(() => {
    fetchPublishedCourses(currentPage);
    setIsInitialLoad(false);
  }, [user?.id, currentPage]);

  const fetchPublishedCourses = async (page = 1) => {
    try {
      setLoading(true);
      const cacheKey = 'published:courses';
      
      // Check cache first
      const cached = apiCache.get(cacheKey);
      if (cached) {
        setCourses(cached.data);
        setCurrentPage(cached.meta?.current_page || page);
        setTotalPages(cached.meta?.last_page || 1);
        setTotalCourses(cached.meta?.total || 0);
        setLoading(false);
        return;
      }

      const response = await axios.get(`${import.meta.env.VITE_API_URL}/courses/published`, {
        params: { page, per_page: pageSize }
      });
      
      if (response.data.success) {
        setCourses(response.data.data);
        setCurrentPage(response.data.meta?.current_page || page);
        setTotalPages(response.data.meta?.last_page || 1);
        setTotalCourses(response.data.meta?.total || 0);
        
        // Cache the response
        apiCache.set(cacheKey, response.data, 15 * 60 * 1000); // 15 min cache
      }
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollCourse = (courseId) => {
    // Navigate to course detail page where student can enroll
    navigate(`/student-course/${courseId}`);
  };

  // Show full-page loading only on initial load
  if (isInitialLoad && loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-blue-50 flex items-center justify-center">
        <p className="text-slate-600 text-lg font-medium">Loading courses...</p>
      </div>
    );
  }

  // Show loading state in course section while fetching
  const showCoursesLoading = loading && courses.length === 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-blue-50">
      <Header user={user} onLogout={logout} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="bg-gradient-to-br from-sky-500 via-sky-600 to-blue-700 rounded-2xl shadow-xl p-10 mb-12 text-white overflow-hidden relative fade-in">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          
          <div className="relative">
            <h2 className="text-5xl font-bold mb-4">Welcome back, {user?.name}! 👋</h2>
            <p className="text-xl opacity-90 font-light">
              Explore and enroll in published courses to start your learning journey
            </p>
          </div>
        </div>

        {/* Courses Section */}
        <div>
          <div className="mb-10">
            <h3 className="text-3xl font-bold text-slate-900 mb-2">Available Courses</h3>
            <p className="text-slate-600">Showing {courses.length} of {totalCourses} course{totalCourses !== 1 ? 's' : ''}</p>
          </div>
          
          {showCoursesLoading ? (
            <div className="text-center py-20 bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200">
              <p className="text-slate-600 text-lg font-medium">Loading courses...</p>
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-20 bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200">
              <svg className="w-20 h-20 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C6.5 6.253 2 10.998 2 17s4.5 10.747 10 10.747c5.5 0 10-4.998 10-10.747S17.5 6.253 12 6.253z" />
              </svg>
              <p className="text-slate-600 text-xl font-medium">No courses available yet.</p>
              <p className="text-slate-500 mt-2">Check back soon for new courses!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.map((course, index) => (
                <button
                  key={course.id}
                  onClick={() => handleEnrollCourse(course.id)}
                  className="group relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-md border border-slate-200 overflow-hidden card-shadow-hover fade-in hover:border-sky-200 text-left cursor-pointer transition-all hover:shadow-lg"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Course Image */}
                  <div className="relative h-48 bg-gradient-to-br from-sky-400 via-sky-500 to-blue-600 flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <svg className="w-24 h-24 text-white/30 group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10.5 1.5H1.5A1.5 1.5 0 0 0 0 3v14a1.5 1.5 0 0 0 1.5 1.5h17a1.5 1.5 0 0 0 1.5-1.5V6.5a1.5 1.5 0 0 0-1.5-1.5H10.5V1.5z"/>
                    </svg>
                  </div>

                  <div className="p-7">
                    {/* Course Title */}
                    <h4 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-sky-600 transition-colors">
                      {course.title}
                    </h4>

                    {/* Course Description */}
                    <p className="text-sm text-slate-600 mb-5 line-clamp-2 leading-relaxed">
                      {course.description || 'No description available'}
                    </p>

                    {/* Publisher */}
                    <p className="text-sm text-slate-500 mb-4">
                      By <span className="font-semibold text-slate-700">{course.teacher?.name || 'Unknown'}</span>
                    </p>

                    {/* Course Stats */}
                    <div className="flex items-center gap-6 text-sm text-slate-600 mb-6 pb-6 border-b border-slate-200">
                      <span className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-sky-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10.5 1.5H1.5A1.5 1.5 0 0 0 0 3v14a1.5 1.5 0 0 0 1.5 1.5h17a1.5 1.5 0 0 0 1.5-1.5V6.5a1.5 1.5 0 0 0-1.5-1.5H10.5V1.5z"/>
                        </svg>
                        <span className="font-semibold">{course.chapters_count || 0} chapters</span>
                      </span>
                      <span className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM0 16.68a6 6 0 0112 0M12.5 16.5h.01M20 16v-2a6 6 0 00-6-6H8a6 6 0 00-6 6v2h18z"/>
                        </svg>
                        <span className="font-semibold">{course.students_count || 0} students</span>
                      </span>
                    </div>

                    {/* Status Badge */}
                    <div className="mb-5">
                      <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold ${
                        course.status === 'Published'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        <span className={`w-2 h-2 rounded-full ${course.status === 'Published' ? 'bg-green-600' : 'bg-amber-600'}`}></span>
                        {course.status}
                      </span>
                    </div>

                    {/* Enroll Button */}
                    <div className="w-full btn-primary flex items-center justify-center gap-2 py-2.5 font-semibold bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-lg hover:from-sky-600 hover:to-blue-700">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                      View Course Details
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-12 flex items-center justify-between border-t border-slate-200 pt-8">
              <div className="text-sm text-slate-600">
                Showing page <span className="font-semibold">{currentPage}</span> of <span className="font-semibold">{totalPages}</span> ({totalCourses} total courses)
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg bg-slate-100 text-slate-900 font-semibold hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  ← Previous
                </button>
                
                <div className="flex gap-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                    if (pageNum > totalPages) return null;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-2 rounded-lg font-semibold transition-colors ${
                          pageNum === currentPage
                            ? 'bg-sky-500 text-white'
                            : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-lg bg-slate-100 text-slate-900 font-semibold hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
