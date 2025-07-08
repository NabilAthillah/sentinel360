import api from "../utils/api";

const employeeDocumentPivotService = {
    getEmployeeDocument: async (token, employeeId) => {
        try {
            const response = await api.get(`/employee-document/${employeeId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.data) {
                return response.data;
            }
        } catch (error) {
            throw error.response ? error.response.data : { message: 'Network error' };
        }
    },

    addEmployeeDocument: async (token, employeeId, documentId, base64Document) => {
        try {
            const response = await api.post(`/employee-document`, {
                id_employee: employeeId,
                id_document: documentId,
                document: base64Document,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : { message: 'Network error' };
        }
    },
    editEmployeeDocument: async (token, id, name) => {
        try {
            const response = await api.put(`/employee-document/${id}`, {
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



    deleteRoute: async (token, routeId) => {
        try {
            const response = await api.delete(`/routes/${routeId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : { message: 'Network error' };
        }
    }

}

export default employeeDocumentPivotService;