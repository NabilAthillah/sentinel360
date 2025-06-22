import api from "../utils/api";

const employeeService = {
    addEmployee: async (name, nric_fin_no, mobile, shift, email, id_role, reporting_to, briefing_date, address, token) => {
        try {
            const response = await api.post('/employees', {
                name,
                nric_fin_no,
                mobile,
                shift,
                email,
                id_role,
                reporting_to,
                briefing_date,
                address
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
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

    deleteEmployee: async (id, token) => {
        try {
            const response = await api.post(`/employees/delete/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : { message: 'Network error' };
        }
    }
}

export default employeeService;