import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { apiCache, CACHE_KEYS } from '../utils/apiCache';
import { useToast } from '../context/ToastContext';

export const EditLessonModal = ({ isOpen, onClose, lesson, chapterId, onLessonUpdated }) => {
  const { success: showSuccess, error: showError } = useToast();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content_url: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (lesson && isOpen) {
      setFormData({
        title: lesson.title || '',
        description: lesson.description || '',
        content_url: lesson.content_url || '',
      });
      setError('');
    }
  }, [lesson, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.title.trim()) {
      setError('Title is required');
      setLoading(false);
      return;
    }

    if (lesson.type === 'video' && !formData.content_url.trim()) {
      setError('Video URL is required for video lessons');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/chapters/${chapterId}/lessons/${lesson.id}`,
        {
          title: formData.title,
          description: formData.description,
          content_url: formData.content_url,
        }
      );

      if (response.data && response.data.data) {
        // Clear related caches
        apiCache.clear(CACHE_KEYS.CHAPTER(chapterId));
        apiCache.clearPattern('lessons:');
        showSuccess('Lesson updated successfully');
        onLessonUpdated(chapterId, response.data.data);
        onClose();
      } else {
        setError('Failed to update lesson: Invalid response from server');
      }
    } catch (err) {
      console.error('Error updating lesson:', err);
      let errorMessage = 'Failed to update lesson';

      if (err.response?.status === 422) {
        const errors = err.response?.data?.errors;
        if (errors) {
          errorMessage = Object.values(errors).flat().join(', ');
        } else {
          errorMessage = err.response?.data?.message || 'Validation failed';
        }
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !lesson) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 fade-in">
      <div className="bg-white/95 backdrop-filter backdrop-blur-xl rounded-2xl shadow-2xl max-w-2xl w-full mx-auto max-h-[90vh] overflow-y-auto border border-slate-200">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-slate-200 px-8 py-6 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Edit Lesson</h2>
            <p className="text-slate-600 text-sm mt-1">Update lesson details and content</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-200 rounded-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-8 py-8">
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg text-sm font-medium fade-in">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Lesson Type Badge */}
          <div className="mb-8 bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-xl border border-slate-200">
            <label className="block text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <span>🎓</span> Lesson Type
            </label>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-slate-200">
                <span className="text-2xl">{lesson.type === 'video' ? '🎥' : '📄'}</span>
                <span className="text-base font-medium text-slate-900 capitalize">{lesson.type} Lesson</span>
              </div>
              <p className="text-sm text-slate-600">(cannot be changed)</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Lesson Title */}
            <div>
              <label htmlFor="title" className="form-label flex items-center gap-1">
                Lesson Title
                <span className="text-red-500 font-bold">*</span>
              </label>
              <input
                id="title"
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g., Introduction to Variables"
              />
            </div>

            {/* Lesson Description */}
            <div>
              <label htmlFor="description" className="form-label">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="form-input resize-none"
                placeholder="Provide a detailed description of what students will learn..."
                rows="4"
              />
            </div>

            {/* Video Content: Video URL */}
            {lesson.type === 'video' && (
              <div>
                <label htmlFor="content_url" className="form-label flex items-center gap-1">
                  Video URL
                  <span className="text-red-500 font-bold">*</span>
                </label>
                <input
                  id="content_url"
                  type="text"
                  name="content_url"
                  required
                  value={formData.content_url}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="https://youtube.com/watch?v=... or any video URL"
                />
                <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                  <span>💡</span> Paste a video URL (YouTube, Vimeo, or direct video link)
                </p>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-4 pt-8 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 btn-secondary py-3 px-6 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 btn-primary py-3 px-6 font-semibold flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Updating Lesson...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span>Update Lesson</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditLessonModal;
