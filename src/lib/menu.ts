import api from "./axios";

interface MenuItemPayload {
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  itemType: "meal_1" | "meal_2" | "drink";
  ingredients?: string | null;
  calories?: number | null;
}

export const menuAPI = {
  getToday: async () => {
    const res = await api.get("/menu/today");
    return res.data;
  },
  getByDate: async (date: string) => {
    const res = await api.get(`/menu/${date}`);
    return res.data;
  },
  getMonthly: async (year: number, month: number) => {
    const res = await api.get(`/menu/monthly/${year}/${month}`);
    return res.data;
  },
  create: async (data: {
    menuDate: string;
    notes?: string | null;
    items?: MenuItemPayload[];
  }) => {
    const res = await api.post("/menu", data);
    return res.data;
  },
  update: async (
    id: number,
    data: {
      menuDate?: string;
      notes?: string | null;
      items?: MenuItemPayload[];
    }
  ) => {
    const res = await api.put(`/menu/${id}`, data);
    return res.data;
  },
  delete: async (id: number) => {
    const res = await api.delete(`/menu/${id}`);
    return res.data;
  },
  addItem: async (menuId: number, data: MenuItemPayload) => {
    const res = await api.post(`/menu/${menuId}/items`, data);
    return res.data;
  },
  updateItem: async (
    itemId: number,
    data: Partial<MenuItemPayload>
  ) => {
    const res = await api.put(`/menu/items/${itemId}`, data);
    return res.data;
  },
  deleteItem: async (itemId: number) => {
    const res = await api.delete(`/menu/items/${itemId}`);
    return res.data;
  },
  respond: async (menuId: number, willAttend: boolean) => {
    const res = await api.post(`/menu/${menuId}/respond`, { willAttend });
    return res.data;
  },
  getMyResponse: async (menuId: number) => {
    const res = await api.get(`/menu/${menuId}/my-response`);
    return res.data;
  },
  getResponseSummary: async (menuId: number) => {
    const res = await api.get(`/menu/${menuId}/response-summary`);
    return res.data;
  },
  getAllResponses: async (menuId: number) => {
    const res = await api.get(`/menu/${menuId}/responses`);
    return res.data;
  },
};
