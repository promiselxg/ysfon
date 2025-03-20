import { useAuthStore } from "@/store/authStore";
import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Automatically attach Bearer token
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

// Response Interceptor: Handle token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const authStore = useAuthStore.getState();
    const originalRequest = error.config;

    // If request fails with 401 and it wasn't already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Call refresh token API
        const { data } = await axios.get("/api/auth/refresh", {
          withCredentials: true, // Ensure cookies are sent
        });

        // Update token in Zustand store
        authStore.set((state) => ({
          user: { ...state.user, token: data.token },
          isAuthenticated: true,
        }));

        // Retry the failed request with new token
        originalRequest.headers.Authorization = `Bearer ${data.token}`;
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, log out user
        authStore.logout();
      }
    }

    return Promise.reject(error);
  }
);

/**
 * Generic API Call Function
 * @param {string} method - HTTP method (e.g., "GET", "POST", "PUT", "DELETE")
 * @param {string} url - API endpoint (e.g., "/auth")
 * @param {object} [payload] - Request body data (for POST, PUT, PATCH)
 * @param {object} [params] - Query parameters (for GET requests)
 * @returns {Promise} - API response data
 */
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
    console.error(`API ${method.toUpperCase()} error:`, error);
    throw new Error(error?.response?.data?.message || "Something went wrong");
  }
};

export default api;
