import api from "../utils/api";

const roleService = {
    addRole: async (name, token, permissions) => {
        try {
            const response = await api.post('/roles', {
                name: name,
                permissions
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            if (response.data) {
                return response.data;
            }
        } catch (error) {
            throw error.response ? error.response.data : { message: 'Network error' };
        }
    },

    getAllRoles: async (token) => {
        try {
            const response = await api.get('/roles', {
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

    updateRole: async (id, name, token, permissions) => {
        try {
            const response = await api.put(`/roles/${id}`, {
                name: name,
                permissions
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
    }
}

export default roleService;