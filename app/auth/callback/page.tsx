"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import { Suspense } from "react";

function CallbackContent() {
  const router = useRouter();
  const [status, setStatus] = useState("Verificando seu acesso…");

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) { setStatus("Auth not configured."); return; }

    // Read redirect destination set by login page before magic link was sent
    const dest = localStorage.getItem("auth_redirect") || "/minhas-versoes";

    function redirect() {
      localStorage.removeItem("auth_redirect");
      router.replace(dest);
    }

    sb.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        setStatus("Pronto! Redirecionando…");
        redirect();
      }
    });

    sb.auth.getSession().then(({ data: { session } }) => {
      if (session) redirect();
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

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="inline-block h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
}
