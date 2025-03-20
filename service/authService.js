import { apiCall } from "@/lib/utils/api";

export const signin = async (username, password) => {
  return await apiCall("POST", `/auth/login`, { username, password });
};

export const signout = async () => {
  return await apiCall("POST", "/auth/logout");
};

export const getAllUsers = async () => {
  return await apiCall("GET", "/user");
};
