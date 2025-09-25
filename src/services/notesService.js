import api from '../config/api';

export const notesService = {
    // Get all notes
    getNotes: async (categoryId = null) => {
        const params = categoryId ? { categoryId } : {};
        const response = await api.get('notes/getNotes', { params });
        return response.data;
    },

    // Add new note
    addNotes: async (noteData) => {
        const response = await api.post('notes/addNotes', noteData);
        return response.data;
    },

    // Update note
    updateNotes: async (id, noteData) => {
        const response = await api.put(`notes/updateNotes/${id}`, noteData);
        return response.data;
    },

    // Delete note
    deleteNotes: async (id) => {
        const response = await api.delete(`notes/deleteNotes/${id}`);
        return response.data;
    }
};
