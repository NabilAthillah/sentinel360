import api from "../utils/api";

const auditTrialsService = {
    getAuditTrails: async (token) => {
        try {
            const response = await api.get('/audit-trails', {
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
}

export default auditTrialsService