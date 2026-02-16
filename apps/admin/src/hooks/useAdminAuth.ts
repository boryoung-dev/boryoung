"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";

interface AdminInfo {
  id: string;
  email: string;
  name: string;
  role: string;
}

export function useAdminAuth() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [admin, setAdmin] = useState<AdminInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("adminToken");
    const storedAdmin = localStorage.getItem("adminInfo");

    if (!storedToken) {
      router.push("/login");
      return;
    }

    setToken(storedToken);
    if (storedAdmin) {
      try {
        setAdmin(JSON.parse(storedAdmin));
      } catch {}
    }
    setIsLoading(false);
  }, [router]);

  const logout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminInfo");
    router.push("/login");
  };

  const authHeaders = useMemo(
    () => (token ? { Authorization: `Bearer ${token}` } : {}),
    [token]
  );

  return { token, admin, isLoading, logout, authHeaders };
}
