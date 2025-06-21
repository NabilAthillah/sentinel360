import api from "../utils/api";

const roleService = {
    addRole: async (name) => {
        try {
            const response = await api.post('/roles', {
                name: name
            })
            if (response.data) {
                return response.data;
            }
        } catch (error) {
            throw error.response ? error.response.data : { message: 'Network error' };
        }
    },

    getAllRoles: async () => {
        try {
            const response = await api.get('/roles');

            if (response.data) {
                return response.data;
            }
        } catch (error) {
            throw error.response ? error.response.data : { message: 'Network error' };
        }
    },

    updateRole: async (id, name) => {
        try {
            const response = await api.put(`/roles/${id}`, {
                name: name
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