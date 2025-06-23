import api from "../utils/api";

const siteService = {
    getAllSite: async (token) => {
        try {
            const response = await api.get('/sites', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data) {
                return response.data
            }
        } catch (error) {
            throw error.response ? error.response.data : { message: 'Network error' };
        }
    },

    addSite: async (token, payload) => {
        try {
            const response = await api.post('/sites', payload, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            if (response.data) {
                return response.data;
            }
        } catch (error) {
            throw error.response ? error.response.data : { message: 'Network error' };
        }
    },

    editSite: async (token, id, payload) => {
        try {
            const response = await api.put(`/sites/${id}`, payload, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            if (response.data) {
                return response.data;
            }
        } catch (error) {
            throw error.response ? error.response.data : { message: 'Network error' };
        }
    },

    deleteSite: async (token, id) => {
        try {
            const response = await api.post(`/sites/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            if (response.data) {
                return response.data;
            }
        } catch (error) {
            throw error.response ? error.response.data : { message: 'Network error' };
        }
    }
}

export default siteService