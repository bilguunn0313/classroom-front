import api from "./axios";

interface CreateDishPayload {
  name: string;
  imageUrl?: string | null;
  itemType: "meal_1" | "meal_2" | "drink";
}

interface UpdateDishPayload {
  name?: string;
  imageUrl?: string | null;
  itemType?: "meal_1" | "meal_2" | "drink";
}

export const dishAPI = {
  list: async (params?: { itemType?: string; search?: string }) => {
    const res = await api.get("/dishes", { params });
    return res.data;
  },
  create: async (data: CreateDishPayload) => {
    const res = await api.post("/dishes", data);
    return res.data;
  },
  update: async (id: number, data: UpdateDishPayload) => {
    const res = await api.put(`/dishes/${id}`, data);
    return res.data;
  },
  delete: async (id: number) => {
    const res = await api.delete(`/dishes/${id}`);
    return res.data;
  },
};
