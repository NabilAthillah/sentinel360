import api from "../utils/api";

const occurrenceService = {
    addOccurrence: async (token, data) => {
        try {
            const response = await api.post(`/occurrences`, {
                occurrences: data,
            }, {
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

    getAllOccurrence: async (token) => {
        try {
            const response = await api.get(`/occurrences`, {
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

    deleteOccurrence: async (token, id) => {
        try {
            const response = await api.delete(`/occurrences/${id}`, {
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

    updateOccurrence: async (token, id, data) => {
        try {
            const response = await api.put(`/occurrences/${id}`, data);

            if (response.data) {
                return response.data;
            }
        } catch (error) {
            throw error.response ? error.response.data : { message: 'Network error' };
        }
    },
}

export default occurrenceService;