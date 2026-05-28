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
        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg disabled:opacity-50 transition text-lg"
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
  const b = t.bundle;

  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900 flex flex-col">
      <main className="flex-1 w-full">
        <div className="max-w-lg mx-auto px-4 py-16 text-center">

          <Link href="/br" className="text-sm text-green-600 hover:underline mb-8 inline-block">← {ptBR.common.backHome}</Link>

          <h1 className="text-3xl font-semibold mb-3">{ptBR.pricing.title}</h1>
          <p className="text-neutral-600 mb-12 max-w-sm mx-auto">{ptBR.pricing.subtitle}</p>

          {/* Single bundle card */}
          <div className="relative bg-white border-2 border-green-500 rounded-2xl shadow-lg p-8 flex flex-col">

            {/* Badge */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <span className="bg-red-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow">
                🔥 {b.badge}
              </span>
            </div>

            <h2 className="text-2xl font-bold mb-2 mt-2">{b.name}</h2>
            <p className="text-neutral-600 mb-6">{b.desc}</p>

            {/* Price */}
            <div className="flex items-center justify-center mb-2">
              <div className="text-6xl font-bold text-green-700">{b.price}</div>
            </div>
            <p className="text-sm text-neutral-500 mb-8">Pagamento único · Sem mensalidade · Sem renovação</p>

            {/* ATS Engine description */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-5 text-left">
              <p className="text-xs font-bold text-green-800 uppercase tracking-wide mb-2">TradePro ATS Engine™ — Análise Profissional Completa</p>
              <ul className="space-y-1">
                {["Relatório ATS completo em PDF","Pontuação de Estrutura","Pontuação ATS (quando houver vaga)","Habilidades faltantes","Ferramentas faltantes","Responsabilidades faltantes","Impacto estimado na pontuação","Recomendações específicas para o seu cargo","Dicas gerais de estrutura"].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-green-800">
                    <span className="text-green-600 font-bold">✓</span>{item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Features */}
            <ul className="text-left space-y-3 mb-4">
              {b.features.map((f, i) => (
                <li key={i} className="flex items-center gap-2 text-neutral-700">
                  <span className="text-green-600 font-bold text-lg flex-shrink-0">✓</span>
                  {f}
                </li>
              ))}
            </ul>

            {/* Launch pricing note */}
            <div className="text-center mb-6">
              <p className="text-xs text-neutral-500">Preço de lançamento: <strong className="text-green-700">R$ 49</strong> · Preço após o lançamento: <strong className="text-neutral-600">R$ 99</strong></p>
            </div>

            <BrCheckoutButton userId={userId} productId={BrProductId.BUNDLE} />
          </div>

          <p className="text-neutral-400 text-xs mt-8">{t.footer}</p>

          {/* FAQ */}
          <div className="mt-16 text-left max-w-2xl mx-auto">
            <h2 className="text-xl font-bold text-neutral-900 mb-6 text-center">Perguntas Frequentes</h2>
            <div className="space-y-6">
              {[
                {
                  q: "O que é o TradePro ATS Engine™?",
                  a: "É uma tecnologia proprietária desenvolvida pela TradePro Technologies que analisa seu currículo com base em habilidades, ferramentas e responsabilidades esperadas para o mercado de trabalho.",
                },
                {
                  q: "Por que essa análise é melhor do que outras?",
                  a: "Porque ela usa uma biblioteca proprietária de cargos do Brasil, um sistema exclusivo de pontuação e um formato único de relatório ATS — nenhum outro serviço oferece isso.",
                },
                {
                  q: "O relatório realmente ajuda a conseguir entrevistas?",
                  a: "Sim. Ele mostra exatamente o que está faltando no seu currículo e como aumentar sua pontuação ATS, que é usada por empresas e recrutadores na triagem de candidatos.",
                },
                {
                  q: "O preço vai aumentar?",
                  a: "Sim. O preço de lançamento é R$ 49 BRL. Após o período promocional, o valor será R$ 99 BRL.",
                },
              ].map(({ q, a }, i) => (
                <div key={i} className="bg-white border border-neutral-200 rounded-xl p-5">
                  <p className="font-semibold text-neutral-900 mb-2">❓ {q}</p>
                  <p className="text-neutral-600 text-sm">{a}</p>
                </div>
              ))}
            </div>
          </div>
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
