"use client";

import { getAllUsers, signout, signin } from "@/service/authService";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      loading: false,
      error: null,

      login: async (username, password) => {
        set({ loading: true, error: null, user: null });
        try {
          const user = await signin(username, password);
          set({
            user: user.userInfo,
            loading: false,
            isAuthenticated: true,
            error: null,
          });
        } catch (error) {
          set({ user: null, loading: false, error });
        }
      },

      logout: async () => {
        try {
          await signout();
          set({
            user: null,
            loading: false,
            error: null,
            isAuthenticated: false,
          });
        } catch (error) {
          console.error(error);
        }
      },

      fetchUser: async () => {
        try {
          const userData = await getAllUsers();
          set({ user: userData, loading: false });
        } catch {
          set({ user: null, loading: false });
        }
      },
    }),
    { name: "userInfo" }
  )
);
