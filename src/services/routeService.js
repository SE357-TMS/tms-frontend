import api from '../lib/httpHandler';

/**
 * Service for route-related API calls
 */
const routeService = {
  /**
   * Get all routes with optional filters
   * @param {Object} params - Query parameters
   * @returns {Promise} API response
   */
  getRoutes: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `/routes?${queryString}` : '/routes';
    return api.get(url);
  },

  /**
   * Get route detail by ID
   * @param {number} id - Route ID
   * @returns {Promise} API response with route details including itinerary
   */
  getRouteById: async (id) => {
    return api.get(`/routes/${id}`);
  },

  /**
   * Get route detail with full information (for customer view)
   * @param {number} id - Route ID
   * @returns {Promise} API response with complete route details
   */
  getRouteDetail: async (id) => {
    return api.get(`/routes/${id}/detail`);
  },

  /**
   * Get route images
   * @param {number} routeId - Route ID
   * @returns {Promise} Array of image URLs
   */
  getRouteImages: async (routeId) => {
    return api.get(`/images/routes/${routeId}/images`);
  },

  /**
   * Search routes
   * @param {Object} searchParams - Search parameters
   * @returns {Promise} API response
   */
  searchRoutes: async (searchParams) => {
    return api.post('/routes/search', searchParams);
  },

  /**
   * Get popular routes
   * @param {number} limit - Number of routes to return
   * @returns {Promise} API response
   */
  getPopularRoutes: async (limit = 10) => {
    return api.get(`/routes/popular?limit=${limit}`);
  },

  /**
   * Get routes by category
   * @param {number} categoryId - Category ID
   * @returns {Promise} API response
   */
  getRoutesByCategory: async (categoryId) => {
    return api.get(`/routes/category/${categoryId}`);
  }
};

export default routeService;
