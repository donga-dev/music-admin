import api from "../config/api";

export const userService = {
  // Get all users with pagination
  getUsers: async (page = 1, limit = 10) => {
    console.log(`Making API call to: admin/get-users?page=${page}&limit=${limit}`);
    const response = await api.get(`admin/get-users?page=${page}&limit=${limit}`);
    console.log("Raw API response:", response);
    console.log("Response data:", response.data);
    return response.data;
  },

  // Create new user (if endpoint exists)
  createUser: async (userData) => {
    const response = await api.post("admin/create-user", userData);
    return response.data;
  },

  // Update user (if endpoint exists)
  updateUser: async (userId, userData) => {
    const response = await api.put(`admin/update-user/${userId}`, userData);
    return response.data;
  },

  // Delete user (if endpoint exists)
  deleteUser: async (userId) => {
    const response = await api.delete(`admin/delete-user/${userId}`);
    return response.data;
  },
};
