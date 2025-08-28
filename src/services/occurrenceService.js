import api from "../utils/api";

const occurrenceService = {
    addOccurrence: async (token, data) => {
        try {
            const response = await api.post(`/occcurrences`, {
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
            const response = await api.get(`/occcurrences`, {
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
            const response = await api.delete(`/occcurrences/${id}`, {
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
            const response = await api.put(`/occcurrences/${id}`, data);

            if (response.data) {
                return response.data;
            }
        } catch (error) {
            throw error.response ? error.response.data : { message: 'Network error' };
        }
    },
}

export default occurrenceService;