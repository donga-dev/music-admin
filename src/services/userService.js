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

  // Create new user using admin/signup endpoint
  createUser: async (userData) => {
    const formData = new FormData();

    // Add required fields
    formData.append("email", userData.email);
    formData.append("password", userData.password || "Default@123");
    formData.append("fname", userData.fname);
    formData.append("lname", userData.lname);
    formData.append("phone", userData.phone);
    formData.append("phoneCode", userData.phoneCode || "+91");
    formData.append("role", userData.role || "user");

    // Add optional fields with defaults
    formData.append("font", userData.font || "ubuntu");
    formData.append("fontColor", userData.fontColor || "black");
    formData.append("fontSize", userData.fontSize || "16");
    formData.append("verseColor", userData.verseColor || "black");
    formData.append("verseType", userData.verseType || "Solidcolor");

    // Add photo if provided
    if (userData.photo) {
      formData.append("photo", userData.photo);
    }

    // Add verseBackgroundId if provided
    if (userData.verseBackgroundId) {
      formData.append("verseBackgroundId", userData.verseBackgroundId);
    }

    const response = await api.post("admin/signup", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Update user using admin/updateUser endpoint
  updateUser: async (userId, userData) => {
    const formData = new FormData();

    // Add userId as required parameter
    formData.append("userId", userId);

    // Add only editable fields
    if (userData.fname) formData.append("fname", userData.fname);
    if (userData.lname) formData.append("lname", userData.lname);
    if (userData.phone) formData.append("phone", userData.phone);

    const response = await api.put("admin/updateUser", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Block/Delete user using admin/block endpoint
  deleteUser: async (userId) => {
    const response = await api.put(
      "admin/block",
      {
        userId: userId,
        status: "deleted",
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  },
};
