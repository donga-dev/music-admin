import api from '../config/api';

export const notesCategoryService = {
    // Get all note categories
    getNoteCategories: async (isAll = false) => {
        const params = isAll ? { isAll } : {};
        const response = await api.get('noteCategory/getNoteCategory', { params });
        return response.data;
    },

    // Add new note category
    addNoteCategory: async (name) => {
        const response = await api.post('noteCategory/addNoteCategory', { name });
        return response.data;
    },

    // Update note category
    updateNoteCategory: async (id, name) => {
        const response = await api.put(`noteCategory/updateNoteCategory/${id}`, { name });
        return response.data;
    },

    // Delete note category
    deleteNoteCategory: async (id) => {
        const response = await api.delete(`noteCategory/deleteNoteCategory/${id}`);
        return response.data;
    }
};
