import api from "./axios";

export const carAPI = {
  getAll: async () => {
    const res = await api.get("/cars");
    return res.data;
  },
  create: async (data: { licensePlate: string; carName?: string | null }) => {
    const res = await api.post("/cars", data);
    return res.data;
  },
  update: async (
    id: number,
    data: { licensePlate?: string; carName?: string | null }
  ) => {
    const res = await api.put(`/cars/${id}`, data);
    return res.data;
  },
  delete: async (id: number) => {
    const res = await api.delete(`/cars/${id}`);
    return res.data;
  },
};
