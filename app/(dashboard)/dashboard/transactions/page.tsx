"use client";

import { useEffect, useState } from "react";
import { ArrowDownToLine, ArrowUpFromLine, RefreshCw, Gift, Settings2, FileText, Filter } from "lucide-react";

interface Transaction {
  id: string;
  type: string;
  amount: number;
  fee: number;
  status: string;
  description: string | null;
  createdAt: string;
}

const TYPE_ICON: Record<string, React.ElementType> = {
  DEPOSIT: ArrowDownToLine,
  WITHDRAWAL: ArrowUpFromLine,
  FEE: Settings2,
  BONUS: Gift,
  ADJUSTMENT: RefreshCw,
};

const TYPE_COLOR: Record<string, string> = {
  DEPOSIT: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  WITHDRAWAL: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  FEE: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  BONUS: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  ADJUSTMENT: "bg-blue-500/10 text-blue-400 border-blue-500/20",
};

const STATUS_STYLE: Record<string, string> = {
  COMPLETED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  PENDING: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  PROCESSING: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  FAILED: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  CANCELLED: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  REJECTED: "bg-rose-500/10 text-rose-400 border-rose-500/20",
};

export default function TransactionsPage() {
  const [items, setItems] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState<string>("ALL");

  useEffect(() => {
    setLoading(true);
    fetch(`/api/transactions?page=${page}&limit=20`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setItems(d.data.items ?? []);
          setTotalPages(d.data.meta?.totalPages ?? 1);
        }
      })
      .finally(() => setLoading(false));
  }, [page]);

  const filtered = filter === "ALL" ? items : items.filter((tx) => tx.type === filter);

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Transactions</h1>
          <p className="text-gray-400 text-sm mt-1">Full history of your account activity</p>
        </div>
        <div className="flex items-center gap-2 bg-[#13131F] border border-[#1E1E2E] rounded-xl p-1">
          {["ALL", "DEPOSIT", "WITHDRAWAL", "FEE"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                filter === f ? "bg-gradient-to-r from-blue-500/20 to-purple-500/10 text-white border border-blue-500/20" : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {f === "ALL" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-br from-[#13131F] to-[#0F0F1A] border border-[#1E1E2E] rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#1E1E2E] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/10 border border-blue-500/20 flex items-center justify-center">
              <FileText size={15} className="text-blue-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Activity Log</h2>
              <p className="text-xs text-gray-500 mt-0.5">All transactions on your account</p>
            </div>
          </div>
          <span className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded-md">{filtered.length} of {items.length}</span>
        </div>

        {loading ? (
          <div className="divide-y divide-[#1E1E2E]">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="px-5 py-4 flex items-center gap-3 animate-pulse">
                <div className="w-10 h-10 rounded-xl bg-white/5" />
                <div className="flex-1">
                  <div className="h-4 w-32 bg-white/5 rounded mb-2" />
                  <div className="h-3 w-20 bg-white/5 rounded" />
                </div>
                <div className="h-5 w-24 bg-white/5 rounded" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center mx-auto mb-3">
              <FileText size={20} className="text-gray-500" />
            </div>
            <p className="text-gray-300 text-sm font-medium">No transactions{filter !== "ALL" ? ` of type ${filter}` : ""}</p>
            <p className="text-gray-600 text-xs mt-1">Your activity will appear here</p>
          </div>
        ) : (
          <div className="divide-y divide-[#1E1E2E]">
            {filtered.map((tx) => {
              const Icon = TYPE_ICON[tx.type] ?? RefreshCw;
              const isCredit = tx.type === "DEPOSIT" || tx.type === "BONUS";
              return (
                <div key={tx.id} className="flex items-center justify-between px-5 py-4 hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${TYPE_COLOR[tx.type] ?? TYPE_COLOR.ADJUSTMENT}`}>
                      <Icon size={14} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-white font-semibold">{tx.type.charAt(0) + tx.type.slice(1).toLowerCase()}</p>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">{tx.description ?? new Date(tx.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0 ml-3">
                    <div className="text-right">
                      <p className={`text-sm font-bold ${isCredit ? "text-emerald-400" : "text-rose-400"}`}>
                        {isCredit ? "+" : "-"}${Number(tx.amount).toFixed(2)}
                      </p>
                      {tx.fee > 0 && (
                        <p className="text-[10px] text-gray-500">Fee: ${Number(tx.fee).toFixed(4)}</p>
                      )}
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${STATUS_STYLE[tx.status] ?? "bg-gray-500/10 text-gray-400 border-gray-500/20"}`}>
                      {tx.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-[#1E1E2E]">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="text-sm text-gray-300 hover:text-white border border-[#1E1E2E] hover:border-white/20 rounded-lg px-4 py-1.5 disabled:opacity-30 transition-colors"
            >
              ← Previous
            </button>
            <span className="text-xs text-gray-500 font-medium">Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="text-sm text-gray-300 hover:text-white border border-[#1E1E2E] hover:border-white/20 rounded-lg px-4 py-1.5 disabled:opacity-30 transition-colors"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
