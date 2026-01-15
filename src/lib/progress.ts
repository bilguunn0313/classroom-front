import api from "./axios";

export const lessonProgressAPI = {
  // Get progress for a specific lesson
  get: async (lessonId: number) => {
    const res = await api.get(`/lesson-progress/${lessonId}`);
    return res.data.data;
  },

  // Get all progress for a course
  getByCourse: async (courseId: number) => {
    const res = await api.get(`/lesson-progress/course/${courseId}`);
    return res.data.data;
  },

  // Update progress (last position)
  update: async (
    lessonId: number,
    data: {
      lastPosition?: number;
      completed?: boolean;
    }
  ) => {
    const res = await api.patch(`/lesson-progress/${lessonId}`, data);
    return res.data.data;
  },

  // Mark lesson as complete
  markComplete: async (lessonId: number) => {
    const res = await api.patch(`/lesson-progress/${lessonId}/complete`);
    return res.data.data;
  },

  // Reset progress for a lesson
  reset: async (lessonId: number) => {
    const res = await api.patch(`/lesson-progress/${lessonId}`, {
      completed: false,
      lastPosition: 0,
    });
    return res.data.data;
  },
};
