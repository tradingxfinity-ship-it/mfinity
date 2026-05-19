"use client";

import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Alex Rivera",
    role: "Quantitative Trader",
    company: "Independent",
    avatar: "AR",
    avatarColor: "from-blue-500 to-cyan-500",
    stars: 5,
    text: "Mfinity completely changed how I trade. The execution speed is insane — I'm hitting fills I never could before. The AI signals alone have added a 23% edge to my win rate over the last quarter.",
    highlight: "+23% win rate improvement",
  },
  {
    name: "Sarah Chen",
    role: "Portfolio Manager",
    company: "DeFi Capital",
    avatar: "SC",
    avatarColor: "from-purple-500 to-pink-500",
    stars: 5,
    text: "We manage $40M+ in assets and Mfinity is the only platform that gives us the institutional-grade tools we need without the enterprise complexity. The auto-rebalancing feature saves us hours every week.",
    highlight: "$40M+ managed on Mfinity",
  },
  {
    name: "Marcus Webb",
    role: "Crypto Day Trader",
    company: "Self-employed",
    avatar: "MW",
    avatarColor: "from-orange-500 to-yellow-500",
    stars: 5,
    text: "I've tried everything — TradingView bots, 3Commas, Pionex. Nothing comes close to Mfinity. The dashboard UI is clean, the analytics are deep, and support actually responds in minutes, not days.",
    highlight: "Switched from 3 other platforms",
  },
];

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
      ))}
    </div>
  );
}

export default function Testimonials() {
  return (
    <section id="testimonials" className="relative py-24 px-4 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-purple-600/8 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto relative">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-xs font-semibold text-yellow-400 uppercase tracking-widest mb-4 px-3 py-1 rounded-full border border-yellow-500/30 bg-yellow-500/10">
            Testimonials
          </span>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight mb-4">
            Trusted by traders
            <br />
            <span className="gradient-text">all over the world</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Don't take our word for it — hear from the traders who use Mfinity
            every day to grow their portfolios.
          </p>
        </div>

        {/* Testimonial Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div
              key={t.name}
              className="relative flex flex-col p-6 rounded-2xl border border-[#1E1E2E] bg-[#0F0F1A] hover:border-purple-500/30 transition-all duration-300 hover:-translate-y-1 group"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              {/* Quote icon */}
              <Quote className="w-8 h-8 text-purple-500/30 mb-4 flex-shrink-0" />

              {/* Stars */}
              <StarRating count={t.stars} />

              {/* Text */}
              <p className="text-gray-300 text-sm leading-relaxed mt-4 flex-1">
                &ldquo;{t.text}&rdquo;
              </p>

              {/* Highlight pill */}
              <div className="mt-4 mb-5 inline-flex">
                <span className="text-xs font-semibold text-purple-300 bg-purple-500/10 border border-purple-500/20 px-3 py-1 rounded-full">
                  {t.highlight}
                </span>
              </div>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-[#1E1E2E]">
                <div
                  className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.avatarColor} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}
                >
                  {t.avatar}
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{t.name}</div>
                  <div className="text-xs text-gray-500">
                    {t.role} · {t.company}
                  </div>
                </div>
              </div>

              {/* Hover glow */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </div>
          ))}
        </div>

        {/* Social proof bar */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {["from-blue-500 to-cyan-500", "from-purple-500 to-pink-500", "from-green-500 to-emerald-500", "from-orange-500 to-yellow-500"].map((g, i) => (
                <div key={i} className={`w-7 h-7 rounded-full bg-gradient-to-br ${g} border-2 border-[#0A0A0F] flex items-center justify-center text-[9px] font-bold text-white`}>
                  {["JK", "AL", "BM", "TC"][i]}
                </div>
              ))}
            </div>
            <span>240,000+ traders joined</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />)}
            </div>
            <span>4.9/5 average rating</span>
          </div>
        </div>
      </div>
    </section>
  );
}
