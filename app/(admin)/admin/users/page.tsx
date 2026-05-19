"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, MoreHorizontal, Ban, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  kycStatus: string;
  createdAt: string;
  subscription: { plan: string } | null;
  _count: { deposits: number; withdrawals: number };
}

const statusColor: Record<string, string> = {
  ACTIVE: "text-green-400 bg-green-500/10 border-green-500/20",
  SUSPENDED: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  BANNED: "text-red-400 bg-red-500/10 border-red-500/20",
  PENDING_VERIFICATION: "text-gray-400 bg-gray-500/10 border-gray-500/20",
};

const kycColor: Record<string, string> = {
  NOT_STARTED: "text-gray-500",
  PENDING: "text-yellow-400",
  APPROVED: "text-green-400",
  REJECTED: "text-red-400",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: page.toString(), limit: "20" });
    if (search) params.set("search", search);

    const res = await fetch(`/api/admin/users?${params}`);
    const data = await res.json();
    if (data.success) {
      setUsers(data.data.items);
      setTotal(data.data.meta.total);
    }
    setLoading(false);
  }, [page, search]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  async function doAction(userId: string, action: string) {
    setActionLoading(userId);
    setOpenMenu(null);

    await fetch(`/api/admin/users/${userId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });

    await fetchUsers();
    setActionLoading(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Users</h1>
          <p className="text-gray-400 text-sm mt-1">{total.toLocaleString()} total users</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search by name or email..."
          className="w-full max-w-md bg-[#0F0F1A] border border-[#1E1E2E] text-white rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Table */}
      <div className="bg-[#0F0F1A] border border-[#1E1E2E] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1E1E2E] bg-white/2">
                {["User", "Status", "KYC", "Plan", "Deposits", "Joined", "Actions"].map((h) => (
                  <th key={h} className="text-left text-xs text-gray-500 px-4 py-3 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-10">
                  <Loader2 className="animate-spin text-gray-500 mx-auto" size={20} />
                </td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={7} className="text-center text-gray-500 py-10">No users found</td></tr>
              ) : users.map((user) => (
                <tr key={user.id} className="border-b border-[#1E1E2E] last:border-0 hover:bg-white/2">
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-white font-medium">{user.firstName} {user.lastName}</p>
                      <p className="text-gray-500 text-xs">{user.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${statusColor[user.status] ?? ""}`}>
                      {user.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs ${kycColor[user.kycStatus] ?? "text-gray-500"}`}>
                      {user.kycStatus.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-300 text-xs">{user.subscription?.plan ?? "FREE"}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{user._count.deposits}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 relative">
                    {actionLoading === user.id ? (
                      <Loader2 size={16} className="animate-spin text-gray-500" />
                    ) : (
                      <>
                        <button
                          onClick={() => setOpenMenu(openMenu === user.id ? null : user.id)}
                          className="text-gray-400 hover:text-white p-1 rounded hover:bg-white/5"
                        >
                          <MoreHorizontal size={16} />
                        </button>
                        {openMenu === user.id && (
                          <div className="absolute right-4 top-10 bg-[#0F0F1A] border border-[#1E1E2E] rounded-lg shadow-xl z-10 py-1 min-w-36">
                            {user.status !== "ACTIVE" && (
                              <button onClick={() => doAction(user.id, "restore")} className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-green-400 hover:bg-green-500/10">
                                <CheckCircle size={14} /> Restore
                              </button>
                            )}
                            {user.status === "ACTIVE" && (
                              <button onClick={() => doAction(user.id, "suspend")} className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-yellow-400 hover:bg-yellow-500/10">
                                <AlertTriangle size={14} /> Suspend
                              </button>
                            )}
                            {user.status !== "BANNED" && (
                              <button onClick={() => doAction(user.id, "ban")} className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-500/10">
                                <Ban size={14} /> Ban
                              </button>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > 20 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#1E1E2E]">
            <p className="text-xs text-gray-500">
              Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, total)} of {total}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="text-xs px-3 py-1.5 rounded border border-[#1E1E2E] text-gray-400 hover:text-white disabled:opacity-40"
              >
                Prev
              </button>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page * 20 >= total}
                className="text-xs px-3 py-1.5 rounded border border-[#1E1E2E] text-gray-400 hover:text-white disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
