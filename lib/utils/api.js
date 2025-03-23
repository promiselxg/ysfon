import { useAuthStore } from "@/store/authStore";
import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Attach Bearer Token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().user?.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle Token Expiry
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { logout } = useAuthStore.getState();
    const originalRequest = error.config;

    // If token expired & request was not retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        console.log("🔄 Refreshing token...");
        const { data } = await axios.get("/api/auth/refresh", {
          withCredentials: true,
        });

        // Update Zustand store with new token
        useAuthStore.setState((state) => ({
          user: { ...state.user, token: data.token },
          isAuthenticated: true,
        }));

        // Retry the failed request with the new token
        originalRequest.headers.Authorization = `Bearer ${data.token}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error(
          "❌ Token refresh failed:",
          refreshError.response?.data?.message
        );

        // Only logout if refresh API returns 403 (invalid token)
        if (refreshError.response?.status === 403) {
          console.error("🔓 Logging out...");
          //logout();
        }
      }
    }

    return Promise.reject(error);
  }
);

// Generic API Call Function
export const apiCall = async (method, url, payload = {}, params = {}) => {
  try {
    const config = {
      method: method.toLowerCase(),
      url,
      ...(method.toLowerCase() === "get" ? { params } : { data: payload }),
    };

    const response = await api(config);
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.message || "Something went wrong");
  }
};

export default api;
