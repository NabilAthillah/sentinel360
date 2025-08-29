import api from "../utils/api";

const pointerService = {
    getAllPointers: async () => {
        try {
            const response = await api.get(`/pointers`);

            if (response.data) return response.data
        } catch (error) {
            throw error.response ? error.response.data : { message: "Network error" };
        }
    },

    storePointer: async (payload) => {
        try {
            const response = await api.post('/pointers', payload);

            if (response.data) return response.data
        } catch (error) {
            throw error.response ? error.response.data : { message: "Network error" };
        }
    },

    updatePointer: async (id, payload) => {
        try {
            const response = await api.put(`/pointers/${id}`, payload);

            if (response.data) return response.data
        } catch (error) {
            throw error.response ? error.response.data : { message: "Network error" };
        }
    },

    deletePointer: async (id) => {
        try {
            const response = await api.delete(`/pointers/${id}`);

            if (response.data) return response.data
        } catch (error) {
            throw error.response ? error.response.data : { message: "Network error" };
        }
    },

    getPointersByRouteId: async (id) => {
        try {
            const response = await api.get(`/pointers/route/${id}`);

            if (response.data) return response.data
        } catch (error) {
            throw error.response ? error.response.data : { message: "Network error" };
        }
    }
}

export default pointerService;