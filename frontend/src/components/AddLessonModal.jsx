import React, { useState } from 'react';
import axios from 'axios';
import { apiCache, CACHE_KEYS } from '../utils/apiCache';

export const AddLessonModal = ({ isOpen, onClose, chapterId, chapters = [], onLessonCreated }) => {
  const [selectedChapterId, setSelectedChapterId] = useState(chapterId || '');
  const [lessonType, setLessonType] = useState('video');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content_url: '',
    file_name: '',
  });
  const [videoFile, setVideoFile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideoFile(file);
      setFormData((prev) => ({
        ...prev,
        file_name: file.name,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const targetChapterId = selectedChapterId || chapterId;
    
    if (!targetChapterId) {
      setError('Please select a chapter');
      setLoading(false);
      return;
    }

    if (!formData.title.trim()) {
      setError('Title is required');
      setLoading(false);
      return;
    }

    if (lessonType === 'video' && !formData.content_url.trim()) {
      setError('Video URL is required for video lessons');
      setLoading(false);
      return;
    }

    if (lessonType === 'document' && !videoFile) {
      setError('Please select a PDF file for the document lesson');
      setLoading(false);
      return;
    }

    // Validate file types for documents
    if (videoFile && lessonType === 'document' && !videoFile.name.toLowerCase().endsWith('.pdf')) {
      setError('Only PDF files are allowed for documents');
      setLoading(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('type', lessonType);
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('file_name', formData.file_name);

      if (lessonType === 'video') {
        formDataToSend.append('content_url', formData.content_url);
      } else if (videoFile) {
        formDataToSend.append('file', videoFile);
      }

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/chapters/${targetChapterId}/lessons`,
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data && response.data.data) {
        setFormData({ title: '', description: '', content_url: '', file_name: '' });
        setVideoFile(null);
        setSelectedChapterId('');
        // Clear related caches so next fetch gets fresh data
        apiCache.clear(CACHE_KEYS.CHAPTER(targetChapterId));
        apiCache.clearPattern('lessons:');
        onLessonCreated(targetChapterId, response.data.data);
        onClose();
      } else if (response.data) {
        setFormData({ title: '', description: '', content_url: '', file_name: '' });
        setVideoFile(null);
        setSelectedChapterId('');
        // Clear related caches so next fetch gets fresh data
        apiCache.clear(CACHE_KEYS.CHAPTER(targetChapterId));
        apiCache.clearPattern('lessons:');
        onLessonCreated(targetChapterId, response.data);
        onClose();
      } else {
        setError('Failed to create lesson: Invalid response from server');
      }
    } catch (err) {
      console.error('Error creating lesson:', err);
      let errorMessage = 'Failed to create lesson';
      
      if (err.response?.status === 422) {
        // Validation errors
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
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 fade-in">
      <div className="bg-white/95 backdrop-filter backdrop-blur-xl rounded-2xl shadow-2xl max-w-2xl w-full mx-auto max-h-[90vh] overflow-y-auto border border-slate-200">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-slate-200 px-8 py-6 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Add New Lesson</h2>
            <p className="text-slate-600 text-sm mt-1">Create engaging content for your students</p>
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

          {/* Chapter Selection - Only show if chapters array exists and is not empty */}
          {chapters.length > 0 && (
            <div className="mb-8 bg-gradient-to-r from-emerald-50 to-teal-50 p-6 rounded-xl border border-slate-200">
              <label className="block text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <span>📚</span> Select Chapter
                <span className="text-red-500 font-bold">*</span>
              </label>
              <select
                value={selectedChapterId}
                onChange={(e) => setSelectedChapterId(e.target.value)}
                className="form-input"
              >
                <option value="">-- Choose a chapter --</option>
                {chapters.map((ch) => (
                  <option key={ch.id} value={ch.id}>
                    {ch.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Lesson Type Selector */}
          <div className="mb-8 bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border border-slate-200">
            <label className="block text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <span>🎓</span> Lesson Type
              <span className="text-red-500 font-bold">*</span>
            </label>
            <div className="flex gap-4">
              <label className="flex-1 flex items-center gap-3 p-3 rounded-lg cursor-pointer border-2 transition-all" style={{ borderColor: lessonType === 'video' ? '#8b5cf6' : '#e2e8f0', backgroundColor: lessonType === 'video' ? '#faf5ff' : '#f8fafc' }}>
                <input
                  type="radio"
                  value="video"
                  checked={lessonType === 'video'}
                  onChange={(e) => setLessonType(e.target.value)}
                  className="w-5 h-5"
                />
                <span className="text-base font-medium text-slate-900">
                  <span className="text-2xl">🎥</span> Video Lesson
                </span>
              </label>
              <label className="flex-1 flex items-center gap-3 p-3 rounded-lg cursor-pointer border-2 transition-all" style={{ borderColor: lessonType === 'document' ? '#8b5cf6' : '#e2e8f0', backgroundColor: lessonType === 'document' ? '#faf5ff' : '#f8fafc' }}>
                <input
                  type="radio"
                  value="document"
                  checked={lessonType === 'document'}
                  onChange={(e) => setLessonType(e.target.value)}
                  className="w-5 h-5"
                />
                <span className="text-base font-medium text-slate-900">
                  <span className="text-2xl">📄</span> Document
                </span>
              </label>
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
            {lessonType === 'video' && (
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

            {/* Document Content: PDF Upload Only */}
            {lessonType === 'document' && (
              <div>
                <label htmlFor="document_file" className="form-label flex items-center gap-1">
                  Upload PDF Document
                  <span className="text-red-500 font-bold">*</span>
                </label>
                <div className="relative">
                  <input
                    id="document_file"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="form-input file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-red-100 file:text-red-700 hover:file:bg-red-200 cursor-pointer"
                  />
                </div>
                {videoFile && (
                  <div className="mt-3 p-4 bg-green-50 border border-green-200 rounded-lg fade-in">
                    <p className="text-sm text-green-800 font-medium flex items-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Selected: {videoFile.name} ({(videoFile.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  </div>
                )}
                <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                  <span>📄</span> Only PDF files are supported
                </p>
              </div>
            )}

            {/* Document File Name - only for documents */}
            {lessonType === 'document' && (
              <div>
                <label htmlFor="file_name" className="form-label">
                  File Name
                </label>
                <input
                  id="file_name"
                  type="text"
                  name="file_name"
                  value={formData.file_name}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="e.g., lecture-notes.pdf"
                />
                <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                  <span>💡</span> The display name for the document
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
                    <span>Adding Lesson...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Add Lesson</span>
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

export default AddLessonModal;
