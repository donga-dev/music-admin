import api from "../config/api";

export const musicService = {
  // Get all music
  getMusic: async (params = {}) => {
    const response = await api.get("music/getMusic", { params });
    return response.data;
  },

  // Add new music
  addMusic: async (formData) => {
    const response = await api.post("music/addMusic", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Update music
  updateMusic: async (id, formData) => {
    const response = await api.put(`music/updateMusic/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Delete music
  deleteMusic: async (id) => {
    const response = await api.delete(`music/deleteMusic/${id}`);
    return response.data;
  },

  // Update premium status
  updatePremiumStatus: async (id, isSubscribe) => {
    const formData = new FormData();
    formData.append("isSubscribe", isSubscribe.toString());

    const response = await api.put(`music/updateMusic/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
};
