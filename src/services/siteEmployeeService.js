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
}

export default siteEmployeeService;