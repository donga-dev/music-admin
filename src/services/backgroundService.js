import api from '../config/api';

export const backgroundService = {
    // Get all backgrounds
    getBackground: async () => {
        console.log('Making API call to: background/getBackground');
        const response = await api.get('background/getBackground');
        console.log('Raw API response:', response);
        console.log('Response data:', response.data);
        return response.data;
    },

    // Add new background
    addBackground: async (formData) => {
        const response = await api.post('background/addBackground', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    // Delete background
    deleteBackground: async (id) => {
        const response = await api.delete(`background/deleteBackground/${id}`);
        return response.data;
    }
};
