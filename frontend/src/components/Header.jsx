import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Reusable header component with dynamic colors based on user role
 */
export const Header = ({ user, onLogout }) => {
  const navigate = useNavigate();
  
  // Dynamic colors based on role
  const isTeacher = user?.role === 'teacher';
  const logoGradient = isTeacher
    ? 'from-emerald-500 to-teal-600'
    : 'from-sky-500 to-blue-600';
  const logoText = isTeacher
    ? 'from-emerald-600 to-teal-600'
    : 'from-sky-600 to-blue-600';
  const userBgColor = isTeacher
    ? 'bg-emerald-50'
    : 'bg-sky-50';
  const userAvatarGradient = isTeacher
    ? 'from-emerald-400 to-teal-500'
    : 'from-sky-400 to-blue-500';

  const handleLogoClick = () => {
    if (isTeacher) {
      navigate('/teacher-dashboard');
    } else {
      navigate('/student-dashboard');
    }
  };

  const handleLogout = async () => {
    if (onLogout) {
      await onLogout();
    }
    navigate('/login');
  };

  return (
    <header className="bg-white/80 backdrop-blur-lg border-b border-slate-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        {/* Logo Section - Clickable */}
        <div
          onClick={handleLogoClick}
          className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
        >
          <div className={`w-10 h-10 bg-gradient-to-br ${logoGradient} rounded-xl flex items-center justify-center`}>
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C6.5 6.253 2 10.998 2 17s4.5 10.747 10 10.747c5.5 0 10-4.998 10-10.747S17.5 6.253 12 6.253z" />
            </svg>
          </div>
          <h1 className={`text-2xl font-bold bg-gradient-to-r ${logoText} bg-clip-text text-transparent`}>SmartLearn</h1>
        </div>

        {/* User Info and Logout */}
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 px-4 py-2 ${userBgColor} rounded-lg`}>
            <span className={`w-10 h-10 bg-gradient-to-br ${userAvatarGradient} rounded-full flex items-center justify-center text-white font-semibold text-sm`}>
              {user?.name?.charAt(0).toUpperCase()}
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-900">{user?.name}</p>
              <p className="text-xs text-slate-500">{isTeacher ? 'Teacher' : 'Student'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="btn-danger py-2 px-4 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
