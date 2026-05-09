"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState("Verifying your login…");

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) {
      setStatus("Auth not configured.");
      return;
    }

    // Supabase automatically picks up the token from the URL hash.
    // Listen for the session to be established then redirect.
    sb.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        setStatus("Logged in! Redirecting…");
        router.replace("/minhas-versoes");
      }
    });

    // Also check if already have a session (in case event already fired)
    sb.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace("/minhas-versoes");
      }
    });
  }, [router]);

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-neutral-600 text-sm">{status}</p>
      </div>
    </div>
  );
}
