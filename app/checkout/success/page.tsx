"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useResumeStore } from "@/app/store/useResumeStore";

function CheckoutSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId") || "demo-user";
  const productId = searchParams.get("productId") || null;
  const sessionId = searchParams.get("session_id") || null;

  const setField = useResumeStore((s: any) => s.setField);
  const [entitlements, setEntitlements] = useState<any>(null);
  const [grantError, setGrantError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      // Grant entitlement on the server
      if (productId) {
        const grantRes = await fetch("/api/stripe/grant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, productId, sessionId }),
        });
        if (!grantRes.ok) {
          const grantData = await grantRes.json().catch(() => ({}));
          setGrantError(grantData.detail || grantData.error || `Grant failed (${grantRes.status})`);
        }
      }

      // Fetch updated entitlements
      const res = await fetch(`/api/debug/entitlements?userId=${userId}`);
      const data = await res.json();
      setEntitlements(data.entitlements);

      // Remove watermark from the resume store now that they've paid
      if (data.entitlements.resume || data.entitlements.bundle) {
        setField("showWatermark", false);
        setField("premiumUnlocked", !!data.entitlements.bundle);
      }

      // Auto‑redirect based on what they unlocked
      setTimeout(() => {
        if (data.entitlements.bundle) {
          router.push("/resume");
        } else if (data.entitlements.coverLetter) {
          router.push("/cover-letter");
        } else if (data.entitlements.resume) {
          router.push("/resume");
        } else {
          router.push("/pricing");
        }
      }, 2000);
    }

    load();
  }, [router, userId, productId, sessionId, setField]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white shadow-lg rounded-xl p-10 border border-gray-200 max-w-lg text-center">
        <h1 className="text-3xl font-bold text-green-700 mb-4">
          Payment Successful!
        </h1>

        <p className="text-gray-700 text-lg mb-6">
          Thank you for your purchase. Your account is being upgraded now.
        </p>

        {entitlements && (
          <div className="text-gray-800 font-medium mb-6">
            {entitlements.bundle && "You now have access to ALL premium features."}
            {entitlements.resume && !entitlements.bundle && "Resume Builder Unlocked."}
            {entitlements.coverLetter && !entitlements.bundle && "Cover Letter Builder Unlocked."}
          </div>
        )}

        {grantError && (
          <p className="text-red-600 text-sm mb-4 bg-red-50 border border-red-200 rounded p-3">
            Storage error: {grantError}
          </p>
        )}

        <p className="text-sm text-gray-500">
          Redirecting you to your tools…
        </p>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading…</p>
      </div>
    }>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
