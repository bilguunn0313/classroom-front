import api from "./axios";

export const uploadAPI = {
  /**
   * Upload an image file
   * @param file - The image file to upload
   * @returns Promise with the uploaded image URL
   */
  uploadImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await api.post("/api/upload/image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return res.data.data.url;
  },
};
