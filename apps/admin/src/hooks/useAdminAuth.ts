"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";

interface AdminInfo {
  id: string;
  username: string;
  name: string;
  role: string;
}

export function useAdminAuth() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [admin, setAdmin] = useState<AdminInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminInfo");
    setToken(null);
    setAdmin(null);
    router.push("/login");
  }, [router]);

  useEffect(() => {
    const storedToken = localStorage.getItem("adminToken");
    const storedAdmin = localStorage.getItem("adminInfo");

    if (!storedToken) {
      setIsLoading(false);
      router.push("/login");
      return;
    }

    // JWT 만료 체크 (payload의 exp 필드)
    try {
      const payload = JSON.parse(atob(storedToken.split(".")[1]));
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminInfo");
        setIsLoading(false);
        router.push("/login");
        return;
      }
    } catch {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminInfo");
      setIsLoading(false);
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

  const authFetch = useCallback(
    async (url: string, options: RequestInit = {}) => {
      if (!token) return null;

      const res = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        logout();
        return null;
      }

      return res;
    },
    [token, logout]
  );

  const authHeaders = useMemo(
    () => (token ? { Authorization: `Bearer ${token}` } : {}),
    [token]
  );

  return { token, admin, isLoading, logout, authHeaders, authFetch };
}
