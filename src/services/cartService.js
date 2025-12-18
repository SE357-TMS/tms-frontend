import api from '../lib/httpHandler';

/**
 * Service for cart-related API calls
 */
const cartService = {
  /**
   * Get current user's cart
   * @returns {Promise} API response with cart data
   */
  getCart: async () => {
    return api.get('/cart');
  },

  /**
   * Add trip to cart
   * @param {Object} data - Cart item data
   * @param {number} data.tripId - Trip ID
   * @param {number} data.quantity - Number of seats
   * @returns {Promise} API response
   */
  addToCart: async (data) => {
    return api.post('/cart/items', data);
  },

  /**
   * Update cart item quantity
   * @param {number} cartItemId - Cart item ID
   * @param {Object} data - Update data
   * @param {number} data.quantity - New quantity
   * @returns {Promise} API response
   */
  updateCartItem: async (cartItemId, data) => {
    return api.put(`/cart/items/${cartItemId}`, data);
  },

  /**
   * Remove item from cart
   * @param {number} cartItemId - Cart item ID
   * @returns {Promise} API response
   */
  removeFromCart: async (cartItemId) => {
    return api.delete(`/cart/items/${cartItemId}`);
  },

  /**
   * Clear all items from cart
   * @returns {Promise} API response
   */
  clearCart: async () => {
    return api.delete('/cart/clear');
  },

  /**
   * Check if a trip is already in the cart
   * @param {number} tripId - Trip ID
   * @returns {Promise} API response with boolean
   */
  checkTripInCart: async (tripId) => {
    return api.get(`/cart/check/${tripId}`);
  },

  /**
   * Get cart item count
   * @returns {Promise} API response with count
   */
  getCartCount: async () => {
    return api.get('/cart/count');
  }
};

export default cartService;
