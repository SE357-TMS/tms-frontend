import { useState, useEffect, useCallback } from 'react';
import { AuthContext } from './AuthContext';
import authService from '../services/authService';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Kiểm tra token khi component mount
    const hasToken = authService.isAuthenticated();
    setIsAuthenticated(hasToken);
    
    if (hasToken) {
      // Lấy user từ sessionStorage
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
      }
    }
    
    setLoading(false);
  }, []);

  const login = useCallback(async (username, password) => {
    const response = await authService.login(username, password);
    setIsAuthenticated(true);
    
    // Set user from login response or sessionStorage
    const userData = authService.getCurrentUser();
    setUser(userData);
    
    return response;
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const register = async (userData) => {
    return await authService.register(userData);
  };

  const value = {
    user,
    login,
    logout,
    register,
    isAuthenticated,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
