"use client";

import { useState, useEffect, useCallback } from "react";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

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
  user: { firstName: string; lastName: string; email: string };
}

const statusColor: Record<string, string> = {
  PENDING: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  COMPLETED: "text-green-400 bg-green-500/10 border-green-500/20",
  REJECTED: "text-red-400 bg-red-500/10 border-red-500/20",
};

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState("PENDING");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [extra, setExtra] = useState<Record<string, { txHash?: string; note?: string }>>({});

  const fetchWithdrawals = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/withdrawals?status=${filter}&limit=50`);
    const data = await res.json();
    if (data.success) {
      setWithdrawals(data.data.items);
      setTotal(data.data.meta.total);
    }
    setLoading(false);
  }, [filter]);

  useEffect(() => { fetchWithdrawals(); }, [fetchWithdrawals]);

  async function handleAction(withdrawalId: string, action: "approve" | "reject") {
    setActionLoading(withdrawalId);
    const e = extra[withdrawalId] ?? {};
    await fetch("/api/admin/withdrawals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ withdrawalId, action, note: e.note, txHash: e.txHash }),
    });
    await fetchWithdrawals();
    setActionLoading(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Withdrawals</h1>
          <p className="text-gray-400 text-sm mt-1">{total} {filter.toLowerCase()} withdrawals</p>
        </div>
        <div className="flex gap-2">
          {["PENDING", "COMPLETED", "REJECTED"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${filter === s ? "bg-blue-500/10 border-blue-500/30 text-blue-400" : "border-[#1E1E2E] text-gray-400 hover:text-white"}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-[#0F0F1A] border border-[#1E1E2E] rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="animate-spin text-gray-500" size={20} /></div>
        ) : withdrawals.length === 0 ? (
          <div className="text-center py-10 text-gray-500">No {filter.toLowerCase()} withdrawals</div>
        ) : (
          <div className="divide-y divide-[#1E1E2E]">
            {withdrawals.map((w) => (
              <div key={w.id} className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium text-white">{w.user.firstName} {w.user.lastName}</p>
                    <p className="text-xs text-gray-500">{w.user.email}</p>
                    <p className="text-xs text-gray-600 mt-0.5">{new Date(w.createdAt).toLocaleString()}</p>
                    <p className="text-xs text-gray-500 font-mono mt-1 max-w-xs truncate">{w.destinationAddress}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-white">${Number(w.amount).toFixed(2)} <span className="text-sm font-normal text-gray-400">{w.currency}</span></p>
                    <p className="text-xs text-gray-500">Fee: ${Number(w.fee).toFixed(4)} · Net: ${Number(w.netAmount).toFixed(2)}</p>
                    <p className="text-xs text-gray-500">{w.network}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full border mt-1 inline-block ${statusColor[w.status] ?? ""}`}>
                      {w.status}
                    </span>
                  </div>
                </div>

                {w.status === "PENDING" && (
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <input
                      type="text"
                      value={extra[w.id]?.txHash ?? ""}
                      onChange={(e) => setExtra({ ...extra, [w.id]: { ...extra[w.id], txHash: e.target.value } })}
                      placeholder="Tx hash (for approval)..."
                      className="flex-1 min-w-0 bg-[#0A0A0F] border border-[#1E1E2E] text-white rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-blue-500 font-mono"
                    />
                    <input
                      type="text"
                      value={extra[w.id]?.note ?? ""}
                      onChange={(e) => setExtra({ ...extra, [w.id]: { ...extra[w.id], note: e.target.value } })}
                      placeholder="Note (required for rejection)..."
                      className="flex-1 min-w-0 bg-[#0A0A0F] border border-[#1E1E2E] text-white rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-blue-500"
                    />
                    <button
                      onClick={() => handleAction(w.id, "approve")}
                      disabled={actionLoading === w.id}
                      className="flex items-center gap-1 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg px-3 py-1.5 text-xs hover:bg-green-500/20 disabled:opacity-50"
                    >
                      {actionLoading === w.id ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} />}
                      Approve
                    </button>
                    <button
                      onClick={() => handleAction(w.id, "reject")}
                      disabled={actionLoading === w.id}
                      className="flex items-center gap-1 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg px-3 py-1.5 text-xs hover:bg-red-500/20 disabled:opacity-50"
                    >
                      <XCircle size={12} /> Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
