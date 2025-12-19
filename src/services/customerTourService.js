import api from './api';

const BASE_PATH = '/api/v1/customer/tours';

const customerTourService = {
  // Get search suggestions (autocomplete)
  getSearchSuggestions: async (keyword, limit = 5) => {
    const response = await api.get(`${BASE_PATH}/suggestions`, {
      params: { keyword, limit }
    });
    return response.data;
  },

  // Get home page data (favorite tours and destinations)
  getHomePageData: async (tourLimit = 8, destinationLimit = 8) => {
    const response = await api.get(`${BASE_PATH}/home`, {
      params: { tourLimit, destinationLimit }
    });
    return response.data;
  },

  getFavoriteDestinationImages: async (destinationLimit = 8) => {
    const response = await api.get(`${BASE_PATH}/home/destination-images`, {
      params: { destinationLimit }
    });
    return response.data;
  },

  // Search tours with filters and pagination
  searchTours: async (params) => {
    const response = await api.get(`${BASE_PATH}/search`, { params });
    return response.data;
  },

  // Get all start locations for filter dropdown
  getStartLocations: async () => {
    const response = await api.get(`${BASE_PATH}/start-locations`);
    return response.data;
  },

  // Toggle favorite for a route
  toggleFavorite: async (routeId) => {
    const response = await api.post(`${BASE_PATH}/${routeId}/favorite`);
    return response.data;
  },

  // Check if route is favorited
  checkFavorite: async (routeId) => {
    const response = await api.get(`${BASE_PATH}/${routeId}/favorite`);
    return response.data;
  }
};

export default customerTourService;
