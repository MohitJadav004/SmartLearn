import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { apiCache, CACHE_KEYS } from '../utils/apiCache';
import Header from '../components/Header';
import ChapterList from '../components/ChapterList';
import CreateChapterModal from '../components/CreateChapterModal';
import AddLessonModal from '../components/AddLessonModal';

export const CourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { error: showError } = useToast(); 
  const [course, setCourse] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isChapterModalOpen, setIsChapterModalOpen] = useState(false);
  const [lessonModal, setLessonModal] = useState({ isOpen: false, chapterId: null });
  const [chapterLessons, setChapterLessons] = useState({});

  useEffect(() => {
    fetchCourseAndChapters();
  }, [courseId]);

  const fetchCourseAndChapters = async () => {
    try {
      setLoading(true);
      const cacheKey = CACHE_KEYS.COURSE(courseId);
      
      // Check cache first
      const cachedCourse = apiCache.get(cacheKey);
      if (cachedCourse) {
        const courseData = cachedCourse.data;
        setCourse(courseData);
        
        if (courseData.chapters && Array.isArray(courseData.chapters)) {
          setChapters(courseData.chapters);
          
          const lessonsData = {};
          courseData.chapters.forEach(chapter => {
            lessonsData[chapter.id] = chapter.lessons || [];
          });
          setChapterLessons(lessonsData);
        }
        setLoading(false);
        return;
      }

      // Fetch from API if not cached
      const courseRes = await axios.get(`${import.meta.env.VITE_API_URL}/courses/${courseId}`);
      
      const courseData = courseRes.data.data;
      setCourse(courseData);
      
      // Cache the result (10 min duration)
      apiCache.set(cacheKey, courseRes.data, 10 * 60 * 1000);
      
      // Extract chapters and lessons from the eager-loaded course data
      if (courseData.chapters && Array.isArray(courseData.chapters)) {
        setChapters(courseData.chapters);
        
        // Build lessons map from eager-loaded chapters
        const lessonsData = {};
        courseData.chapters.forEach(chapter => {
          lessonsData[chapter.id] = chapter.lessons || [];
        });
        setChapterLessons(lessonsData);
      }
    } catch (err) {
      console.error('Failed to fetch course:', err);
      showError('Failed to load course');
      navigate('/teacher-dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleChapterCreated = (newChapter) => {
    setChapters([...chapters, newChapter]);
    setIsChapterModalOpen(false);
    // Invalidate course cache
    apiCache.clear(CACHE_KEYS.COURSE(courseId));
  };

  const handleChapterDeleted = (chapterId) => {
    setChapters(chapters.filter(ch => ch.id !== chapterId));
    // Invalidate course cache
    apiCache.clear(CACHE_KEYS.COURSE(courseId));
  };

  const handleLessonCreated = (chapterId, newLesson) => {
    setChapterLessons((prev) => ({
      ...prev,
      [chapterId]: [...(prev[chapterId] || []), newLesson],
    }));
    setLessonModal({ isOpen: false, chapterId: null });
    // Invalidate course cache
    apiCache.clear(CACHE_KEYS.COURSE(courseId));
  };

  const handleLessonUpdated = (chapterId, updatedLesson) => {
    // Replace the lesson in the list instead of appending it
    setChapterLessons((prev) => ({
      ...prev,
      [chapterId]: (prev[chapterId] || []).map((lesson) =>
        lesson.id === updatedLesson.id ? updatedLesson : lesson
      ),
    }));
    // Invalidate course cache
    apiCache.clear(CACHE_KEYS.COURSE(courseId));
  };

  const handleLoadChapterLessons = (chapterId, lessons) => {
    setChapterLessons((prev) => ({
      ...prev,
      [chapterId]: lessons,
    }));
  };

  const handleLessonDeleted = (chapterId, lessonId) => {
    setChapterLessons((prev) => ({
      ...prev,
      [chapterId]: (prev[chapterId] || []).filter((lesson) => lesson.id !== lessonId),
    }));
    // Invalidate course cache
    apiCache.clear(CACHE_KEYS.COURSE(courseId));
  };

  const handleLogout = async () => {
    await logout();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading course...</p>
      </div>
    );
  }

  const breadcrumb = ['Home', 'Courses', course?.title];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50">
      <Header user={user} onLogout={logout} />

      {/* Back Button - Full Width Far Left */}
      <button
        onClick={() => navigate('/teacher-dashboard')}
        className={`w-full text-left px-6 py-4 font-semibold inline-flex items-center gap-2 transition ${
          'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50'
        }`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Dashboard
      </button>

      {/* Title Section */}
      <div className="border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h2 className="text-4xl font-bold text-slate-900">{course?.title}</h2>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2">
            {/* Title and Status */}
            <div className="mb-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                      course?.status === 'Published'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {course?.status}
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium text-gray-600">3.5</span>
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={`text-lg ${i < 4 ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Course Metadata */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 pb-8 border-b">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Category</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">Education</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Level</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">Beginner</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Students</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">{course?.students_count || 0}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Language</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">English</p>
              </div>
            </div>

            {/* Overview Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Overview</h2>
              <p className="text-gray-700 leading-relaxed">
                {course?.description || 'No description available'}
              </p>
            </div>

            {/* What You Will Learn */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">What you will learn</h2>
              {course?.what_you_will_learn ? (
                <ul className="space-y-3">
                  {course.what_you_will_learn.split('\n').filter(item => item.trim()).map((item, index) => (
                    <li key={index} className="flex gap-3 text-gray-700">
                      <span className="text-teal-600 font-bold">✓</span>
                      <span>{item.trim()}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600 italic">No learning outcomes defined yet.</p>
              )}
            </div>

            {/* Requirements */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Requirements</h2>
              {course?.requirements ? (
                <ul className="space-y-3">
                  {course.requirements.split('\n').filter(item => item.trim()).map((item, index) => (
                    <li key={index} className="flex gap-3 text-gray-700">
                      <span className="text-teal-600 font-bold">✓</span>
                      <span>{item.trim()}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600 italic">No requirements defined yet.</p>
              )}
            </div>

            {/* Course Structure */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Course Structure</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setLessonModal({ isOpen: true, chapterId: null })}
                    className="bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 inline-flex items-center gap-2"
                  >
                    <span>+</span>
                    Add Lesson
                  </button>
                  <button
                    onClick={() => setIsChapterModalOpen(true)}
                    className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 inline-flex items-center gap-2"
                  >
                    <span>+</span>
                    Add Chapter
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                {chapters.length} Chapters • {chapters.reduce((acc, ch) => acc + (chapterLessons[ch.id]?.length || 0), 0)} Lessons
              </p>
              <ChapterList
                chapters={chapters}
                courseId={courseId}
                onChapterDeleted={handleChapterDeleted}
                lessonModal={lessonModal}
                setLessonModal={setLessonModal}
                chapterLessons={chapterLessons}
                onLessonCreated={handleLessonCreated}
                onLoadLessons={handleLoadChapterLessons}
                onLessonDeleted={handleLessonDeleted}
                onLessonUpdated={handleLessonUpdated}
              />
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:col-span-1">
            {/* Course Image */}
            <div className="bg-gray-200 rounded-lg overflow-hidden mb-6 aspect-video flex items-center justify-center">
              <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <svg className="w-16 h-16 text-white opacity-30" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
                </svg>
              </div>
            </div>

            {/* Sidebar Info */}
            <div className="bg-gray-50 rounded-lg p-6 sticky top-8">
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-1">Course Status</p>
                <p className={`text-lg font-semibold ${
                  course?.status === 'Published' ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {course?.status}
                </p>
              </div>

              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-1">Total Chapters</p>
                <p className="text-lg font-semibold text-gray-900">{chapters.length}</p>
              </div>

              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-1">Enrolled Students</p>
                <p className="text-lg font-semibold text-gray-900">{course?.students_count || 0}</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Create Chapter Modal */}
      <CreateChapterModal
        isOpen={isChapterModalOpen}
        onClose={() => setIsChapterModalOpen(false)}
        courseId={courseId}
        onChapterCreated={handleChapterCreated}
      />

      {/* Add Lesson Modal */}
      <AddLessonModal
        isOpen={lessonModal.isOpen}
        onClose={() => setLessonModal({ isOpen: false, chapterId: null })}
        chapterId={lessonModal.chapterId}
        chapters={chapters}
        onLessonCreated={handleLessonCreated}
      />
    </div>
  );
};

export default CourseDetail;
