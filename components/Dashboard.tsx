"use client";

import {
  TrendingUp, TrendingDown, Activity, Wallet, ArrowUpRight, ArrowDownRight,
  ArrowDownToLine, ArrowUpFromLine, Zap, Sparkles, Target, ChevronRight, Clock,
} from "lucide-react";

const statsCards = [
  { label: "Total P&L", value: "+$12,420", sub: "+12.40%", icon: TrendingUp, positive: true, color: "#34D399" },
  { label: "Available", value: "$87,580", sub: "", icon: Wallet, positive: undefined, color: "#60A5FA" },
  { label: "Open Positions", value: "7", sub: "68% win rate", icon: Activity, positive: true, color: "#A78BFA" },
  { label: "Win Rate", value: "68.2%", sub: "", icon: Target, positive: true, color: "#A78BFA" },
];

const positions = [
  { symbol: "BTC/USDT", side: "LONG", entry: "63,240.00", pnl: "+$2,240.18", pct: "+5.42%", up: true },
  { symbol: "ETH/USDT", side: "LONG", entry: "3,140.50", pnl: "+$860.40", pct: "+4.78%", up: true },
  { symbol: "SOL/USDT", side: "SHORT", entry: "142.50", pnl: "+$257.00", pct: "+3.02%", up: true },
  { symbol: "ARB/USDT", side: "LONG", entry: "0.92", pnl: "-$139.00", pct: "-4.35%", up: false },
];

const activity = [
  { type: "Deposit", amount: "+$5,000.00", status: "COMPLETED", time: "2h ago", up: true },
  { type: "Withdrawal", amount: "-$1,200.00", status: "PROCESSING", time: "5h ago", up: false },
  { type: "Deposit", amount: "+$10,000.00", status: "COMPLETED", time: "Yesterday", up: true },
];

