import api from "../utils/api";

const routeService = {
    addRoute: async (token, id_site, name) => {
        try {
            const response = await api.post(`/routes`, {
                name,
                id_site
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

    editRoute: async (token, id, name) => {
        try {
            const response = await api.put(`/routes/${id}`, {
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

    gethRouteById: async (token, id) => {
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