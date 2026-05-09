"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import { Suspense } from "react";

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/minhas-versoes";
  const [status, setStatus] = useState("Verificando seu acesso…");

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) {
      setStatus("Auth not configured.");
      return;
    }

    sb.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        setStatus("Pronto! Redirecionando…");
        router.replace(next);
      }
    });

    sb.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace(next);
    });
  }, [router, next]);

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
