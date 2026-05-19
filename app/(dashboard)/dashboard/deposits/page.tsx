"use client";

import { useState, useEffect } from "react";
import { Copy, CheckCircle, ArrowDownToLine, Loader2, Wallet, Clock, ShieldAlert } from "lucide-react";
import { CoinIcon } from "@/components/CoinIcon";

const NETWORKS = [
  { id: "BTC", label: "Bitcoin", short: "BTC", currency: "BTC", icon: "BTC" },
  { id: "ETH", label: "Ethereum", short: "ERC-20", currency: "USDT", icon: "ETH" },
  { id: "USDT_TRC20", label: "USDT TRC-20", short: "TRC-20", currency: "USDT", icon: "USDT" },
  { id: "BNB", label: "BNB Smart Chain", short: "BSC", currency: "USDT", icon: "BNB" },
  { id: "SOL", label: "Solana", short: "SOL", currency: "SOL", icon: "SOL" },
];

interface Deposit {
  id: string;
  amount: number;
  currency: string;
  network: string;
  status: string;
  txHash: string | null;
  walletAddress: string;
  createdAt: string;
}

const STATUS_STYLE: Record<string, string> = {
  COMPLETED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  PENDING: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  PROCESSING: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  FAILED: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  REJECTED: "bg-rose-500/10 text-rose-400 border-rose-500/20",
};

