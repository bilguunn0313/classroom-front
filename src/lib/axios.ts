// import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

// const api = axios.create({
//   baseURL: process.env.NEXT_PUBLIC_API_URL,
//   headers: {
//     "Content-Type": "application/json",
//   },
//   timeout: 10000, // 10 seconds
// });

// let isRedirecting = false;

// api.interceptors.request.use(
//   (config: InternalAxiosRequestConfig) => {
//     const token = localStorage.getItem("token");

//     if (token && config.headers) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }

//     return config;
//   },
//   (error: AxiosError) => {
//     return Promise.reject(error);
//   }
// );

// api.interceptors.response.use(
//   (response) => {
//     return response;
//   },
//   (error: AxiosError) => {
//     const status = error.response?.status;
//     console.error("API Error:", {
//       status,
//       message: error.response?.data,
//       url: error.config?.url,
//     });
//     if (status === 401 && typeof window !== "undefined") {
//       const currentPath = window.location.pathname;

//       // Only auto-logout if:
//       // 1. Not already redirecting (prevent loops)
//       // 2. Not on login page
//       // 3. Not a login request
//       if (
//         !isRedirecting &&
//         currentPath !== "/login" &&
//         !error.config?.url?.includes("/auth/login")
//       ) {
//         console.log("🔒 401 Error: Invalid token, logging out");
//         isRedirecting = true;

//         localStorage.removeItem("token");
//         localStorage.removeItem("currentUser");

//         setTimeout(() => {
//           window.location.href = "/login";
//           isRedirecting = false;
//         }, 100);
//       }
//     }

//     if (status === 403) {
//       if (typeof window && typeof window !== "undefined") {
//         window.location.href = "/unauthorized";
//       }
//     }
//     if (!error.response) {
//       console.error("Network error:", error.message);
//     }
//     return Promise.reject(error);
//   }
// );

// export default api;

// lib/axios.ts - FULLY DEBUGGED VERSION
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

let isRedirecting = false;

// Request interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    console.log(
      "\n📤 [AXIOS] Request:",
      config.method?.toUpperCase(),
      config.url
    );

    const token = localStorage.getItem("token");

    if (token) {
      console.log("🎫 [AXIOS] Adding token to request");
      console.log(
        "🎫 [AXIOS] Token (first 30 chars):",
        token.substring(0, 30) + "..."
      );
      console.log("🎫 [AXIOS] Token length:", token.length);

      if (config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } else {
      console.log("ℹ️ [AXIOS] No token found for request");
    }

    return config;
  },
  (error: AxiosError) => {
    console.error("❌ [AXIOS] Request error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log("✅ [AXIOS] Response:", response.status, response.config.url);
    return response;
  },
  (error: AxiosError) => {
    const status = error.response?.status;
    const url = error.config?.url;

    console.error("\n==========================================");
    console.error("❌ [AXIOS] Response Error");
    console.error("==========================================");
    console.error("Status:", status);
    console.error("URL:", url);
    console.error("Response data:", error.response?.data);
    console.error("==========================================\n");

    // Handle 401 Unauthorized
    if (status === 401 && typeof window !== "undefined") {
      const currentPath = window.location.pathname;
      const isLoginRequest = url?.includes("/auth/login");

      console.log("🔒 [AXIOS] 401 Unauthorized detected");
      console.log("📍 [AXIOS] Current path:", currentPath);
      console.log("🔐 [AXIOS] Is login request:", isLoginRequest);
      console.log("🔄 [AXIOS] Already redirecting:", isRedirecting);

      // DON'T auto-logout on login page or for login requests
      if (!isRedirecting && currentPath !== "/login" && !isLoginRequest) {
        console.log("🧹 [AXIOS] Clearing localStorage and redirecting...");
        isRedirecting = true;

        localStorage.removeItem("token");
        localStorage.removeItem("currentUser");

        setTimeout(() => {
          window.location.href = "/login";
          isRedirecting = false;
        }, 100);
      } else {
        console.log(
          "ℹ️ [AXIOS] Skipping auto-logout (on login page or already redirecting)"
        );
      }
    }

    // Handle 403 Forbidden
    if (status === 403 && typeof window !== "undefined") {
      console.log("⛔ [AXIOS] 403 Forbidden - redirecting to /unauthorized");
      window.location.href = "/unauthorized";
    }

    // Network errors
    if (!error.response) {
      console.error("🌐 [AXIOS] Network error:", error.message);
    }

    return Promise.reject(error);
  }
);

export default api;

// lib/axios.ts
// import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

// const api = axios.create({
//   baseURL: process.env.NEXT_PUBLIC_API_URL,
//   headers: {
//     "Content-Type": "application/json",
//   },
//   timeout: 10000,
// });

// let isRedirecting = false;

// // Request interceptor - Add token to all requests
// api.interceptors.request.use(
//   (config: InternalAxiosRequestConfig) => {
//     const token = localStorage.getItem("token");

//     if (token && config.headers) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }

//     return config;
//   },
//   (error: AxiosError) => {
//     return Promise.reject(error);
//   }
// );

// // Response interceptor - Handle errors
// api.interceptors.response.use(
//   (response) => response,
//   (error: AxiosError) => {
//     const status = error.response?.status;
//     const url = error.config?.url;

//     // Handle 401 Unauthorized
//     if (status === 401 && typeof window !== "undefined") {
//       const currentPath = window.location.pathname;
//       const isLoginRequest = url?.includes("/auth/login");

//       // Only auto-logout if NOT on login page and NOT a login request
//       if (!isRedirecting && currentPath !== "/login" && !isLoginRequest) {
//         isRedirecting = true;

//         localStorage.removeItem("token");
//         localStorage.removeItem("currentUser");

//         // Use a small delay to prevent race conditions
//         setTimeout(() => {
//           window.location.href = "/login";
//           isRedirecting = false;
//         }, 100);
//       }
//     }

//     // Handle 403 Forbidden
//     if (status === 403 && typeof window !== "undefined") {
//       window.location.href = "/unauthorized";
//     }

//     return Promise.reject(error);
//   }
// );

// export default api;
