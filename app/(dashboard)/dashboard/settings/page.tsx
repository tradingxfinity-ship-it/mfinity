"use client";

import { useState, useEffect } from "react";
import { Loader2, Shield, User, CheckCircle, XCircle, Mail, Phone, Lock, AlertTriangle } from "lucide-react";

interface Profile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  twoFactorEnabled: boolean;
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [form, setForm] = useState({ firstName: "", lastName: "", phone: "" });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const [qrCode, setQrCode] = useState("");
  const [totpToken, setTotpToken] = useState("");
  const [setup2FA, setSetup2FA] = useState(false);
  const [loading2FA, setLoading2FA] = useState(false);
  const [twoFAMsg, setTwoFAMsg] = useState("");

  useEffect(() => {
    fetch("/api/user/profile")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setProfile(d.data);
          setForm({ firstName: d.data.firstName, lastName: d.data.lastName, phone: d.data.phone ?? "" });
        }
      });
  }, []);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    setError("");

    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) { setMsg("Profile updated successfully"); setProfile(data.data); setTimeout(() => setMsg(""), 3000); }
      else setError(data.error);
    } catch {
      setError("Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  async function start2FASetup() {
    setLoading2FA(true);
    const res = await fetch("/api/auth/2fa/setup");
    const data = await res.json();
    if (data.success && !data.data.alreadyEnabled) {
      setQrCode(data.data.qrCode);
      setSetup2FA(true);
    }
    setLoading2FA(false);
  }

  async function enable2FA(e: React.FormEvent) {
    e.preventDefault();
    setLoading2FA(true);
    setTwoFAMsg("");

    const res = await fetch("/api/auth/2fa/enable", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: totpToken }),
    });
    const data = await res.json();
    if (data.success) {
      setTwoFAMsg("2FA enabled successfully!");
      setSetup2FA(false);
      setProfile((p) => p ? { ...p, twoFactorEnabled: true } : p);
    } else {
      setTwoFAMsg(data.error);
    }
    setLoading2FA(false);
  }

  async function disable2FA() {
    setLoading2FA(true);
    const res = await fetch("/api/auth/2fa/enable", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: totpToken }),
    });
    const data = await res.json();
    if (data.success) {
      setTwoFAMsg("2FA disabled");
      setProfile((p) => p ? { ...p, twoFactorEnabled: false } : p);
    } else {
      setTwoFAMsg(data.error);
    }
    setLoading2FA(false);
  }

  const initials = profile ? `${profile.firstName?.[0] ?? ""}${profile.lastName?.[0] ?? ""}`.toUpperCase() : "";

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Settings</h1>
        <p className="text-gray-400 text-sm mt-1">Manage your account preferences and security</p>
      </div>

      {/* Profile Card */}
      <div className="bg-gradient-to-br from-[#13131F] to-[#0F0F1A] border border-[#1E1E2E] rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#1E1E2E] flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/10 border border-blue-500/20 flex items-center justify-center">
            <User size={16} className="text-blue-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Profile</h2>
            <p className="text-xs text-gray-500">Personal information</p>
          </div>
        </div>
        <div className="p-6">
          {/* Avatar */}
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-[#1E1E2E]">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-blue-500/20">
              {initials || "U"}
            </div>
            <div>
              <p className="text-white font-bold text-base">{profile ? `${profile.firstName} ${profile.lastName}` : "Loading..."}</p>
              <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-0.5">
                <Mail size={12} />
                {profile?.email}
              </p>
            </div>
          </div>

          {msg && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 mb-4 flex items-start gap-2">
              <CheckCircle size={14} className="text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-emerald-400 text-sm">{msg}</p>
            </div>
          )}
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3 mb-4 flex items-start gap-2">
              <XCircle size={14} className="text-rose-400 shrink-0 mt-0.5" />
              <p className="text-rose-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={saveProfile} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider font-medium">First Name</label>
                <input
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  className="w-full bg-[#0A0A14] border border-[#1E1E2E] focus:border-blue-500/40 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider font-medium">Last Name</label>
                <input
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  className="w-full bg-[#0A0A14] border border-[#1E1E2E] focus:border-blue-500/40 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider font-medium">Email</label>
              <div className="relative">
                <input
                  value={profile?.email ?? ""}
                  disabled
                  className="w-full bg-[#0A0A14] border border-[#1E1E2E] text-gray-500 rounded-xl px-4 py-2.5 text-sm cursor-not-allowed pr-12"
                />
                <Lock size={13} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600" />
              </div>
              <p className="text-[11px] text-gray-600 mt-1.5">Email cannot be changed</p>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider font-medium">Phone</label>
              <div className="relative">
                <Phone size={13} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full bg-[#0A0A14] border border-[#1E1E2E] focus:border-blue-500/40 text-white rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all"
                  placeholder="+1 555 000 0000"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl px-5 py-2.5 text-sm font-bold hover:opacity-90 disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-blue-500/20"
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              Save Changes
            </button>
          </form>
        </div>
      </div>

      {/* 2FA Card */}
      <div className="bg-gradient-to-br from-[#13131F] to-[#0F0F1A] border border-[#1E1E2E] rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#1E1E2E] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${profile?.twoFactorEnabled ? "bg-emerald-500/15 border-emerald-500/20" : "bg-amber-500/10 border-amber-500/20"}`}>
              <Shield size={16} className={profile?.twoFactorEnabled ? "text-emerald-400" : "text-amber-400"} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Two-Factor Authentication</h2>
              <p className="text-xs text-gray-500">{profile?.twoFactorEnabled ? "Your account is protected" : "Add an extra layer of security"}</p>
            </div>
          </div>
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md border ${profile?.twoFactorEnabled ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20"}`}>
            {profile?.twoFactorEnabled ? "ENABLED" : "DISABLED"}
          </span>
        </div>

        <div className="p-6">
          {twoFAMsg && (
            <div className={`rounded-xl px-4 py-3 mb-4 flex items-start gap-2 ${twoFAMsg.includes("disabled") || twoFAMsg.includes("Invalid") ? "bg-rose-500/10 border border-rose-500/20 text-rose-400" : "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"}`}>
              {twoFAMsg.includes("Invalid") ? <XCircle size={14} className="shrink-0 mt-0.5" /> : <CheckCircle size={14} className="shrink-0 mt-0.5" />}
              <p className="text-sm">{twoFAMsg}</p>
            </div>
          )}

          {!setup2FA ? (
            <div>
              {!profile?.twoFactorEnabled ? (
                <div className="bg-amber-500/[0.06] border border-amber-500/20 rounded-xl p-4 mb-4 flex gap-3">
                  <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-300/90 leading-relaxed">
                    Two-factor authentication adds an extra layer of security to your account. Enable it to protect your funds.
                  </p>
                </div>
              ) : (
                <div className="bg-emerald-500/[0.06] border border-emerald-500/20 rounded-xl p-4 mb-4 flex gap-3">
                  <CheckCircle size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-emerald-300/90 leading-relaxed">
                    Your account is protected with two-factor authentication. You&apos;ll need to enter a code from your authenticator app when logging in.
                  </p>
                </div>
              )}

              {!profile?.twoFactorEnabled ? (
                <button
                  onClick={start2FASetup}
                  disabled={loading2FA}
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl px-5 py-2.5 text-sm font-bold hover:opacity-90 disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-emerald-500/20"
                >
                  {loading2FA ? <Loader2 size={14} className="animate-spin" /> : <Shield size={14} />}
                  Enable 2FA
                </button>
              ) : (
                <div className="flex items-center gap-2 flex-wrap">
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={totpToken}
                    onChange={(e) => setTotpToken(e.target.value)}
                    placeholder="6-digit code"
                    className="bg-[#0A0A14] border border-[#1E1E2E] focus:border-rose-500/40 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/10 w-44 text-center tracking-widest font-mono transition-all"
                  />
                  <button
                    onClick={disable2FA}
                    disabled={loading2FA || totpToken.length !== 6}
                    className="bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl px-4 py-2.5 text-sm font-bold hover:bg-rose-500/15 disabled:opacity-50 transition-colors"
                  >
                    Disable 2FA
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <p className="text-sm text-gray-300 mb-2 font-medium">Step 1: Scan the QR code</p>
                <p className="text-xs text-gray-500">Use Google Authenticator, Authy, or any TOTP app</p>
              </div>
              {qrCode && (
                <div className="bg-white p-4 rounded-2xl inline-block">
                  <img src={qrCode} alt="2FA QR Code" className="w-48 h-48" />
                </div>
              )}
              <div>
                <p className="text-sm text-gray-300 mb-2 font-medium">Step 2: Enter the 6-digit code</p>
                <form onSubmit={enable2FA} className="flex items-center gap-2 flex-wrap">
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={totpToken}
                    onChange={(e) => setTotpToken(e.target.value)}
                    placeholder="000000"
                    className="bg-[#0A0A14] border border-[#1E1E2E] focus:border-emerald-500/40 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/10 w-44 text-center tracking-widest font-mono transition-all"
                  />
                  <button
                    type="submit"
                    disabled={loading2FA || totpToken.length !== 6}
                    className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl px-5 py-2.5 text-sm font-bold hover:opacity-90 disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-emerald-500/20"
                  >
                    {loading2FA && <Loader2 size={14} className="animate-spin" />}
                    Verify &amp; Enable
                  </button>
                  <button type="button" onClick={() => setSetup2FA(false)} className="text-sm text-gray-400 hover:text-white px-3 py-2 transition-colors">
                    Cancel
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
