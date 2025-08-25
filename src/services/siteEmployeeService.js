import api from "../utils/api";

const siteEmployeeService = {
    getAllSiteEmployee: async (token, allocationType, shiftType, date) => {
        try {
            const response = await api.get('/site-user', {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                params: {
                    allocationType,
                    shiftType,
                    date
                }
            });
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : { message: 'Network error' };
        }
    },

    getNearestSiteUser: async (token, user) => {
        try {
            const response = await api.get(`/site-user/user/nearest/${user.id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : { message: 'Network error' };
        }
    },

    getById: async (token, id) => {
        try {
            const response = await api.get(`/site-user/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : { message: 'Network error' };
        }
    },

    getAllSiteUser: async (token, user) => {
        try {
            const response = await api.get(`/site-user/user/data/${user.employee.id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : { message: 'Network error' };
        }
    },

    allocationUserToSite: async (id, token, id_employee, allocationType, shiftType, date) => {
        try {
            const response = await api.put(`/site-user/allocation/${id}`, {
                id_employee,
                allocationType,
                shiftType,
                date
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

    editAttendance: async (token, id, status) => {
        try {
            const response = await api.put(`/site-user/${id}`, {
                status,
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
    }

}

export default siteEmployeeService;