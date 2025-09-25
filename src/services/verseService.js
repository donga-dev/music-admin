import api from '../config/api';

export const verseService = {
    // Get all verses
    getVerse: async (isAll = false) => {
        const params = isAll ? { isAll } : {};
        const response = await api.get('verse/getVerse', { params });
        return response.data;
    },

    // Add new verse
    addVerse: async (verseData) => {
        const response = await api.post('verse/addVerse', verseData);
        return response.data;
    },

    // Update verse
    updateVerse: async (id, verseData) => {
        const response = await api.put(`verse/updateVerse/${id}`, verseData);
        return response.data;
    },

    // Delete verse
    deleteVerse: async (id) => {
        const response = await api.delete(`verse/deleteVerse/${id}`);
        return response.data;
    }
};
