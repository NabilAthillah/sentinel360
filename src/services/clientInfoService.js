import api from "../utils/api";

const clientInfoService = {
    getData: async (token) => {
        try {
            const response = await api.get('/client-info', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : { message: 'Network error' };
        }
    },

    updateData: async (token, payload, id) => {
        try {
            const response = await api.put(`/client-info/${id}`,
                payload,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : { message: 'Network error' };
        }
    }
}

export default clientInfoService;