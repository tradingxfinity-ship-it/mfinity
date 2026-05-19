"use client";

import { ArrowRight, CheckCircle2 } from "lucide-react";

const perks = [
  "Free forever plan — no credit card",
  "Connect in under 60 seconds",
  "Cancel or upgrade anytime",
  "SOC 2 certified & fully non-custodial",
];

export default function CTA() {
  return (
    <section id="cta" className="relative py-24 px-4 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-600/5 to-purple-600/10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-gradient-radial from-purple-600/20 to-transparent blur-3xl" />
      </div>

      <div className="max-w-4xl mx-auto relative">
        <div className="relative rounded-3xl border border-[#1E1E2E] bg-[#0F0F1A] overflow-hidden p-10 sm:p-16 text-center">
          {/* Corner glows */}
          <div className="absolute top-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

          {/* Top gradient border */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />

          <span className="relative inline-block text-xs font-semibold text-blue-400 uppercase tracking-widest mb-6 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10">
            Coming Soon
          </span>

          <h2 className="relative text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight mb-6 leading-tight">
            Start trading smarter
            <br />
            <span className="gradient-text">in 60 seconds flat</span>
          </h2>

          <p className="relative text-lg text-gray-400 max-w-xl mx-auto mb-8">
            Join 240,000+ traders who use Mfinity to execute faster, analyze
            deeper, and profit consistently — starting today.
          </p>

          {/* Perks */}
          <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto mb-10 text-left">
            {perks.map((perk) => (
              <div key={perk} className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                <span className="text-sm text-gray-300">{perk}</span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="relative flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold text-base shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105 transition-all duration-300"
            >
              Create Free Account
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="#"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-[#1E1E2E] bg-white/5 text-white font-semibold text-base hover:border-blue-500/40 hover:bg-white/10 transition-all duration-300"
            >
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
