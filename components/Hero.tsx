"use client";

import { useEffect, useRef } from "react";
import { ArrowRight, Play, TrendingUp, Shield, Zap } from "lucide-react";

const floatingBadges = [
  { icon: TrendingUp, label: "+284% ROI", color: "text-green-400", bg: "bg-green-500/10 border-green-500/20", pos: "top-[18%] left-[8%] lg:left-[12%]", delay: "0s" },
  { icon: Shield, label: "SOC 2 Certified", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20", pos: "top-[30%] right-[6%] lg:right-[10%]", delay: "1.5s" },
  { icon: Zap, label: "12ms Execution", color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20", pos: "bottom-[25%] left-[5%] lg:left-[8%]", delay: "0.8s" },
];

export default function Hero() {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const onMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      el.style.setProperty("--mouse-x", `${x}%`);
      el.style.setProperty("--mouse-y", `${y}%`);
    };
    el.addEventListener("mousemove", onMouseMove);
    return () => el.removeEventListener("mousemove", onMouseMove);
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 pt-20 pb-16 overflow-hidden"
    >
      {/* Background glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-gradient-radial from-purple-600/20 via-blue-600/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute top-1/3 right-1/4 w-[350px] h-[350px] bg-purple-600/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: "2s" }} />
      </div>

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(rgba(59,130,246,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.5) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Floating badges */}
      {floatingBadges.map((badge) => (
        <div
          key={badge.label}
          className={`absolute hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl border ${badge.bg} ${badge.pos} backdrop-blur-sm animate-float`}
          style={{ animationDelay: badge.delay }}
        >
          <badge.icon className={`w-3.5 h-3.5 ${badge.color}`} />
          <span className={`text-xs font-semibold ${badge.color}`}>{badge.label}</span>
        </div>
      ))}

      {/* Launch badge */}
      <div className="relative flex items-center gap-2 mb-8 px-4 py-2 rounded-full border border-blue-500/30 bg-blue-500/10 backdrop-blur-sm animate-fade-in">
        <span className="inline-block w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
        <span className="text-xs font-medium text-blue-300 tracking-wide uppercase">
          Now live — Start trading in under 60 seconds
        </span>
        <ArrowRight className="w-3.5 h-3.5 text-blue-400" />
      </div>

      {/* Headline */}
      <h1
        className="relative text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[1.05] mb-6 animate-fade-up"
        style={{ animationDelay: "0.1s", opacity: 0 }}
      >
        Trade at the
        <br />
        <span className="gradient-text">Speed of Light</span>
      </h1>

      {/* Subheading */}
      <p
        className="relative text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-up"
        style={{ animationDelay: "0.25s", opacity: 0 }}
      >
        Institutional-grade execution, real-time analytics, and AI-powered
        signals — all in a single, blazing-fast platform built for serious
        traders.
      </p>

      {/* CTA Buttons */}
      <div
        className="relative flex flex-col sm:flex-row gap-4 items-center justify-center animate-fade-up"
        style={{ animationDelay: "0.4s", opacity: 0 }}
      >
        <a
          href="#cta"
          className="group flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold text-base shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105 transition-all duration-300"
        >
          Coming Soon
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </a>
        <a
          href="#dashboard"
          className="group flex items-center gap-2 px-8 py-4 rounded-xl border border-[#1E1E2E] bg-white/5 text-white font-semibold text-base hover:border-blue-500/50 hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
        >
          <span className="w-7 h-7 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
            <Play className="w-3 h-3 text-white ml-0.5" />
          </span>
          Coming Soon
        </a>
      </div>

      {/* Trust line */}
      <p
        className="relative mt-8 text-sm text-gray-600 animate-fade-up"
        style={{ animationDelay: "0.55s", opacity: 0 }}
      >
        No credit card required &nbsp;·&nbsp; Free forever plan &nbsp;·&nbsp; Cancel anytime
      </p>

      {/* Hero bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0A0A0F] to-transparent pointer-events-none" />
    </section>
  );
}
