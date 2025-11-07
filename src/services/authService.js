import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS, AUTH_CONFIG } from '../config/constants';

const authService = {
  // Đăng nhập
  login: async (username, password, rememberMe = false) => {
    console.log('🔵 authService.login() called', { username, rememberMe });
    
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
    
    // Lưu tokens vào localStorage hoặc sessionStorage tùy rememberMe
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem(AUTH_CONFIG.TOKEN_KEY, token);
    storage.setItem(AUTH_CONFIG.REFRESH_TOKEN_KEY, refreshToken);
    
    // Lưu flag remember me
    if (rememberMe) {
      localStorage.setItem('rememberMe', 'true');
    } else {
      localStorage.removeItem('rememberMe');
    }
    
    console.log('✅ Tokens saved to', rememberMe ? 'localStorage' : 'sessionStorage');
    
    return response.data;
  },

  // Auto login với credentials mặc định (để test)
  autoLogin: async () => {
    try {
      // Sử dụng credentials từ constants
      return await authService.login(
        AUTH_CONFIG.DEFAULT_USERNAME, 
        AUTH_CONFIG.DEFAULT_PASSWORD
      );
    } catch (error) {
      console.error('Auto login failed:', error);
      throw error;
    }
  },

  // Refresh token
  refreshToken: async (refreshToken) => {
    const response = await axios.post(`${API_BASE_URL}${API_ENDPOINTS.AUTH.REFRESH}`, {
      refreshToken
    });
    
    // Backend trả về ApiResponse wrapper: { success, data: { token, refreshToken } }
    const { token, refreshToken: newRefreshToken } = response.data.data;
    
    // Lưu vào storage phù hợp (localStorage nếu rememberMe, sessionStorage nếu không)
    const rememberMe = localStorage.getItem('rememberMe') === 'true';
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem(AUTH_CONFIG.TOKEN_KEY, token);
    storage.setItem(AUTH_CONFIG.REFRESH_TOKEN_KEY, newRefreshToken);
    
    return response.data;
  },

  // Đăng xuất
  logout: async () => {
    const accessToken = this.getToken();
    const refreshToken = this.getRefreshToken();
    
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
      // Clear cả localStorage và sessionStorage
      localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY);
      localStorage.removeItem(AUTH_CONFIG.REFRESH_TOKEN_KEY);
      localStorage.removeItem(AUTH_CONFIG.USER_KEY);
      localStorage.removeItem('rememberMe');
      sessionStorage.removeItem(AUTH_CONFIG.TOKEN_KEY);
      sessionStorage.removeItem(AUTH_CONFIG.REFRESH_TOKEN_KEY);
      sessionStorage.removeItem(AUTH_CONFIG.USER_KEY);
    }
  },

  // Helper functions để lấy token từ storage phù hợp
  getToken: () => {
    return localStorage.getItem(AUTH_CONFIG.TOKEN_KEY) || 
           sessionStorage.getItem(AUTH_CONFIG.TOKEN_KEY);
  },

  getRefreshToken: () => {
    return localStorage.getItem(AUTH_CONFIG.REFRESH_TOKEN_KEY) || 
           sessionStorage.getItem(AUTH_CONFIG.REFRESH_TOKEN_KEY);
  },

  // Lấy thông tin user hiện tại
  getCurrentUser: () => {
    const userStr = localStorage.getItem(AUTH_CONFIG.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  },

  // Kiểm tra đã đăng nhập chưa
  isAuthenticated: () => {
    return !!authService.getToken();
  },
};

export default authService;
