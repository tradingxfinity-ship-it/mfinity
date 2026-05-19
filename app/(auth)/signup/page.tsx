"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2, Check } from "lucide-react";

const requirements = [
  { label: "8+ characters", test: (p: string) => p.length >= 8 },
  { label: "Uppercase", test: (p: string) => /[A-Z]/.test(p) },
  { label: "Lowercase", test: (p: string) => /[a-z]/.test(p) },
  { label: "Number", test: (p: string) => /[0-9]/.test(p) },
  { label: "Special character", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    referralCode: "",
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setFieldErrors({});

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!data.success) {
        if (data.details) setFieldErrors(data.details);
        else setError(data.error);
        return;
      }

      router.push("/dashboard?welcome=true");
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  const field = (key: string) => ({
    value: form[key as keyof typeof form],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm({ ...form, [key]: e.target.value }),
  });

  return (
    <div className="bg-[#0F0F1A] border border-[#1E1E2E] rounded-2xl p-8">
      <h1 className="text-2xl font-bold text-white mb-1">Create your account</h1>
      <p className="text-gray-400 text-sm mb-6">Start trading smarter today</p>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 mb-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">First Name</label>
            <input
              type="text"
              required
              {...field("firstName")}
              className="w-full bg-[#0A0A0F] border border-[#1E1E2E] text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="John"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Last Name</label>
            <input
              type="text"
              required
              {...field("lastName")}
              className="w-full bg-[#0A0A0F] border border-[#1E1E2E] text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="Doe"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Email</label>
          <input
            type="email"
            required
            {...field("email")}
            className={`w-full bg-[#0A0A0F] border text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none transition-colors ${fieldErrors.email ? "border-red-500" : "border-[#1E1E2E] focus:border-blue-500"}`}
            placeholder="you@example.com"
          />
          {fieldErrors.email && (
            <p className="text-red-400 text-xs mt-1">{fieldErrors.email[0]}</p>
          )}
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Password</label>
          <div className="relative">
            <input
              type={showPass ? "text" : "password"}
              required
              {...field("password")}
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
          {form.password.length > 0 && (
            <div className="grid grid-cols-2 gap-1 mt-2">
              {requirements.map((r) => (
                <div key={r.label} className="flex items-center gap-1.5">
                  <div
                    className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${r.test(form.password) ? "bg-green-500" : "bg-[#1E1E2E]"}`}
                  >
                    {r.test(form.password) && <Check size={8} className="text-white" />}
                  </div>
                  <span className={`text-xs ${r.test(form.password) ? "text-green-400" : "text-gray-500"}`}>
                    {r.label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1.5">
            Referral Code <span className="text-gray-600">(optional)</span>
          </label>
          <input
            type="text"
            {...field("referralCode")}
            className="w-full bg-[#0A0A0F] border border-[#1E1E2E] text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors"
            placeholder="MFINITY2025"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          Create Account
        </button>

        <p className="text-xs text-gray-500 text-center">
          By creating an account you agree to our{" "}
          <Link href="/terms" className="text-blue-400 hover:underline">Terms</Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-blue-400 hover:underline">Privacy Policy</Link>
        </p>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Already have an account?{" "}
        <Link href="/login" className="text-blue-400 hover:text-blue-300">
          Sign in
        </Link>
      </p>
    </div>
  );
}
