"use client";

import { UserPlus, Settings2, TrendingUp } from "lucide-react";

const steps = [
  {
    step: "01",
    icon: UserPlus,
    title: "Create Your Account",
    description:
      "Sign up in under 60 seconds. Connect your exchange API keys or use our non-custodial wallet integration — your keys, your crypto.",
    color: "from-blue-500 to-cyan-500",
    shadow: "shadow-blue-500/20",
  },
  {
    step: "02",
    icon: Settings2,
    title: "Configure Your Strategy",
    description:
      "Choose from 50+ pre-built strategies or build your own using our no-code strategy builder. Set risk limits, targets, and triggers.",
    color: "from-purple-500 to-blue-500",
    shadow: "shadow-purple-500/20",
  },
  {
    step: "03",
    icon: TrendingUp,
    title: "Watch It Execute",
    description:
      "Mfinity monitors markets 24/7 and executes your trades with sub-12ms latency. Get real-time alerts and detailed performance reports.",
    color: "from-cyan-500 to-purple-500",
    shadow: "shadow-cyan-500/20",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-24 px-4 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-cyan-600/6 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto relative">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-xs font-semibold text-cyan-400 uppercase tracking-widest mb-4 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10">
            How It Works
          </span>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight mb-4">
            Up and running
            <br />
            <span className="gradient-text">in three steps</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            No complexity, no gatekeeping. Mfinity is designed for traders who want
            results, not a learning curve.
          </p>
        </div>

        {/* Steps */}
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Connector line (desktop) */}
          <div className="absolute top-16 left-[calc(16.66%+2rem)] right-[calc(16.66%+2rem)] hidden md:block">
            <div className="h-px bg-gradient-to-r from-blue-500/40 via-purple-500/40 to-cyan-500/40" />
            <div className="h-px bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-cyan-500/10 mt-0.5 blur-sm" />
          </div>

          {steps.map((step, i) => (
            <div
              key={step.step}
              className="relative flex flex-col items-center text-center group"
              style={{ animationDelay: `${i * 0.15}s` }}
            >
              {/* Step number background circle */}
              <div className="relative mb-6">
                {/* Outer ring */}
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} p-0.5 shadow-xl ${step.shadow} group-hover:scale-110 transition-transform duration-300`}>
                  <div className="w-full h-full rounded-[14px] bg-[#0F0F1A] flex items-center justify-center">
                    <step.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                {/* Step badge */}
                <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center text-[10px] font-black text-white shadow-lg`}>
                  {i + 1}
                </div>
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-300 transition-colors">
                {step.title}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
                {step.description}
              </p>

              {/* Mobile connector */}
              {i < steps.length - 1 && (
                <div className="md:hidden mt-8 w-px h-8 bg-gradient-to-b from-blue-500/40 to-transparent" />
              )}
            </div>
          ))}
        </div>

        {/* Bottom CTA nudge */}
        <div className="text-center mt-16">
          <a
            href="#cta"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-blue-400 transition-colors group"
          >
            Ready to start?{" "}
            <span className="text-blue-400 group-hover:translate-x-1 transition-transform inline-block">
              Create your free account →
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
