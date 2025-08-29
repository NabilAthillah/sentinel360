import api from "../utils/api";

const routeService = {
    addRoute: async (token, id_site, name, remarks) => {
        try {
            const response = await api.post(`/routes`, {
                name,
                id_site,
                remarks,
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

    editRoute: async (token, id, name, remarks, route) => {
        try {
            const response = await api.put(`/routes/${id}`, {
                name,
                remarks,
                route
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

    editRouteStatus: async (token, id, status) => {
        try {
            const response = await api.put(`/routes/${id}`, {
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
            const response = await api.delete(`/routes/${route.id}`, {
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

    getAllRoutes: async (token) => {
        try {
            const response = await api.get(`/routes`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.data) {
                return response.data;
            }
        } catch (error) {
            throw error.response ? error.response.data : { message: "Network error" };
        }
    },

    getRouteById: async (token, id) => {
        try {
            const response = await api.get(`/route/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            if (response.data) {
                return response.data;
            }
        } catch (error) {
            throw error.response ? error.response.data : { message: 'Network error' }
        }

    }
}

export default routeService;