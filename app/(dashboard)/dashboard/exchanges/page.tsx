"use client";

import { useEffect, useState } from "react";
import { Link as LinkIcon, Unlink, Plus, Loader2, CheckCircle, XCircle, AlertTriangle, ShieldCheck, X } from "lucide-react";
import { ExchangeIcon } from "@/components/ExchangeIcon";

interface Exchange {
  id: string;
  exchange: string;
  label: string;
  status: string;
  createdAt: string;
}

const SUPPORTED = [
  { id: "binance", label: "Binance" },
  { id: "bybit", label: "Bybit" },
  { id: "okx", label: "OKX" },
  { id: "coinbase", label: "Coinbase" },
];

export default function ExchangesPage() {
  const [connections, setConnections] = useState<Exchange[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ exchange: "binance", label: "", apiKey: "", apiSecret: "", passphrase: "" });

  function load() {
    setLoading(true);
    fetch("/api/exchanges")
      .then((r) => r.json())
      .then((d) => { if (d.success) setConnections(d.data); })
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function handleConnect(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/exchanges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.success) { setError(data.error ?? "Failed to connect"); return; }
      setShowForm(false);
      setForm({ exchange: "binance", label: "", apiKey: "", apiSecret: "", passphrase: "" });
      load();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDisconnect(id: string) {
    if (!confirm("Are you sure you want to disconnect this exchange?")) return;
    await fetch(`/api/exchanges/${id}`, { method: "DELETE" });
    load();
  }

  const selectedExchange = SUPPORTED.find((e) => e.id === form.exchange) ?? SUPPORTED[0];

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Exchanges</h1>
          <p className="text-gray-400 text-sm mt-1">Connect exchange API keys to enable trading</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-bold px-4 py-2.5 rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-blue-500/20"
          >
            <Plus size={15} />
            Connect Exchange
          </button>
        )}
      </div>

      {/* Connect form */}
      {showForm && (
        <div className="bg-gradient-to-br from-[#13131F] to-[#0F0F1A] border border-blue-500/20 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/10 border border-blue-500/20 flex items-center justify-center">
                <LinkIcon size={16} className="text-blue-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Connect Exchange</h3>
                <p className="text-xs text-gray-500">Add your API credentials</p>
              </div>
            </div>
            <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors">
              <X size={16} />
            </button>
          </div>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3 mb-4 flex items-start gap-2">
              <AlertTriangle size={14} className="text-rose-400 shrink-0 mt-0.5" />
              <p className="text-rose-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleConnect} className="space-y-4">
            <div>
              <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider font-medium">Exchange</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {SUPPORTED.map((ex) => (
                  <button
                    key={ex.id}
                    type="button"
                    onClick={() => setForm({ ...form, exchange: ex.id })}
                    className={`relative flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left transition-all ${
                      form.exchange === ex.id ? "border-blue-500/40 bg-blue-500/10" : "border-[#1E1E2E] bg-[#0A0A14] hover:border-[#2A2A3E]"
                    }`}
                  >
                    <ExchangeIcon name={ex.id} size={28} className="shrink-0 rounded-lg" />
                    <span className="text-xs text-white font-medium">{ex.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider font-medium">Label</label>
              <input
                required
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
                placeholder={`My ${selectedExchange.label} account`}
                className="w-full bg-[#0A0A14] border border-[#1E1E2E] focus:border-blue-500/40 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider font-medium">API Key</label>
              <input
                required
                value={form.apiKey}
                onChange={(e) => setForm({ ...form, apiKey: e.target.value })}
                placeholder="Your API key"
                className="w-full bg-[#0A0A14] border border-[#1E1E2E] focus:border-blue-500/40 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 font-mono transition-all"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider font-medium">API Secret</label>
              <input
                required
                type="password"
                value={form.apiSecret}
                onChange={(e) => setForm({ ...form, apiSecret: e.target.value })}
                placeholder="Your API secret"
                className="w-full bg-[#0A0A14] border border-[#1E1E2E] focus:border-blue-500/40 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 font-mono transition-all"
              />
            </div>

            {form.exchange === "okx" && (
              <div>
                <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider font-medium">Passphrase</label>
                <input
                  type="password"
                  value={form.passphrase}
                  onChange={(e) => setForm({ ...form, passphrase: e.target.value })}
                  placeholder="OKX passphrase"
                  className="w-full bg-[#0A0A14] border border-[#1E1E2E] focus:border-blue-500/40 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 font-mono transition-all"
                />
              </div>
            )}

            <div className="bg-blue-500/[0.06] border border-blue-500/20 rounded-xl p-3 flex gap-3">
              <ShieldCheck size={14} className="text-blue-400 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-300/90 leading-relaxed">
                API keys are encrypted and stored securely. Use read-only or restricted keys when possible.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:opacity-90 disabled:opacity-50 shadow-lg shadow-blue-500/20"
              >
                {submitting && <Loader2 size={14} className="animate-spin" />}
                Connect
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-sm text-gray-400 hover:text-white px-5 py-2.5 rounded-xl border border-[#1E1E2E] hover:border-white/20 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Connections list */}
      <div className="space-y-3">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="bg-[#0F0F1A] border border-[#1E1E2E] rounded-2xl p-4 h-20 animate-pulse" />
            ))}
          </div>
        ) : connections.length === 0 ? (
          <div className="bg-gradient-to-br from-[#13131F] to-[#0F0F1A] border border-[#1E1E2E] rounded-2xl px-5 py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center mx-auto mb-3">
              <LinkIcon size={20} className="text-gray-500" />
            </div>
            <p className="text-gray-300 text-sm font-medium">No exchanges connected</p>
            <p className="text-gray-600 text-xs mt-1 mb-4">Connect an exchange to enable automated trading</p>
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-bold px-4 py-2 rounded-xl hover:opacity-90 transition-opacity"
              >
                <Plus size={14} />
                Connect Exchange
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Available exchanges grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              {SUPPORTED.map((ex) => {
                const connected = connections.some((c) => c.exchange === ex.id);
                return (
                  <div
                    key={ex.id}
                    className={`bg-gradient-to-br from-[#13131F] to-[#0F0F1A] border rounded-2xl p-4 text-center ${connected ? "border-emerald-500/20" : "border-[#1E1E2E]"}`}
                  >
                    <ExchangeIcon name={ex.id} size={40} className="mx-auto mb-2 rounded-xl" />
                    <p className="text-xs text-white font-medium">{ex.label}</p>
                    {connected ? (
                      <span className="text-[10px] text-emerald-400 mt-1 flex items-center justify-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-emerald-400" />
                        Connected
                      </span>
                    ) : (
                      <span className="text-[10px] text-gray-600 mt-1 block">Not connected</span>
                    )}
                  </div>
                );
              })}
            </div>

            {connections.map((conn) => {
              return (
                <div key={conn.id} className="bg-gradient-to-br from-[#13131F] to-[#0F0F1A] border border-[#1E1E2E] hover:border-[#2A2A3E] rounded-2xl p-4 flex items-center justify-between transition-colors">
                  <div className="flex items-center gap-3">
                    <ExchangeIcon name={conn.exchange} size={44} className="rounded-xl shadow-sm" />
                    <div>
                      <p className="text-white text-sm font-bold">{conn.label}</p>
                      <p className="text-xs text-gray-500 capitalize mt-0.5">{conn.exchange} · Added {new Date(conn.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {conn.status === "CONNECTED" ? (
                      <span className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-md font-medium">
                        <CheckCircle size={11} />
                        Connected
                      </span>
                    ) : (
                      <span className="hidden sm:flex items-center gap-1.5 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-1 rounded-md font-medium">
                        <XCircle size={11} />
                        {conn.status}
                      </span>
                    )}
                    <button
                      onClick={() => handleDisconnect(conn.id)}
                      className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 bg-rose-500/5 border border-rose-500/20 hover:bg-rose-500/10 rounded-lg px-3 py-1.5 font-medium transition-colors"
                    >
                      <Unlink size={11} />
                      Disconnect
                    </button>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
