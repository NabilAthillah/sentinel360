import api from "../utils/api";

const IncidentTypesService = {
    getIncidentTypes: async (token) => {
        try {
            const response = await api.get(`master-settings/incident-types`, {
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

    addIncidentTypes: async (token, name) => {
        try {
            const response = await api.post(`master-settings/incident-types`, {name: name});

            if (response.data) {
                return response.data;
            }
        } catch (error) {
            throw error.response ? error.response.data : { message: 'Network error' };
        }
    },

    editIncidentTypes: async (token, id, name) => {
        try {
            const response = await api.put(`master-settings/incident-types/${id}`, {name});

            if (response.data) {
                return response.data;
            }
        } catch (error) {
            throw error.response ? error.response.data : { message: 'Network error' };
        }
    },

    editIncidentTypesStatus: async (token, id, status) => {
        try {
            const response = await api.put(`master-settings/incident-types/${id}`, {status});

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

export default IncidentTypesService;