import { refresh } from "next/cache";
import api from "./axios";

export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post("/auth/login", { email, password });
    return response.data;
  },

  verify: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  },

  refreshToken: async () => {
    const res = await api.post("/auth/refresh");
    return res.data;
  },
};
