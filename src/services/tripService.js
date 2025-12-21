import api from "../lib/httpHandler";

const BASE_PATH = "/api/v1/trips";

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
		const url = queryString ? `${BASE_PATH}?${queryString}` : BASE_PATH;
		return api.get(url);
	},

	/**
	 * Get trip by ID
	 * @param {string} id - Trip ID (UUID)
	 * @returns {Promise} API response
	 */
	getTripById: async (id) => {
		return api.get(`${BASE_PATH}/${id}`);
	},

	/**
	 * Get available trips for a route (trips at least 3 days in the future)
	 * @param {string} routeId - Route ID (UUID)
	 * @returns {Promise} API response with available trips
	 */
	getAvailableTripsByRoute: async (routeId) => {
		return api.get(`${BASE_PATH}/route/${routeId}/available`);
	},

	/**
	 * Get nearest available trip for a route
	 * @param {string} routeId - Route ID (UUID)
	 * @returns {Promise} API response with nearest trip
	 */
	getNearestTrip: async (routeId) => {
		return api.get(`${BASE_PATH}/route/${routeId}/nearest`);
	},

	/**
	 * Get all trips without pagination
	 * @returns {Promise} API response
	 */
	getAllTrips: async () => {
		return api.get(`${BASE_PATH}/all`);
	},

	/**
	 * Update a trip
	 * @param {string} id - Trip ID (UUID)
	 * @param {Object} data - Update data
	 * @returns {Promise} API response
	 */
	updateTrip: async (id, data) => {
		return api.put(`${BASE_PATH}/${id}`, data);
	},

	/**
	 * Create a new trip
	 * @param {Object} data - Trip data
	 * @returns {Promise} API response
	 */
	createTrip: async (data) => {
		return api.post(BASE_PATH, data);
	},

	/**
	 * Delete a trip
	 * @param {string} id - Trip ID (UUID)
	 * @returns {Promise} API response
	 */
	deleteTrip: async (id) => {
		return api.delete(`${BASE_PATH}/${id}`);
	},
};

export default tripService;
