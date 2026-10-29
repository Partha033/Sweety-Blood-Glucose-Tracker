import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true, // Send and receive HttpOnly cookies
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: attach token from session storage if present (supports fallback)
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("sweety_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: extract clean error messages
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      "An unexpected network error occurred.";

    const errors = error.response?.data?.errors || [];

    return Promise.reject({
      statusCode: error.response?.status || 500,
      message,
      errors,
      raw: error,
    });
  }
);

export default api;
