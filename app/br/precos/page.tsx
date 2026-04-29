"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ptBR } from "@/lib/i18n/pt-BR";
import { getOrCreateUserId } from "@/lib/userId";
import { BrProductId } from "@/lib/brPricing";

function BrCheckoutButton({ userId, productId, label }: { userId: string; productId: BrProductId; label?: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout-br", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, productId }),
      });
      const data = await res.json();
      if (data.url) { window.location.href = data.url; return; }
      setError(data.detail || data.error || "Erro ao iniciar pagamento.");
    } catch (err: any) {
      setError(err?.message || "Erro de rede.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-1">
      <button onClick={handleCheckout} disabled={loading}
        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg disabled:opacity-50 transition"
      >
        {loading ? "Redirecionando..." : (label || ptBR.pricing.buyNow)}
      </button>
      <p className="text-xs text-center text-neutral-400">{ptBR.pricing.pix} · {ptBR.pricing.installments}</p>
      {error && <p className="text-red-600 text-xs text-center">{error}</p>}
    </div>
  );
}

export default function BrazilPricingPage() {
  const [userId, setUserId] = useState("anonymous");

  useEffect(() => {
    setUserId(getOrCreateUserId());
  }, []);

  const t = ptBR.pricing;

  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900 flex flex-col">
      <main className="flex-1 w-full">
        <div className="max-w-5xl mx-auto px-4 py-16 text-center">

          <Link href="/br" className="text-sm text-green-600 hover:underline mb-8 inline-block">← {ptBR.common.backHome}</Link>

          <h1 className="text-3xl font-semibold mb-4">{ptBR.pricing.title}</h1>
          <p className="text-neutral-700 mb-12 max-w-xl mx-auto">{ptBR.pricing.subtitle}</p>

          <div className="grid gap-8 md:grid-cols-3 items-stretch">

            {/* Currículo Padrão */}
            <div className="bg-white border border-neutral-300 rounded-lg shadow-sm p-6 sm:p-8 flex flex-col">
              <h2 className="text-2xl font-semibold mb-2 min-h-[4rem] flex items-center justify-center text-center">{t.resume.name}</h2>
              <p className="text-neutral-600 mb-6 text-center min-h-[3rem]">{t.resume.desc}</p>
              <div className="flex items-center justify-center mb-6">
                <div className="text-5xl font-bold">{t.resume.price}</div>
              </div>
              <ul className="text-left text-neutral-700 space-y-3 mb-8 flex-1">
                {t.resume.features.map((f, i) => <li key={i}>• {f}</li>)}
                {t.resume.notIncluded.map((f, i) => <li key={i} className="opacity-60">• {f}</li>)}
              </ul>
              <div className="mt-auto">
                <BrCheckoutButton userId={userId} productId={BrProductId.RESUME} />
              </div>
            </div>

            {/* Carta de Apresentação */}
            <div className="bg-white border border-neutral-300 rounded-lg shadow-sm p-6 sm:p-8 flex flex-col">
              <h2 className="text-2xl font-semibold mb-2 min-h-[4rem] flex items-center justify-center text-center">{t.coverLetter.name}</h2>
              <p className="text-neutral-600 mb-6 text-center min-h-[3rem]">{t.coverLetter.desc}</p>
              <div className="flex items-center justify-center mb-6">
                <div className="text-5xl font-bold">{t.coverLetter.price}</div>
              </div>
              <ul className="text-left text-neutral-700 space-y-3 mb-8 flex-1">
                {t.coverLetter.features.map((f, i) => <li key={i}>• {f}</li>)}
                {t.coverLetter.notIncluded.map((f, i) => <li key={i} className="opacity-60">• {f}</li>)}
              </ul>
              <div className="mt-auto">
                <BrCheckoutButton userId={userId} productId={BrProductId.COVER_LETTER} />
              </div>
            </div>

            {/* Pacote Premium */}
            <div className="relative mt-4 md:mt-0 flex flex-col">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-green-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow">
                {t.popular}
              </div>
              <div className="bg-white border border-neutral-300 rounded-lg shadow-sm p-6 sm:p-8 flex flex-col flex-1">
                <h2 className="text-2xl font-semibold mb-2 min-h-[4rem] flex items-center justify-center text-center">{t.bundle.name}</h2>
                <p className="text-neutral-600 mb-6 text-center min-h-[3rem]">{t.bundle.desc}</p>
                <div className="flex items-center justify-center mb-6">
                  <div className="text-5xl font-bold">{t.bundle.price}</div>
                </div>
                <ul className="text-left text-neutral-700 space-y-3 mb-8 flex-1">
                  {t.bundle.features.map((f, i) => <li key={i}>• {f}</li>)}
                </ul>
                <div className="mt-auto">
                  <BrCheckoutButton userId={userId} productId={BrProductId.BUNDLE} label={`${t.buyNow} — ${t.bundle.price}`} />
                </div>
              </div>
            </div>

          </div>

          <p className="text-neutral-500 text-xs mt-10">{t.footer}</p>
        </div>
      </main>

      <footer className="w-full bg-neutral-900 text-neutral-400 text-xs border-t border-neutral-700">
        <div className="flex flex-col items-center py-6 px-4 gap-3">
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-neutral-500">
            <Link href="/br/termos" className="hover:text-neutral-300">{ptBR.legal.terms}</Link>
            <Link href="/br/privacidade" className="hover:text-neutral-300">{ptBR.legal.privacy}</Link>
            <Link href="/br/reembolso" className="hover:text-neutral-300">{ptBR.legal.refunds}</Link>
            <Link href="/br/contato" className="hover:text-neutral-300">{ptBR.legal.contact}</Link>
          </div>
          <span className="text-neutral-600">© {new Date().getFullYear()} TradePro Technologies. Todos os direitos reservados.</span>
        </div>
      </footer>
    </div>
  );
}
