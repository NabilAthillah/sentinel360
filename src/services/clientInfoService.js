import api from "../utils/api";

const clientInfoService = {
    getData: async () => {
        try {
            const response = await api.get('master-settings/client-info');
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : { message: 'Network error' };
        }
    },

    updateData: async (token, payload, id) => {
        try {
            const response = await api.put(`master-settings/client-info/${id}`,payload);
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : { message: 'Network error' };
        }
    }
}

export default clientInfoService;