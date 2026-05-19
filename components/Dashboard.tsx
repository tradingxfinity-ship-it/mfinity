"use client";

import { TrendingUp, TrendingDown, Activity, DollarSign, BarChart2, ArrowUpRight } from "lucide-react";

const chartBars = [
  { h: 45, up: true }, { h: 62, up: true }, { h: 38, up: false }, { h: 70, up: true },
  { h: 55, up: false }, { h: 80, up: true }, { h: 65, up: true }, { h: 90, up: true },
  { h: 72, up: false }, { h: 85, up: true }, { h: 78, up: true }, { h: 95, up: true },
  { h: 60, up: false }, { h: 88, up: true }, { h: 76, up: true }, { h: 100, up: true },
];

const statsCards = [
  { icon: DollarSign, label: "Portfolio Value", value: "$284,920", change: "+12.4%", up: true },
  { icon: TrendingUp, label: "24h P&L", value: "+$3,240", change: "+1.15%", up: true },
  { icon: Activity, label: "Open Positions", value: "7", change: "Active", up: true },
  { icon: BarChart2, label: "Win Rate", value: "68.2%", change: "+2.3%", up: true },
];

const positions = [
  { pair: "BTC/USDT", side: "Long", size: "$42,000", entry: "$61,240", current: "$63,480", pnl: "+$2,240", up: true },
  { pair: "ETH/USDT", side: "Long", size: "$18,000", entry: "$3,140", current: "$3,290", pnl: "+$860", up: true },
  { pair: "SOL/USDT", side: "Short", size: "$8,500", entry: "$142.5", current: "$138.2", pnl: "+$257", up: true },
  { pair: "ARB/USDT", side: "Long", size: "$3,200", entry: "$0.92", current: "$0.88", pnl: "-$139", up: false },
];

export default function Dashboard() {
  return (
    <section id="dashboard" className="relative py-24 px-4 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-blue-600/10 to-transparent blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto relative">
        {/* Section Header */}
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

        {/* Dashboard UI Mock */}
        <div className="relative rounded-2xl border border-[#1E1E2E] bg-[#0F0F1A] overflow-hidden shadow-2xl shadow-black/50">
          {/* Top bar */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-[#1E1E2E] bg-[#0A0A12]">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/70" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
              <div className="w-3 h-3 rounded-full bg-green-500/70" />
            </div>
            <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-[#1E1E2E] text-xs text-gray-500">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              app.xfinitybot.io — Live
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-16 h-2 rounded bg-[#1E1E2E]" />
              <div className="w-8 h-2 rounded bg-[#1E1E2E]" />
            </div>
          </div>

          <div className="p-5 space-y-5">
            {/* Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {statsCards.map((card) => (
                <div key={card.label} className="p-4 rounded-xl bg-[#0A0A12] border border-[#1E1E2E]">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-gray-500">{card.label}</span>
                    <card.icon className="w-3.5 h-3.5 text-gray-600" />
                  </div>
                  <div className="text-xl font-bold text-white mb-1">{card.value}</div>
                  <div className={`flex items-center gap-1 text-xs font-semibold ${card.up ? "text-green-400" : "text-red-400"}`}>
                    {card.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {card.change}
                  </div>
                </div>
              ))}
            </div>

            {/* Chart + Positions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Chart */}
              <div className="lg:col-span-2 p-5 rounded-xl bg-[#0A0A12] border border-[#1E1E2E]">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-sm font-semibold text-white">BTC/USDT</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-2xl font-black text-white">$63,480</span>
                      <span className="text-xs font-semibold text-green-400 flex items-center gap-0.5">
                        <ArrowUpRight className="w-3 h-3" /> +3.65%
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {["1H", "4H", "1D", "1W"].map((t, i) => (
                      <button key={t} className={`px-2 py-1 rounded text-xs font-medium transition-colors ${i === 2 ? "bg-blue-500/20 text-blue-400" : "text-gray-600 hover:text-gray-400"}`}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Chart bars */}
                <div className="relative h-32 flex items-end gap-1 overflow-hidden">
                  {/* Horizontal grid lines */}
                  {[0, 33, 66, 100].map((pct) => (
                    <div key={pct} className="absolute left-0 right-0 border-t border-[#1E1E2E]/60" style={{ bottom: `${pct}%` }} />
                  ))}
                  {chartBars.map((bar, i) => (
                    <div
                      key={i}
                      className={`flex-1 rounded-t chart-bar transition-all ${bar.up ? "bg-gradient-to-t from-blue-600 to-blue-400" : "bg-gradient-to-t from-red-600/70 to-red-400/70"}`}
                      style={{
                        height: `${bar.h}%`,
                        animationDelay: `${i * 0.05}s`,
                        animationFillMode: "backwards",
                      }}
                    />
                  ))}
                </div>
                <div className="flex justify-between mt-2">
                  {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"].map((m) => (
                    <span key={m} className="text-xs text-gray-600">{m}</span>
                  ))}
                </div>
              </div>

              {/* Positions */}
              <div className="p-5 rounded-xl bg-[#0A0A12] border border-[#1E1E2E]">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold text-white">Open Positions</span>
                  <span className="text-xs text-blue-400 font-medium cursor-pointer hover:underline">See all →</span>
                </div>
                <div className="space-y-3">
                  {positions.map((pos) => (
                    <div key={pos.pair} className="flex items-center justify-between py-2 border-b border-[#1E1E2E]/60 last:border-0">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-white">{pos.pair}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${pos.side === "Long" ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-400"}`}>
                            {pos.side}
                          </span>
                        </div>
                        <span className="text-[11px] text-gray-600">{pos.size}</span>
                      </div>
                      <div className="text-right">
                        <div className={`text-xs font-bold ${pos.up ? "text-green-400" : "text-red-400"}`}>{pos.pnl}</div>
                        <div className="text-[11px] text-gray-600">{pos.current}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom glow effect */}
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-3/4 h-20 bg-blue-500/10 blur-3xl pointer-events-none" />
      </div>
    </section>
  );
}
