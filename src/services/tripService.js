import api from '../lib/httpHandler';

/**
 * Service for trip-related API calls
 */
const tripService = {
  /**
   * Get all trips with optional filters
   * @param {Object} params - Query parameters
   * @returns {Promise} API response
   */
  getTrips: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `/trips?${queryString}` : '/trips';
    return api.get(url);
  },

  /**
   * Get trip by ID
   * @param {number} id - Trip ID
   * @returns {Promise} API response
   */
  getTripById: async (id) => {
    return api.get(`/trips/${id}`);
  },

  /**
   * Get available trips for a route (trips at least 3 days in the future)
   * @param {number} routeId - Route ID
   * @returns {Promise} API response with available trips
   */
  getAvailableTripsByRoute: async (routeId) => {
    return api.get(`/trips/route/${routeId}/available`);
  },

  /**
   * Get trips by route ID
   * @param {number} routeId - Route ID
   * @returns {Promise} API response
   */
  getTripsByRoute: async (routeId) => {
    return api.get(`/trips/route/${routeId}`);
  },

  /**
   * Get nearest available trip for a route
   * @param {number} routeId - Route ID
   * @returns {Promise} API response with nearest trip
   */
  getNearestTrip: async (routeId) => {
    return api.get(`/trips/route/${routeId}/nearest`);
  },

  /**
   * Get upcoming trips
   * @param {number} limit - Number of trips to return
   * @returns {Promise} API response
   */
  getUpcomingTrips: async (limit = 10) => {
    return api.get(`/trips/upcoming?limit=${limit}`);
  },

  /**
   * Search trips
   * @param {Object} searchParams - Search parameters
   * @returns {Promise} API response
   */
  searchTrips: async (searchParams) => {
    return api.post('/trips/search', searchParams);
  }
};

export default tripService;
