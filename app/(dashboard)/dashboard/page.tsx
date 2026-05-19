"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  ArrowDownToLine,
  ArrowUpFromLine,
  Sparkles,
  Plus,
  Zap,
  Target,
  Clock,
  ChevronRight,
} from "lucide-react";

interface DashboardData {
  stats: {
    totalValue: number;
    totalPnl: number;
    totalPnlPercent: number;
    openPositions: number;
    availableBalance: number;
    lockedBalance: number;
    winRate: number;
  };
  positions: Array<{
    id: string;
    symbol: string;
    side: string;
    entryPrice: number;
    currentPrice: number;
    pnl: number;
    pnlPercent: number;
    quantity: number;
  }>;
  recentTransactions: Array<{
    id: string;
    type: string;
    amount: number;
    currency: string;
    status: string;
    createdAt: string;
  }>;
  notifications: Array<{ id: string; title: string; message: string; createdAt: string }>;
}

interface UserProfile {
  firstName: string;
  subscriptionPlan: string;
}

function greetingFor(hour: number): string {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function Sparkline({ trend, color }: { trend: "up" | "down" | "flat"; color: string }) {
  const path =
    trend === "up"
      ? "M0 25 L20 22 L35 18 L50 12 L65 14 L80 8 L100 4"
      : trend === "down"
      ? "M0 5 L20 8 L35 12 L50 16 L65 14 L80 22 L100 26"
      : "M0 15 L20 14 L35 16 L50 15 L65 13 L80 16 L100 14";

  return (
    <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="w-full h-8 opacity-70">
      <defs>
        <linearGradient id={`grad-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${path} L100 30 L0 30 Z`} fill={`url(#grad-${color})`} />
      <path d={path} stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StatCard({
  title,
  value,
  sub,
  icon: Icon,
  positive,
  trend,
  trendColor = "#60A5FA",
}: {
  title: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
  positive?: boolean;
  trend?: "up" | "down" | "flat";
  trendColor?: string;
}) {
  return (
    <div className="group relative bg-gradient-to-br from-[#13131F] to-[#0F0F1A] border border-[#1E1E2E] hover:border-[#2A2A3E] rounded-2xl p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/40 overflow-hidden">
      <div className="flex items-start justify-between mb-4">
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{title}</p>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/5 flex items-center justify-center">
          <Icon size={15} className="text-gray-300" />
        </div>
      </div>
      <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
      {sub && (
        <p
          className={`text-xs mt-1.5 flex items-center gap-1 font-medium ${
            positive === true ? "text-emerald-400" : positive === false ? "text-rose-400" : "text-gray-500"
          }`}
        >
          {positive === true && <ArrowUpRight size={12} />}
          {positive === false && <ArrowDownRight size={12} />}
          {sub}
        </p>
      )}
      {trend && (
        <div className="mt-3 -mx-1">
          <Sparkline trend={trend} color={trendColor} />
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    COMPLETED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    PENDING: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    FAILED: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    PROCESSING: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    REJECTED: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  };
  return (
    <span
      className={`text-[10px] px-1.5 py-0.5 rounded-md border font-medium ${
        map[status] ?? "bg-gray-500/10 text-gray-400 border-gray-500/20"
      }`}
    >
      {status}
    </span>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/user/dashboard").then((r) => r.json()),
      fetch("/api/user/profile").then((r) => r.json()),
    ])
      .then(([dash, prof]) => {
        if (dash.success) setData(dash.data);
        if (prof.success) setUser(prof.data);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("welcome") === "true") {
      setShowWelcome(true);
      // Clean the URL so the popup doesn't reappear on refresh
      window.history.replaceState({}, "", "/dashboard");
    }
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-32 bg-[#0F0F1A] border border-[#1E1E2E] rounded-2xl animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-[#0F0F1A] border border-[#1E1E2E] rounded-2xl p-5 animate-pulse h-36" />
          ))}
        </div>
      </div>
    );
  }

  const s = data?.stats;
  const pnlPositive = (s?.totalPnl ?? 0) >= 0;
  const hour = new Date().getHours();

  return (
    <div className="space-y-6">
      {/* Welcome / demo balance popup */}
      {showWelcome && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-gradient-to-br from-[#13131F] to-[#0F0F1A] border border-white/10 rounded-2xl p-8 text-center overflow-hidden">
            {/* Decorative glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-blue-500/30 to-purple-500/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <Sparkles size={28} className="text-white" />
              </div>

              <h2 className="text-2xl font-bold text-white tracking-tight">Welcome to Mfinity!</h2>
              <p className="text-gray-400 text-sm mt-2 leading-relaxed">
                You have received
              </p>

              <div className="my-4 py-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <p className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                  $10,000
                </p>
                <p className="text-xs text-emerald-400/80 font-medium uppercase tracking-wider mt-1">Demo Money</p>
              </div>

              <p className="text-gray-400 text-sm leading-relaxed">
                Use it to test our platform — open trades, track live P&amp;L, and explore everything risk-free.
              </p>

              <button
                onClick={() => setShowWelcome(false)}
                className="mt-6 w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl py-3 text-sm font-bold hover:opacity-90 transition-opacity shadow-lg shadow-blue-500/20"
              >
                Start Trading
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Welcome Card */}
      <div className="relative bg-gradient-to-br from-blue-600/20 via-purple-600/15 to-pink-600/10 border border-white/10 rounded-2xl p-6 overflow-hidden">
        {/* Decorative gradient blobs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-purple-500/15 rounded-full blur-3xl translate-y-1/2 pointer-events-none" />

        <div className="relative flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-full font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live
              </span>
              {user?.subscriptionPlan && user.subscriptionPlan !== "FREE" && (
                <span className="flex items-center gap-1 text-xs text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-full font-medium">
                  <Sparkles size={10} />
                  {user.subscriptionPlan}
                </span>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              {greetingFor(hour)}{user?.firstName ? `, ${user.firstName}` : ""}
            </h1>
            <p className="text-gray-400 text-sm mt-1">Here&apos;s your trading overview for today</p>

            <div className="mt-5">
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Portfolio Value</p>
              <div className="flex items-baseline gap-3">
                <span className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                  ${(s?.totalValue ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
                <span
                  className={`flex items-center gap-1 text-sm font-semibold px-2 py-1 rounded-lg ${
                    pnlPositive
                      ? "text-emerald-400 bg-emerald-400/10 border border-emerald-400/20"
                      : "text-rose-400 bg-rose-400/10 border border-rose-400/20"
                  }`}
                >
                  {pnlPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  {pnlPositive ? "+" : ""}
                  {(s?.totalPnlPercent ?? 0).toFixed(2)}%
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {pnlPositive ? "+" : "-"}${Math.abs(s?.totalPnl ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2 })} all time
              </p>
            </div>
          </div>

          {/* Quick actions */}
          <div className="flex flex-wrap gap-2">
            <Link
              href="/dashboard/deposits"
              className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium px-4 py-2.5 rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-blue-500/20"
            >
              <ArrowDownToLine size={15} />
              Deposit
            </Link>
            <Link
              href="/dashboard/withdrawals"
              className="flex items-center gap-2 bg-white/5 border border-white/10 text-white text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-white/10 transition-colors"
            >
              <ArrowUpFromLine size={15} />
              Withdraw
            </Link>
            <Link
              href="/dashboard/trade"
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-medium px-4 py-2.5 rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-emerald-500/20"
            >
              <Zap size={15} />
              Trade
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total P&L"
          value={`${pnlPositive ? "+" : "-"}$${Math.abs(s?.totalPnl ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
          sub={`${pnlPositive ? "+" : ""}${(s?.totalPnlPercent ?? 0).toFixed(2)}%`}
          icon={pnlPositive ? TrendingUp : TrendingDown}
          positive={pnlPositive}
          trend={pnlPositive ? "up" : "down"}
          trendColor={pnlPositive ? "#34D399" : "#FB7185"}
        />
        <StatCard
          title="Available"
          value={`$${(s?.availableBalance ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
          icon={Wallet}
          trend="flat"
          trendColor="#60A5FA"
        />
        <StatCard
          title="Open Positions"
          value={`${s?.openPositions ?? 0}`}
          sub={`${(s?.winRate ?? 0).toFixed(0)}% win rate`}
          icon={Activity}
          positive={(s?.winRate ?? 0) >= 50}
        />
        <StatCard
          title="Win Rate"
          value={`${(s?.winRate ?? 0).toFixed(1)}%`}
          icon={Target}
          positive={(s?.winRate ?? 0) >= 50}
          trend={(s?.winRate ?? 0) >= 50 ? "up" : "down"}
          trendColor={(s?.winRate ?? 0) >= 50 ? "#A78BFA" : "#FB7185"}
        />
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Open Positions */}
        <div className="lg:col-span-3 bg-gradient-to-br from-[#13131F] to-[#0F0F1A] border border-[#1E1E2E] rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#1E1E2E]">
            <div>
              <h2 className="text-sm font-semibold text-white">Open Positions</h2>
              <p className="text-xs text-gray-500 mt-0.5">Active trades being managed</p>
            </div>
            <Link href="/dashboard/portfolio" className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-medium">
              View all <ChevronRight size={12} />
            </Link>
          </div>

          {data?.positions.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center mx-auto mb-3">
                <Activity size={18} className="text-gray-500" />
              </div>
              <p className="text-gray-400 text-sm">No open positions</p>
              <p className="text-gray-600 text-xs mt-1">Your active trades will appear here</p>
            </div>
          ) : (
            <div className="divide-y divide-[#1E1E2E]">
              {data?.positions.map((p) => {
                const positive = Number(p.pnl) >= 0;
                return (
                  <div key={p.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                        p.side === "LONG" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                      }`}>
                        {p.symbol.slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{p.symbol}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                            p.side === "LONG" ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                          }`}>
                            {p.side}
                          </span>
                          <span className="text-xs text-gray-500">Entry ${Number(p.entryPrice).toFixed(4)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold ${positive ? "text-emerald-400" : "text-rose-400"}`}>
                        {positive ? "+" : "-"}${Math.abs(Number(p.pnl)).toFixed(2)}
                      </p>
                      <p className={`text-xs font-medium ${positive ? "text-emerald-500/80" : "text-rose-500/80"}`}>
                        {positive ? "+" : ""}{Number(p.pnlPercent).toFixed(2)}%
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-gradient-to-br from-[#13131F] to-[#0F0F1A] border border-[#1E1E2E] rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#1E1E2E]">
            <div>
              <h2 className="text-sm font-semibold text-white">Recent Activity</h2>
              <p className="text-xs text-gray-500 mt-0.5">Latest transactions</p>
            </div>
            <Link href="/dashboard/transactions" className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-medium">
              All <ChevronRight size={12} />
            </Link>
          </div>

          {data?.recentTransactions.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center mx-auto mb-3">
                <Clock size={18} className="text-gray-500" />
              </div>
              <p className="text-gray-400 text-sm">No transactions yet</p>
              <p className="text-gray-600 text-xs mt-1">
                <Link href="/dashboard/deposits" className="text-blue-400 hover:underline">
                  Make your first deposit
                </Link>
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#1E1E2E]">
              {data?.recentTransactions.map((tx) => {
                const isCredit = tx.type === "DEPOSIT" || tx.type === "BONUS";
                return (
                  <div key={tx.id} className="flex items-center justify-between px-5 py-3 hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        isCredit ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-rose-500/10 border border-rose-500/20"
                      }`}>
                        {isCredit ? (
                          <ArrowDownRight size={14} className="text-emerald-400" />
                        ) : (
                          <ArrowUpRight size={14} className="text-rose-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm text-white font-medium truncate">{tx.type}</p>
                        <p className="text-[11px] text-gray-500">
                          {new Date(tx.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <p className={`text-sm font-bold ${isCredit ? "text-emerald-400" : "text-white"}`}>
                        {isCredit ? "+" : "-"}${Number(tx.amount).toFixed(2)}
                      </p>
                      <div className="mt-0.5">
                        <StatusBadge status={tx.status} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Bottom callout - getting started */}
      {(data?.positions.length === 0 && data?.recentTransactions.length === 0) && (
        <div className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-white/10 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0">
              <Sparkles size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm">Get started in 3 steps</h3>
              <p className="text-gray-400 text-xs mt-0.5">Verify your identity, deposit funds, and start trading</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href="/dashboard/kyc" className="text-sm text-white bg-white/10 hover:bg-white/15 border border-white/10 px-4 py-2 rounded-xl font-medium transition-colors">
              Start KYC
            </Link>
            <Link href="/dashboard/deposits" className="text-sm text-white bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-2 rounded-xl font-medium hover:opacity-90 transition-opacity flex items-center gap-1.5">
              <Plus size={14} /> Deposit
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
