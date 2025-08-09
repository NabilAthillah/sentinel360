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

    storeAuditTrails: async (token, id, title, description, status, category) => {
        try {
            const response = await api.post('/audit-trails', {
                title,
                description,
                user_id: id,
                status,
                category
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                
            })
            if (response.data) {
                return response.data;
            }
        } catch (error) {
            throw error.response ? error.response.data : { message: 'Network error' };
        }
    }
}

export default auditTrialsService