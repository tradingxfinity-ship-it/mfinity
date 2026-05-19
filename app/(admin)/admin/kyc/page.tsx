"use client";

import { useState, useEffect, useCallback } from "react";
import { CheckCircle, XCircle, Eye, Loader2 } from "lucide-react";

interface KYCUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  kycStatus: string;
  createdAt: string;
  kycDocuments: Array<{ id: string; documentType: string; cloudinaryUrl: string; status: string }>;
}

export default function AdminKYCPage() {
  const [users, setUsers] = useState<KYCUser[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selected, setSelected] = useState<KYCUser | null>(null);
  const [note, setNote] = useState("");
  const [msg, setMsg] = useState("");

  const fetchKYC = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/kyc?limit=20");
    const data = await res.json();
    if (data.success) {
      setUsers(data.data.items);
      setTotal(data.data.meta.total);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchKYC(); }, [fetchKYC]);

  async function handleAction(userId: string, action: "approve" | "reject") {
    if (action === "reject" && !note.trim()) {
      setMsg("Rejection reason required");
      return;
    }
    setActionLoading(userId);
    setMsg("");

    const res = await fetch("/api/admin/kyc", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, action, note: note || undefined }),
    });
    const data = await res.json();
    if (data.success) {
      setSelected(null);
      setNote("");
      await fetchKYC();
    } else {
      setMsg(data.error);
    }
    setActionLoading(null);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">KYC Requests</h1>
        <p className="text-gray-400 text-sm mt-1">{total} pending verifications</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* List */}
        <div className="bg-[#0F0F1A] border border-[#1E1E2E] rounded-xl overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-gray-500" size={20} /></div>
          ) : users.length === 0 ? (
            <div className="text-center py-10 text-gray-500">No pending KYC requests</div>
          ) : (
            <div className="divide-y divide-[#1E1E2E]">
              {users.map((user) => (
                <div
                  key={user.id}
                  onClick={() => { setSelected(user); setNote(""); setMsg(""); }}
                  className={`p-4 cursor-pointer hover:bg-white/2 transition-colors ${selected?.id === user.id ? "bg-blue-500/5 border-l-2 border-blue-500" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white">{user.firstName} {user.lastName}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">{user.kycDocuments.length} docs</p>
                      <p className="text-xs text-gray-600">{new Date(user.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detail panel */}
        {selected ? (
          <div className="bg-[#0F0F1A] border border-[#1E1E2E] rounded-xl p-5 space-y-4">
            <div>
              <h2 className="text-base font-semibold text-white">{selected.firstName} {selected.lastName}</h2>
              <p className="text-xs text-gray-500">{selected.email}</p>
            </div>

            {msg && <p className="text-red-400 text-sm">{msg}</p>}

            <div className="space-y-3">
              {selected.kycDocuments.map((doc) => (
                <div key={doc.id} className="border border-[#1E1E2E] rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between px-3 py-2 bg-white/2">
                    <p className="text-xs text-gray-400">{doc.documentType.replace("_", " ")}</p>
                    <a href={doc.cloudinaryUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-400 flex items-center gap-1 hover:text-blue-300">
                      <Eye size={12} /> View
                    </a>
                  </div>
                  {doc.cloudinaryUrl && (
                    <img
                      src={doc.cloudinaryUrl}
                      alt={doc.documentType}
                      className="w-full h-32 object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                  )}
                </div>
              ))}
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Note (required for rejection)</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                className="w-full bg-[#0A0A0F] border border-[#1E1E2E] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 resize-none"
                placeholder="Reason or feedback..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleAction(selected.id, "approve")}
                disabled={actionLoading === selected.id}
                className="flex-1 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg py-2.5 text-sm font-medium hover:bg-green-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {actionLoading === selected.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                Approve
              </button>
              <button
                onClick={() => handleAction(selected.id, "reject")}
                disabled={actionLoading === selected.id}
                className="flex-1 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg py-2.5 text-sm font-medium hover:bg-red-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {actionLoading === selected.id ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                Reject
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-[#0F0F1A] border border-[#1E1E2E] rounded-xl flex items-center justify-center text-gray-500 text-sm py-20">
            Select a user to review their documents
          </div>
        )}
      </div>
    </div>
  );
}
