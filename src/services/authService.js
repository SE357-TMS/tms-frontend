import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS, AUTH_CONFIG } from '../config/constants';

const authService = {
  // Đăng nhập
  login: async (username, password) => {
    console.log('🔵 authService.login() called', { username });
    
    const response = await axios.post(`${API_BASE_URL}${API_ENDPOINTS.AUTH.LOGIN}`, {
      username,
      password
    });
    
    console.log('📡 API Response:', response);
    console.log('📦 Response data:', response.data);
    
    // Backend trả về ApiResponse wrapper: { success, data: { token, refreshToken } }
    const { token, refreshToken } = response.data.data;
    
    console.log('🔑 Extracted tokens:', { 
      token: token?.substring(0, 50) + '...', 
      refreshToken: refreshToken?.substring(0, 50) + '...' 
    });
    
    // Lưu tokens vào sessionStorage (sẽ bị xóa khi đóng trình duyệt)
    sessionStorage.setItem(AUTH_CONFIG.TOKEN_KEY, token);
    sessionStorage.setItem(AUTH_CONFIG.REFRESH_TOKEN_KEY, refreshToken);
    
    // Decode JWT token để lấy user info
    try {
      if (token && token.includes('.')) {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        const payload = JSON.parse(jsonPayload);
        const userInfo = {
          username: payload.sub,
          role: payload.role,
          fullName: payload.fullName || payload.sub
        };
        sessionStorage.setItem(AUTH_CONFIG.USER_KEY, JSON.stringify(userInfo));
      }
    } catch (e) {
      console.error('Failed to decode token:', e);
    }
    
    console.log('✅ Tokens saved to sessionStorage');
    
    return response.data;
  },

  // Refresh token
  refreshToken: async (refreshToken) => {
    const response = await axios.post(`${API_BASE_URL}${API_ENDPOINTS.AUTH.REFRESH}`, {
      refreshToken
    });
    
    // Backend trả về ApiResponse wrapper: { success, data: { token, refreshToken } }
    const { token, refreshToken: newRefreshToken } = response.data.data;
    
    // Lưu vào sessionStorage
    sessionStorage.setItem(AUTH_CONFIG.TOKEN_KEY, token);
    sessionStorage.setItem(AUTH_CONFIG.REFRESH_TOKEN_KEY, newRefreshToken);
    
    return response.data;
  },

  // Đăng xuất
  logout: async () => {
    const accessToken = authService.getToken();
    const refreshToken = authService.getRefreshToken();
    
    try {
      await axios.post(`${API_BASE_URL}${API_ENDPOINTS.AUTH.LOGOUT}`, 
        { refreshToken },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear sessionStorage
      sessionStorage.removeItem(AUTH_CONFIG.TOKEN_KEY);
      sessionStorage.removeItem(AUTH_CONFIG.REFRESH_TOKEN_KEY);
      sessionStorage.removeItem(AUTH_CONFIG.USER_KEY);
    }
  },

  // Helper functions để lấy token từ sessionStorage
  getToken: () => {
    return sessionStorage.getItem(AUTH_CONFIG.TOKEN_KEY);
  },

  getRefreshToken: () => {
    return sessionStorage.getItem(AUTH_CONFIG.REFRESH_TOKEN_KEY);
  },

  // Lấy thông tin user hiện tại
  getCurrentUser: () => {
    try {
      const userStr = sessionStorage.getItem(AUTH_CONFIG.USER_KEY);
      if (!userStr || userStr === 'undefined') return null;
      return JSON.parse(userStr);
    } catch (e) {
      console.error('Error parsing user from session storage:', e);
      return null;
    }
  },

  // Lưu thông tin user
  setCurrentUser: (user) => {
    sessionStorage.setItem(AUTH_CONFIG.USER_KEY, JSON.stringify(user));
  },

  // Kiểm tra đã đăng nhập chưa
  isAuthenticated: () => {
    return !!authService.getToken();
  },
};

export default authService;
