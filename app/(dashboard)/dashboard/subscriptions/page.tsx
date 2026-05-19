"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Check, Loader2, CreditCard, ExternalLink } from "lucide-react";

const PLANS = [
  {
    id: "FREE",
    name: "Free",
    price: 0,
    interval: null,
    features: ["1 exchange connection", "Basic analytics", "5 active positions", "Email support"],
    cta: "Current Plan",
  },
  {
    id: "PRO",
    name: "Pro",
    price: 49,
    interval: "monthly",
    features: ["3 exchange connections", "Advanced analytics", "Unlimited positions", "AI signals", "Priority support"],
    cta: "Upgrade to Pro",
    popular: true,
  },
  {
    id: "ENTERPRISE",
    name: "Enterprise",
    price: 199,
    interval: "monthly",
    features: ["Unlimited connections", "Full analytics suite", "Custom strategies", "API access", "Dedicated support"],
    cta: "Upgrade to Enterprise",
  },
];

function SubscriptionsContent() {
  const searchParams = useSearchParams();
  const success = searchParams.get("success") ?? searchParams.get("verified");
  const cancelled = searchParams.get("cancelled");

  const [currentPlan, setCurrentPlan] = useState("FREE");
  const [loading, setLoading] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    fetch("/api/user/profile")
      .then((r) => r.json())
      .then((d) => { if (d.success) setCurrentPlan(d.data.subscriptionPlan); });
  }, []);

  async function handleUpgrade(plan: string, interval: string) {
    setLoading(plan);
    try {
      const res = await fetch("/api/paystack/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, interval }),
      });
      const data = await res.json();
      if (data.success && data.data.url) {
        window.location.href = data.data.url;
      }
    } catch {
      setLoading(null);
    }
  }

  async function openPortal() {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/paystack/portal", { method: "POST" });
      const data = await res.json();
      if (data.success && data.data.url) window.location.href = data.data.url;
    } catch {
      setPortalLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Subscription</h1>
        <p className="text-gray-400 text-sm mt-1">Choose the plan that fits your trading needs</p>
      </div>

      {success && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-center gap-3">
          <Check className="text-green-400 shrink-0" size={18} />
          <p className="text-green-400 text-sm">Subscription activated successfully! Your plan has been upgraded.</p>
        </div>
      )}
      {cancelled && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
          <p className="text-yellow-400 text-sm">Checkout cancelled. You can upgrade anytime.</p>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-5">
        {PLANS.map((plan) => {
          const isCurrent = currentPlan === plan.id;
          return (
            <div
              key={plan.id}
              className={`bg-[#0F0F1A] border rounded-xl p-6 relative ${
                plan.popular
                  ? "border-blue-500/40"
                  : isCurrent
                  ? "border-green-500/30"
                  : "border-[#1E1E2E]"
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs px-3 py-1 rounded-full font-medium">
                  Most Popular
                </span>
              )}
              {isCurrent && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500/20 border border-green-500/30 text-green-400 text-xs px-3 py-1 rounded-full font-medium">
                  Current Plan
                </span>
              )}

              <h3 className="text-lg font-bold text-white mb-1">{plan.name}</h3>
              <div className="mb-4">
                {plan.price === 0 ? (
                  <span className="text-3xl font-bold text-white">Free</span>
                ) : (
                  <>
                    <span className="text-3xl font-bold text-white">${plan.price}</span>
                    <span className="text-gray-500 text-sm">/mo</span>
                  </>
                )}
              </div>

              <ul className="space-y-2 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-400">
                    <Check size={14} className="text-green-400 shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>

              {isCurrent || plan.price === 0 ? (
                <button
                  disabled
                  className="w-full bg-white/5 border border-[#1E1E2E] text-gray-500 rounded-lg py-2.5 text-sm cursor-not-allowed"
                >
                  {isCurrent ? "Current Plan" : "Free Forever"}
                </button>
              ) : (
                <button
                  onClick={() => handleUpgrade(plan.id, plan.interval ?? "monthly")}
                  disabled={loading === plan.id}
                  className={`w-full text-white rounded-lg py-2.5 text-sm font-semibold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 ${
                    plan.popular
                      ? "bg-gradient-to-r from-blue-500 to-purple-600"
                      : "bg-white/10 hover:bg-white/15"
                  }`}
                >
                  {loading === plan.id && <Loader2 size={14} className="animate-spin" />}
                  {plan.cta}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {currentPlan !== "FREE" && (
        <div className="bg-[#0F0F1A] border border-[#1E1E2E] rounded-xl p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CreditCard size={18} className="text-gray-400" />
            <div>
              <p className="text-sm font-medium text-white">Billing Portal</p>
              <p className="text-xs text-gray-500">Manage invoices, payment methods, and cancellations</p>
            </div>
          </div>
          <button
            onClick={openPortal}
            disabled={portalLoading}
            className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 border border-blue-500/20 rounded-lg px-4 py-2 hover:bg-blue-500/5 transition-colors disabled:opacity-50"
          >
            {portalLoading ? <Loader2 size={14} className="animate-spin" /> : <ExternalLink size={14} />}
            Open Billing Portal
          </button>
        </div>
      )}
    </div>
  );
}

export default function SubscriptionsPage() {
  return (
    <Suspense fallback={<div className="text-gray-400">Loading...</div>}>
      <SubscriptionsContent />
    </Suspense>
  );
}
