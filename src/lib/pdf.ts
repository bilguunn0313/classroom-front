import api from "./axios";

export const pdfAPI = {
  // Get all PDFs for a lesson
  getByLesson: async (lessonId: number) => {
    const res = await api.get(`/pdf/lesson/${lessonId}`);
    return res.data;
  },

  // Upload PDF file
  uploadFile: async (lessonId: number, file: File, title?: string) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("lessonId", lessonId.toString());
    if (title) {
      formData.append("title", title);
    } else {
      formData.append("title", file.name);
    }

    const res = await api.post(`/api/upload/pdf/${lessonId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 300000, // 5 minutes for PDF uploads
    });
    return res.data;
  },

  // Delete PDF material
  delete: async (id: number) => {
    const res = await api.delete(`/pdf/${id}`);
    return res.data;
  },
};
