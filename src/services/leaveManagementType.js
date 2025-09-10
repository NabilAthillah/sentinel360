import api from "../utils/api";

export const leaveTypeService = {
    create: async (data) => {
        return await api.post("/leave-types", data);
    },
    getAll: async () => {
        try {
            const response = await api.get("/leave-types");
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : { message: "Network error" };
        }
    },
};