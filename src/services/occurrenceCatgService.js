import api from "../utils/api";

const occurrenceCatgService = {
    getCategories: async (token) => {
        try {
            const response = await api.get(`master-settings/occurrence-categories`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data) {
                return response.data;
            }
        } catch (error) {
            throw error.response ? error.response.data : { message: 'Network error' };
        }
    },

    addCategory: async (token, name) => {
        try {
            const response = await api.post(`master-settings/occurrence-categories`, { name: name });

            if (response.data) {
                return response.data;
            }
        } catch (error) {
            throw error.response ? error.response.data : { message: 'Network error' };
        }
    },

    editCategory: async (token, id, name) => {
        try {
            const response = await api.put(`master-settings/occurrence-categories/${id}`, { name: name });

            if (response.data) {
                return response.data;
            }
        } catch (error) {
            throw error.response ? error.response.data : { message: 'Network error' };
        }
    },

    editCategoryStatus: async (token, id, status) => {
        try {
            const response = await api.put(`master-settings/occurrence-categories/${id}`, { status });

            if (response.data) {
                return response.data;
            }
        } catch (error) {
            throw error.response ? error.response.data : { message: 'Network error' };
        }
    },

    deleteCategory: async (id) => {
        try {
            const response = await api.delete(`master-settings/occurrence-categories/${id}`)
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : { message: 'Network error' };
        }
    },

    deleteRoute: async (token, route) => {
        try {
            const response = await api.post(`/routes/${route.id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data) {
                return response.data;
            }
        } catch (error) {
            throw error.response ? error.response.data : { message: 'Network error' };
        }
    }
}

export default occurrenceCatgService;