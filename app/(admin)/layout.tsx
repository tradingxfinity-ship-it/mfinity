"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ArrowDownToLine,
  ArrowUpFromLine,
  FileText,
  Settings,
  Megaphone,
  Shield,
  Menu,
  LogOut,
  ChevronRight,
} from "lucide-react";

const NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/deposits", label: "Deposits", icon: ArrowDownToLine },
  { href: "/admin/withdrawals", label: "Withdrawals", icon: ArrowUpFromLine },
  { href: "/admin/kyc", label: "KYC Requests", icon: Shield },
  { href: "/admin/logs", label: "Audit Logs", icon: FileText },
  { href: "/admin/broadcast", label: "Broadcast", icon: Megaphone },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

async function logout() {
  await fetch("/api/auth/logout", { method: "POST" });
  window.location.href = "/login";
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-[#0F0F1A] border-r border-[#1E1E2E] transform transition-transform duration-200 lg:translate-x-0 lg:static lg:z-auto ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center gap-2 px-4 h-16 border-b border-[#1E1E2E]">
          <Image
            src="/logo.png"
            alt="Mfinity"
            width={140}
            height={40}
            className="h-8 w-auto object-contain"
            priority
          />
          <span className="text-red-400 text-[10px] font-bold uppercase tracking-wider bg-red-500/10 border border-red-500/20 px-1.5 py-0.5 rounded ml-auto flex items-center gap-1">
            <Shield size={10} />
            Admin
          </span>
        </div>

        <nav className="p-4 space-y-1">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${active ? "bg-red-500/10 text-red-400 border border-red-500/20" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
              >
                <Icon size={16} />
                {label}
                {active && <ChevronRight size={14} className="ml-auto" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#1E1E2E] absolute bottom-0 w-full">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors mb-1">
            <LayoutDashboard size={16} /> User Dashboard
          </Link>
          <button onClick={logout} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/5 transition-colors w-full">
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-[#0F0F1A] border-b border-[#1E1E2E] flex items-center gap-4 px-4 lg:px-6 sticky top-0 z-10">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-400 hover:text-white">
            <Menu size={20} />
          </button>
          <span className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-1 rounded font-medium">
            ADMIN MODE
          </span>
        </header>
        <main className="flex-1 p-4 lg:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
