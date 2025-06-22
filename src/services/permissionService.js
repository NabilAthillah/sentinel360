import api from "../utils/api";

const permissionService = {
    getAllPermissions: async (token) => {
        try {
            const response = await api.get('/permissions', {
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

export default permissionService;