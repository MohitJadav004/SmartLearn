import axios from 'axios';
import { apiCache } from './apiCache';

/**
 * Create axios instance with caching support
 * Usage: await cachedAxios.get(url, { cache: true, cacheKey: 'custom-key' })
 */

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  timeout: 15000,
});

// Request interceptor - check cache first
instance.interceptors.request.use((config) => {
  // Only cache GET requests
  if (config.method === 'get' && config.cache !== false) {
    const cacheKey = config.cacheKey || config.url;
    const cachedData = apiCache.get(cacheKey);
    
    if (cachedData) {
      // Return cached data as resolved promise
      return Promise.reject({
        __cached: true,
        data: cachedData,
      });
    }
  }
  return config;
});

// Response interceptor - cache successful responses
instance.interceptors.response.use(
  (response) => {
    // Cache successful GET responses
    if (response.config.method === 'get' && response.config.cache !== false) {
      const cacheKey = response.config.cacheKey || response.config.url;
      const cacheDuration = response.config.cacheDuration;
      apiCache.set(cacheKey, response.data, cacheDuration);
    }
    return response;
  },
  (error) => {
    // Handle cached data rejection
    if (error.__cached) {
      return Promise.resolve({
        data: error.data,
        status: 200,
        cached: true,
      });
    }
    return Promise.reject(error);
  }
);

export default instance;
