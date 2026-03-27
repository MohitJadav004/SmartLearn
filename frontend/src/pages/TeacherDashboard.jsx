import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmContext';
import { apiCache, CACHE_KEYS } from '../utils/apiCache';
import Header from '../components/Header';
import CreateCourseModal from '../components/CreateCourseModal';

export const TeacherDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  const { showConfirm } = useConfirm();
  const [courses, setCourses] = useState([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [studentsModal, setStudentsModal] = useState({ isOpen: false, courseId: null, courseName: '', students: [], loading: false, courseData: null });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCourses, setTotalCourses] = useState(0);
  const [pageSize] = useState(10);

  useEffect(() => {
    fetchCourses(currentPage);
    setIsInitialLoad(false);
  }, [user?.id, currentPage]);

  const fetchCourses = async (page = 1) => {
    try {
      setLoading(true);
      const cacheKey = CACHE_KEYS.COURSES_LIST(user?.id);
      
      // check cache first
      const cached = apiCache.get(cacheKey);
      if (cached) {
        setCourses(cached.data);
        setCurrentPage(cached.meta?.current_page || page);
        setTotalPages(cached.meta?.last_page || 1);
        setTotalCourses(cached.meta?.total || 0);
        setLoading(false);
        return;
      }

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/courses`,
        { params: { page, per_page: pageSize } }
      );
      
      if (response.data.success) {
        setCourses(response.data.data);
        setCurrentPage(response.data.meta?.current_page || page);
        setTotalPages(response.data.meta?.last_page || 1);
        setTotalCourses(response.data.meta?.total || 0);
        
        // Cache the response
        apiCache.set(cacheKey, response.data);
      }
    } catch (err) {
      console.error('Failed to fetch courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCourseCreated = (newCourse) => {
    // Clear cache and refresh
    apiCache.clearPattern('courses:');
    setCurrentPage(1);
    fetchCourses(1);
  };

  const handleDeleteCourse = async (courseId) => {
    const confirmed = await showConfirm({
      title: 'Delete Course',
      message: 'Are you sure you want to delete this course? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      isDangerous: true
    });

    if (confirmed) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/courses/${courseId}`);
        // Clear cache and refresh
        apiCache.clearPattern('courses:');
        apiCache.clear(CACHE_KEYS.COURSE(courseId));
        fetchCourses(currentPage);
        success('Course deleted successfully');
      } catch (err) {
        console.error('Failed to delete course:', err);
        showError('Failed to delete course');
      }
    }
  };

  const handlePublishCourse = async (courseId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'Published' ? 'Draft' : 'Published';
      await axios.put(`${import.meta.env.VITE_API_URL}/courses/${courseId}`, {
        status: newStatus
      });
      // Clear cache and refresh
      apiCache.clearPattern('courses:');
      apiCache.clear(CACHE_KEYS.COURSE(courseId));
      fetchCourses(currentPage);
      success(`Course ${newStatus === 'Published' ? 'published' : 'unpublished'} successfully`);
    } catch (err) {
      console.error('Failed to update course status:', err);
      showError('Failed to update course status');
    }
  };

  const handleViewStudents = async (courseId, courseName) => {
    try {
      setStudentsModal({ ...studentsModal, courseId, courseName, loading: true, isOpen: true, courseData: null });
      
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/courses/${courseId}/students`,
        { params: { per_page: 100 } }
      );

      // Also fetch course data to get chapter/lesson info
      const courseResponse = await axios.get(
        `${import.meta.env.VITE_API_URL}/courses/${courseId}`
      );

      if (response.data.success) {
        setStudentsModal({
          isOpen: true,
          courseId,
          courseName,
          students: response.data.data,
          loading: false,
          courseData: courseResponse.data.data
        });
      }
    } catch (error) {
      console.error('Failed to fetch students:', error);
      showError('Failed to load enrolled students');
      setStudentsModal({ ...studentsModal, isOpen: false });
    }
  };

  const getStudentProgress = (student) => {
    if (!studentsModal.courseData || !studentsModal.courseData.chapters) {
      return 0;
    }

    // Calculate total lessons in course
    let totalLessons = 0;
    for (let chapter of studentsModal.courseData.chapters) {
      if (chapter.lessons && chapter.lessons.length > 0) {
        totalLessons += chapter.lessons.length;
      }
    }

    if (totalLessons === 0) return 0;

    // Get completed lessons from student data if available
    // This will be enhanced once backend tracks student progress
    const completedLessons = student.completed_lessons_count || 0;
    return Math.round((completedLessons / totalLessons) * 100);
  };

  // Show full-page loading only on initial load
  if (isInitialLoad && loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50 flex items-center justify-center">
        <p className="text-slate-600 text-lg font-medium">Loading courses...</p>
      </div>
    );
  }

  // Show loading state in course section while fetching
  const showCoursesLoading = loading && courses.length === 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50">
      <Header user={user} onLogout={logout} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 rounded-2xl shadow-xl p-10 mb-12 text-white overflow-hidden relative fade-in">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          
          <div className="relative">
            <h2 className="text-5xl font-bold mb-4">Welcome, {user?.name}! 👨‍🏫</h2>
            <p className="text-xl opacity-90 font-light">
              Manage your courses and track student progress
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Total Courses Card */}
          <div className="group relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-md border border-slate-200 p-6 hover:border-emerald-200 card-shadow-hover transition-all">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                📚
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Total Courses</p>
                <p className="text-3xl font-bold text-slate-900">{courses.length}</p>
              </div>
            </div>
          </div>

          {/* Total Students Card */}
          <div className="group relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-md border border-slate-200 p-6 hover:border-sky-200 card-shadow-hover transition-all">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-sky-400 to-blue-500 text-white flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                👥
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Total Students</p>
                <p className="text-3xl font-bold text-slate-900">
                  {courses.reduce((sum, course) => sum + (course.students_count || 0), 0)}
                </p>
              </div>
            </div>
          </div>

          {/* Published Courses Card */}
          <div className="group relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-md border border-slate-200 p-6 hover:border-purple-200 card-shadow-hover transition-all">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 text-white flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                ✅
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Published Courses</p>
                <p className="text-3xl font-bold text-slate-900">
                  {courses.filter((c) => c.status === 'Published').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Create Course Button */}
        <div className="mb-12 flex gap-4">
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary py-3 px-8 inline-flex items-center gap-2 text-lg font-semibold"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create New Course
          </button>
        </div>

        {/* Courses Section */}
        <div>
          <div className="mb-10">
            <h3 className="text-3xl font-bold text-slate-900 mb-2">My Courses</h3>
            <p className="text-slate-600">Manage and track all your courses</p>
          </div>
          
          {showCoursesLoading ? (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200 p-12 text-center">
              <p className="text-slate-600 text-lg font-medium">Loading courses...</p>
            </div>
          ) : courses.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200 p-12 text-center">
              <svg className="w-20 h-20 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C6.5 6.253 2 10.998 2 17s4.5 10.747 10 10.747c5.5 0 10-4.998 10-10.747S17.5 6.253 12 6.253z" />
              </svg>
              <p className="text-slate-600 text-xl font-medium mb-4">No courses yet.</p>
              <p className="text-slate-500 mb-6">Create your first course to get started!</p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="btn-primary py-3 px-8 inline-flex items-center gap-2 font-semibold"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Your First Course
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course, index) => (
                <div 
                  key={course.id} 
                  className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-md border border-slate-200 overflow-hidden hover:border-emerald-200 card-shadow-hover fade-in transition-all flex flex-col"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="p-6 flex-1 flex flex-col">
                    <h4 className="text-xl font-bold text-slate-900 mb-2 hover:text-emerald-600 transition-colors line-clamp-2">{course.title}</h4>
                    <p className="text-slate-600 text-sm mb-4 leading-relaxed line-clamp-2 flex-1">{course.description}</p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 mb-4">
                      <span className="flex items-center gap-1 font-medium">
                        <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10.5 1.5H1.5A1.5 1.5 0 0 0 0 3v14a1.5 1.5 0 0 0 1.5 1.5h17a1.5 1.5 0 0 0 1.5-1.5V6.5a1.5 1.5 0 0 0-1.5-1.5H10.5V1.5z"/>
                        </svg>
                        {course.students_count || 0} students
                      </span>
                      <span className="flex items-center gap-1 font-medium">
                        <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
                        </svg>
                        {course.chapters_count || 0} chapters
                      </span>
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                        course.status === 'Published'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        <span className={`w-2 h-2 rounded-full ${course.status === 'Published' ? 'bg-green-600' : 'bg-amber-600'}`}></span>
                        {course.status}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2 pt-4 border-t border-slate-200">
                      <button
                        onClick={() => navigate(`/course/${course.id}`)}
                        className="btn-primary w-full py-2 px-3 inline-flex items-center justify-center gap-2 font-semibold text-sm"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Manage
                      </button>

                      {course.status === 'Published' && (
                        <button
                          onClick={() => handleViewStudents(course.id, course.title)}
                          className="w-full py-2 px-3 rounded-lg font-semibold text-sm inline-flex items-center justify-center gap-2 transition-all bg-sky-100 hover:bg-sky-200 text-sky-900"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM0 16.68a6 6 0 0112 0M16 12a4 4 0 11-8 0 4 4 0 018 0zm1 6a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          View Students
                        </button>
                      )}

                      <button
                        onClick={() => handlePublishCourse(course.id, course.status)}
                        className={`w-full py-2 px-3 rounded-lg font-semibold text-sm inline-flex items-center justify-center gap-2 transition-all ${
                          course.status === 'Published'
                            ? 'bg-slate-200 hover:bg-slate-300 text-slate-900'
                            : 'bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white'
                        }`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        {course.status === 'Published' ? 'Unpublish' : 'Publish'}
                      </button>

                      <button
                        onClick={() => handleDeleteCourse(course.id)}
                        className="btn-danger w-full py-2 px-3 inline-flex items-center justify-center gap-2 font-semibold text-sm"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-between border-t border-slate-200 pt-8">
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
                            ? 'bg-emerald-500 text-white'
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

        {/* Create Course Modal */}
        <CreateCourseModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onCourseCreated={handleCourseCreated}
        />

        {/* View Students Modal */}
        {studentsModal.isOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-96 overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Enrolled Students</h2>
                  <p className="text-slate-600 text-sm mt-1">{studentsModal.courseName}</p>
                </div>
                <button
                  onClick={() => setStudentsModal({ ...studentsModal, isOpen: false })}
                  className="text-slate-500 hover:text-slate-700 text-2xl leading-none"
                >
                  ×
                </button>
              </div>

              <div className="p-6">
                {studentsModal.loading ? (
                  <div className="text-center py-8">
                    <p className="text-slate-600">Loading students...</p>
                  </div>
                ) : studentsModal.students.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-slate-600 text-lg">No students enrolled yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {studentsModal.students.map((student) => {
                      const progress = getStudentProgress(student);
                      const totalLessons = studentsModal.courseData?.chapters?.reduce((total, ch) => total + (ch.lessons?.length || 0), 0) || 0;
                      const completedLessons = student.completed_lessons_count || 0;
                      
                      return (
                        <div 
                          key={student.id} 
                          className="p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-sky-200 transition"
                        >
                          <div className="flex items-center gap-4">
                            {/* Student Info */}
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-slate-900 text-sm">{student.name}</p>
                              <p className="text-xs text-slate-600 truncate">{student.email}</p>
                            </div>

                            {/* Progress Bar */}
                            <div className="flex-1 min-w-[120px]">
                              <div className="flex items-center gap-2">
                                <div className="flex-1">
                                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                                    <div
                                      className="bg-gradient-to-r from-sky-500 to-blue-600 h-1.5 rounded-full transition-all duration-500"
                                      style={{ width: `${progress}%` }}
                                    ></div>
                                  </div>
                                </div>
                                <p className="text-xs font-bold text-sky-600 min-w-[28px] text-right">{progress}%</p>
                              </div>
                              <p className="text-xs text-slate-500 mt-0.5">
                                {completedLessons}/{totalLessons} lessons
                              </p>
                            </div>

                            {/* Status Badge */}
                            <span className="text-xs px-2.5 py-1 bg-green-100 text-green-800 rounded-full font-semibold whitespace-nowrap">
                              Enrolled
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default TeacherDashboard;
