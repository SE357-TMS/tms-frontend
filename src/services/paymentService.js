import api from "../lib/httpHandler";

const PAYOS_BASE_PATH = "/api/v1/payment";

const paymentService = {
  /**
   * Create PayOS payment link
   * @param {Object} data - { bookingId, amount, description, buyerName, buyerEmail, buyerPhone }
   */
  createPaymentLink: async (data) => {
    return api.post(`${PAYOS_BASE_PATH}/create-payment`, data);
  },

  /**
   * Get payment info by order code
   * @param {string|number} orderCode
   */
  getPaymentInfo: async (orderCode) => {
    return api.get(`${PAYOS_BASE_PATH}/payment-requests/${orderCode}`);
  },

  /**
   * Cancel payment link
   * @param {string|number} orderCode
   * @param {string} cancellationReason
   */
  cancelPaymentLink: async (orderCode, cancellationReason = "User cancelled") => {
    return api.post(`${PAYOS_BASE_PATH}/payment-requests/${orderCode}/cancel`, {
      cancellationReason,
    });
  },

  /**
   * Verify payment status and update booking
   * @param {string} bookingId
   * @param {string|number} orderCode
   */
  verifyAndUpdatePayment: async (bookingId, orderCode) => {
    return api.post(`${PAYOS_BASE_PATH}/verify-payment`, {
      bookingId,
      orderCode,
    });
  },

  /**
   * Store payment URL in localStorage
   * @param {string} bookingId
   * @param {Object} paymentData - { orderCode, checkoutUrl, qrCode, amount }
   */
  storePaymentUrl: (bookingId, paymentData) => {
    const key = `payment_${bookingId}`;
    localStorage.setItem(key, JSON.stringify({
      ...paymentData,
      timestamp: Date.now(),
    }));
  },

  /**
   * Get stored payment URL from localStorage
   * @param {string} bookingId
   */
  getStoredPaymentUrl: (bookingId) => {
    const key = `payment_${bookingId}`;
    const stored = localStorage.getItem(key);
    if (!stored) return null;
    
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  },

  /**
   * Clear stored payment URL from localStorage
   * @param {string} bookingId
   */
  clearStoredPaymentUrl: (bookingId) => {
    const key = `payment_${bookingId}`;
    localStorage.removeItem(key);
  },

  /**
   * Clear all stored payment URLs (call on logout)
   */
  clearAllStoredPayments: () => {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('payment_')) {
        keys.push(key);
      }
    }
    keys.forEach(key => localStorage.removeItem(key));
  },
};

export default paymentService;
