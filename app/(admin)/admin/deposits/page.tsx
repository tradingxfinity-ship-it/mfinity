"use client";

import { useState, useEffect, useCallback } from "react";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

interface Deposit {
  id: string;
  amount: number;
  currency: string;
  network: string;
  status: string;
  txHash: string | null;
  walletAddress: string;
  createdAt: string;
  user: { firstName: string; lastName: string; email: string };
}

const statusColor: Record<string, string> = {
  PENDING: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  COMPLETED: "text-green-400 bg-green-500/10 border-green-500/20",
  REJECTED: "text-red-400 bg-red-500/10 border-red-500/20",
};

export default function AdminDepositsPage() {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState("PENDING");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [note, setNote] = useState<Record<string, string>>({});

  const fetchDeposits = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/deposits?status=${filter}&limit=50`);
    const data = await res.json();
    if (data.success) {
      setDeposits(data.data.items);
      setTotal(data.data.meta.total);
    }
    setLoading(false);
  }, [filter]);

  useEffect(() => { fetchDeposits(); }, [fetchDeposits]);

  async function handleAction(depositId: string, action: "approve" | "reject") {
    setActionLoading(depositId);
    await fetch("/api/admin/deposits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ depositId, action, note: note[depositId] }),
    });
    await fetchDeposits();
    setActionLoading(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Deposits</h1>
          <p className="text-gray-400 text-sm mt-1">{total} {filter.toLowerCase()} deposits</p>
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
        ) : deposits.length === 0 ? (
          <div className="text-center py-10 text-gray-500">No {filter.toLowerCase()} deposits</div>
        ) : (
          <div className="divide-y divide-[#1E1E2E]">
            {deposits.map((dep) => (
              <div key={dep.id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm font-medium text-white">{dep.user.firstName} {dep.user.lastName}</p>
                    <p className="text-xs text-gray-500">{dep.user.email}</p>
                    <p className="text-xs text-gray-600 mt-0.5">{new Date(dep.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-white">${Number(dep.amount).toFixed(2)} <span className="text-sm font-normal text-gray-400">{dep.currency}</span></p>
                    <p className="text-xs text-gray-500">{dep.network}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full border mt-1 inline-block ${statusColor[dep.status] ?? ""}`}>
                      {dep.status}
                    </span>
                  </div>
                </div>

                {dep.txHash && (
                  <p className="text-xs text-gray-500 font-mono mb-3">Tx: {dep.txHash}</p>
                )}

                {dep.status === "PENDING" && (
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="text"
                      value={note[dep.id] ?? ""}
                      onChange={(e) => setNote({ ...note, [dep.id]: e.target.value })}
                      placeholder="Optional note..."
                      className="flex-1 bg-[#0A0A0F] border border-[#1E1E2E] text-white rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-blue-500"
                    />
                    <button
                      onClick={() => handleAction(dep.id, "approve")}
                      disabled={actionLoading === dep.id}
                      className="flex items-center gap-1 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg px-3 py-1.5 text-xs hover:bg-green-500/20 disabled:opacity-50"
                    >
                      {actionLoading === dep.id ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} />}
                      Approve
                    </button>
                    <button
                      onClick={() => handleAction(dep.id, "reject")}
                      disabled={actionLoading === dep.id}
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
