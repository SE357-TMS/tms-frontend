import api from '../lib/httpHandler';

const BASE_PATH = '/api/v1/customer/profile';

/**
 * Service for customer profile-related API calls
 */
const customerProfileService = {
  /**
   * Get current user's profile
   * @returns {Promise} API response with profile data
   */
  getProfile: async () => {
    return api.get(`${BASE_PATH}/me`);
  },
};

export default customerProfileService;
