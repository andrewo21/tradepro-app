"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useResumeStore } from "@/app/store/useResumeStore";
import { getOrCreateUserId } from "@/lib/userId";

function CheckoutSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Prefer the userId from the URL param (set by Stripe redirect), fall back to cookie
  const userId = searchParams.get("userId") || getOrCreateUserId();
  const productId = searchParams.get("productId") || null;
  const sessionId = searchParams.get("session_id") || null;

  const setField = useResumeStore((s: any) => s.setField);
  const [entitlements, setEntitlements] = useState<any>(null);
  const [grantError, setGrantError] = useState<string | null>(null);
  const [status, setStatus] = useState("Processing your payment…");

  useEffect(() => {
    async function load() {
      // Grant entitlement on the server
      if (productId) {
        setStatus("Activating your purchase…");
        const grantRes = await fetch("/api/stripe/grant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, productId, sessionId }),
        });
        if (!grantRes.ok) {
          const grantData = await grantRes.json().catch(() => ({}));
          const errMsg = grantData.detail || grantData.error || `Grant failed (${grantRes.status})`;
          setGrantError(errMsg);
          setStatus("Something went wrong activating your purchase.");
          // Do NOT redirect — let them read the error
          return;
        }
      }

      // Fetch updated entitlements
      setStatus("Loading your account…");
      const res = await fetch(`/api/debug/entitlements?userId=${userId}`);
      const data = await res.json();
      setEntitlements(data.entitlements);

      // Remove watermark from the resume store now that they've paid
      if (data.entitlements.resume || data.entitlements.bundle) {
        setField("showWatermark", false);
        setField("premiumUnlocked", !!data.entitlements.bundle);
      }

      const hasAny = data.entitlements.resume || data.entitlements.coverLetter || data.entitlements.bundle;
      if (!hasAny) {
        setGrantError("Purchase processed but entitlement not found. Please contact support.");
        setStatus("Activation issue detected.");
        return;
      }

      setStatus("Redirecting you to your tools…");

      // Detect Brazil purchase by productId prefix
      const isBrazil = productId?.startsWith("br_");

      // Give them 3 seconds to see the success message before redirecting
      setTimeout(() => {
        if (data.entitlements.bundle) {
          router.push(isBrazil ? "/br/curriculo" : "/resume");
        } else if (data.entitlements.coverLetter) {
          router.push(isBrazil ? "/br/carta" : "/cover-letter");
        } else if (data.entitlements.resume) {
          router.push(isBrazil ? "/br/curriculo" : "/resume");
        }
      }, 3000);
    }

    load();
  }, [router, userId, productId, sessionId, setField]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white shadow-lg rounded-xl p-10 border border-gray-200 max-w-lg text-center">
        <h1 className={`text-3xl font-bold mb-4 ${grantError ? "text-red-600" : "text-green-700"}`}>
          {grantError ? "Activation Problem" : "Payment Successful!"}
        </h1>

        {!grantError && (
          <p className="text-gray-700 text-lg mb-6">
            Thank you for your purchase. Your account is being upgraded now.
          </p>
        )}

        {entitlements && !grantError && (
          <div className="text-gray-800 font-medium mb-6">
            {entitlements.bundle && "✓ You now have access to ALL premium features."}
            {entitlements.resume && !entitlements.bundle && "✓ Resume Builder Unlocked."}
            {entitlements.coverLetter && !entitlements.bundle && "✓ Cover Letter Builder Unlocked."}
          </div>
        )}

        {grantError && (
          <div className="text-red-600 text-sm mb-6 bg-red-50 border border-red-200 rounded p-4 text-left">
            <p className="font-bold mb-2">Error detail:</p>
            <p className="font-mono break-all">{grantError}</p>
            <p className="mt-3 text-gray-600 text-xs">
              Your payment was received by Stripe. Please screenshot this error and contact support.
            </p>
          </div>
        )}

        <p className="text-sm text-gray-500">{status}</p>
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
