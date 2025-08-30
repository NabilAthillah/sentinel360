import api from "../utils/api";

const IncidentService = {
  getIncident: async (token) => {
    try {
      const response = await api.get(`/incidents`, {
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

  addIncident: async (formData) => {
    try {
      const res = await api.post("/incidents", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    } catch (error) {
      throw error?.response?.data || { message: "Network error" };
    }
  },

  editIncident: async (token, id, payload) => {
    try {
      const response = await api.put(`/incidents/${id}`, payload, {
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

  deleteIncident: async (token, id) => {
    try {
      const response = await api.delete(`/incidents/${id}`, {
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

  deleteRoute: async (token, route) => {
    try {
      const response = await api.delete(`/routes/${route.id}`, {
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
};

export default IncidentService;
