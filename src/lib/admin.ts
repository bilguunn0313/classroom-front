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

  // Courses
  getCourses: async (params: CoursesParams) => {
    const res = await api.get("/admin/courses", { params });
    return res.data;
  },
  getCoursesStats: async () => {
    const res = await api.get("/admin/courses/stats");
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

  // Subjects
  getSubjects: async (params: SubjectsParams) => {
    const res = await api.get("/admin/subjects", { params });
    return res.data;
  },
  getSubjectsStats: async () => {
    const res = await api.get("/admin/subjects/stats");
    return res.data;
  },
};
