// services/tourApi.js
const BASE_URL = 'http://localhost:8081/api/v1/customer/tours'; // Thay đổi port tùy backend của bạn

export const tourApi = {
    // GET /home: Lấy dữ liệu trang chủ (Tour nổi bật, địa điểm hot)
    getHomeData: async () => {
        const response = await fetch(`${BASE_URL}/home`);
        if (!response.ok) throw new Error('Failed to fetch home data');
        return response.json();
    },

    // GET /suggestions: Gợi ý tìm kiếm
    getSuggestions: async (query) => {
        const response = await fetch(`${BASE_URL}/suggestions?query=${query}`);
        return response.json();
    },

    // POST /{routeId}/favorite: Toggle yêu thích
    toggleFavorite: async (routeId) => {
        const response = await fetch(`${BASE_URL}/${routeId}/favorite`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Thêm Authorization header nếu cần (Bear token)
            }
        });
        if (!response.ok) throw new Error('Failed to toggle favorite');
        return response.json(); // Giả sử trả về trạng thái mới { isFavorited: true/false }
    },
    
    // GET /start-locations: Lấy điểm khởi hành
    getStartLocations: async () => {
        const response = await fetch(`${BASE_URL}/start-locations`);
        return response.json();
    }
};