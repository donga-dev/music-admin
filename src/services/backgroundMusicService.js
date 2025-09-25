import api from '../config/api';

export const backgroundMusicService = {
    // Get all background music
    getBackgroundMusic: async () => {
        const response = await api.get('backgroundMusic/getBackgroundMusic');
        return response.data;
    },

    // Add new background music
    addBackgroundMusic: async (formData) => {
        const response = await api.post('backgroundMusic/addBackgroundMusic', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    // Update background music
    updateBackgroundMusic: async (id, formData) => {
        const response = await api.put(`backgroundMusic/updateBackgroundMusic/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    // Delete background music
    deleteBackgroundMusic: async (id) => {
        const response = await api.delete(`backgroundMusic/deleteBackgroundMusic/${id}`);
        return response.data;
    }
};
