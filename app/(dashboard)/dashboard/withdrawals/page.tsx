"use client";

import { useState, useEffect } from "react";
import { ArrowUpFromLine, Loader2, AlertTriangle, Wallet, ShieldCheck, CheckCircle } from "lucide-react";
import { CoinIcon } from "@/components/CoinIcon";

const NETWORKS = [
  { id: "BTC", label: "Bitcoin", short: "BTC", currency: "BTC", fee: "0.0001 BTC", icon: "BTC" },
  { id: "ETH", label: "Ethereum", short: "ERC-20", currency: "USDT", fee: "10 USDT", icon: "ETH" },
  { id: "USDT_TRC20", label: "USDT TRC-20", short: "TRC-20", currency: "USDT", fee: "1 USDT", icon: "USDT" },
  { id: "BNB", label: "BNB Smart Chain", short: "BSC", currency: "USDT", fee: "0.5 USDT", icon: "BNB" },
];

interface Withdrawal {
  id: string;
  amount: number;
  fee: number;
  netAmount: number;
  currency: string;
  network: string;
  destinationAddress: string;
  status: string;
  createdAt: string;
}

const STATUS_STYLE: Record<string, string> = {
  COMPLETED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  PENDING: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  PROCESSING: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  FAILED: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  REJECTED: "bg-rose-500/10 text-rose-400 border-rose-500/20",
};

