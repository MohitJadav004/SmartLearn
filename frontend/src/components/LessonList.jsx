import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmContext';

const LessonList = ({ lessons, chapterId, onLessonDeleted, onLessonEdit }) => {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const { error: showError } = useToast();
  const { showConfirm } = useConfirm();

  const handleDeleteLesson = async (lessonId) => {
    const confirmed = await showConfirm({
      title: 'Delete Lesson',
      message: 'Are you sure you want to delete this lesson?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      isDangerous: true
    });

    if (confirmed) {
      try {
        await axios.delete(
          `${import.meta.env.VITE_API_URL}/chapters/${chapterId}/lessons/${lessonId}`
        );
        onLessonDeleted(chapterId, lessonId);
      } catch (error) {
        console.error('Failed to delete lesson:', error);
        showError(error.response?.data?.message || 'Failed to delete lesson');
      }
    }
  };

  const handleViewLesson = (lessonId) => {
    navigate(`/course/${courseId}/chapter/${chapterId}/lesson/${lessonId}`);
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <div className="space-y-1">
      {!lessons || lessons.length === 0 ? (
        <div className="text-center py-6">
          <svg className="w-12 h-12 text-slate-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C6.5 6.253 2 10.998 2 17s4.5 10.747 10 10.747c5.5 0 10-4.998 10-10.747S17.5 6.253 12 6.253z" />
          </svg>
          <p className="text-slate-400 text-sm font-medium">No lessons yet</p>
          <p className="text-slate-400 text-xs">Add one to get started!</p>
        </div>
      ) : (
        Array.isArray(lessons) && lessons.map((lesson) => (
          lesson && lesson.id ? (
            <div key={lesson.id} className="bg-white/60 backdrop-blur-sm border border-slate-200 rounded-xl p-3 hover:bg-white/80 hover:border-sky-200 transition-all group">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-2">
                <div className="flex items-start gap-4 flex-1 cursor-pointer min-w-0" onClick={() => handleViewLesson(lesson.id)}>
                  <div className="flex-1 min-w-0">
                    <h5 className="font-bold text-slate-900 group-hover:text-sky-600 transition-colors text-sm sm:text-base break-words">{lesson.title}</h5>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0 w-full sm:w-auto justify-end sm:justify-start opacity-100 transition-opacity">
                  <button
                    onClick={() => onLessonEdit(lesson)}
                    className="p-2 rounded-lg hover:bg-blue-100 text-blue-600 transition-all flex-shrink-0"
                    title="Edit lesson"
                  >
                    <svg className="w-4 sm:w-5 h-4 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleViewLesson(lesson.id)}
                    className="p-2 rounded-lg hover:bg-sky-100 text-sky-600 transition-all flex-shrink-0"
                    title="View lesson"
                  >
                    <svg className="w-4 sm:w-5 h-4 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeleteLesson(lesson.id)}
                    className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition-all flex-shrink-0"
                    title="Delete lesson"
                  >
                    <svg className="w-4 sm:w-5 h-4 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ) : null
        ))
      )}
    </div>
  );
};

export default LessonList;
