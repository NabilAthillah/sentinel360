import api from "../utils/api";

const employeeService = {
    addEmployee: async (name, nric_fin_no, mobile, email, id_role, reporting_to, briefing_date, address, token) => {
        try {
            const response = await api.post('/employees', {
                name,
                nric_fin_no,
                mobile,
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

    editEmployee: async (
    id, 
    name,
    nric_fin_no,
    mobile,
    email,
    id_role,
    reporting_to,
    briefing_date,
    birth,
    address,
    briefing_conducted,
    profileBase64, 
    token
) => {
    try {
        const payload = {
            name,
            nric_fin_no,
            mobile,
            email,
            id_role,
            reporting_to,
            briefing_date,
            birth,
            address,
            briefing_conducted,
        };

        if (profileBase64) {
            payload.profile = profileBase64;
        }

        const response = await api.put(`/employees/${id}`, payload, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
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
}

export default employeeService;