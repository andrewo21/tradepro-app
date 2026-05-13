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
  const isBrazil = productId?.startsWith("br_");
  const [status, setStatus] = useState(isBrazil ? "Processando seu pagamento…" : "Processing your payment…");

  useEffect(() => {
    async function load() {
      // Grant entitlement on the server
      if (productId) {
        setStatus(isBrazil ? "Ativando sua compra…" : "Activating your purchase…");
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
      setStatus(isBrazil ? "Carregando sua conta…" : "Loading your account…");
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
        setGrantError(isBrazil
          ? "Pagamento processado mas acesso não encontrado. Entre em contato com o suporte."
          : "Purchase processed but entitlement not found. Please contact support.");
        setStatus(isBrazil ? "Problema de ativação detectado." : "Activation issue detected.");
        return;
      }

      // Bundle: stay on this page and show the tool menu
      // Single product: redirect after 3 seconds
      if (!data.entitlements.bundle) {
        setStatus(isBrazil ? "Redirecionando para suas ferramentas…" : "Redirecting you to your tools…");
        setTimeout(() => {
          if (data.entitlements.coverLetter) {
            router.push(isBrazil ? "/br/carta" : "/cover-letter");
          } else if (data.entitlements.resume) {
            router.push(isBrazil ? "/br/curriculo" : "/resume/personal");
          }
        }, 3000);
      } else {
        setStatus(isBrazil ? "Tudo pronto! Escolha por onde começar." : "All set! Choose where to start.");
      }
    }

    load();
  }, [router, userId, productId, sessionId, setField]);

  // Text in Portuguese for Brazil, English for US
  const t = {
    successTitle: isBrazil ? "Pagamento Confirmado!" : "Payment Successful!",
    activationProblem: isBrazil ? "Problema na Ativação" : "Activation Problem",
    thankYou: isBrazil
      ? "Obrigado pela sua compra. Sua conta está sendo atualizada agora."
      : "Thank you for your purchase. Your account is being upgraded now.",
    allFeatures: isBrazil ? "✓ Você agora tem acesso a TODOS os recursos premium." : "✓ You now have access to ALL premium features.",
    resumeUnlocked: isBrazil ? "✓ Criador de Currículo Desbloqueado." : "✓ Resume Builder Unlocked.",
    coverLetterUnlocked: isBrazil ? "✓ Carta de Apresentação Desbloqueada." : "✓ Cover Letter Builder Unlocked.",
    errorDetail: isBrazil ? "Detalhe do erro:" : "Error detail:",
    errorContact: isBrazil
      ? "Seu pagamento foi recebido pelo Stripe. Por favor, tire um print deste erro e entre em contato com o suporte."
      : "Your payment was received by Stripe. Please screenshot this error and contact support.",
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className={`bg-white shadow-lg rounded-xl p-10 border max-w-lg text-center ${isBrazil ? "border-green-200" : "border-gray-200"}`}>
        <h1 className={`text-3xl font-bold mb-4 ${grantError ? "text-red-600" : isBrazil ? "text-green-700" : "text-green-700"}`}>
          {grantError ? t.activationProblem : t.successTitle}
        </h1>

        {!grantError && (
          <p className="text-gray-700 text-lg mb-6">{t.thankYou}</p>
        )}

        {entitlements && !grantError && (
          <div className="text-gray-800 font-medium mb-6">
            {entitlements.bundle && t.allFeatures}
            {entitlements.resume && !entitlements.bundle && t.resumeUnlocked}
            {entitlements.coverLetter && !entitlements.bundle && t.coverLetterUnlocked}
          </div>
        )}

        {/* Bundle sub-menu */}
        {entitlements?.bundle && !grantError && (
          <div className="grid grid-cols-1 gap-3 mt-4 mb-6 text-left">
            <p className="text-sm font-semibold text-gray-700 mb-1">
              {isBrazil ? "O que você quer criar primeiro?" : "What would you like to create first?"}
            </p>
            <a href={isBrazil ? "/br/curriculo" : "/resume/personal"}
              className="flex items-center gap-3 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm">
              <span className="text-xl">📄</span>
              {isBrazil ? "Criar Currículo" : "Build My Resume"}
            </a>
            <a href={isBrazil ? "/br/carta" : "/cover-letter"}
              className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-300 text-gray-800 rounded-lg hover:bg-gray-50 transition font-medium text-sm">
              <span className="text-xl">✉️</span>
              {isBrazil ? "Criar Carta de Apresentação" : "Write a Cover Letter"}
            </a>
            {!isBrazil && (
              <a href="/projects"
                className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-300 text-gray-800 rounded-lg hover:bg-gray-50 transition font-medium text-sm">
                <span className="text-xl">🏗️</span>
                Build a Project Portfolio
              </a>
            )}
          </div>
        )}

        {grantError && (
          <div className="text-red-600 text-sm mb-6 bg-red-50 border border-red-200 rounded p-4 text-left">
            <p className="font-bold mb-2">{t.errorDetail}</p>
            <p className="font-mono break-all">{grantError}</p>
            <p className="mt-3 text-gray-600 text-xs">{t.errorContact}</p>
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
