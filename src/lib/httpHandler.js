import axios from 'axios';
import { API_BASE_URL } from '../config/constants';
import authService from '../services/authService';

// Tạo axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    "ngrok-skip-browser-warning": "69420",
  },
});

// Export BE_ENDPOINT để dùng cho các URL hình ảnh
export const BE_ENDPOINT = API_BASE_URL;

// Request interceptor để thêm token vào headers
api.interceptors.request.use(
  (config) => {
    const token = authService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor để xử lý lỗi
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Nếu lỗi 401 và chưa thử refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = authService.getRefreshToken();
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const { token } = response.data.data;
        
        // Lưu token mới vào storage phù hợp
        const rememberMe = localStorage.getItem('rememberMe') === 'true';
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem('accessToken', token);

        // Thử lại request ban đầu với token mới
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Nếu refresh token thất bại, đăng xuất người dùng
        authService.logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Helper functions
export const fetchGet = (endpoint, onSuccess, onError) => {
  api
    .get(endpoint)
    .then((response) => {
      if (onSuccess) onSuccess(response.data);
    })
    .catch((error) => {
      console.error('GET Error:', error);
      if (onError) onError(error);
    });
};

export const fetchPost = (endpoint, data, onSuccess, onError) => {
  api
    .post(endpoint, data)
    .then((response) => {
      if (onSuccess) onSuccess(response.data);
    })
    .catch((error) => {
      console.error('POST Error:', error);
      if (onError) onError(error);
    });
};

export const fetchPut = (endpoint, data, onSuccess, onError) => {
  api
    .put(endpoint, data)
    .then((response) => {
      if (onSuccess) onSuccess(response.data);
    })
    .catch((error) => {
      console.error('PUT Error:', error);
      if (onError) onError(error);
    });
};

export const fetchDelete = (endpoint, onSuccess, onError) => {
  api
    .delete(endpoint)
    .then((response) => {
      if (onSuccess) onSuccess(response.data);
    })
    .catch((error) => {
      console.error('DELETE Error:', error);
      if (onError) onError(error);
    });
};

export default api;
