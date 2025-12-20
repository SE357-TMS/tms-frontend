import api from '../lib/httpHandler';

const BASE_PATH = '/api/v1/cart';

/**
 * Service for cart-related API calls
 */
const cartService = {
  /**
   * Get current user's cart
   * @returns {Promise} API response with cart data
   */
  getCart: async () => {
    return api.get(BASE_PATH);
  },

  /**
   * Add trip to cart
   * @param {string} tripId - Trip ID (UUID)
   * @param {number} quantity - Number of seats
   * @returns {Promise} API response
   */
  addToCart: async (tripId, quantity) => {
    return api.post(`${BASE_PATH}/items`, { tripId, quantity });
  },

  /**
   * Update cart item quantity
   * @param {string} cartItemId - Cart item ID (UUID)
   * @param {number} quantity - New quantity
   * @returns {Promise} API response
   */
  updateCartItem: async (cartItemId, quantity) => {
    return api.put(`${BASE_PATH}/items/${cartItemId}`, { quantity });
  },

  /**
   * Remove item from cart
   * @param {string} cartItemId - Cart item ID (UUID)
   * @returns {Promise} API response
   */
  removeFromCart: async (cartItemId) => {
    return api.delete(`${BASE_PATH}/items/${cartItemId}`);
  },

  /**
   * Remove multiple items from cart
   * @param {string[]} cartItemIds - Array of Cart item IDs (UUID)
   * @returns {Promise} API response
   */
  removeMultipleFromCart: async (cartItemIds) => {
    return api.post(`${BASE_PATH}/items/bulk-delete`, cartItemIds);
  },

  /**
   * Clear all items from cart
   * @returns {Promise} API response
   */
  clearCart: async () => {
    return api.delete(`${BASE_PATH}/clear`);
  },

  /**
   * Check if a trip is already in the cart
   * @param {string} tripId - Trip ID (UUID)
   * @returns {Promise<boolean>} True if trip is in cart
   */
  hasTripInCart: async (tripId) => {
    try {
      const response = await api.get(`${BASE_PATH}/check/${tripId}`);
      return response?.data?.data || false;
    } catch (error) {
      console.error('Error checking cart:', error);
      return false;
    }
  },

  /**
   * Get cart item count
   * @returns {Promise<number>} Number of items in cart
   */
  getCartCount: async () => {
    try {
      const cartResponse = await api.get(BASE_PATH);
      return cartResponse?.data?.items?.length || 0;
    } catch (error) {
      return 0;
    }
  }
};

export default cartService;
