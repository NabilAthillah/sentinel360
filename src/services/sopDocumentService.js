import api from "../utils/api";

const sopDocumentService = {

getSop: async (token) => {
        try {
            const response = await api.get(`master-settings/sop-documents`, {
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

    addSop: async (payload) => {
        try {
            const response = await api.post(`master-settings/sop-documents`, payload);

            if (response.data) {
                return response.data;
            }
        } catch (error) {
            throw error.response ? error.response.data : { message: 'Network error' };
        }
    },

    editSop: async (id, payload) => {
        try {
            const response = await api.put(`master-settings/sop-documents/${id}`, payload);

            if (response.data) {
                return response.data;
            }
        } catch (error) {
            throw error.response ? error.response.data : { message: 'Network error' };
        }
    },

    deleteSop: async (id) => {
        try {
            const response = await api.delete(`master-settings/sop-documents/${id}`)
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
};

export default sopDocumentService;