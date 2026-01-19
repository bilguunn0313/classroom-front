import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Debug logging
api.interceptors.request.use((config) => {
  console.log("🌐 API Request:", {
    method: config.method?.toUpperCase(),
    url: config.url,
    baseURL: config.baseURL,
    fullURL: `${config.baseURL}${config.url}`,
  });
  return config;
});

let isRedirecting = false;

// Request interceptor - Add token to all requests
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("token");

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status;
    const url = error.config?.url;

    // Handle 401 Unauthorized
    if (status === 401 && typeof window !== "undefined") {
      const currentPath = window.location.pathname;
      const isLoginRequest = url?.includes("/auth/login");

      // Only auto-logout if NOT on login page and NOT a login request
      if (!isRedirecting && currentPath !== "/login" && !isLoginRequest) {
        isRedirecting = true;

        localStorage.removeItem("token");
        localStorage.removeItem("currentUser");

        setTimeout(() => {
          window.location.href = "/login";
          isRedirecting = false;
        }, 100);
      }
    }

    // Handle 403 Forbidden
    if (status === 403 && typeof window !== "undefined") {
      window.location.href = "/unauthorized";
    }

    return Promise.reject(error);
  }
);

export default api;
