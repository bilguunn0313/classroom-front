import api from "./axios";

export const courseAPI = {
  getBySubject: async (subjectId: number) => {
    const res = await api.get(`/course/${subjectId}`);
    return res.data;
  },
  getByUser: async (userId: number) => {
    const res = await api.get(`/course/${userId}`);
    return res.data;
  },
  getById: async (id: number) => {
    const res = await api.get(`/course/${id}`);
    return res.data;
  },
  create: async (data: {
    title: string;
    description?: string | null;
    subjectId: number;
    userId: number;
    thumbnailUrl?: string | null;
  }) => {
    const res = await api.post(`/course/create`, data);
    return res.data;
  },
  updateCourse: async (
    id: number,
    data: {
      title: string;
      description?: string | null;
      subjectId: number;
      userId: number;
      thumbnailUrl?: string | null;
    }
  ) => {
    const res = await api.patch(`/course/${id}`, data);
    return res.data;
  },
  publish: async (id: number) => {
    const res = await api.patch(`/course/${id}`);
    return res.data;
  },
  delete: async (id: number) => {
    const res = await api.delete(`/course/${id}`);
    return res.data;
  },
};
