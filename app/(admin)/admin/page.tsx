"use client";

import { useState, useEffect } from "react";
import { Users, ArrowDownToLine, ArrowUpFromLine, Shield, DollarSign, TrendingUp } from "lucide-react";
import Link from "next/link";

interface Stats {
  totalUsers: number;
  activeUsers: number;
  pendingKYC: number;
  pendingWithdrawals: number;
  totalDeposits: number;
  totalWithdrawals: number;
}

function StatCard({ title, value, sub, icon: Icon, href, color = "blue" }: {
  title: string; value: string | number; sub?: string; icon: React.ElementType; href?: string; color?: string;
}) {
  const colorMap: Record<string, string> = {
    blue: "text-blue-400 bg-blue-500/10",
    green: "text-green-400 bg-green-500/10",
    yellow: "text-yellow-400 bg-yellow-500/10",
    red: "text-red-400 bg-red-500/10",
    purple: "text-purple-400 bg-purple-500/10",
  };

  const card = (
    <div className="bg-[#0F0F1A] border border-[#1E1E2E] rounded-xl p-5 hover:border-white/10 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm text-gray-400">{title}</p>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${colorMap[color]}`}>
          <Icon size={16} className={colorMap[color].split(" ")[0]} />
        </div>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  );

  return href ? <Link href={href}>{card}</Link> : card;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((d) => { if (d.success) setStats(d.data); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-[#0F0F1A] border border-[#1E1E2E] rounded-xl p-5 animate-pulse">
            <div className="h-4 bg-white/5 rounded mb-3 w-24" />
            <div className="h-8 bg-white/5 rounded w-20" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Admin Overview</h1>
        <p className="text-gray-400 text-sm mt-1">Platform-wide metrics</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard title="Total Users" value={stats?.totalUsers ?? 0} sub={`${stats?.activeUsers ?? 0} active`} icon={Users} href="/admin/users" color="blue" />
        <StatCard title="Pending KYC" value={stats?.pendingKYC ?? 0} sub="Awaiting review" icon={Shield} href="/admin/kyc" color="yellow" />
        <StatCard title="Pending Withdrawals" value={stats?.pendingWithdrawals ?? 0} sub="Need approval" icon={ArrowUpFromLine} href="/admin/withdrawals" color="red" />
        <StatCard title="Total Deposits" value={`$${(stats?.totalDeposits ?? 0).toLocaleString()}`} sub="All time completed" icon={ArrowDownToLine} href="/admin/deposits" color="green" />
        <StatCard title="Total Withdrawals" value={`$${(stats?.totalWithdrawals ?? 0).toLocaleString()}`} sub="All time completed" icon={TrendingUp} href="/admin/withdrawals" color="purple" />
        <StatCard title="Net Revenue" value={`$${((stats?.totalDeposits ?? 0) - (stats?.totalWithdrawals ?? 0)).toLocaleString()}`} sub="Deposits - Withdrawals" icon={DollarSign} color="green" />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Review KYC", href: "/admin/kyc", urgent: (stats?.pendingKYC ?? 0) > 0 },
          { label: "Approve Withdrawals", href: "/admin/withdrawals", urgent: (stats?.pendingWithdrawals ?? 0) > 0 },
          { label: "Manage Deposits", href: "/admin/deposits", urgent: false },
          { label: "Send Broadcast", href: "/admin/broadcast", urgent: false },
        ].map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className={`flex items-center justify-between p-4 rounded-xl border text-sm font-medium transition-colors ${
              action.urgent
                ? "bg-red-500/5 border-red-500/30 text-red-400 hover:bg-red-500/10"
                : "bg-white/2 border-[#1E1E2E] text-gray-300 hover:text-white hover:bg-white/5"
            }`}
          >
            {action.label}
            {action.urgent && (
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
