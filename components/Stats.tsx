"use client";

import { useEffect, useRef, useState } from "react";

const stats = [
  { value: 5000, suffix: "+", label: "Active Traders", prefix: "" },
  { value: 8.4, suffix: "B+", label: "Volume Traded", prefix: "$" },
  { value: 99.98, suffix: "%", label: "Uptime SLA", prefix: "" },
  { value: 12, suffix: "ms", label: "Avg. Execution", prefix: "" },
];

function useCountUp(target: number, duration = 2000, started: boolean) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!started) return;
    const isDecimal = target % 1 !== 0;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = eased * target;
      setCount(isDecimal ? Math.round(current * 100) / 100 : Math.round(current));
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, [target, duration, started]);

  return count;
}

function StatCard({ stat, started }: { stat: typeof stats[0]; started: boolean }) {
  const count = useCountUp(stat.value, 2000, started);
  const isDecimal = stat.value % 1 !== 0;

  return (
    <div className="relative flex flex-col items-center text-center p-8 rounded-2xl border border-[#1E1E2E] bg-[#0F0F1A] group hover:border-blue-500/30 transition-all duration-300 overflow-hidden">
      {/* Card glow on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative text-4xl sm:text-5xl font-black tracking-tight mb-2">
        <span className="gradient-text">
          {stat.prefix}
          {isDecimal ? count.toFixed(1) : count.toLocaleString()}
          {stat.suffix}
        </span>
      </div>
      <p className="text-gray-400 text-sm font-medium">{stat.label}</p>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
  );
}

const trustedLogos = [
  "Binance", "Coinbase", "Kraken", "Uniswap", "Aave", "Chainlink",
];

export default function Stats() {
  const ref = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStarted(true); },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="relative py-24 px-4 overflow-hidden">
      {/* Background accent */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-600/8 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Trusted By */}
        <div className="text-center mb-16">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-widest mb-8">
            Trusted by traders from leading platforms
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12">
            {trustedLogos.map((logo) => (
              <span
                key={logo}
                className="text-gray-600 font-bold text-sm sm:text-base tracking-wide hover:text-gray-400 transition-colors duration-200 cursor-default"
              >
                {logo}
              </span>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-[#1E1E2E] to-transparent mb-16" />

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((stat) => (
            <StatCard key={stat.label} stat={stat} started={started} />
          ))}
        </div>
      </div>
    </section>
  );
}
