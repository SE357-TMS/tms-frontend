import { QueryClient } from '@tanstack/react-query';

// Tạo query client với cấu hình mặc định
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Không tự động refetch khi focus window
      retry: 1, // Số lần retry khi request fail
      staleTime: 5 * 60 * 1000, // 5 phút - thời gian data được coi là fresh
    },
  },
});
