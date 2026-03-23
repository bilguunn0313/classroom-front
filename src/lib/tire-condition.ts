import api from "./axios";

export const tireConditionAPI = {
  getLatest: async () => {
    const res = await api.get("/tire-condition/latest");
    return res.data;
  },
  getMonthly: async (carId: number, year: number, month: number) => {
    const res = await api.get(
      `/tire-condition/car/${carId}/monthly/${year}/${month}`
    );
    return res.data;
  },
  create: async (data: {
    carId: number;
    recordDate: string;
    condition: string;
    notes?: string | null;
  }) => {
    const res = await api.post("/tire-condition", data);
    return res.data;
  },
  update: async (
    id: number,
    data: {
      carId?: number;
      recordDate?: string;
      condition?: string;
      notes?: string | null;
    }
  ) => {
    const res = await api.put(`/tire-condition/${id}`, data);
    return res.data;
  },
  delete: async (id: number) => {
    const res = await api.delete(`/tire-condition/${id}`);
    return res.data;
  },
};
