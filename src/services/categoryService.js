import api from '../config/api';

export const categoryService = {
    // Get all categories
    getCategories: async (isAll = false) => {
        const params = isAll ? { isAll } : {};
        const response = await api.get('category/getCategory', { params });
        return response.data;
    },

    // Add new category
    addCategory: async (name) => {
        const response = await api.post('category/addCategory', { name });
        return response.data;
    },

    // Update category
    updateCategory: async (id, name) => {
        const response = await api.put(`category/updateCategory/${id}`, { name });
        return response.data;
    },

    // Delete category
    deleteCategory: async (id) => {
        const response = await api.delete(`category/deleteCategory/${id}`);
        return response.data;
    }
};
