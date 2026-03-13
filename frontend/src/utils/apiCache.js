/**
 * API Cache Manager - Caches API responses to reduce redundant calls
 */

const API_CACHE = new Map();
const CACHE_DURATION = {
  SHORT: 5 * 60 * 1000,      // 5 minutes
  MEDIUM: 15 * 60 * 1000,    // 15 minutes
  LONG: 30 * 60 * 1000,      // 30 minutes
};

class CacheEntry {
  constructor(data, duration) {
    this.data = data;
    this.expiresAt = Date.now() + duration;
  }

  isExpired() {
    return Date.now() > this.expiresAt;
  }
}

export const apiCache = {
  /**
   * Get cached data if available and not expired
   * @param {string} key - Cache key
   * @returns {any|null} - Cached data or null if not found/expired
   */
  get(key) {
    const entry = API_CACHE.get(key);
    if (!entry) return null;
    if (entry.isExpired()) {
      API_CACHE.delete(key);
      return null;
    }
    return entry.data;
  },

  /**
   * Set data in cache
   * @param {string} key - Cache key
   * @param {any} data - Data to cache
   * @param {number} duration - Cache duration in ms (default: MEDIUM)
   */
  set(key, data, duration = CACHE_DURATION.MEDIUM) {
    API_CACHE.set(key, new CacheEntry(data, duration));
  },

  /** 
   * Clear specific cache entry
   * @param {string} key - Cache key
   */
  clear(key) {
    API_CACHE.delete(key);
  },

  /**
   * Clear all cache entries matching a pattern
   * @param {string} pattern - Pattern to match (e.g., 'courses:' to clear all course-related cache)
   */
  clearPattern(pattern) {
    for (const key of API_CACHE.keys()) {
      if (key.includes(pattern)) {
        API_CACHE.delete(key);
      }
    }
  },

  /**
   * Clear all cache
   */
  clearAll() {
    API_CACHE.clear();
  },
};

export const CACHE_KEYS = {
  COURSES_LIST: (teacherId) => `courses:list:${teacherId}`,
  COURSE: (courseId) => `course:${courseId}`,
  CHAPTERS: (courseId) => `chapters:${courseId}`,
  CHAPTER: (chapterId) => `chapter:${chapterId}`,
  LESSONS: (chapterId) => `lessons:${chapterId}`,
  LESSON: (lessonId) => `lesson:${lessonId}`,
  USER: 'user:current',
};

export default apiCache;
