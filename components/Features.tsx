"use client";

import { Zap, BarChart2, Shield, BrainCircuit, Globe, RefreshCw } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Lightning Execution",
    description:
      "Sub-12ms order execution with smart routing across 50+ exchanges. Never miss a price move again.",
    color: "from-yellow-500 to-orange-500",
    glow: "shadow-yellow-500/20",
    border: "hover:border-yellow-500/30",
  },
  {
    icon: BarChart2,
    title: "Advanced Analytics",
    description:
      "Real-time P&L tracking, portfolio heatmaps, and 100+ technical indicators powered by live data.",
    color: "from-blue-500 to-cyan-500",
    glow: "shadow-blue-500/20",
    border: "hover:border-blue-500/30",
  },
  {
    icon: BrainCircuit,
    title: "AI Signal Engine",
    description:
      "Machine-learning signals that surface high-probability setups before they happen. Stay ahead of the market.",
    color: "from-purple-500 to-pink-500",
    glow: "shadow-purple-500/20",
    border: "hover:border-purple-500/30",
  },
  {
    icon: Shield,
    title: "Bank-Grade Security",
    description:
      "SOC 2 Type II certified, cold-storage custody, 2FA enforcement, and real-time threat monitoring.",
    color: "from-green-500 to-emerald-500",
    glow: "shadow-green-500/20",
    border: "hover:border-green-500/30",
  },
  {
    icon: Globe,
    title: "Global Liquidity",
    description:
      "Access deep liquidity from 50+ centralized and decentralized exchanges through a single unified API.",
    color: "from-cyan-500 to-blue-500",
    glow: "shadow-cyan-500/20",
    border: "hover:border-cyan-500/30",
  },
  {
    icon: RefreshCw,
    title: "Auto-Rebalancing",
    description:
      "Set target allocations and let Mfinity automatically rebalance your portfolio on your schedule.",
    color: "from-violet-500 to-purple-500",
    glow: "shadow-violet-500/20",
    border: "hover:border-violet-500/30",
  },
];

export default function Features() {
  return (
    <section id="features" className="relative py-24 px-4 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-purple-600/8 rounded-full blur-3xl -translate-y-1/2" />
        <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-blue-600/8 rounded-full blur-3xl -translate-y-1/2" />
      </div>

      <div className="max-w-7xl mx-auto relative">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-xs font-semibold text-blue-400 uppercase tracking-widest mb-4 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10">
            Platform Features
          </span>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight mb-4">
            Everything you need to
            <br />
            <span className="gradient-text">trade like a pro</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            From AI-powered signals to institutional-grade security, Mfinity gives
            you every edge the market has to offer.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className={`gradient-border group relative p-6 rounded-2xl border border-[#1E1E2E] bg-[#0F0F1A] ${feature.border} transition-all duration-300 hover:-translate-y-1`}
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              {/* Icon */}
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-5 shadow-lg ${feature.glow} group-hover:scale-110 transition-transform duration-300`}
              >
                <feature.icon className="w-5 h-5 text-white" />
              </div>

              {/* Content */}
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {feature.description}
              </p>

              {/* Hover shimmer */}
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none shimmer-line" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
