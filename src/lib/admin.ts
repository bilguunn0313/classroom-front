import api from "./axios";
import {
  UsersParams,
  CoursesParams,
  LessonsParams,
  SubjectsParams,
} from "@/types/admin";

export const adminAPI = {
  // Dashboard
  getDashboardStats: async () => {
    const res = await api.get("/admin/dashboard/stats");
    return res.data;
  },

  // Users
  getUsers: async (params: UsersParams) => {
    const res = await api.get("/admin/users", { params });
    return res.data;
  },
  getUsersStats: async () => {
    const res = await api.get("/admin/users/stats");
    return res.data;
  },
  createUser: async (data: any) => {
    const res = await api.post("/admin/users", data);
    return res.data;
  },
  updateUser: async (id: number, data: any) => {
    const res = await api.patch(`/admin/users/${id}/role`, data);
    return res.data;
  },
  deleteUser: async (id: number) => {
    const res = await api.delete(`/admin/users/${id}`);
    return res.data;
  },

  // Courses
  getCourses: async (params: CoursesParams) => {
    const res = await api.get("/admin/courses", { params });
    return res.data;
  },
  getCoursesStats: async () => {
    const res = await api.get("/admin/courses/stats");
    return res.data;
  },
  createCourse: async (data: any) => {
    const res = await api.post("/admin/courses", data);
    return res.data;
  },
  updateCourse: async (id: number, data: any) => {
    const res = await api.put(`/admin/courses/${id}`, data);
    return res.data;
  },
  deleteCourse: async (id: number) => {
    const res = await api.delete(`/admin/courses/${id}`);
    return res.data;
  },

  // Lessons
  getLessons: async (params: LessonsParams) => {
    const res = await api.get("/admin/lessons", { params });
    return res.data;
  },
  getLessonsStats: async () => {
    const res = await api.get("/admin/lessons/stats");
    return res.data;
  },
  createLesson: async (data: any) => {
    const res = await api.post("/admin/lessons", data);
    return res.data;
  },
  updateLesson: async (id: number, data: any) => {
    const res = await api.put(`/admin/lessons/${id}`, data);
    return res.data;
  },
  deleteLesson: async (id: number) => {
    const res = await api.delete(`/admin/lessons/${id}`);
    return res.data;
  },

  // Subjects
  getSubjects: async (params: SubjectsParams) => {
    const res = await api.get("/admin/subjects", { params });
    return res.data;
  },
  getSubjectsStats: async () => {
    const res = await api.get("/admin/subjects/stats");
    return res.data;
  },
  createSubject: async (data: any) => {
    const res = await api.post("/admin/subjects", data);
    return res.data;
  },
  updateSubject: async (id: number, data: any) => {
    const res = await api.put(`/admin/subjects/${id}`, data);
    return res.data;
  },
  deleteSubject: async (id: number) => {
    const res = await api.delete(`/admin/subjects/${id}`);
    return res.data;
  },
};
