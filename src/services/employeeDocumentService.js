import api from "../utils/api";

const employeeDocumentService = {
    getEmployeeDocuments: async (token, employeeId) => {
        try {
            const response = await api.get(`master-settings/employee-documents`, {
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

    addEmployeeDocument: async (token, name) => {
        try {
            const response = await api.post(`master-settings/employee-documents`, {name: name});

            if (response.data) {
                return response.data;
            }
        } catch (error) {
            throw error.response ? error.response.data : { message: 'Network error' };
        }
    },

    editEmployeeDocument: async (token, id, name) => {
        try {
            const response = await api.put(`master-settings/employee-documents/${id}`, {name: name});

            if (response.data) {
                return response.data;
            }
        } catch (error) {
            throw error.response ? error.response.data : { message: 'Network error' };
        }
    },

    editEmployeeDocumentStatus: async (token, id, status) => {
        try {
            const response = await api.put(`master-settings/employee-documents/${id}`, {status});
            if (response.data) {
                return response.data;
            }
        } catch (error) {
            throw error.response ? error.response.data : { message: 'Network error' };
        }
    },

    deleteRoute: async (token, route) => {
        try {
            const response = await api.post(`/routes/${route.id}`, {
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

export default employeeDocumentService;