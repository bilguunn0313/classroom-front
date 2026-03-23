import api from "./axios";

export const odometerAPI = {
  getLatest: async () => {
    const res = await api.get("/odometer/latest");
    return res.data;
  },
  getByCar: async (carId: number) => {
    const res = await api.get(`/odometer/car/${carId}`);
    return res.data;
  },
  getMonthly: async (carId: number, year: number, month: number) => {
    const res = await api.get(
      `/odometer/car/${carId}/monthly/${year}/${month}`
    );
    return res.data;
  },
  create: async (data: {
    carId: number;
    recordDate: string;
    readingKm: number;
    notes?: string | null;
  }) => {
    const res = await api.post("/odometer", data);
    return res.data;
  },
  update: async (
    id: number,
    data: {
      carId?: number;
      recordDate?: string;
      readingKm?: number;
      notes?: string | null;
    }
  ) => {
    const res = await api.put(`/odometer/${id}`, data);
    return res.data;
  },
  delete: async (id: number) => {
    const res = await api.delete(`/odometer/${id}`);
    return res.data;
  },
};
