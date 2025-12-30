import api from "./axios";

export const subjectAPI = {
  create: async (data: { title: string; description: string | null }) => {
    const res = await api.post("/subject/create", data);
    return res.data;
  },

  getAll: async () => {
    const res = await api.get("/subject");
    return res.data;
  },

  getById: async (id: number) => {
    const res = await api.get(`/subject/${id}`);
    return res.data;
  },
  update: async (
    id: number,
    data: { title?: string; description?: string | null }
  ) => {
    const res = await api.patch(`/subject/${id}`, data);
    return res.data;
  },
  delete: async (id: number) => {
    const res = await api.delete(`/subject/${id}`);
    return res.data;
  },
};
