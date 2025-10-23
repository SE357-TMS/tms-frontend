import api from './api';

const travelService = {
  // Lấy tất cả tours/travels
  getAllTravels: async (params) => {
    return await api.get('/travels', { params });
  },

  // Lấy travel theo ID
  getTravelById: async (id) => {
    return await api.get(`/travels/${id}`);
  },

  // Tạo travel mới
  createTravel: async (travelData) => {
    return await api.post('/travels', travelData);
  },

  // Cập nhật travel
  updateTravel: async (id, travelData) => {
    return await api.put(`/travels/${id}`, travelData);
  },

  // Xóa travel
  deleteTravel: async (id) => {
    return await api.delete(`/travels/${id}`);
  },

  // Cập nhật trạng thái travel
  updateTravelStatus: async (id, status) => {
    return await api.patch(`/travels/${id}/status`, { status });
  },
};

export default travelService;
