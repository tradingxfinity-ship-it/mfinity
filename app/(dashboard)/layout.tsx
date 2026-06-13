"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Wallet,
  ArrowDownToLine,
  ArrowUpFromLine,
  FileText,
  Settings,
  CreditCard,
  Link as LinkIcon,
  Bell,
  LogOut,
  Menu,
  ShieldCheck,
  Sparkles,
  Zap,
  DollarSign,
} from "lucide-react";

const NAV_GROUPS = [
  {
    label: "Overview",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/dashboard/trade", label: "Trade", icon: Zap },
      { href: "/dashboard/portfolio", label: "Portfolio", icon: Wallet },
    ],
  },
  {
    label: "Finance",
    items: [
      { href: "/dashboard/deposits", label: "Deposits", icon: ArrowDownToLine },
      { href: "/dashboard/withdrawals", label: "Withdrawals", icon: ArrowUpFromLine },
      { href: "/dashboard/transactions", label: "Transactions", icon: FileText },
    ],
  },
  {
    label: "Account",
    items: [
      { href: "/dashboard/exchanges", label: "Exchanges", icon: LinkIcon },
      { href: "/dashboard/kyc", label: "KYC Verification", icon: ShieldCheck },
      { href: "/dashboard/subscriptions", label: "Subscription", icon: CreditCard },
      { href: "/dashboard/settings", label: "Settings", icon: Settings },
    ],
  },
];

async function logout() {
  await fetch("/api/auth/logout", { method: "POST" });
  window.location.href = "/login";
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [user, setUser] = useState<{ firstName: string; lastName: string; email: string; subscriptionPlan: string; availableBalance: number } | null>(null);

  useEffect(() => {
    fetch("/api/user/notifications?unread=true")
      .then((r) => r.json())
      .then((d) => { if (d.success) setUnreadCount(d.data.length); })
      .catch(() => {});
    fetch("/api/user/profile")
      .then((r) => r.json())
      .then((d) => { if (d.success) setUser(d.data); })
      .catch(() => {});
  }, []);

  const initials = user ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}` : "U";

  return (
    <div className="min-h-screen bg-[#070710] flex relative overflow-hidden">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 -z-0">
        <div className="absolute top-0 -left-40 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-600/8 rounded-full blur-[140px]" />
      </div>

      {/* Backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-[#0B0B14]/95 backdrop-blur-xl border-r border-white/[0.06] transform transition-transform duration-200 lg:translate-x-0 lg:static lg:z-auto flex flex-col ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Link href="/dashboard" className="flex items-center px-4 h-16 border-b border-white/[0.06] hover:opacity-90 transition-opacity">
          <Image
            src="/logo.png"
            alt="Mfinity Trading Bot"
            width={200}
            height={56}
            className="h-9 w-auto object-contain"
            priority
          />
        </Link>

        <nav className="px-3 py-4 space-y-5 flex-1 overflow-y-auto">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-600 px-3 mb-2">{group.label}</p>
              <div className="space-y-0.5">
                {group.items.map(({ href, label, icon: Icon }) => {
                  const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setSidebarOpen(false)}
                      className={`group flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${
                        active
                          ? "bg-gradient-to-r from-blue-500/15 to-purple-500/10 text-white border border-blue-500/20 shadow-sm shadow-blue-500/10"
                          : "text-gray-400 hover:text-white hover:bg-white/[0.04]"
                      }`}
                    >
                      <Icon size={15} className={active ? "text-blue-400" : "text-gray-500 group-hover:text-gray-300"} />
                      {label}
                      {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User card */}
        <div className="p-3 border-t border-white/[0.06]">
          <div className="flex items-center gap-3 px-2 py-2 mb-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
              {initials.toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-white font-medium truncate">{user ? `${user.firstName} ${user.lastName}` : "Loading..."}</p>
              <p className="text-[11px] text-gray-500 truncate">{user?.email ?? ""}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-400 hover:text-rose-400 hover:bg-rose-500/[0.06] transition-colors w-full"
          >
            <LogOut size={14} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        {/* Top bar */}
        <header className="h-16 bg-[#0B0B14]/80 backdrop-blur-xl border-b border-white/[0.06] flex items-center gap-4 px-4 lg:px-6 sticky top-0 z-10">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <Menu size={20} />
          </button>

          <div className="ml-auto flex items-center gap-2">
            {user?.subscriptionPlan && user.subscriptionPlan !== "FREE" && (
              <span className="hidden md:flex items-center gap-1 text-xs text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2.5 py-1.5 rounded-lg font-medium">
                <Sparkles size={11} />
                {user.subscriptionPlan}
              </span>
            )}
            <Link
              href="/dashboard/portfolio"
              className="flex items-center gap-1.5 text-xs font-semibold text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/15 transition-colors px-2.5 py-1.5 rounded-lg"
              title="Available balance"
            >
              <DollarSign size={11} className="text-emerald-400" />
              <span className="tabular-nums">
                {(user?.availableBalance ?? 0).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </Link>
            <Link
              href="/dashboard/notifications"
              className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] transition-colors"
            >
              <Bell size={15} className="text-gray-300" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full text-white text-[10px] flex items-center justify-center font-bold ring-2 ring-[#0B0B14]">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>

            <Link
              href="/dashboard/settings"
              className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-sm hover:opacity-90 transition-opacity"
            >
              {initials.toUpperCase()}
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
