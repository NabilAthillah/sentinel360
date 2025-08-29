import api from "../utils/api";

const attendanceService = {
    storeAttendance: async (token, payload) => {
        try {
            const response = await api.post('/attendances', payload, {
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

    updateAttendance: async (token, payload, id) => {
        try {
            const response = await api.put(`/attendances/${id}`, payload, {
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

    getAttendanceBySiteUserShift: async (token, params) => {
        try {
            const response = await api.get('/attendances', {
                params,
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : { message: 'Network error' };
        }
    },

    checkIn: async (token, payload) => {
        try {
            const response = await api.post('/attendances/check-in', payload, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            throw (error.response ? error.response.data : { message: 'Network error' });
        }
    },

    checkOut: async (token, payload) => {
        try {
            const response = await api.post('/attendances/check-out', payload, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            throw (error.response ? error.response.data : { message: 'Network error' });
        }
    },
}

export default attendanceService;