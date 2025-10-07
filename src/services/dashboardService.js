import api from "../config/api";

export const dashboardService = {
  // Get dashboard statistics
  getDataCount: async () => {
    console.log("Making API call to: admin/data-count");
    const response = await api.get("admin/data-count");
    console.log("Raw API response:", response);
    console.log("Response data:", response.data);
    return response.data;
  },
};