function Sparkline({ trend, color }: { trend: "up" | "down" | "flat"; color: string }) {
  const path = trend === "up"
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

export default function Dashboard() {
  return (
    <section id="dashboard" className="relative py-24 px-4 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-blue-600/10 to-transparent blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto relative">
        <div className="text-center mb-14">
          <span className="inline-block text-xs font-semibold text-purple-400 uppercase tracking-widest mb-4 px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10">
            Live Dashboard
          </span>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight mb-4">
            Your entire portfolio
            <br />
            <span className="gradient-text">at a glance</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            A real-time command center for every trade, position, and signal — designed for clarity under pressure.
          </p>
        </div>

        {/* Browser frame */}
        <div className="relative rounded-2xl border border-[#1E1E2E] bg-[#070710] overflow-hidden shadow-2xl shadow-black/50">
          {/* Top bar */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-[#1E1E2E] bg-[#0A0A12]">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/70" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
              <div className="w-3 h-3 rounded-full bg-green-500/70" />
            </div>
            <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-[#1E1E2E] text-xs text-gray-500">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              mfinity.trade/dashboard
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-16 h-2 rounded bg-[#1E1E2E]" />
              <div className="w-8 h-2 rounded bg-[#1E1E2E]" />
            </div>
          </div>

          {/* Layout: sidebar + main */}
          <div className="flex">
            {/* Sidebar */}
            <aside className="hidden md:flex flex-col w-48 border-r border-white/[0.06] bg-[#0B0B14]/95">
              <div className="px-4 py-3 border-b border-white/[0.06] flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center">
                  <span className="text-white text-[10px] font-bold">M</span>
                </div>
                <span className="text-xs font-bold text-white">Mfinity</span>
              </div>
              <nav className="p-2 space-y-0.5">
                <p className="text-[9px] font-bold uppercase tracking-wider text-gray-600 px-2 py-1.5">Overview</p>
                {[
                  { label: "Dashboard", active: true },
                  { label: "Trade", icon: Zap },
                  { label: "Portfolio", icon: Wallet },
                ].map((item) => (
                  <div key={item.label} className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-[11px] font-medium ${item.active ? "bg-gradient-to-r from-blue-500/15 to-purple-500/10 text-white border border-blue-500/20" : "text-gray-500"}`}>
                    <span className={`w-1 h-1 rounded-full ${item.active ? "bg-blue-400" : "bg-gray-600"}`} />
                    {item.label}
                  </div>
                ))}
                <p className="text-[9px] font-bold uppercase tracking-wider text-gray-600 px-2 py-1.5 pt-2">Finance</p>
                {["Deposits", "Withdrawals", "Transactions"].map((label) => (
                  <div key={label} className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-[11px] text-gray-500">
                    <span className="w-1 h-1 rounded-full bg-gray-600" />
                    {label}
                  </div>
                ))}
              </nav>
            </aside>

            {/* Main */}
            <div className="flex-1 p-3 sm:p-4 space-y-3">
              {/* Hero card */}
              <div className="relative rounded-xl bg-gradient-to-br from-blue-600/20 via-purple-600/15 to-pink-600/10 border border-white/10 p-4 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/15 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
                <div className="relative flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-1.5 py-0.5 rounded-full font-medium">
                        <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                        Live
                      </span>
                      <span className="flex items-center gap-1 text-[10px] text-amber-400 bg-amber-400/10 border border-amber-400/20 px-1.5 py-0.5 rounded-full font-medium">
                        <Sparkles size={8} />
                        ENTERPRISE
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-white">Good afternoon, Alex</h3>
                    <p className="text-[10px] text-gray-400 mt-0.5">Here&apos;s your trading overview for today</p>

                    <div className="mt-3">
                      <p className="text-[9px] text-gray-400 uppercase tracking-wider mb-0.5">Portfolio Value</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight">$100,000.00</span>
                        <span className="flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-md text-emerald-400 bg-emerald-400/10 border border-emerald-400/20">
                          <TrendingUp size={9} /> +12.40%
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <div className="flex items-center gap-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-[10px] font-medium px-2.5 py-1.5 rounded-lg shadow-lg shadow-blue-500/20">
                      <ArrowDownToLine size={10} /> Deposit
                    </div>
                    <div className="flex items-center gap-1 bg-white/5 border border-white/10 text-white text-[10px] font-medium px-2.5 py-1.5 rounded-lg">
                      <ArrowUpFromLine size={10} /> Withdraw
                    </div>
                    <div className="flex items-center gap-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-[10px] font-medium px-2.5 py-1.5 rounded-lg shadow-lg shadow-emerald-500/20">
                      <Zap size={10} /> Trade
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
                {statsCards.map((card) => (
                  <div key={card.label} className="rounded-xl bg-gradient-to-br from-[#13131F] to-[#0F0F1A] border border-[#1E1E2E] p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[9px] uppercase tracking-wider font-bold text-gray-500">{card.label}</span>
                      <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/5 flex items-center justify-center">
                        <card.icon size={10} className="text-gray-300" />
                      </div>
                    </div>
                    <p className={`text-base font-bold tracking-tight ${card.positive === true ? "text-emerald-400" : card.positive === false ? "text-rose-400" : "text-white"}`}>
                      {card.value}
                    </p>
                    {card.sub && (
                      <p className={`text-[9px] font-medium mt-0.5 ${card.positive === true ? "text-emerald-400" : "text-gray-500"}`}>{card.sub}</p>
                    )}
                    <div className="mt-1.5">
                      <Sparkline trend={card.positive === false ? "down" : card.positive === true ? "up" : "flat"} color={card.color} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Two columns */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
                {/* Positions */}
                <div className="lg:col-span-3 rounded-xl bg-gradient-to-br from-[#13131F] to-[#0F0F1A] border border-[#1E1E2E] overflow-hidden">
                  <div className="flex items-center justify-between px-3 py-2.5 border-b border-[#1E1E2E]">
                    <div>
                      <h4 className="text-xs font-bold text-white">Open Positions</h4>
                      <p className="text-[9px] text-gray-500">Active trades being managed</p>
                    </div>
                    <span className="flex items-center gap-0.5 text-[10px] text-blue-400 font-medium">View all <ChevronRight size={9} /></span>
                  </div>
                  <div className="divide-y divide-[#1E1E2E]">
                    {positions.map((p) => (
                      <div key={p.symbol} className="flex items-center justify-between px-3 py-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[9px] font-bold border ${p.side === "LONG" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border-rose-500/20"}`}>
                            {p.symbol.slice(0, 2)}
                          </div>
                          <div>
                            <p className="text-[11px] font-semibold text-white">{p.symbol}</p>
                            <div className="flex items-center gap-1 mt-0.5">
                              <span className={`text-[8px] font-bold px-1 py-0.5 rounded ${p.side === "LONG" ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}>
                                {p.side}
                              </span>
                              <span className="text-[9px] text-gray-500">Entry ${p.entry}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-[11px] font-bold ${p.up ? "text-emerald-400" : "text-rose-400"}`}>{p.pnl}</p>
                          <p className={`text-[9px] font-medium ${p.up ? "text-emerald-500/70" : "text-rose-500/70"}`}>{p.pct}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Activity */}
                <div className="lg:col-span-2 rounded-xl bg-gradient-to-br from-[#13131F] to-[#0F0F1A] border border-[#1E1E2E] overflow-hidden">
                  <div className="flex items-center justify-between px-3 py-2.5 border-b border-[#1E1E2E]">
                    <div>
                      <h4 className="text-xs font-bold text-white">Recent Activity</h4>
                      <p className="text-[9px] text-gray-500">Latest transactions</p>
                    </div>
                    <span className="flex items-center gap-0.5 text-[10px] text-blue-400 font-medium">All <ChevronRight size={9} /></span>
                  </div>
                  <div className="divide-y divide-[#1E1E2E]">
                    {activity.map((tx, i) => (
                      <div key={i} className="flex items-center justify-between px-3 py-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center border ${tx.up ? "bg-emerald-500/10 border-emerald-500/20" : "bg-rose-500/10 border-rose-500/20"}`}>
                            {tx.up ? <ArrowDownRight size={10} className="text-emerald-400" /> : <ArrowUpRight size={10} className="text-rose-400" />}
                          </div>
                          <div>
                            <p className="text-[10px] font-semibold text-white">{tx.type}</p>
                            <p className="text-[9px] text-gray-500 flex items-center gap-0.5"><Clock size={7} /> {tx.time}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-[10px] font-bold ${tx.up ? "text-emerald-400" : "text-white"}`}>{tx.amount}</p>
                          <span className={`text-[8px] font-bold px-1 py-0.5 rounded-md border ${tx.status === "COMPLETED" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-blue-500/10 text-blue-400 border-blue-500/20"}`}>
                            {tx.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-3/4 h-20 bg-blue-500/10 blur-3xl pointer-events-none" />
      </div>
    </section>
  );
}
