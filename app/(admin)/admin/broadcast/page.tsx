"use client";

import { useState } from "react";
import { Send, Loader2, Megaphone } from "lucide-react";

export default function BroadcastPage() {
  const [form, setForm] = useState({ subject: "", body: "", targetGroup: "ALL" });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ sentCount: number } | null>(null);
  const [error, setError] = useState("");

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!confirm(`Send broadcast to ${form.targetGroup} users? This cannot be undone.`)) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/admin/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setResult(data.data);
        setForm({ subject: "", body: "", targetGroup: "ALL" });
      } else {
        setError(data.error);
      }
    } catch {
      setError("Failed to send broadcast.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Email Broadcast</h1>
        <p className="text-gray-400 text-sm mt-1">Send announcements to your users</p>
      </div>

      <div className="bg-[#0F0F1A] border border-[#1E1E2E] rounded-xl p-6">
        {result && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-3 mb-4 flex items-center gap-3">
            <Send size={16} className="text-green-400" />
            <p className="text-green-400 text-sm">
              Broadcast sent to <strong>{result.sentCount}</strong> users.
            </p>
          </div>
        )}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 mb-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSend} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Target Audience</label>
            <select
              value={form.targetGroup}
              onChange={(e) => setForm({ ...form, targetGroup: e.target.value })}
              className="w-full bg-[#0A0A0F] border border-[#1E1E2E] text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Active Users</option>
              <option value="PRO">Pro Subscribers</option>
              <option value="ENTERPRISE">Enterprise Subscribers</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Subject</label>
            <input
              type="text"
              required
              minLength={5}
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              className="w-full bg-[#0A0A0F] border border-[#1E1E2E] text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500"
              placeholder="Important platform update"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1.5">
              Message Body <span className="text-gray-600">(HTML supported)</span>
            </label>
            <textarea
              required
              minLength={20}
              rows={8}
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              className="w-full bg-[#0A0A0F] border border-[#1E1E2E] text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 resize-none font-mono"
              placeholder="<p>Dear trader,</p><p>We have an exciting update...</p>"
            />
            <p className="text-xs text-gray-600 mt-1">{form.body.length}/5000 characters</p>
          </div>

          <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-4">
            <p className="text-xs text-yellow-400">
              This will send an email to all selected users immediately. Review carefully before sending.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg px-6 py-2.5 text-sm font-semibold hover:opacity-90 disabled:opacity-50"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Megaphone size={16} />}
            Send Broadcast
          </button>
        </form>
      </div>
    </div>
  );
}
