import api from '../config/api';

export const colorService = {
    // Get all colors
    getColor: async (isAll = false) => {
        const params = isAll ? { isAll } : {};
        const response = await api.get('color/getColor', { params });
        return response.data;
    },

    // Add new color
    addColor: async (colorData) => {
        const response = await api.post('color/addColor', colorData);
        return response.data;
    },

    // Update color
    updateColor: async (id, colorData) => {
        const response = await api.put(`color/updateColor/${id}`, colorData);
        return response.data;
    },

    // Delete color
    deleteColor: async (id) => {
        const response = await api.delete(`color/deleteColor/${id}`);
        return response.data;
    }
};
