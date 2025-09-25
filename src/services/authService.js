import api from '../config/api';

export const authService = {
    // Login
    login: async (email, password) => {
        const response = await api.post('admin/login', { email, password });
        return response.data;
    },

    // Signup
    signup: async (formData) => {
        const response = await api.post('admin/signup', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    // Get user profile
    getUser: async () => {
        const response = await api.get('admin/get-user');
        return response.data;
    },

    // Update user profile
    updateUser: async (formData) => {
        const response = await api.put('admin/updateUser', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    // Reset password
    resetPassword: async (email, password, newPassword) => {
        const response = await api.post('admin/reset', {
            email,
            password,
            newPassword
        });
        return response.data;
    },

    // Verify email
    verifyEmail: async (email) => {
        const response = await api.put('admin/verify-email', { email });
        return response.data;
    },

    // Verify code
    verifyCode: async (email, code) => {
        const response = await api.put('admin/verify-code', { email, code });
        return response.data;
    }
};