export default function DepositsPage() {
  const [network, setNetwork] = useState(NETWORKS[0]);
  const [amount, setAmount] = useState("");
  const [txHash, setTxHash] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [copied, setCopied] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");

  useEffect(() => {
    fetch("/api/deposits")
      .then((r) => r.json())
      .then((d) => { if (d.success) setDeposits(d.data.items); });
  }, [success]);

  function copyAddress() {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/deposits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseFloat(amount),
          currency: network.currency,
          network: network.id,
          txHash: txHash || undefined,
        }),
      });
      const data = await res.json();
      if (!data.success) { setError(data.error); return; }

      setWalletAddress(data.data.walletAddress);
      setSuccess(true);
    } catch {
      setError("Failed to submit deposit. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Deposits</h1>
          <p className="text-gray-400 text-sm mt-1">Fund your trading account with crypto</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 rounded-xl">
          <Wallet size={14} className="text-emerald-400" />
          <span className="text-xs text-emerald-400 font-medium">Min deposit: $10</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2 bg-gradient-to-br from-[#13131F] to-[#0F0F1A] border border-[#1E1E2E] rounded-2xl p-6">
          {success ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                <CheckCircle className="text-emerald-400" size={28} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Deposit Request Submitted</h3>
              <p className="text-gray-400 text-sm mb-5 max-w-md mx-auto">
                Send your funds to the address below. Your balance will be credited once we confirm the transaction.
              </p>
              <div className="bg-[#0A0A14] border border-[#1E1E2E] rounded-2xl p-5 mb-4 max-w-lg mx-auto">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Send to address ({network.id})</p>
                  <span className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">Pending</span>
                </div>
                <p className="text-sm font-mono text-white break-all leading-relaxed">{walletAddress}</p>
              </div>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={copyAddress}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-blue-500/20"
                >
                  {copied ? <CheckCircle size={14} /> : <Copy size={14} />}
                  {copied ? "Copied!" : "Copy Address"}
                </button>
                <button
                  onClick={() => { setSuccess(false); setAmount(""); setTxHash(""); }}
                  className="text-sm text-gray-400 hover:text-white border border-white/10 hover:border-white/20 px-4 py-2.5 rounded-xl transition-colors"
                >
                  New deposit
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/10 border border-blue-500/20 flex items-center justify-center">
                  <ArrowDownToLine size={16} className="text-blue-400" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">New Deposit</h2>
                  <p className="text-xs text-gray-500">Fund your account in seconds</p>
                </div>
              </div>

              {error && (
                <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3 mb-4 flex items-start gap-2">
                  <ShieldAlert size={14} className="text-rose-400 shrink-0 mt-0.5" />
                  <p className="text-rose-400 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Network grid */}
                <div>
                  <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider font-medium">Choose Network</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {NETWORKS.map((n) => (
                      <button
                        key={n.id}
                        type="button"
                        onClick={() => setNetwork(n)}
                        className={`relative flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left transition-all ${
                          network.id === n.id
                            ? "border-blue-500/40 bg-blue-500/10"
                            : "border-[#1E1E2E] bg-[#0A0A14] hover:border-[#2A2A3E]"
                        }`}
                      >
                        <CoinIcon symbol={n.icon} size={28} className="shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs text-white font-medium truncate">{n.label}</p>
                          <p className="text-[10px] text-gray-500">{n.currency}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider font-medium">
                    Amount ({network.currency})
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min="10"
                      step="any"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full bg-[#0A0A14] border border-[#1E1E2E] focus:border-blue-500/40 text-white rounded-xl px-4 py-3 text-base font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all"
                      placeholder="100.00"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-medium">{network.currency}</span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1.5">Minimum: $10 USD equivalent</p>
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider font-medium">
                    Transaction Hash <span className="text-gray-600 normal-case font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={txHash}
                    onChange={(e) => setTxHash(e.target.value)}
                    className="w-full bg-[#0A0A14] border border-[#1E1E2E] focus:border-blue-500/40 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 font-mono transition-all"
                    placeholder="0x..."
                  />
                  <p className="text-[11px] text-gray-500 mt-1.5">Speeds up confirmation</p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl py-3 text-sm font-bold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
                >
                  {loading && <Loader2 size={16} className="animate-spin" />}
                  Submit Deposit
                </button>
              </form>
            </>
          )}
        </div>

        {/* Side panel */}
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/5 border border-blue-500/20 rounded-2xl p-5">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Clock size={13} className="text-blue-400" />
              </div>
              How it works
            </h3>
            <ol className="space-y-3">
              {["Select network and enter amount", "Submit the deposit request", "Send crypto to the wallet address", "We confirm and credit within 30 min"].map((step, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                  <span className="shrink-0 w-5 h-5 rounded-full bg-blue-500/15 border border-blue-500/20 text-blue-400 text-[10px] font-bold flex items-center justify-center">{i + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          <div className="bg-amber-500/[0.06] border border-amber-500/20 rounded-2xl p-4 flex gap-3">
            <ShieldAlert size={16} className="text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-300/90 leading-relaxed">
              Always verify the wallet address before sending. Deposits to incorrect addresses cannot be recovered.
            </p>
          </div>
        </div>
      </div>

      {/* History */}
      <div className="bg-gradient-to-br from-[#13131F] to-[#0F0F1A] border border-[#1E1E2E] rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#1E1E2E] flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white">Deposit History</h2>
            <p className="text-xs text-gray-500 mt-0.5">All your past deposits</p>
          </div>
          <span className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded-md">{deposits.length} total</span>
        </div>
        {deposits.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center mx-auto mb-3">
              <ArrowDownToLine size={18} className="text-gray-500" />
            </div>
            <p className="text-gray-400 text-sm">No deposits yet</p>
            <p className="text-gray-600 text-xs mt-1">Your deposit history will appear here</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 text-[10px] uppercase tracking-wider border-b border-[#1E1E2E]">
                  <th className="text-left px-5 py-3 font-semibold">Date</th>
                  <th className="text-left px-5 py-3 font-semibold">Amount</th>
                  <th className="text-left px-5 py-3 font-semibold">Network</th>
                  <th className="text-center px-5 py-3 font-semibold">Status</th>
                  <th className="text-right px-5 py-3 font-semibold">Tx Hash</th>
                </tr>
              </thead>
              <tbody>
                {deposits.map((d) => (
                  <tr key={d.id} className="border-b border-[#1E1E2E] last:border-0 hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3 text-gray-400">{new Date(d.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td>
                    <td className="px-5 py-3 text-white font-semibold">${Number(d.amount).toFixed(2)} <span className="text-gray-500 text-xs font-normal">{d.currency}</span></td>
                    <td className="px-5 py-3"><span className="text-xs text-gray-300 bg-white/5 px-2 py-0.5 rounded-md">{d.network}</span></td>
                    <td className="px-5 py-3 text-center">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${STATUS_STYLE[d.status] ?? "bg-gray-500/10 text-gray-400 border-gray-500/20"}`}>{d.status}</span>
                    </td>
                    <td className="px-5 py-3 text-right text-gray-500 font-mono text-xs">
                      {d.txHash ? `${d.txHash.slice(0, 10)}...` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
