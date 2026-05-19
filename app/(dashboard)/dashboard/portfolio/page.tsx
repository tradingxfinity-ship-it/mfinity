"use client";

import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Wallet, DollarSign, Activity, Lock, Target, BarChart2 } from "lucide-react";

interface Stats {
  totalValue: number;
  totalPnl: number;
  totalPnlPercent: number;
  availableBalance: number;
  lockedBalance: number;
  openPositions: number;
  winRate: number;
}

interface Position {
  id: string;
  symbol: string;
  side: string;
  entryPrice: number;
  quantity: number;
  pnl: number;
  pnlPercent: number;
  openedAt: string;
}

function Sparkline({ trend, color }: { trend: "up" | "down" | "flat"; color: string }) {
  const path =
    trend === "up"
      ? "M0 25 L20 22 L35 18 L50 12 L65 14 L80 8 L100 4"
      : trend === "down"
      ? "M0 5 L20 8 L35 12 L50 16 L65 14 L80 22 L100 26"
      : "M0 15 L20 14 L35 16 L50 15 L65 13 L80 16 L100 14";

  return (
    <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="w-full h-7 opacity-70">
      <path d={path} stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StatCard({ label, value, sub, icon: Icon, positive, trend, color = "#60A5FA" }: {
  label: string; value: string; sub?: string; icon: React.ElementType; positive?: boolean; trend?: "up" | "down" | "flat"; color?: string;
}) {
  return (
    <div className="group bg-gradient-to-br from-[#13131F] to-[#0F0F1A] border border-[#1E1E2E] hover:border-[#2A2A3E] rounded-2xl p-5 transition-all duration-200 hover:-translate-y-0.5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] uppercase tracking-wider font-bold text-gray-500">{label}</span>
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/5 flex items-center justify-center">
          <Icon size={13} className="text-gray-300" />
        </div>
      </div>
      <p className={`text-2xl font-bold tracking-tight ${positive === true ? "text-emerald-400" : positive === false ? "text-rose-400" : "text-white"}`}>
        {value}
      </p>
      {sub && <p className="text-[11px] text-gray-500 mt-1 font-medium">{sub}</p>}
      {trend && <div className="mt-2"><Sparkline trend={trend} color={color} /></div>}
    </div>
  );
}

export default function PortfolioPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/user/dashboard")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setStats(d.data.stats);
          setPositions(d.data.positions ?? []);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-32 bg-[#0F0F1A] border border-[#1E1E2E] rounded-2xl animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-[#0F0F1A] border border-[#1E1E2E] rounded-2xl p-5 h-32 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const pnlPositive = (stats?.totalPnl ?? 0) >= 0;

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-indigo-600/20 via-purple-600/15 to-pink-600/10 border border-white/10 rounded-2xl p-6 overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-indigo-300 bg-indigo-400/10 border border-indigo-400/20 px-2 py-0.5 rounded-full font-medium">
              Portfolio
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Your Portfolio</h1>
          <p className="text-gray-400 text-sm mt-1">Real-time performance and active positions</p>

          <div className="mt-5 flex flex-wrap items-baseline gap-4">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Total Value</p>
              <span className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                ${(stats?.totalValue ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </div>
            <span className={`flex items-center gap-1 text-sm font-bold px-2.5 py-1 rounded-lg ${pnlPositive ? "text-emerald-400 bg-emerald-400/10 border border-emerald-400/20" : "text-rose-400 bg-rose-400/10 border border-rose-400/20"}`}>
              {pnlPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {pnlPositive ? "+" : ""}
              {(stats?.totalPnlPercent ?? 0).toFixed(2)}%
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {pnlPositive ? "+" : "-"}${Math.abs(stats?.totalPnl ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2 })} all time
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard label="Total Value" value={`$${(stats?.totalValue ?? 0).toLocaleString("en", { minimumFractionDigits: 2 })}`} icon={DollarSign} trend="up" color="#60A5FA" />
        <StatCard
          label="Total P&L"
          value={`${pnlPositive ? "+" : ""}$${(stats?.totalPnl ?? 0).toLocaleString("en", { minimumFractionDigits: 2 })}`}
          sub={`${pnlPositive ? "+" : ""}${(stats?.totalPnlPercent ?? 0).toFixed(2)}%`}
          icon={pnlPositive ? TrendingUp : TrendingDown}
          positive={pnlPositive}
          trend={pnlPositive ? "up" : "down"}
          color={pnlPositive ? "#34D399" : "#FB7185"}
        />
        <StatCard label="Available" value={`$${(stats?.availableBalance ?? 0).toLocaleString("en", { minimumFractionDigits: 2 })}`} icon={Wallet} trend="flat" />
        <StatCard label="Locked" value={`$${(stats?.lockedBalance ?? 0).toLocaleString("en", { minimumFractionDigits: 2 })}`} icon={Lock} />
        <StatCard label="Open" value={String(stats?.openPositions ?? 0)} icon={Activity} />
        <StatCard
          label="Win Rate"
          value={`${(stats?.winRate ?? 0).toFixed(1)}%`}
          icon={Target}
          positive={(stats?.winRate ?? 0) >= 50 ? true : undefined}
          trend={(stats?.winRate ?? 0) >= 50 ? "up" : "down"}
          color={(stats?.winRate ?? 0) >= 50 ? "#A78BFA" : "#FB7185"}
        />
      </div>

      {/* Open Positions */}
      <div className="bg-gradient-to-br from-[#13131F] to-[#0F0F1A] border border-[#1E1E2E] rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#1E1E2E] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/10 border border-blue-500/20 flex items-center justify-center">
              <BarChart2 size={15} className="text-blue-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Open Positions</h2>
              <p className="text-xs text-gray-500 mt-0.5">Active trades being managed</p>
            </div>
          </div>
          <span className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded-md">{positions.length} active</span>
        </div>

        {positions.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center mx-auto mb-3">
              <Activity size={20} className="text-gray-500" />
            </div>
            <p className="text-gray-300 text-sm font-medium">No open positions</p>
            <p className="text-gray-600 text-xs mt-1">Your active trades will appear here once opened</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 text-[10px] uppercase tracking-wider border-b border-[#1E1E2E]">
                  <th className="text-left px-5 py-3 font-semibold">Symbol</th>
                  <th className="text-left px-5 py-3 font-semibold">Side</th>
                  <th className="text-right px-5 py-3 font-semibold">Entry</th>
                  <th className="text-right px-5 py-3 font-semibold">Quantity</th>
                  <th className="text-right px-5 py-3 font-semibold">P&L</th>
                  <th className="text-right px-5 py-3 font-semibold">Opened</th>
                </tr>
              </thead>
              <tbody>
                {positions.map((p) => {
                  const positive = Number(p.pnl) >= 0;
                  return (
                    <tr key={p.id} className="border-b border-[#1E1E2E] last:border-0 hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs border ${p.side === "LONG" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border-rose-500/20"}`}>
                            {p.symbol.slice(0, 2)}
                          </div>
                          <span className="text-white font-semibold">{p.symbol}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${p.side === "LONG" ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}>
                          {p.side}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right text-gray-300">${Number(p.entryPrice).toFixed(4)}</td>
                      <td className="px-5 py-3 text-right text-gray-300">{Number(p.quantity).toFixed(4)}</td>
                      <td className={`px-5 py-3 text-right font-bold ${positive ? "text-emerald-400" : "text-rose-400"}`}>
                        {positive ? "+" : "-"}${Math.abs(Number(p.pnl)).toFixed(2)}
                        <div className={`text-[11px] font-medium ${positive ? "text-emerald-500/70" : "text-rose-500/70"}`}>
                          {positive ? "+" : ""}{Number(p.pnlPercent).toFixed(2)}%
                        </div>
                      </td>
                      <td className="px-5 py-3 text-right text-gray-500">{new Date(p.openedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
