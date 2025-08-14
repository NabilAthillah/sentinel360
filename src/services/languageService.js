import api from "../utils/api";


const languageService = {
    getLanguages: async () => {
        try {
            const response = await api.get(`/language`);
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : { message: 'Network error' };
        }
    },
    editLanguage: async (token, id, language) => {
        try {
            const response = await api.put(`/language/${id}`, {
                language,
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
};


export default languageService