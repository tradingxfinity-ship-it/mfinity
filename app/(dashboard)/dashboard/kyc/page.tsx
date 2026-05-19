"use client";

import { useState, useEffect, useRef } from "react";
import { Upload, CheckCircle, Clock, XCircle, FileText, Loader2, ShieldCheck, Image as ImageIcon } from "lucide-react";

const DOCUMENT_TYPES = [
  { id: "PASSPORT", label: "Passport" },
  { id: "NATIONAL_ID", label: "National ID" },
  { id: "DRIVERS_LICENSE", label: "Driver's License" },
  { id: "SELFIE", label: "Selfie with ID" },
  { id: "PROOF_OF_ADDRESS", label: "Proof of Address" },
];

interface KYCDoc {
  id: string;
  documentType: string;
  status: string;
  cloudinaryUrl: string;
  adminNote: string | null;
  createdAt: string;
}

const statusConfig: Record<string, { color: string; icon: React.ElementType; label: string }> = {
  PENDING: { color: "text-amber-400 bg-amber-500/10 border-amber-500/20", icon: Clock, label: "Under Review" },
  APPROVED: { color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", icon: CheckCircle, label: "Approved" },
  REJECTED: { color: "text-rose-400 bg-rose-500/10 border-rose-500/20", icon: XCircle, label: "Rejected" },
};

export default function KYCPage() {
  const [docs, setDocs] = useState<KYCDoc[]>([]);
  const [docType, setDocType] = useState(DOCUMENT_TYPES[0].id);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/kyc")
      .then((r) => r.json())
      .then((d) => { if (d.success) setDocs(d.data); });
  }, [success]);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) { setError("Please select a file"); return; }

    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("documentType", docType);

    try {
      const res = await fetch("/api/kyc", { method: "POST", body: formData });
      const data = await res.json();
      if (!data.success) { setError(data.error); return; }
      setSuccess("Document uploaded successfully");
      setFile(null);
      if (fileRef.current) fileRef.current.value = "";
      setTimeout(() => setSuccess(""), 3000);
    } catch {
      setError("Upload failed. Try again.");
    } finally {
      setLoading(false);
    }
  }

  const uploadedTypes = new Set(docs.map((d) => d.documentType));
  const allApproved = docs.length >= 3 && docs.every((d) => d.status === "APPROVED");
  const progress = Math.round((docs.filter((d) => d.status === "APPROVED").length / DOCUMENT_TYPES.length) * 100);

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-emerald-600/15 via-teal-600/10 to-blue-600/10 border border-white/10 rounded-2xl p-6 overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/15 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="relative flex items-start justify-between gap-6 flex-col md:flex-row">
          <div>
            <div className="flex items-center gap-2 mb-2">
              {allApproved ? (
                <span className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-full font-medium">
                  <CheckCircle size={11} /> Verified
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-xs text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-full font-medium">
                  <Clock size={11} /> {progress}% Complete
                </span>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">KYC Verification</h1>
            <p className="text-gray-400 text-sm mt-1 max-w-md">Verify your identity to unlock full platform access and higher transaction limits</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20">
              <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.9155" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="2.5" />
                <circle
                  cx="18" cy="18" r="15.9155" fill="none"
                  stroke="url(#kyc-grad)" strokeWidth="2.5" strokeLinecap="round"
                  strokeDasharray={`${progress} 100`}
                />
                <defs>
                  <linearGradient id="kyc-grad">
                    <stop offset="0%" stopColor="#34D399" />
                    <stop offset="100%" stopColor="#60A5FA" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-white">{progress}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upload */}
        <div className="bg-gradient-to-br from-[#13131F] to-[#0F0F1A] border border-[#1E1E2E] rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-blue-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Upload size={16} className="text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Upload Document</h2>
              <p className="text-xs text-gray-500">JPG, PNG, WEBP, PDF · Max 10MB</p>
            </div>
          </div>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3 mb-4 flex items-start gap-2">
              <XCircle size={14} className="text-rose-400 shrink-0 mt-0.5" />
              <p className="text-rose-400 text-sm">{error}</p>
            </div>
          )}
          {success && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 mb-4 flex items-start gap-2">
              <CheckCircle size={14} className="text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-emerald-400 text-sm">{success}</p>
            </div>
          )}

          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider font-medium">Document Type</label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="w-full bg-[#0A0A14] border border-[#1E1E2E] focus:border-emerald-500/40 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all"
              >
                {DOCUMENT_TYPES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label} {uploadedTypes.has(t.id) ? "✓" : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider font-medium">File</label>
              <div
                className={`group border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                  file ? "border-emerald-500/40 bg-emerald-500/5" : "border-[#1E1E2E] hover:border-emerald-500/30 hover:bg-emerald-500/[0.02]"
                }`}
                onClick={() => fileRef.current?.click()}
              >
                <input
                  ref={fileRef}
                  type="file"
                  className="hidden"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
                <div className={`w-12 h-12 mx-auto mb-3 rounded-2xl flex items-center justify-center transition-colors ${file ? "bg-emerald-500/20 border border-emerald-500/30" : "bg-white/5 border border-white/5 group-hover:bg-emerald-500/10"}`}>
                  {file ? <ImageIcon size={20} className="text-emerald-400" /> : <Upload size={20} className="text-gray-500 group-hover:text-emerald-400" />}
                </div>
                {file ? (
                  <>
                    <p className="text-sm text-white font-medium">{file.name}</p>
                    <p className="text-xs text-emerald-400 mt-1">Click to change</p>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-gray-300 font-medium">Click to upload</p>
                    <p className="text-xs text-gray-500 mt-1">or drag and drop</p>
                  </>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !file}
              className="w-full bg-gradient-to-r from-emerald-500 to-blue-600 text-white rounded-xl py-3 text-sm font-bold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              Upload Document
            </button>
          </form>
        </div>

        {/* Requirements */}
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-[#13131F] to-[#0F0F1A] border border-[#1E1E2E] rounded-2xl p-5">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-500/15 flex items-center justify-center">
                <ShieldCheck size={13} className="text-blue-400" />
              </div>
              Required Documents
            </h3>
            <ul className="space-y-2.5">
              {DOCUMENT_TYPES.map((t) => {
                const doc = docs.find((d) => d.documentType === t.id);
                const cfg = doc ? statusConfig[doc.status] : null;
                return (
                  <li key={t.id} className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-center gap-2.5">
                      <FileText size={13} className="text-gray-500" />
                      <span className="text-sm text-gray-300">{t.label}</span>
                    </div>
                    {cfg ? (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${cfg.color}`}>
                        {cfg.label}
                      </span>
                    ) : (
                      <span className="text-[10px] text-gray-600 font-medium">Not uploaded</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="bg-gradient-to-br from-blue-500/[0.08] to-purple-500/[0.04] border border-blue-500/20 rounded-2xl p-5">
            <h3 className="text-sm font-bold text-white mb-3">Guidelines</h3>
            <ul className="text-xs text-gray-300 space-y-2 leading-relaxed">
              <li className="flex gap-2"><span className="text-blue-400">•</span> Documents must be clear and legible</li>
              <li className="flex gap-2"><span className="text-blue-400">•</span> No expired documents</li>
              <li className="flex gap-2"><span className="text-blue-400">•</span> Selfie must show you holding your ID</li>
              <li className="flex gap-2"><span className="text-blue-400">•</span> Proof of address dated within 3 months</li>
              <li className="flex gap-2"><span className="text-blue-400">•</span> Verification takes 1–2 business days</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Uploaded docs */}
      {docs.length > 0 && (
        <div className="bg-gradient-to-br from-[#13131F] to-[#0F0F1A] border border-[#1E1E2E] rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[#1E1E2E]">
            <h2 className="text-sm font-bold text-white">Submitted Documents</h2>
            <p className="text-xs text-gray-500 mt-0.5">Your uploaded verification documents</p>
          </div>
          <div className="divide-y divide-[#1E1E2E]">
            {docs.map((doc) => {
              const cfg = statusConfig[doc.status] ?? statusConfig.PENDING;
              const Icon = cfg.icon;
              return (
                <div key={doc.id} className="flex items-center justify-between px-5 py-4 hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/5 border border-white/5 rounded-xl flex items-center justify-center">
                      <FileText size={16} className="text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm text-white font-medium">
                        {DOCUMENT_TYPES.find((t) => t.id === doc.documentType)?.label ?? doc.documentType}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{new Date(doc.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                      {doc.adminNote && (
                        <p className="text-xs text-rose-400 mt-1">{doc.adminNote}</p>
                      )}
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${cfg.color}`}>
                    <Icon size={11} />
                    {cfg.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
