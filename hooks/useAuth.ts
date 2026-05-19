"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { AuthUser } from "@/types";

export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch("/api/user/profile");
      const data = await res.json();

      if (res.status === 401) {
        // Try to refresh the token
        const refreshRes = await fetch("/api/auth/refresh", { method: "POST" });
        if (refreshRes.ok) {
          const retryRes = await fetch("/api/user/profile");
          const retryData = await retryRes.json();
          if (retryData.success) {
            setUser(retryData.data);
            return;
          }
        }
        setUser(null);
        return;
      }

      if (data.success) {
        setUser(data.data);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/login");
  }, [router]);

  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

  return { user, loading, logout, isAdmin, refetch: fetchUser };
}
