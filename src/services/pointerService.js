import api from "../utils/api";

const pointerService = {
    getAllPointers: async (idRoute) => {
        try {
            const response = await api.get('/pointers', {
                id_route: idRoute
            });

            if (response.data) return response.data
        } catch (error) {
            throw error.response ? error.response.data : { message: "Network error" };
        }
    }
}

export default pointerService;