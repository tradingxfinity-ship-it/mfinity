"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";

interface Portfolio {
  totalValue: number;
  totalPnl: number;
  totalPnlPercent: number;
  availableBalance: number;
  lockedBalance: number;
}

export function usePortfolio(userId: string | null) {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPortfolio = useCallback(async () => {
    const res = await fetch("/api/user/dashboard");
    const data = await res.json();
    if (data.success) {
      setPortfolio(data.data.stats);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPortfolio();
  }, [fetchPortfolio]);

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`portfolio:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "portfolios",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const p = payload.new;
          setPortfolio({
            totalValue: Number(p.total_value),
            totalPnl: Number(p.total_pnl),
            totalPnlPercent: Number(p.total_pnl_percent),
            availableBalance: Number(p.available_balance),
            lockedBalance: Number(p.locked_balance),
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return { portfolio, loading, refetch: fetchPortfolio };
}
