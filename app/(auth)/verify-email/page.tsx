"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Invalid verification link");
      return;
    }

    fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setStatus("success");
        } else {
          setStatus("error");
          setMessage(data.error);
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Something went wrong");
      });
  }, [token]);

  if (status === "loading") {
    return (
      <div className="bg-[#0F0F1A] border border-[#1E1E2E] rounded-2xl p-8 text-center">
        <Loader2 className="animate-spin text-blue-400 mx-auto mb-4" size={32} />
        <p className="text-gray-400">Verifying your email...</p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="bg-[#0F0F1A] border border-[#1E1E2E] rounded-2xl p-8 text-center">
        <CheckCircle className="text-green-400 mx-auto mb-4" size={40} />
        <h2 className="text-xl font-bold text-white mb-2">Email verified!</h2>
        <p className="text-gray-400 text-sm mb-6">Your account is now active.</p>
        <Link
          href="/dashboard"
          className="inline-block bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg px-6 py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          Go to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#0F0F1A] border border-[#1E1E2E] rounded-2xl p-8 text-center">
      <XCircle className="text-red-400 mx-auto mb-4" size={40} />
      <h2 className="text-xl font-bold text-white mb-2">Verification failed</h2>
      <p className="text-gray-400 text-sm mb-6">{message || "This link may have expired."}</p>
      <Link href="/login" className="text-blue-400 hover:text-blue-300 text-sm">
        Back to login
      </Link>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="text-gray-400 text-center">Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
