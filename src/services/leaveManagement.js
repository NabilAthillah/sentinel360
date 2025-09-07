import api from "../utils/api";


const leaveManagement = {
    getLeaveManagement: async (token) => {
        try {
            const response = await api.get(`/leave-managements`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.data) {
                return response.data;
            }
        } catch (error) {
            throw error.response ? error.response.data : { message: "Network error" };
        }
    },
    addLeaveManagement: async (payload, token) => {
        try {
            const response = await api.post('/leave-managements', payload, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : { message: 'Network error' };
        }
    },



}

export default leaveManagement