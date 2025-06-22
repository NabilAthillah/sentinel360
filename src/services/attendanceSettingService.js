import api from "../utils/api";

const attendanceSettingService = {
    getAttendanceSetting: async (token) => {
        try {
            const response = await api.get('/attendance-settings', {
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

    updateAttendanceSetting: async (token, data) => {
        try {
            const response = await api.post('/attendance-settings', {
                data
            }, {
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
    }
}

export default attendanceSettingService;