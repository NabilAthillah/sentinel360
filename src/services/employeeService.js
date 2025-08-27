import api from "../utils/api";

const employeeService = {
    addEmployee: async (payload, token) => {
        try {
            const response = await api.post('/employees', payload, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : { message: 'Network error' };
        }
    },

    editEmployee: async (
        id,
        name,
        nric_fin_no,
        mobile,
        email,
        role,
        briefing_date,
        address,
        briefing_conducted,
        date_joined,
        profile
    ) => {
        try {
            const payload = {
                name,
                nric_fin_no,
                mobile,
                email,
                id_role: role,
                briefing_date,
                date_joined,
                address,
                briefing_conducted,
            };

            if (profile) {
                payload.profile = profile;
            }

            const response = await api.put(`/employees/${id}`, payload);

            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : { message: 'Network error' };
        }
    },



    getAllEmployee: async (token) => {
        try {
            const response = await api.get('/employees', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : { message: 'Network error' };
        }
    },
    updateEmployeeStatus: async (employeeId, status, token) => {
        try {
            const response = await api.put(
                `/employees/${employeeId}/status`,
                { status },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : { message: 'Network error' };
        }
    },


    deleteEmployee: async (id, token) => {
        try {
            const response = await api.delete(`/employees/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : { message: 'Network error' };
        }
    },

    disallocationUserFromSite: async (token, id_employee, siteId, allocationType, shiftType, date) => {
        try {
            const response = await api.post('/site-user/disallocation', {
                id_employee,
                siteId,
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

    updateProfile: async (token, payload, id) => {
        try {
            const response = await api.put(`/employees/profile/${id}`, payload, {
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
}

export default employeeService;