/**
 * Application Configuration Constants
 * Tập trung tất cả config vào 1 file để dễ quản lý
 */

// API Base URL - Chỉ cần sửa ở đây hoặc trong .env
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';

// API Endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
  },
  
  // User endpoints
  USERS: {
    BASE: '/admin/users',
    BY_ID: (id) => `/admin/users/${id}`,
    BY_ROLE: (role) => `/admin/users/role/${role}`,
  },
  
  // Travels endpoints (nếu có)
  TRAVELS: {
    BASE: '/travels',
    BY_ID: (id) => `/travels/${id}`,
  },
};

// Auth config
export const AUTH_CONFIG = {
  DEFAULT_USERNAME: import.meta.env.VITE_DEFAULT_USERNAME || 'admin',
  DEFAULT_PASSWORD: import.meta.env.VITE_DEFAULT_PASSWORD || 'admin123',
  TOKEN_KEY: 'accessToken',
  REFRESH_TOKEN_KEY: 'refreshToken',
  USER_KEY: 'user',
};

// API config
export const API_CONFIG = {
  TIMEOUT: 30000, // 10 seconds
  HEADERS: {
    'Content-Type': 'application/json',
  },
};

// App config
export const APP_CONFIG = {
  ENV: import.meta.env.VITE_ENV || 'development',
  IS_DEV: import.meta.env.DEV,
  IS_PROD: import.meta.env.PROD,
};

export default {
  API_BASE_URL,
  API_ENDPOINTS,
  AUTH_CONFIG,
  API_CONFIG,
  APP_CONFIG,
};
