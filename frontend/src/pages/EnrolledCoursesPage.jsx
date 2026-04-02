import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmContext';
import { apiCache, CACHE_KEYS } from '../utils/apiCache';
import Header from '../components/Header';

export const EnrolledCoursesPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { error: showError, success: showSuccess } = useToast();
  const { showConfirm } = useConfirm();
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCourses, setTotalCourses] = useState(0);
  const [pageSize] = useState(12);
  const [unenrollingId, setUnenrollingId] = useState(null);

  // Fetch enrolled courses
  const fetchEnrolledCourses = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const cacheKey = `enrolled:courses:page:${page}`;

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

      const response = await axios.get(`${import.meta.env.VITE_API_URL}/enrollments/my-courses`, {
        params: { page, per_page: pageSize }
      });

      if (response.data.success) {
        setCourses(response.data.data);
        setCurrentPage(response.data.meta?.current_page || page);
        setTotalPages(response.data.meta?.last_page || 1);
        setTotalCourses(response.data.meta?.total || 0);

        // Cache the response
        apiCache.set(cacheKey, response.data, 10 * 60 * 1000);
      }
    } catch (error) {
      console.error('Failed to fetch enrolled courses:', error);
      showError('Failed to load enrolled courses');
    } finally {
      setLoading(false);
    }
  }, [pageSize, showError]);

  useEffect(() => {
    fetchEnrolledCourses(currentPage);
  }, [currentPage, fetchEnrolledCourses]);

  // Filter courses based on search query
  useEffect(() => {
    let filtered = courses;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(query) ||
        course.description.toLowerCase().includes(query) ||
        course.level.toLowerCase().includes(query) ||
        (course.teacher?.name && course.teacher.name.toLowerCase().includes(query))
      );
    }

    setFilteredCourses(filtered);
  }, [courses, searchQuery]);

  const handleCourseClick = (courseId) => {
    navigate(`/student-course/${courseId}`, { state: { isEnrolled: true } });
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setCurrentPage(1);
  };

  const handleUnenroll = async (courseId, courseTitle) => {
    const confirmed = await showConfirm({
      title: 'Unenroll from Course',
      message: `Are you sure you want to unenroll from "${courseTitle}"? Your progress will be deleted.`,
      confirmText: 'Unenroll',
      cancelText: 'Cancel',
      isDangerous: true
    });

    if (confirmed) {
      try {
        setUnenrollingId(courseId);
        
        // Optimistic update: Remove course from both arrays immediately
        const updatedCourses = courses.filter(course => course.id !== courseId);
        const updatedFilteredCourses = filteredCourses.filter(course => course.id !== courseId);
        
        setCourses(updatedCourses);
        setFilteredCourses(updatedFilteredCourses);
        setTotalCourses(Math.max(0, totalCourses - 1));
        
        // Call API to unenroll
        await axios.delete(`${import.meta.env.VITE_API_URL}/courses/${courseId}/unenroll`);
        
        // Clear all course caches to ensure sync
        apiCache.clearPattern('enrolled:courses');
        apiCache.clearPattern('all:courses');
        
        showSuccess('Successfully unenrolled from the course');
      } catch (error) {
        console.error('Failed to unenroll:', error);
        // Refetch to restore the course if unenroll failed
        fetchEnrolledCourses(currentPage);
        showError('Failed to unenroll from course');
      } finally {
        setUnenrollingId(null);
      }
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-blue-50 flex items-center justify-center">
        <p className="text-slate-600 text-lg font-medium">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-blue-50">
      <Header user={user} onLogout={logout} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="mb-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">My Courses</h1>
            <button
              onClick={() => navigate('/student-dashboard')}
              className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-slate-200 text-slate-900 rounded-lg font-medium hover:bg-slate-300 transition-colors text-sm sm:text-base"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </button>
          </div>
          <p className="text-lg text-slate-600 mb-8">
            You are enrolled in {totalCourses} course{totalCourses !== 1 ? 's' : ''}
          </p>

          {/* Search Bar */}
          <div className="flex gap-2 mb-6">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search by course title, description, level, or instructor..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-full px-4 py-3 pl-10 pr-12 rounded-lg border border-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent shadow-sm hover:border-sky-300 transition-colors"
              />
              <svg className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {searchQuery && (
            <p className="text-sm text-slate-500">
              Showing {filteredCourses.length} result{filteredCourses.length !== 1 ? 's' : ''} for "{searchQuery}"
            </p>
          )}
        </div>

        {/* Loading State */}
        {loading && courses.length === 0 && (
          <div className="flex items-center justify-center min-h-64">
            <p className="text-slate-600 text-lg font-medium">Loading your courses...</p>
          </div>
        )}

        {/* No Enrolled Courses */}
        {!loading && courses.length === 0 && (
          <div className="text-center py-16">
            <svg className="w-16 h-16 mx-auto text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C6.5 6.253 2 10.998 2 17s4.5 10.747 10 10.747c5.5 0 10-4.998 10-10.747S17.5 6.253 12 6.253z" />
            </svg>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No enrolled courses yet</h3>
            <p className="text-slate-600 mb-6">Start your learning journey by exploring available courses</p>
            <button
              onClick={() => navigate('/all-courses')}
              className="px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition-shadow font-medium"
            >
              Explore Courses
            </button>
          </div>
        )}

        {/* Search No Results */}
        {!loading && courses.length > 0 && filteredCourses.length === 0 && searchQuery && (
          <div className="text-center py-16">
            <svg className="w-16 h-16 mx-auto text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No courses found</h3>
            <p className="text-slate-600 mb-6">Try adjusting your search terms</p>
            <button
              onClick={handleClearSearch}
              className="px-6 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors font-medium"
            >
              Clear Search
            </button>
          </div>
        )}

        {/* Courses Grid */}
        {!loading && filteredCourses.filter(course => course.id !== unenrollingId).length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {filteredCourses.filter(course => course.id !== unenrollingId).map((course) => (
                <div
                  key={course.id}
                  className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden fade-in"
                >
                  {/* Card Header */}
                  <div className="bg-gradient-to-r from-sky-500 to-blue-600 h-32 relative overflow-hidden cursor-pointer" onClick={() => handleCourseClick(course.id)}>
                    <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
                    <div className="absolute top-3 right-3 bg-white/20 backdrop-blur px-3 py-1 rounded-full text-white text-xs font-semibold">
                      {course.level}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6">
                    <h3
                      onClick={() => handleCourseClick(course.id)}
                      className="text-lg font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-sky-600 transition-colors cursor-pointer"
                    >
                      {course.title}
                    </h3>

                    <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                      {course.description || 'No description available'}
                    </p>

                    {/* Course Info */}
                    <div className="flex items-center justify-between mb-4 text-sm text-slate-500">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3z" />
                        </svg>
                        <span>{course.students_count || 0} students</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
                        </svg>
                        <span>{course.chapters_count || 0} chapters</span>
                      </div>
                    </div>

                    {/* Teacher Info */}
                    {course.teacher && (
                      <div className="pt-4 border-t border-slate-200">
                        <p className="text-xs text-slate-500 mb-2">By</p>
                        <p className="text-sm font-medium text-slate-900">{course.teacher.name}</p>
                      </div>
                    )}
                  </div>

                  {/* Card Footer */}
                  <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex gap-2">
                    <button
                      onClick={() => handleCourseClick(course.id)}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg transition-shadow"
                    >
                      Continue Learning
                    </button>
                    
                      
                  
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg border border-sky-300 text-sky-600 hover:bg-sky-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  Previous
                </button>

                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                        page === currentPage
                          ? 'bg-sky-500 text-white'
                          : 'border border-sky-300 text-sky-600 hover:bg-sky-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-lg border border-sky-300 text-sky-600 hover:bg-sky-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default EnrolledCoursesPage;
