"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "", totpToken: "" });
  const [showPass, setShowPass] = useState(false);
  const [require2FA, setRequire2FA] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error);
        return;
      }

      if (data.data.require2FA) {
        setRequire2FA(true);
        setLoading(false);
        return;
      }

      const role = data.data.user?.role;
      router.push(role === "ADMIN" || role === "SUPER_ADMIN" ? "/admin" : "/dashboard");
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-[#0F0F1A] border border-[#1E1E2E] rounded-2xl p-8">
      <h1 className="text-2xl font-bold text-white mb-1">Welcome back</h1>
      <p className="text-gray-400 text-sm mb-6">Sign in to your Mfinity account</p>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 mb-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {!require2FA ? (
          <>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-[#0A0A0F] border border-[#1E1E2E] text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full bg-[#0A0A0F] border border-[#1E1E2E] text-white rounded-lg px-4 py-2.5 text-sm pr-10 focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <div className="flex justify-end mt-1.5">
                <Link href="/forgot-password" className="text-xs text-blue-400 hover:text-blue-300">
                  Forgot password?
                </Link>
              </div>
            </div>
          </>
        ) : (
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">
              Two-Factor Authentication Code
            </label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              required
              value={form.totpToken}
              onChange={(e) => setForm({ ...form, totpToken: e.target.value })}
              className="w-full bg-[#0A0A0F] border border-[#1E1E2E] text-white rounded-lg px-4 py-2.5 text-sm text-center tracking-widest text-lg focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="000000"
              autoFocus
            />
            <p className="text-xs text-gray-500 mt-1.5">Enter the 6-digit code from your authenticator app.</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          {require2FA ? "Verify Code" : "Sign In"}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-blue-400 hover:text-blue-300">
          Create one
        </Link>
      </p>
    </div>
  );
}
