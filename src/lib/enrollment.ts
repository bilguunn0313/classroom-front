import api from "./axios";

export const enrollmentAPI = {
  // Get all my enrolled courses
  getMyCourses: async () => {
    const res = await api.get("/enrollment/my-courses");
    return res.data;
  },

  // Check if enrolled in a course
  checkStatus: async (courseId: number) => {
    const res = await api.get(`/enrollment/course/${courseId}/status`);
    return res.data;
  },

  // Enroll in a course
  enroll: async (courseId: number) => {
    const res = await api.post(`/enrollment/course/${courseId}`);
    return res.data;
  },

  // Unenroll from a course
  unenroll: async (courseId: number) => {
    const res = await api.delete(`/enrollment/course/${courseId}`);
    return res.data;
  },

  // Get all students in a course (for teachers)
  getCourseStudents: async (courseId: number) => {
    const res = await api.get(`/enrollment/course/${courseId}/students`);
    return res.data;
  },

  // Get all students with progress in a course (for course creators)
  getCourseStudentsWithProgress: async (courseId: number) => {
    const res = await api.get(`/enrollment/course/${courseId}/students-progress`);
    return res.data;
  },
};
