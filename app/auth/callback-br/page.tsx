"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";

export default function AuthCallbackBR() {
  const router = useRouter();
  const [status, setStatus] = useState("Verificando seu acesso…");

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) { setStatus("Autenticação não configurada."); return; }

    function redirect() {
      router.replace("/br/meus-curriculos");
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
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#f0fdf4" }}>
      <div className="text-center">
        <div className="inline-block h-8 w-8 border-4 border-t-transparent rounded-full animate-spin mb-4"
          style={{ borderColor: "#166534", borderTopColor: "transparent" }} />
        <p className="text-green-900 text-sm font-medium">{status}</p>
      </div>
    </div>
  );
}
