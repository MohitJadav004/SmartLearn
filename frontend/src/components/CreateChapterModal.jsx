import React, { useState } from 'react';
import axios from 'axios';
import { apiCache, CACHE_KEYS } from '../utils/apiCache';

export const CreateChapterModal = ({ isOpen, onClose, courseId, onChapterCreated }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
      setError('Chapter title is required');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/courses/${courseId}/chapters`,
        formData
      );

      if (response.data.success) {
        setFormData({ title: '', description: '' });
        // Clear related caches so next fetch gets fresh data
        apiCache.clear(CACHE_KEYS.COURSE(courseId));
        apiCache.clearPattern('chapters:');
        onChapterCreated(response.data.data);
        onClose();
      } else {
        setError(response.data.message || 'Failed to create chapter');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create chapter');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 fade-in">
      <div className="bg-white/95 backdrop-filter backdrop-blur-xl rounded-2xl shadow-2xl max-w-2xl w-full mx-auto max-h-[90vh] overflow-y-auto border border-slate-200">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-50 to-sky-50 border-b border-slate-200 px-4 sm:px-6 md:px-8 py-4 sm:py-6 flex justify-between items-start sm:items-center gap-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 break-words">Create New Chapter</h2>
            <p className="text-slate-600 text-xs sm:text-sm mt-1 hidden sm:block">Add a new chapter to organize your course content</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-200 rounded-lg flex-shrink-0"
          >
            <svg className="w-5 sm:w-6 h-5 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-4 sm:px-6 md:px-8 py-6 sm:py-8">
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

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Chapter Title */}
            <div>
              <label htmlFor="title" className="form-label flex items-center gap-1">
                Chapter Title
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
                placeholder="e.g., Module 1: Introduction to Web Development"
              />
            </div>

            {/* Chapter Description */}
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
                placeholder="Provide a detailed description of this chapter's content and learning objectives..."
                rows="5"
              />
              <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                <span>💡</span> Describe what students will learn in this chapter
              </p>
            </div>

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
                    <span>Creating Chapter...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Create Chapter</span>
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

export default CreateChapterModal;
