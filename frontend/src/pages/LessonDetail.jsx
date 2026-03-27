import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { apiCache, CACHE_KEYS } from '../utils/apiCache';
import Header from '../components/Header';
import VideoPlayer from '../components/VideoPlayer';

export const LessonDetail = () => {
  const { courseId, chapterId, lessonId } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [lesson, setLesson] = useState(null);
  const [chapter, setChapter] = useState(null);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLessonCompleted, setIsLessonCompleted] = useState(user?.role === 'teacher');
  const [nextLesson, setNextLesson] = useState(null);
  const [nextChapter, setNextChapter] = useState(null);

  useEffect(() => {
    // reset completion state for the incoming lesson
    setIsLessonCompleted(user?.role === 'teacher');
    
    // Check if this lesson was already marked completed by the student
    if (user?.role !== 'teacher') {
      const key = `course_${courseId}_completed_lessons`;
      const completed = localStorage.getItem(key);
      const completedLessons = completed ? JSON.parse(completed) : [];
      if (completedLessons.includes(parseInt(lessonId))) {
        setIsLessonCompleted(true);
      }
    }
    
    fetchLessonDetails();
  }, [lessonId, chapterId, courseId, user?.role]);

  const fetchLessonDetails = async () => {
    try {
      setLoading(true);
      const courseCacheKey = CACHE_KEYS.COURSE(courseId);
      
      // Try to get course from cache first (includes chapters and lessons)
      const cachedCourse = apiCache.get(courseCacheKey);
      if (cachedCourse) {
        const courseData = cachedCourse.data;
        setCourse(courseData);
        
        // Find chapter and lesson from cached data
        if (courseData.chapters) {
          const chapter = courseData.chapters.find(c => c.id == chapterId);
          if (chapter) {
            setChapter(chapter);
            
            const lesson = chapter.lessons?.find(l => l.id == lessonId);
            if (lesson) {
              setLesson(lesson);
              
              // Find next lesson or next chapter
              if (chapter.lessons && chapter.lessons.length > 0) {
                const currentLessonIndex = chapter.lessons.findIndex(l => l.id == lessonId);
                if (currentLessonIndex !== -1) {
                  // Check if there's a next lesson in this chapter
                  if (currentLessonIndex < chapter.lessons.length - 1) {
                    setNextLesson(chapter.lessons[currentLessonIndex + 1]);
                    setNextChapter(null);
                  } else {
                    // If this is the last lesson, find next chapter
                    setNextLesson(null);
                    const currentChapterIndex = courseData.chapters.findIndex(c => c.id == chapterId);
                    if (currentChapterIndex !== -1 && currentChapterIndex < courseData.chapters.length - 1) {
                      setNextChapter(courseData.chapters[currentChapterIndex + 1]);
                    } else {
                      setNextChapter(null);
                    }
                  }
                }
              }
              
              setLoading(false);
              return;
            }
          }
        }
      }

      // If not fully cached, fetch individually
      const [lessonRes, courseRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/chapters/${chapterId}/lessons/${lessonId}`),
        axios.get(`${import.meta.env.VITE_API_URL}/courses/${courseId}`),
      ]);

      setLesson(lessonRes.data.data);
      const courseData = courseRes.data.data;
      setCourse(courseData);
      
      // Cache course data
      apiCache.set(courseCacheKey, courseRes.data, 10 * 60 * 1000);
      
      if (courseData.chapters) {
        const chapter = courseData.chapters.find(c => c.id == chapterId);
        if (chapter) {
          setChapter(chapter);
          
          // Find next lesson or next chapter
          if (chapter.lessons && chapter.lessons.length > 0) {
            const currentLessonIndex = chapter.lessons.findIndex(l => l.id == lessonId);
            if (currentLessonIndex !== -1) {
              // Check if there's a next lesson in this chapter
              if (currentLessonIndex < chapter.lessons.length - 1) {
                setNextLesson(chapter.lessons[currentLessonIndex + 1]);
                setNextChapter(null);
              } else {
                // If this is the last lesson, find next chapter
                setNextLesson(null);
                const currentChapterIndex = courseData.chapters.findIndex(c => c.id == chapterId);
                if (currentChapterIndex !== -1 && currentChapterIndex < courseData.chapters.length - 1) {
                  setNextChapter(courseData.chapters[currentChapterIndex + 1]);
                } else {
                  setNextChapter(null);
                }
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch lesson:', error);
      setError('Failed to load lesson details. Please check if the lesson exists and try again.');
    } finally {
      setLoading(false);
    }
  };



  const handleNextLesson = () => {
    if (nextLesson) {
      navigate(`/course/${courseId}/chapter/${chapterId}/lesson/${nextLesson.id}`);
    } else if (nextChapter && nextChapter.lessons && nextChapter.lessons.length > 0) {
      // Navigate to first lesson of next chapter
      navigate(`/course/${courseId}/chapter/${nextChapter.id}/lesson/${nextChapter.lessons[0].id}`);
    }
  };

  const handleCompleteLesson = async () => {
    // Mark lesson as complete
    setIsLessonCompleted(true);
    
    // Save completed lesson to localStorage
    const key = `course_${courseId}_completed_lessons`;
    const completed = localStorage.getItem(key);
    const completedLessons = completed ? JSON.parse(completed) : [];
    
    if (!completedLessons.includes(parseInt(lessonId))) {
      completedLessons.push(parseInt(lessonId));
      localStorage.setItem(key, JSON.stringify(completedLessons));
    }

    // Save to backend
    try {
      console.log('Saving lesson completion to backend:', lessonId);
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/lessons/${lessonId}/complete`
      );
      console.log('Lesson completion saved:', response.data);
    } catch (error) {
      console.error('Failed to save lesson completion to backend:', error);
      // Still mark as complete locally even if backend fails
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return 'Duration not specified';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const handleLogout = async () => {
    await logout();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading lesson details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate(user?.role === 'teacher' ? `/course/${courseId}` : `/student-course/${courseId}`)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg"
          >
            Back to Course
          </button>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Lesson not found</p>
          <button
            onClick={() => navigate(user?.role === 'teacher' ? `/course/${courseId}` : `/student-course/${courseId}`)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg"
          >
            Back to Course
          </button>
        </div>
      </div>
    );
  }

  return (
    // give the container a key so React unmounts/remounts when the params change
    <div key={`${courseId}_${chapterId}_${lessonId}`} className="min-h-screen bg-white">
      <Header user={user} onLogout={logout} />

      {/* Back Button - Full Width Far Left */}
      <button
        onClick={() => navigate(user?.role === 'teacher' ? `/course/${courseId}` : `/student-course/${courseId}`)}
        className={`w-full text-left px-6 py-4 font-semibold inline-flex items-center gap-2 transition ${
          user?.role === 'teacher'
            ? 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50'
            : 'text-sky-600 hover:text-sky-700 hover:bg-sky-50'
        }`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Course
      </button>

      {/* Lesson Navigation Section */}
      <div className="border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{lesson?.title}</h1>
          {/* only show title, remove type icon/label for a shorter header */}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Video/Document Preview */}
            {lesson.type === 'video' ? (
              <div className="mb-8">
                <VideoPlayer videoUrl={lesson.content_url} title={lesson.title} />
                {/* Mark Video as Complete Button for Students */}
                {user?.role !== 'teacher' && !isLessonCompleted && (
                  <button
                    onClick={handleCompleteLesson}
                    className="bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 text-sm"
                  >
                    ✓ Mark Video as Complete
                  </button>
                )}
              </div>
            ) : (
              <div className="mb-8 bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">{lesson.file_name || 'Document'}</h3>
                  <a
                    href={lesson.content_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal-600 hover:text-teal-700 font-medium text-sm flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Open in New Tab
                  </a>
                </div>
                <div className="aspect-[4/3] bg-gray-100 overflow-hidden">
                  <object
                    data={lesson.content_url}
                    type="application/pdf"
                    className="w-full h-full"
                  >
                    <p>Your browser does not support PDFs. <a href={lesson.content_url}>Download the document</a>.</p>
                  </object>
                </div>
                {/* Mark Document as Complete for students */}
                {user?.role !== 'teacher' && !isLessonCompleted && (
                  <button
                    onClick={handleCompleteLesson}
                    className="mt-3 bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 text-sm"
                  >
                    ✓ Mark Document as Complete
                  </button>
                )}
              </div>
            )}

            {/* Lesson Description */}
            <div className="bg-white rounded-lg border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About this lesson</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {lesson.description || 'No description available for this lesson.'}
              </p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Lesson Info Card */}
            <div className="bg-gray-50 rounded-lg p-6 sticky top-8 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Lesson Details</h3>

              <div className="space-y-6">
                {/* Chapter */}
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">Chapter</p>
                  <p className="text-sm text-gray-900 font-semibold">{chapter?.title}</p>
                </div>

                {/* Course */}
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">Course</p>
                  <p className="text-sm text-gray-900 font-semibold">{course?.title}</p>
                </div>

                {/* Type */}
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">Type</p>
                  <p className="text-sm text-gray-900 font-semibold">
                    {lesson.type === 'video' ? '🎥 Video' : '📄 Document'}
                  </p>
                </div>

                {/* Duration */}
                {lesson.type === 'video' && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">Duration</p>
                    <p className="text-sm text-gray-900 font-semibold">{formatDuration(lesson.duration)}</p>
                  </div>
                )}

                {/* Status */}
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">Course Status</p>
                  <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                    course?.status === 'Published'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {course?.status || 'Draft'}
                  </span>
                </div>

                {/* Next Lesson/Chapter Button */}
                {(nextLesson || nextChapter) && (
                  <div>
                    {user?.role === 'teacher' ? (
                      <button
                        onClick={handleNextLesson}
                        className="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2 mt-4"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                        {nextLesson ? 'Next Lesson' : 'Next Chapter'}
                      </button>
                    ) : (
                      <button
                        onClick={handleNextLesson}
                        disabled={!isLessonCompleted}
                        className={`w-full font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2 mt-4 ${
                          isLessonCompleted
                            ? 'bg-sky-600 hover:bg-sky-700 text-white cursor-pointer'
                            : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                        }`}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                        {isLessonCompleted ? (nextLesson ? 'Next Lesson' : 'Next Chapter') : 'Complete Lesson to Continue'}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Back Button */}
              <button
                onClick={() => navigate(user?.role === 'teacher' ? `/course/${courseId}` : `/student-course/${courseId}`)}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-3 px-4 rounded-lg transition duration-200 mt-6"
              >
                Back to Course
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LessonDetail;
