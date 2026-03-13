import React, { useState } from 'react';
import axios from 'axios';
import LessonList from './LessonList';

const ChapterList = ({ chapters, courseId, onChapterDeleted, lessonModal, setLessonModal, chapterLessons, onLessonCreated, onLoadLessons, onLessonDeleted }) => {
  const [expandedChapterId, setExpandedChapterId] = useState(null);

  const handleExpandChapter = async (chapterId) => {
    if (expandedChapterId === chapterId) {
      setExpandedChapterId(null);
    } else {
      // If lessons aren't already loaded, fetch them
      if (!chapterLessons[chapterId]) {
        try {
          const response = await axios.get(
            `${import.meta.env.VITE_API_URL}/chapters/${chapterId}/lessons`
          );
          const lessonsData = response.data?.data || response.data || [];
          const lessonsArray = Array.isArray(lessonsData) ? lessonsData : [];
          onLoadLessons(chapterId, lessonsArray);
        } catch (error) {
          console.error('Failed to fetch lessons for chapter:', chapterId, error);
          onLoadLessons(chapterId, []);
        }
      }
      setExpandedChapterId(chapterId);
    }
  };

  const handleDeleteChapter = async (chapterId) => {
    if (window.confirm('Are you sure you want to delete this chapter and all its lessons?')) {
      try {
        await axios.delete(
          `${import.meta.env.VITE_API_URL}/courses/${courseId}/chapters/${chapterId}`
        );
        onChapterDeleted(chapterId);
      } catch (error) {
        console.error('Failed to delete chapter:', error);
        alert('Failed to delete chapter');
      }
    }
  };

  return (
    <div className="space-y-4">
      {chapters.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200 p-12 text-center">
          <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C6.5 6.253 2 10.998 2 17s4.5 10.747 10 10.747c5.5 0 10-4.998 10-10.747S17.5 6.253 12 6.253z" />
          </svg>
          <p className="text-slate-600 text-lg font-medium mb-4">No chapters yet.</p>
          <p className="text-slate-500">Create your first chapter to get started!</p>
        </div>
      ) : (
        chapters.map((chapter, index) => (
          <div key={chapter.id} className="border border-slate-200 rounded-xl overflow-hidden bg-white/80 backdrop-blur-sm hover:border-sky-200 transition-all shadow-sm">
            {/* Chapter Header */}
            <div className="p-6 hover:bg-slate-50 flex items-center justify-between transition-colors">
              <div 
                onClick={() => handleExpandChapter(chapter.id)}
                className="flex items-start gap-4 flex-1 cursor-pointer"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-sky-100 to-blue-100 flex items-center justify-center font-bold text-sky-700">
                  {String(index + 1).padStart(2, '0')}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-900 hover:text-sky-600 transition-colors">{chapter.title}</h3>
                  {chapter.description && (
                    <p className="text-sm text-slate-600 mt-1.5 line-clamp-2">{chapter.description}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-6 ml-4">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-sky-50 rounded-lg">
                  <svg className="w-4 h-4 text-sky-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.3A4.5 4.5 0 1113.5 13H11V9.413l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13H5.5z" />
                  </svg>
                  <span className="text-xs font-bold text-sky-700">
                    {chapterLessons[chapter.id]?.length || 0} lessons
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteChapter(chapter.id);
                  }}
                  className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition-all"
                  title="Delete chapter"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
                <button
                  onClick={() => handleExpandChapter(chapter.id)}
                  className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                  title={expandedChapterId === chapter.id ? "Collapse" : "Expand"}
                >
                  <span className={`transform transition-transform duration-300 inline-block ${expandedChapterId === chapter.id ? 'rotate-180' : ''}`}>
                    <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </span>
                </button>
              </div>
            </div>

            {/* Chapter Content - Lessons */}
            {expandedChapterId === chapter.id && (
              <div className="border-t border-slate-200 fade-in">
                <div className="px-6 py-4">
                  <LessonList
                    lessons={chapterLessons[chapter.id] || []}
                    chapterId={chapter.id}
                    onLessonDeleted={onLessonDeleted}
                  />
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default ChapterList;
