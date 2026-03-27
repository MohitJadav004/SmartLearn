import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';

export const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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

        {/* Navigation Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <button
            onClick={() => navigate('/all-courses')}
            className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden hover:scale-105 transform fade-in p-8 text-left"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-slate-900 mb-2 group-hover:text-sky-600 transition-colors">
                  Explore Courses
                </h3>
                <p className="text-slate-600 mb-4">
                  Browse all available courses and enroll in new ones to expand your knowledge
                </p>
              </div>
              <svg className="w-12 h-12 text-sky-400 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3z" />
              </svg>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-sky-500 text-white rounded-lg font-medium group-hover:bg-sky-600 transition-colors">
              Browse All
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>

          <button
            onClick={() => navigate('/my-courses')}
            className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden hover:scale-105 transform fade-in p-8 text-left"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-slate-900 mb-2 group-hover:text-sky-600 transition-colors">
                  My Courses
                </h3>
                <p className="text-slate-600 mb-4">
                  Continue learning from your enrolled courses and track your progress
                </p>
              </div>
              <svg className="w-12 h-12 text-blue-400 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
              </svg>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-sky-500 text-white rounded-lg font-medium group-hover:bg-sky-600 transition-colors">
              View Enrolled
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        </div>

      </main>
    </div>
  );
};

export default StudentDashboard;
