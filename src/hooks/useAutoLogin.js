import { useEffect, useState } from 'react';
import authService from '../services/authService';

/**
 * Hook để tự động login khi app load
 * Nếu chưa có token, sẽ tự động login với credentials mặc định
 */
export const useAutoLogin = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Kiểm tra đã có token chưa
        if (!authService.isAuthenticated()) {
          console.log('[Auto-login] No token found, attempting auto-login...');
          console.log('[Auto-login] API URL:', import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081');
          console.log('[Auto-login] Username:', import.meta.env.VITE_DEFAULT_USERNAME || 'admin');
          
          const result = await authService.autoLogin();
          
          console.log('[Auto-login] ✅ Success!', result);
        } else {
          console.log('[Auto-login] ✅ Already authenticated');
        }
      } catch (err) {
        console.error('[Auto-login] ❌ Failed:', err);
        console.error('[Auto-login] Error details:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
          url: err.config?.url
        });
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  return { isLoading, error };
};
