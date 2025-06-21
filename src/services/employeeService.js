import api from "../utils/api";

const employeeService = {
    addEmployee: async (name, no, number, shiftType, email) => {
        try {
            const response = await api.post('/employees', {
                name: name,
                nirc_fin: no,
                mobile: number,
                shift: shiftType,
                email
            });
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : { message: 'Network error' };
        }
    },

    getAllEmployee: async () => {
        try {
            const response = await api.get('/employees');
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : { message: 'Network error' };
        }
    }
}

export default employeeService;