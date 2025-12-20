import api from "../lib/httpHandler";

const BASE_PATH = "/api/v1/customer/bookings";

const bookingService = {
  /**
   * Create a new booking
   * @param {Object} data - { tripId, quantity, cartItemId?, travelers? }
   */
  createBooking: async (data) => {
    return api.post(BASE_PATH, data);
  },

  /**
   * Get booking by ID
   * @param {string} bookingId
   */
  getBookingById: async (bookingId) => {
    return api.get(`${BASE_PATH}/${bookingId}`);
  },

  /**
   * Get all bookings for current user (reservation list)
   * @param {string} status - 'all', 'paid', 'unpaid'
   */
  getMyBookings: async (status = "all") => {
    return api.get(`${BASE_PATH}?status=${status}`);
  },

  /**
   * Get payment page data for a booking
   * @param {string} bookingId
   */
  getPaymentPageData: async (bookingId) => {
    return api.get(`${BASE_PATH}/${bookingId}/payment`);
  },

  /**
   * Add travelers to a booking
   * @param {string} bookingId
   * @param {Array} travelers - Array of traveler objects
   */
  addTravelers: async (bookingId, travelers) => {
    return api.post(`${BASE_PATH}/${bookingId}/travelers`, travelers);
  },

  /**
   * Update a specific traveler
   * @param {string} bookingId
   * @param {string} travelerId
   * @param {Object} travelerData
   */
  updateTraveler: async (bookingId, travelerId, travelerData) => {
    return api.put(`${BASE_PATH}/${bookingId}/travelers/${travelerId}`, travelerData);
  },

  /**
   * Update booking quantity
   * @param {string} bookingId
   * @param {number} quantity
   */
  updateQuantity: async (bookingId, quantity) => {
    return api.put(`${BASE_PATH}/${bookingId}/quantity?quantity=${quantity}`);
  },

  /**
   * Confirm booking
   * @param {string} bookingId
   */
  confirmBooking: async (bookingId) => {
    return api.post(`${BASE_PATH}/${bookingId}/confirm`);
  },

  /**
   * Cancel booking
   * @param {string} bookingId
   */
  cancelBooking: async (bookingId) => {
    return api.post(`${BASE_PATH}/${bookingId}/cancel`);
  },

  /**
   * Update payment method
   * @param {string} bookingId
   * @param {string} paymentMethod - 'CASH', 'BANK_TRANSFER', 'E_WALLET'
   */
  updatePaymentMethod: async (bookingId, paymentMethod) => {
    return api.put(`${BASE_PATH}/${bookingId}/payment-method`, { paymentMethod });
  },

  /**
   * Mark booking as paid (demo/testing)
   * @param {string} bookingId
   */
  markAsPaid: async (bookingId) => {
    return api.post(`${BASE_PATH}/${bookingId}/mark-paid`);
  },
};

export default bookingService;