export default function WithdrawalsPage() {
  const [network, setNetwork] = useState(NETWORKS[0]);
  const [amount, setAmount] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    Promise.all([
      fetch("/api/withdrawals").then((r) => r.json()),
      fetch("/api/user/dashboard").then((r) => r.json()),
    ]).then(([wData, dData]) => {
      if (wData.success) setWithdrawals(wData.data.items);
      if (dData.success) setBalance(dData.data.stats.availableBalance);
    });
  }, [success]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (amt > balance) { setError("Insufficient balance"); return; }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/withdrawals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amt,
          currency: network.currency,
          network: network.id,
          destinationAddress: address,
        }),
      });
      const data = await res.json();
      if (!data.success) { setError(data.error); return; }
      setSuccess(true);
      setTimeout(() => { setSuccess(false); setAmount(""); setAddress(""); }, 3000);
    } catch {
      setError("Failed to submit withdrawal. Try again.");
    } finally {
      setLoading(false);
    }
  }

  const fee = parseFloat(amount || "0") * 0.001;
  const netAmount = parseFloat(amount || "0") - fee;

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Withdrawals</h1>
          <p className="text-gray-400 text-sm mt-1">Send funds back to your wallet</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20 rounded-xl">
          <Wallet size={14} className="text-purple-400" />
          <span className="text-xs text-purple-400 font-medium">Available: ${balance.toFixed(2)}</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gradient-to-br from-[#13131F] to-[#0F0F1A] border border-[#1E1E2E] rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/10 border border-purple-500/20 flex items-center justify-center">
              <ArrowUpFromLine size={16} className="text-purple-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">New Withdrawal</h2>
              <p className="text-xs text-gray-500">Available: <span className="text-white font-medium">${balance.toFixed(2)}</span></p>
            </div>
          </div>

          {success && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 mb-4 flex items-start gap-2">
              <CheckCircle size={14} className="text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-emerald-400 text-sm">Withdrawal submitted! Admin review within 24h.</p>
            </div>
          )}
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3 mb-4 flex items-start gap-2">
              <AlertTriangle size={14} className="text-rose-400 shrink-0 mt-0.5" />
              <p className="text-rose-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider font-medium">Network</label>
              <div className="grid grid-cols-2 gap-2">
                {NETWORKS.map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => setNetwork(n)}
                    className={`relative flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left transition-all ${
                      network.id === n.id
                        ? "border-purple-500/40 bg-purple-500/10"
                        : "border-[#1E1E2E] bg-[#0A0A14] hover:border-[#2A2A3E]"
                    }`}
                  >
                    <CoinIcon symbol={n.icon} size={28} className="shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-white font-medium truncate">{n.label}</p>
                      <p className="text-[10px] text-gray-500">Fee: {n.fee}</p>
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
                  max={balance}
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-[#0A0A14] border border-[#1E1E2E] focus:border-purple-500/40 text-white rounded-xl px-4 py-3 text-base font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/10 pr-16 transition-all"
                  placeholder="100.00"
                />
                <button
                  type="button"
                  onClick={() => setAmount(balance.toFixed(2))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-purple-400 hover:text-purple-300 bg-purple-500/10 border border-purple-500/20 px-2 py-1 rounded-md"
                >
                  MAX
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider font-medium">Destination Address</label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-[#0A0A14] border border-[#1E1E2E] focus:border-purple-500/40 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/10 font-mono transition-all"
                placeholder="Enter your wallet address"
              />
            </div>

            {amount && parseFloat(amount) > 0 && (
              <div className="bg-[#0A0A14] border border-[#1E1E2E] rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between text-gray-400">
                  <span>Amount</span><span className="text-white font-medium">${parseFloat(amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Network fee (0.1%)</span><span className="text-rose-400">-${fee.toFixed(4)}</span>
                </div>
                <div className="flex justify-between font-bold border-t border-[#1E1E2E] pt-2">
                  <span className="text-white">You receive</span>
                  <span className="text-emerald-400">${netAmount.toFixed(2)}</span>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !amount || !address}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl py-3 text-sm font-bold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              Request Withdrawal
            </button>
          </form>
        </div>

        <div className="space-y-4">
          <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/5 border border-purple-500/20 rounded-2xl p-5">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <ShieldCheck size={13} className="text-purple-400" />
              </div>
              Policy
            </h3>
            <ul className="space-y-2.5 text-sm text-gray-300">
              <li className="flex items-start gap-2"><span className="text-purple-400">•</span> Minimum withdrawal: $10</li>
              <li className="flex items-start gap-2"><span className="text-purple-400">•</span> Network fee: 0.1% of amount</li>
              <li className="flex items-start gap-2"><span className="text-purple-400">•</span> Processing within 24 hours</li>
              <li className="flex items-start gap-2"><span className="text-purple-400">•</span> KYC required for &gt; $500</li>
            </ul>
          </div>

          <div className="bg-amber-500/[0.06] border border-amber-500/20 rounded-2xl p-4 flex gap-3">
            <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-300/90 leading-relaxed">
              Always verify the destination address. Funds sent to incorrect addresses cannot be recovered.
            </p>
          </div>
        </div>
      </div>

      {/* History */}
      <div className="bg-gradient-to-br from-[#13131F] to-[#0F0F1A] border border-[#1E1E2E] rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#1E1E2E] flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white">Withdrawal History</h2>
            <p className="text-xs text-gray-500 mt-0.5">All your past withdrawals</p>
          </div>
          <span className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded-md">{withdrawals.length} total</span>
        </div>
        {withdrawals.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center mx-auto mb-3">
              <ArrowUpFromLine size={18} className="text-gray-500" />
            </div>
            <p className="text-gray-400 text-sm">No withdrawals yet</p>
            <p className="text-gray-600 text-xs mt-1">Your withdrawal history will appear here</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 text-[10px] uppercase tracking-wider border-b border-[#1E1E2E]">
                  <th className="text-left px-5 py-3 font-semibold">Date</th>
                  <th className="text-left px-5 py-3 font-semibold">Amount</th>
                  <th className="text-left px-5 py-3 font-semibold">Fee</th>
                  <th className="text-left px-5 py-3 font-semibold">Net</th>
                  <th className="text-left px-5 py-3 font-semibold">Network</th>
                  <th className="text-center px-5 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.map((w) => (
                  <tr key={w.id} className="border-b border-[#1E1E2E] last:border-0 hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3 text-gray-400">{new Date(w.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td>
                    <td className="px-5 py-3 text-white font-semibold">${Number(w.amount).toFixed(2)} <span className="text-gray-500 text-xs font-normal">{w.currency}</span></td>
                    <td className="px-5 py-3 text-rose-400">${Number(w.fee).toFixed(4)}</td>
                    <td className="px-5 py-3 text-emerald-400 font-semibold">${Number(w.netAmount).toFixed(2)}</td>
                    <td className="px-5 py-3"><span className="text-xs text-gray-300 bg-white/5 px-2 py-0.5 rounded-md">{w.network}</span></td>
                    <td className="px-5 py-3 text-center">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${STATUS_STYLE[w.status] ?? "bg-gray-500/10 text-gray-400 border-gray-500/20"}`}>{w.status}</span>
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
