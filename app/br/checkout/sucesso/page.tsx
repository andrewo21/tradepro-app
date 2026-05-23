"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useBrResumeStore } from "@/app/store/useBrResumeStore";
import { getOrCreateUserId } from "@/lib/userId";

function SucessoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId") || getOrCreateUserId();
  const productId = searchParams.get("productId") || null;
  const sessionId = searchParams.get("session_id") || null;

  const clearAll = useBrResumeStore((s: any) => s.clearAll);
  const [entitlements, setEntitlements] = useState<any>(null);
  const [grantError, setGrantError] = useState<string | null>(null);
  const [status, setStatus] = useState("Processando seu pagamento…");

  useEffect(() => {
    async function load() {
      if (productId) {
        setStatus("Ativando sua compra…");
        const grantRes = await fetch("/api/stripe/grant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, productId, sessionId }),
        });
        if (!grantRes.ok) {
          const data = await grantRes.json().catch(() => ({}));
          setGrantError(data.detail || data.error || `Erro na ativação (${grantRes.status})`);
          setStatus("Problema na ativação.");
          return;
        }
      }

      setStatus("Carregando sua conta…");
      const res = await fetch(`/api/debug/entitlements?userId=${userId}`);
      const data = await res.json();
      setEntitlements(data.entitlements);

      const hasAny = data.entitlements?.resume || data.entitlements?.coverLetter || data.entitlements?.bundle;
      if (!hasAny) {
        setGrantError("Pagamento processado mas acesso não encontrado. Entre em contato com o suporte.");
        setStatus("Problema de ativação detectado.");
        return;
      }

      setStatus("Abrindo seu currículo…");

      // Short delay so user sees the success message, then go straight to preview
      setTimeout(() => {
        if (data.entitlements.bundle || data.entitlements.resume) {
          router.push("/br/curriculo/preview");
        } else if (data.entitlements.coverLetter) {
          router.push("/br/carta");
        }
      }, 1500);
    }

    load();
  }, [router, userId, productId, sessionId]); // eslint-disable-line

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
      <div className="bg-white shadow-lg rounded-xl p-10 border border-green-200 max-w-lg text-center">

        {!grantError && (
          <div className="text-5xl mb-4">🎉</div>
        )}

        <h1 className={`text-3xl font-bold mb-4 ${grantError ? "text-red-600" : "text-green-700"}`}>
          {grantError ? "Problema na Ativação" : "Pagamento Confirmado!"}
        </h1>

        {!grantError && (
          <p className="text-gray-700 text-lg mb-6">
            Obrigado pela sua compra. Sua conta está sendo atualizada agora.
          </p>
        )}

        {entitlements && !grantError && (
          <div className="text-gray-800 font-medium mb-6">
            {entitlements.bundle && "✓ Você agora tem acesso a TODOS os recursos premium."}
            {entitlements.resume && !entitlements.bundle && "✓ Criador de Currículo Desbloqueado."}
            {entitlements.coverLetter && !entitlements.bundle && "✓ Carta de Apresentação Desbloqueada."}
          </div>
        )}

        {grantError && (
          <div className="text-red-600 text-sm mb-6 bg-red-50 border border-red-200 rounded p-4 text-left">
            <p className="font-bold mb-2">Detalhe do erro:</p>
            <p className="font-mono break-all">{grantError}</p>
            <p className="mt-3 text-gray-600 text-xs">
              Seu pagamento foi recebido. Por favor, tire um print e entre em contato: support@tradepro.tools
            </p>
          </div>
        )}

        <div className="flex items-center justify-center gap-2 mt-2">
          {!grantError && (
            <span className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
          )}
          <p className="text-sm text-gray-500">{status}</p>
        </div>
      </div>
    </div>
  );
}

export default function SucessoPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
      <p className="text-gray-500">Carregando…</p>
    </div>
  );
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <p className="text-gray-500">Carregando…</p>
      </div>
    }>
      <SucessoContent />
    </Suspense>
  );
}
