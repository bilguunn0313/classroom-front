import api from "./axios";

export const temperatureAPI = {
  getToday: async () => {
    const res = await api.get("/temperature/today");
    return res.data;
  },
  getMonthly: async (year: number, month: number) => {
    const res = await api.get(`/temperature/monthly/${year}/${month}`);
    return res.data;
  },
  create: async (data: {
    recordDate: string;
    temperature: number;
    notes?: string | null;
  }) => {
    const res = await api.post("/temperature", data);
    return res.data;
  },
  update: async (
    id: number,
    data: {
      recordDate?: string;
      temperature?: number;
      notes?: string | null;
    }
  ) => {
    const res = await api.put(`/temperature/${id}`, data);
    return res.data;
  },
  delete: async (id: number) => {
    const res = await api.delete(`/temperature/${id}`);
    return res.data;
  },
};
