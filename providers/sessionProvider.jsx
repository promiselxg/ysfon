"use client";

import { useAuthStore } from "@/store/authStore";
import { useEffect, useState } from "react";

const SessionProvider = ({ children }) => {
  const { loading } = useAuthStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || loading) return <p>Loading session...</p>;

  return children;
};

export default SessionProvider;
