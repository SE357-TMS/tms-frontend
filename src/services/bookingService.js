import api from "./api";

const BOOKING_ENDPOINT = "/tour-bookings";

/**
 * Booking Service - API calls for booking management
 */
const bookingService = {
	/**
	 * Get all bookings with pagination and filters
	 * @param {Object} params - Filter parameters
	 * @param {number} params.page - Page number (1-based)
	 * @param {number} params.pageSize - Items per page
	 * @param {string} params.keyword - Search by customer name, email, or route
	 * @param {string} params.status - Filter by status (PENDING, CONFIRMED, CANCELED, COMPLETED)
	 * @param {string} params.sortBy - Sort field
	 * @param {string} params.sortDirection - Sort direction (asc/desc)
	 * @param {string} params.fromDate - Filter by booking date from (YYYY-MM-DD)
	 * @param {string} params.toDate - Filter by booking date to (YYYY-MM-DD)
	 * @param {string} params.departureFrom - Filter by departure date from
	 * @param {string} params.departureTo - Filter by departure date to
	 */
	getAll: async (params = {}) => {
		const queryParams = new URLSearchParams();

		if (params.page) queryParams.append("page", params.page);
		if (params.pageSize) queryParams.append("pageSize", params.pageSize);
		if (params.keyword) queryParams.append("keyword", params.keyword);
		if (params.status) queryParams.append("status", params.status);
		if (params.sortBy) queryParams.append("sortBy", params.sortBy);
		if (params.sortDirection)
			queryParams.append("sortDirection", params.sortDirection);
		if (params.fromDate) queryParams.append("fromDate", params.fromDate);
		if (params.toDate) queryParams.append("toDate", params.toDate);
		if (params.departureFrom)
			queryParams.append("departureFrom", params.departureFrom);
		if (params.departureTo)
			queryParams.append("departureTo", params.departureTo);
		if (params.userId) queryParams.append("userId", params.userId);
		if (params.tripId) queryParams.append("tripId", params.tripId);

		const queryString = queryParams.toString();
		const url = queryString
			? `${BOOKING_ENDPOINT}?${queryString}`
			: BOOKING_ENDPOINT;

		return api.get(url);
	},

	/**
	 * Get booking by ID
	 * @param {string} id - Booking UUID
	 */
	getById: async (id) => {
		return api.get(`${BOOKING_ENDPOINT}/${id}`);
	},

	/**
	 * Get bookings by user ID
	 * @param {string} userId - User UUID
	 */
	getByUserId: async (userId) => {
		return api.get(`${BOOKING_ENDPOINT}/user/${userId}`);
	},

	/**
	 * Create new booking
	 * @param {Object} bookingData - Booking data
	 * @param {string} bookingData.tripId - Trip UUID
	 * @param {string} bookingData.userId - User UUID
	 * @param {number} bookingData.noAdults - Number of adults
	 * @param {number} bookingData.noChildren - Number of children
	 * @param {Array} bookingData.travelers - Array of traveler info
	 * @param {string} bookingData.travelers[].fullName - Traveler full name
	 * @param {string} bookingData.travelers[].gender - Gender (M/F/O)
	 * @param {string} bookingData.travelers[].dateOfBirth - Date of birth (YYYY-MM-DD)
	 * @param {string} bookingData.travelers[].identityDoc - Identity document number
	 */
	create: async (bookingData) => {
		return api.post(BOOKING_ENDPOINT, bookingData);
	},

	/**
	 * Update booking
	 * @param {string} id - Booking UUID
	 * @param {Object} updateData - Update data
	 * @param {string} updateData.status - New status (PENDING, CONFIRMED, CANCELED, COMPLETED)
	 * @param {Array} updateData.travelers - Updated travelers (optional)
	 * @param {number} updateData.noAdults - Updated number of adults
	 * @param {number} updateData.noChildren - Updated number of children
	 * @param {string} updateData.notes - Special notes
	 */
	update: async (id, updateData) => {
		return api.put(`${BOOKING_ENDPOINT}/${id}`, updateData);
	},

	/**
	 * Update booking status only
	 * @param {string} id - Booking UUID
	 * @param {string} status - New status
	 */
	updateStatus: async (id, status) => {
		return api.put(`${BOOKING_ENDPOINT}/${id}`, { status });
	},

	/**
	 * Cancel booking
	 * @param {string} id - Booking UUID
	 */
	cancel: async (id) => {
		return api.post(`${BOOKING_ENDPOINT}/${id}/cancel`);
	},

	/**
	 * Delete booking (Admin only)
	 * @param {string} id - Booking UUID
	 */
	delete: async (id) => {
		return api.delete(`${BOOKING_ENDPOINT}/${id}`);
	},

	/**
	 * Confirm booking (change status to CONFIRMED)
	 * @param {string} id - Booking UUID
	 */
	confirm: async (id) => {
		return api.put(`${BOOKING_ENDPOINT}/${id}`, { status: "CONFIRMED" });
	},

	/**
	 * Complete booking (change status to COMPLETED)
	 * @param {string} id - Booking UUID
	 */
	complete: async (id) => {
		return api.put(`${BOOKING_ENDPOINT}/${id}`, { status: "COMPLETED" });
	},
};

export default bookingService;
