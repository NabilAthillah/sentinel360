import api from "../utils/api";

const employeeDocumentService = {
    getEmployeeDocuments: async (token) => {
        try {
            const response = await api.get(`/employee-documents`, {
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
            const response = await api.post(`/employee-documents`, {
                name,
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

    editEmployeeDocument: async (token, id, name) => {
        try {
            const response = await api.put(`/employee-documents/${id}`, {
                name,
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

    editEmployeeDocumentStatus: async (token, id, status) => {
        try {
            const response = await api.put(`/employee-documents/${id}`, {
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