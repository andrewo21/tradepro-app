"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { overrides } from "@/config/overrides";

export default function SuccessPage() {
  const router = useRouter();
  const userId = "demo-user"; // TODO: replace with real auth user

  const [entitlements, setEntitlements] = useState<any>(null);

  useEffect(() => {
    async function load() {
      // ⭐ In dev mode, skip API and use override system
      if (overrides.devMode) {
        const devEntitlements = {
          resume: overrides.premium || overrides.access,
          coverLetter: overrides.premium || overrides.access,
          bundle: overrides.premium,
        };

        setEntitlements(devEntitlements);

        setTimeout(() => {
          if (devEntitlements.bundle) router.push("/resume");
          else if (devEntitlements.coverLetter) router.push("/cover-letter");
          else if (devEntitlements.resume) router.push("/resume");
          else router.push("/pricing");
        }, 1500);

        return;
      }

      // ⭐ Production: use real entitlements
      const res = await fetch(`/api/debug/entitlements?userId=${userId}`);
      const data = await res.json();
      setEntitlements(data.entitlements);

      setTimeout(() => {
        if (data.entitlements.bundle) router.push("/resume");
        else if (data.entitlements.coverLetter) router.push("/cover-letter");
        else if (data.entitlements.resume) router.push("/resume");
        else router.push("/pricing");
      }, 1500);
    }

    load();
  }, [router, userId]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white shadow-lg rounded-xl p-10 border border-gray-200 max-w-lg text-center">
        <h1 className="text-3xl font-bold text-green-700 mb-4">
          Premium Unlocked!
        </h1>

        <p className="text-gray-700 text-lg mb-6">
          Thank you for your purchase. Your account has been upgraded.
        </p>

        {entitlements && (
          <div className="text-gray-800 font-medium mb-6">
            {entitlements.bundle && "You now have access to ALL premium features."}
            {entitlements.resume && !entitlements.bundle && "Resume Builder Unlocked."}
            {entitlements.coverLetter && !entitlements.bundle && "Cover Letter Builder Unlocked."}
          </div>
        )}

        <p className="text-sm text-gray-500">
          Redirecting you to your tools…
        </p>
      </div>
    </div>
  );
}
