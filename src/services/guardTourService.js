// src/services/guardTourService.js
import api from "../utils/api";

const guardTourService = {
    // Internal helper (dipakai scan/skip)
    clock: async (token, payload) => {
        try {
            const response = await api.post("/guard-tours", payload, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.data) return response.data;
        } catch (error) {
            throw error.response ? error.response.data : { message: "Network error" };
        }
    },

    // Scan NFC tag
    // payload: { point_id: string, nfc_serial: string }
    scan: async (token, payload) => {
        try {
            const body = {
                point_id: payload.point_id,
                action: "scan",
                nfc_serial: payload.nfc_serial,
            };
            const response = await api.post("/guard-tours", body, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.data) return response.data;
        } catch (error) {
            throw error.response ? error.response.data : { message: "Network error" };
        }
    },

    // Skip dengan reason
    // payload: { point_id: string, reason: string }
    skip: async (token, payload) => {
        try {
            const body = {
                point_id: payload.point_id,
                action: "skip",
                reason: payload.reason,
            };
            const response = await api.post("/guard-tours", body, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.data) return response.data;
        } catch (error) {
            throw error.response ? error.response.data : { message: "Network error" };
        }
    },

    // (Opsional) riwayat/daftar guard tour, kalau nanti kamu butuh
    // params contoh: { point_id, user_id, date_from, date_to, page }
    index: async (token, params = {}) => {
        try {
            const res = await api.get("/guard-tours", {
                params,
                headers: { Authorization: `Bearer ${token}` },
            });
            return res.data;
        } catch (error) {
            throw error.response ? error.response.data : { message: "Network error" };
        }
    },

    // (Opsional) detail by id
    show: async (token, id) => {
        try {
            const response = await api.get(`/guard-tours/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : { message: "Network error" };
        }
    },
};

export default guardTourService;
