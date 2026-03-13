import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { apiCache, CACHE_KEYS } from '../utils/apiCache';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('auth_token'));
  const authCheckRef = useRef(false);

  const API_URL = 'http://localhost:8000/api';

  // Configure axios defaults
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      // Prevent double auth check
      if (authCheckRef.current) return;
      authCheckRef.current = true;

      if (token) {
        try {
          // Check cache first
          const cachedUser = apiCache.get(CACHE_KEYS.USER);
          if (cachedUser) {
            setUser(cachedUser);
            setLoading(false);
            return;
          }

          const response = await axios.get(`${API_URL}/auth/me`);
          const userData = response.data.user;
          setUser(userData);
          // Cache user data for 1 hour
          apiCache.set(CACHE_KEYS.USER, userData, 60 * 60 * 1000);
        } catch (error) {
          console.error('Auth check failed:', error);
          setToken(null);
          localStorage.removeItem('auth_token');
          delete axios.defaults.headers.common['Authorization'];
          apiCache.clear(CACHE_KEYS.USER);
        }
      }
      setLoading(false);
    };

    checkAuth();

    return () => {
      authCheckRef.current = false;
    };
  }, [token]);

  const register = async (name, email, password, passwordConfirmation, role) => {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, {
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
        role,
      });

      const { token: newToken, user: userData } = response.data;
      setToken(newToken);
      setUser(userData);
      localStorage.setItem('auth_token', newToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      apiCache.set(CACHE_KEYS.USER, userData, 60 * 60 * 1000);

      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      return { success: false, error: errorMessage };
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });

      const { token: newToken, user: userData } = response.data;
      setToken(newToken);
      setUser(userData);
      localStorage.setItem('auth_token', newToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      apiCache.set(CACHE_KEYS.USER, userData, 60 * 60 * 1000);

      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await axios.post(`${API_URL}/auth/logout`);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('auth_token');
      delete axios.defaults.headers.common['Authorization'];
      apiCache.clear(CACHE_KEYS.USER);
      apiCache.clearPattern('courses:');
      authCheckRef.current = false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        register,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
