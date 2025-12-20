import api from '../lib/httpHandler';

const BASE_PATH = '/api/v1/routes';

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
    const url = queryString ? `${BASE_PATH}?${queryString}` : BASE_PATH;
    return api.get(url);
  },

  /**
   * Get route detail by ID
   * @param {string} id - Route ID (UUID)
   * @returns {Promise} API response with route details including itinerary
   */
  getRouteById: async (id) => {
    return api.get(`${BASE_PATH}/${id}`);
  },

  /**
   * Get route detail with full information (for customer view)
   * @param {string} id - Route ID (UUID)
   * @returns {Promise} API response with route detail and trips
   */
  getRouteDetail: async (id) => {
    return api.get(`${BASE_PATH}/${id}/detail`);
  },

  /**
   * Get full route detail including itinerary and trips
   * @param {string} id - Route ID (UUID)
   * @returns {Promise} API response with route and trip metadata
   */
  getRouteFullDetail: async (id) => {
    return api.get(`${BASE_PATH}/${id}/full`);
  },

  /**
   * Get image URLs for a specific route
   * @param {string} id - Route ID (UUID)
   * @returns {Promise} API response with image URLs
   */
  getRouteImages: async (id) => {
    return api.get(`${BASE_PATH}/${id}/images`);
  },

  /**
   * Get all routes without pagination
   * @returns {Promise} API response
   */
  getAllRoutes: async () => {
    return api.get(`${BASE_PATH}/all`);
  }
};

export default routeService;
