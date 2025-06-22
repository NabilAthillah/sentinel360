const siteServive = {
    addSite: async (token, formData) => {
        try {
            const response = await api.post('/auth/login', {
                email: email,
                password: password
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
    }
}

export default siteServive