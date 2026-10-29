import api from "./axios";

export const readingsApi = {
  async createReading(data) {
    const response = await api.post("/readings", data);
    return response.data;
  },

  async getReadings(params = {}) {
    const response = await api.get("/readings", { params });
    return response.data;
  },

  async getReadingById(id) {
    const response = await api.get(`/readings/${id}`);
    return response.data;
  },

  async updateReading(id, data) {
    const response = await api.put(`/readings/${id}`, data);
    return response.data;
  },

  async deleteReading(id) {
    const response = await api.delete(`/readings/${id}`);
    return response.data;
  },
};
