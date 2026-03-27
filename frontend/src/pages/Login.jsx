import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, user } = useAuth();
  

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);

    if (result.success) {
      const user = result.data.user;
      // Redirect based on role
      if (user.role === 'teacher') { 
        navigate('/teacher-dashboard');
      } else {
        navigate('/student-dashboard');
      }
    } else {
      setError(result.error || 'Login failed');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-blue-100 flex items-center justify-center px-4 py-8">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-200 rounded-full blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-200 rounded-full blur-3xl opacity-20 animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      <div className="relative max-w-md w-full bg-white/95 backdrop-filter backdrop-blur-xl rounded-2xl shadow-2xl p-10 fade-in">
        {/* Header */}
        <div className="text-center mb-10 block" aria-label="Go to dashboard">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl mb-5 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C6.5 6.253 2 10.998 2 17s4.5 10.747 10 10.747c5.5 0 10-4.998 10-10.747S17.5 6.253 12 6.253z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent mb-2">
            SmartLearn
          </h1>
          <p className="text-slate-600 text-lg">Welcome back</p>
        </div>

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

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Input */}
          <div>
            <label htmlFor="email" className="form-label">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              placeholder="you@example.com"
            />
          </div>

          {/* Password Input */}
          <div>
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input pr-12"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1 no-hover-lift"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  /* Eye (visible) icon - Heroicons style */
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                ) : (
                  /* Eye Off (hidden) icon - Heroicons style */
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
                    <path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M9.88 9.88A3 3 0 0012 15a3 3 0 004.12 0" />
                    <path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c1.33 0 2.58.3 3.69.84" />
                    <path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M14.12 14.12A3 3 0 019.88 9.88" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary flex items-center justify-center gap-2 mt-7 py-3 text-lg font-semibold"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Signing in...</span>
              </>
            ) : (
              <>
                
                <span>Sign In</span>
              </>
            )}
          </button>
        </form>

        {/* Register Link */}
        <div className="mt-8 pt-8 border-t border-slate-200">
          <p className="text-center text-slate-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-sky-600 hover:text-sky-700 font-bold transition-colors">
              Create one now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
