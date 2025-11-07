import api from './api';
import { API_ENDPOINTS } from '../config/constants';

export const userService = {
  // Get all users
  getAllUsers: async () => {
    const response = await api.get(API_ENDPOINTS.USERS.BASE);
    return response.data;
  },

  // Get user by ID
  getUserById: async (id) => {
    const response = await api.get(API_ENDPOINTS.USERS.BY_ID(id));
    return response.data;
  },

  // Create new user
  createUser: async (userData) => {
    const response = await api.post(API_ENDPOINTS.USERS.BASE, userData);
    return response.data;
  },

  // Update user
  updateUser: async (id, userData) => {
    const response = await api.put(API_ENDPOINTS.USERS.BY_ID(id), userData);
    return response.data;
  },

  // Delete user
  deleteUser: async (id) => {
    const response = await api.delete(API_ENDPOINTS.USERS.BY_ID(id));
    return response.data;
  },

  // Get users by role
  getUsersByRole: async (role) => {
    const response = await api.get(API_ENDPOINTS.USERS.BY_ROLE(role));
    return response.data;
  },
};

export default userService;
