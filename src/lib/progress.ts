import api from "./axios";

export const lessonProgressAPI = {
  // Get progress for a specific lesson
  get: async (lessonId: number) => {
    const res = await api.get(`/progress/lesson/${lessonId}`);
    return res.data.data;
  },

  // Get all progress for a course
  getByCourse: async (courseId: number) => {
    const res = await api.get(`/progress/course/${courseId}`);
    return res.data.data || res.data.lessons || [];
  },

  // Update progress (last position)
  update: async (
    lessonId: number,
    data: {
      lastPosition?: number;
      completed?: boolean;
    }
  ) => {
    const res = await api.patch(`/progress/lesson/${lessonId}`, {
      last_position: data.lastPosition,
      completed: data.completed,
    });
    return res.data.data;
  },

  // Mark lesson as complete
  markComplete: async (lessonId: number) => {
    const res = await api.post(`/progress/lesson/${lessonId}/complete`);
    return res.data.data;
  },

  // Reset progress for a lesson
  reset: async (lessonId: number) => {
    const res = await api.delete(`/progress/lesson/${lessonId}`);
    return res.data.data;
  },
};
