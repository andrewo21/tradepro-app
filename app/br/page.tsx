"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ptBR } from "@/lib/i18n/pt-BR";
import GringoDynamic from "@/components/assistant/GringoDynamic";

const TYPED_WORDS = ptBR.landing.skills.words;

function NewsletterBR() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const t = ptBR.landing.newsletter;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) setSubmitted(true);
      else setError(ptBR.common.error);
    } catch { setError(ptBR.common.network); }
    finally { setLoading(false); }
  }

  return (
    <section className="w-full bg-neutral-900 border-t border-neutral-700 py-14 px-4">
      <div className="max-w-xl mx-auto text-center">
        <h2 className="text-2xl font-semibold text-white mb-2">{t.title}</h2>
        <p className="text-neutral-400 text-sm mb-8">{t.subtitle}</p>
        {submitted ? (
          <div className="text-green-400 font-medium text-lg">{t.success}</div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 justify-center">
            <input
              type="email" required value={email} onChange={e => setEmail(e.target.value)}
              placeholder={t.placeholder}
              className="flex-1 px-4 py-3 rounded-md text-sm text-neutral-900 bg-white border border-neutral-300 focus:outline-none"
            />
            <button type="submit" disabled={loading}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-md disabled:opacity-50 whitespace-nowrap"
            >
              {loading ? "..." : t.button}
            </button>
          </form>
        )}
        {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
      </div>
    </section>
  );
}

const WA_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_BR || "";
const WA_MESSAGE = encodeURIComponent("Olá! Gostaria de criar meu currículo profissional com a TradePro. Pode me ajudar?");
const WA_URL = WA_NUMBER ? `https://wa.me/${WA_NUMBER}?text=${WA_MESSAGE}` : "/br/contato";

function WhatsAppSection() {
  return (
    <section className="w-full py-16 px-4" style={{ backgroundColor: "#0d3320" }}>
      <div className="max-w-2xl mx-auto text-center">
        {/* WhatsApp logo */}
        <div className="flex justify-center mb-5">
          <div className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg" style={{ backgroundColor: "#25D366" }}>
            <svg viewBox="0 0 32 32" className="w-9 h-9" fill="white" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 2C8.268 2 2 8.268 2 16c0 2.444.658 4.733 1.805 6.7L2 30l7.5-1.775A13.93 13.93 0 0 0 16 30c7.732 0 14-6.268 14-14S23.732 2 16 2zm0 25.5a11.43 11.43 0 0 1-5.82-1.593l-.418-.247-4.453 1.053 1.09-4.322-.274-.44A11.432 11.432 0 0 1 4.5 16C4.5 9.649 9.649 4.5 16 4.5S27.5 9.649 27.5 16 22.351 27.5 16 27.5zm6.29-8.47c-.345-.173-2.04-1.005-2.355-1.12-.315-.115-.545-.172-.774.173-.23.345-.89 1.12-1.09 1.348-.2.23-.4.258-.745.086-.345-.172-1.457-.537-2.775-1.713-1.025-.916-1.717-2.047-1.917-2.392-.2-.345-.021-.532.15-.703.154-.154.345-.4.518-.6.172-.2.23-.345.345-.575.115-.23.057-.43-.029-.603-.086-.172-.774-1.866-1.06-2.555-.28-.67-.564-.58-.774-.59-.2-.01-.43-.012-.66-.012-.23 0-.603.086-.918.43-.315.345-1.205 1.177-1.205 2.869s1.233 3.328 1.405 3.557c.172.23 2.427 3.71 5.88 5.204.822.355 1.463.567 1.963.725.824.263 1.575.226 2.168.137.66-.099 2.04-.834 2.327-1.638.287-.805.287-1.494.2-1.638-.085-.143-.315-.23-.66-.4z"/>
            </svg>
          </div>
        </div>

        <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
          Prefere que a gente faça por você?
        </h2>
        <p className="text-green-200 text-base mb-2">
          Manda uma mensagem no WhatsApp com seu nome e profissão.
        </p>
        <p className="text-green-300 text-sm mb-8">
          Nós cuidamos do resto — você recebe seu currículo profissional pronto.
        </p>

        <a
          href={WA_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-white text-lg shadow-xl transition-all hover:scale-105 hover:shadow-2xl"
          style={{ backgroundColor: "#25D366" }}
        >
          <svg viewBox="0 0 32 32" className="w-6 h-6" fill="white">
            <path d="M16 2C8.268 2 2 8.268 2 16c0 2.444.658 4.733 1.805 6.7L2 30l7.5-1.775A13.93 13.93 0 0 0 16 30c7.732 0 14-6.268 14-14S23.732 2 16 2zm0 25.5a11.43 11.43 0 0 1-5.82-1.593l-.418-.247-4.453 1.053 1.09-4.322-.274-.44A11.432 11.432 0 0 1 4.5 16C4.5 9.649 9.649 4.5 16 4.5S27.5 9.649 27.5 16 22.351 27.5 16 27.5zm6.29-8.47c-.345-.173-2.04-1.005-2.355-1.12-.315-.115-.545-.172-.774.173-.23.345-.89 1.12-1.09 1.348-.2.23-.4.258-.745.086-.345-.172-1.457-.537-2.775-1.713-1.025-.916-1.717-2.047-1.917-2.392-.2-.345-.021-.532.15-.703.154-.154.345-.4.518-.6.172-.2.23-.345.345-.575.115-.23.057-.43-.029-.603-.086-.172-.774-1.866-1.06-2.555-.28-.67-.564-.58-.774-.59-.2-.01-.43-.012-.66-.012-.23 0-.603.086-.918.43-.315.345-1.205 1.177-1.205 2.869s1.233 3.328 1.405 3.557c.172.23 2.427 3.71 5.88 5.204.822.355 1.463.567 1.963.725.824.263 1.575.226 2.168.137.66-.099 2.04-.834 2.327-1.638.287-.805.287-1.494.2-1.638-.085-.143-.315-.23-.66-.4z"/>
          </svg>
          Chamar no WhatsApp
        </a>

        <p className="text-green-400 text-xs mt-4">Respondemos em minutos • Sem compromisso</p>
      </div>
    </section>
  );
}

export default function BrazilHomePage() {
  const [lineIndex, setLineIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [lines, setLines] = useState<string[]>(Array(TYPED_WORDS.length).fill(""));
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    if (isResetting) return;
    const word = TYPED_WORDS[lineIndex];
    const interval = setInterval(() => {
      setLines(prev => { const n = [...prev]; n[lineIndex] = word.slice(0, charIndex + 1); return n; });
      if (charIndex < word.length - 1) {
        setCharIndex(c => c + 1);
      } else {
        clearInterval(interval);
        if (lineIndex < TYPED_WORDS.length - 1) {
          setTimeout(() => { setLineIndex(l => l + 1); setCharIndex(0); }, 350);
        } else {
          setTimeout(() => { setIsResetting(true); setLines(Array(TYPED_WORDS.length).fill("")); setLineIndex(0); setCharIndex(0); setIsResetting(false); }, 1200);
        }
      }
    }, 90);
    return () => clearInterval(interval);
  }, [charIndex, lineIndex, isResetting]);

  return (
    <div className="min-h-screen flex flex-col bg-neutral-200 text-neutral-900">

      {/* HERO */}
      <section className="relative z-0 w-full flex items-center justify-center min-h-[600px] md:h-[80vh] lg:h-[90vh]">
        <motion.div
          initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: "easeOut" }}
          className="relative w-full h-full min-h-[600px] overflow-hidden"
        >
          <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/rough-paper.png')", backgroundSize: "cover", opacity: 0.25 }} />
          <div className="absolute inset-0 bg-[rgba(60,48,36,0.8)] mix-blend-multiply pointer-events-none" />
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle,_transparent_50%,_rgba(0,0,0,0.65)_100%)]" />

          <div className="relative px-8 py-10 md:px-16 md:py-16 text-neutral-50 flex flex-col items-center justify-center min-h-[600px] md:min-h-[80vh]">
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                <span className="text-white">{ptBR.landing.hero.split("TradePro")[0]}</span>
                <span className="text-black">TradePro</span>
                <span className="text-green-400"> Technologies</span>
              </h1>
            </div>

            <div className="max-w-xl mx-auto text-center mb-2">
              <p className="text-sm md:text-base text-neutral-200">{ptBR.landing.mission}</p>
            </div>

            <div className="max-w-xl mx-auto text-center mb-2">
              <p className="text-xs md:text-sm text-white font-medium italic">
                "Não importa sua área — sua história profissional merece ser contada com profissionalismo."
              </p>
            </div>

            <div className="max-w-xl mx-auto text-center mb-5">
              <p className="text-sm md:text-base text-amber-300 font-semibold">
                Recrutadores veem uma análise do seu currículo. Você nunca viu essa análise.{" "}
                <span className="text-white">Até agora.</span>
              </p>
            </div>

            <div className="max-w-xl mx-auto mb-8">
              <h3 className="text-lg font-semibold tracking-wide uppercase mb-1 border-b border-neutral-400 pb-1">Habilidades</h3>
              <div className="font-mono text-base md:text-lg leading-relaxed mt-2 min-h-[120px]">
                {TYPED_WORDS.map((_, idx) => (
                  <div key={idx} className="h-7">
                    {lines[idx]}
                    {idx === lineIndex && <span className="inline-block w-2 animate-pulse">|</span>}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </motion.div>
      </section>


      {/* ATS SECTION — what it is + before/after proof */}
      <section className="w-full bg-white border-t border-neutral-200 py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <span className="inline-block bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">
              TradePro ATS Engine™
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              O que o recrutador vê — antes de você enviar
            </h2>
            <p className="text-neutral-600 text-lg max-w-2xl mx-auto">
              Empresas usam sistemas automáticos de triagem (ATS) para filtrar currículos antes de qualquer humano ver.
              A maioria dos candidatos é eliminada nessa etapa — sem saber por quê.
            </p>
          </div>

          {/* Before / After — the only proof needed */}
          <div className="mb-10">
            <div className="text-center mb-4">
              <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">Exemplo Ilustrativo — Personagem fictício. Resultados reais variam.</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                <p className="text-xs font-bold text-red-600 uppercase tracking-wide mb-3">Antes — Sem análise</p>
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-5xl font-bold text-red-600">52</div>
                  <span className="inline-block bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full">Mediano</span>
                </div>
                <ul className="space-y-1.5 text-sm text-red-700">
                  <li className="flex gap-2"><span>✗</span>Sem resumo profissional</li>
                  <li className="flex gap-2"><span>✗</span>Apenas 3 bullets de experiência</li>
                  <li className="flex gap-2"><span>✗</span>2 habilidades da vaga faltando</li>
                  <li className="flex gap-2"><span>✗</span>Ferramenta principal não mencionada</li>
                </ul>
              </div>
              <div className="bg-green-50 border border-green-300 rounded-2xl p-6">
                <p className="text-xs font-bold text-green-700 uppercase tracking-wide mb-3">Depois — Com TradePro ATS Engine™</p>
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-5xl font-bold text-green-700">84</div>
                  <span className="inline-block bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full">Forte</span>
                </div>
                <ul className="space-y-1.5 text-sm text-green-700">
                  <li className="flex gap-2"><span>✓</span>Resumo adicionado (+10 pts)</li>
                  <li className="flex gap-2"><span>✓</span>5 bullets com resultados (+5 pts)</li>
                  <li className="flex gap-2"><span>✓</span>Habilidades da vaga incluídas (+10 pts)</li>
                  <li className="flex gap-2"><span>✓</span>Ferramentas relevantes adicionadas (+7 pts)</li>
                </ul>
              </div>
            </div>
            <p className="text-center text-xs text-neutral-400 mt-2">
              * O TradePro mostra sua pontuação real e o que melhorar — não garante resultados de contratação.
            </p>
          </div>

          {/* 3 distinct benefit pillars */}
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            {[
              { icon: "🎯", title: "Análise contra a vaga", desc: "Cole a descrição da vaga e veja se seu currículo está alinhado com os requisitos exatos." },
              { icon: "🛠️", title: "Sugestões em português", desc: "Recomendações claras e diretas — sem jargão técnico, em português do Brasil." },
              { icon: "📊", title: "Funciona sem vaga também", desc: "Sem descrição de vaga? A IA avalia seu currículo com base no seu cargo e área de atuação." },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="bg-neutral-50 border border-neutral-200 rounded-xl p-5">
                <div className="text-3xl mb-3">{icon}</div>
                <h3 className="font-semibold text-neutral-900 mb-2">{title}</h3>
                <p className="text-neutral-600 text-sm">{desc}</p>
              </div>
            ))}
          </div>

          {/* Ringo intro + CTAs */}
          <div className="mt-12 bg-gradient-to-br from-green-950 via-green-900 to-green-950 rounded-2xl border border-green-700/40 p-8 text-center">
            <div className="flex justify-center mb-4">
              <GringoDynamic size={160} />
            </div>
            <p className="text-green-300 text-xs font-bold uppercase tracking-widest mb-3">Gringo™ — Escritor de Currículo IA</p>
            <h3 className="text-2xl font-bold text-white mb-3">Gringo te guia em cada etapa.</h3>
            <p className="text-green-200/80 text-base mb-6 max-w-md mx-auto leading-relaxed">
              Gringo faz perguntas, sugere melhorias e você decide o que entra no currículo. Você sempre tem o controle — veja tudo antes de pagar.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/br/curriculo/gringo"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-green-500 text-white font-bold rounded-xl hover:bg-green-400 transition shadow-lg shadow-green-500/20 text-base">
                🤖 Criar com a ajuda do Gringo →
              </Link>
              <Link href="/br/curriculo"
                className="inline-block px-6 py-3.5 text-green-300 font-semibold rounded-xl border border-green-500/40 hover:bg-green-500/10 transition text-sm">
                Prefiro preencher sozinho
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS — TradePro ATS Engine™ (dark, includes the "até agora" quote) */}
      <section className="w-full bg-neutral-900 py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <span className="inline-block bg-green-800 text-green-200 text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">
              Tecnologia Proprietária
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              🔍 TradePro ATS Engine™
            </h2>
            <p className="text-neutral-400 text-base max-w-2xl mx-auto mb-6">
              Um sistema exclusivo que identifica automaticamente o que falta no seu currículo — e quanto cada melhoria vale em pontos.
            </p>
            <div className="bg-neutral-800 border border-neutral-700 rounded-2xl px-6 py-4 max-w-xl mx-auto">
              <p className="text-white font-semibold text-base leading-relaxed">
                Recrutadores sempre tiveram informações que você não tinha.<br />
                <span className="text-green-400">Agora você tem acesso à mesma visão — antes de enviar seu currículo.</span>
              </p>
              <p className="text-neutral-500 text-xs mt-2">Exclusivo da TradePro Technologies — você não vai encontrar isso em nenhum outro lugar.</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-10">
            {[
              "Habilidades que estão faltando para o seu cargo",
              "Ferramentas essenciais que aumentam sua empregabilidade",
              "Responsabilidades esperadas que não aparecem no seu currículo",
              "Resultados mensuráveis que você deveria destacar",
              "Problemas estruturais que reduzem sua pontuação",
              "O que profissionais da sua área realmente apresentam",
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 bg-neutral-800 rounded-xl px-4 py-3">
                <span className="text-green-400 font-bold flex-shrink-0 mt-0.5">✓</span>
                <span className="text-neutral-200 text-sm">{item}</span>
              </div>
            ))}
          </div>

          <div className="bg-neutral-800 rounded-2xl p-6">
            <p className="text-green-300 font-semibold mb-4 text-sm uppercase tracking-wide">Relatório completo inclui:</p>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
              {[
                "Pontuação ATS",
                "Melhorias com impacto estimado",
                "Recomendações para o seu cargo",
                "Dicas de estrutura",
                "Habilidades e ferramentas faltantes",
                "PDF profissional para enviar",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-neutral-300">
                  <span className="text-green-500">→</span>{item}
                </div>
              ))}
            </div>
            <p className="text-xs text-neutral-500 mt-4 text-center">Incluído no pacote — sem assinatura, sem mensalidade.</p>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="w-full bg-neutral-100 border-t border-neutral-300 pt-20 pb-12 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-semibold text-center mb-8">{ptBR.landing.testimonials.title}</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {ptBR.landing.testimonials.items.map((t, i) => (
              <div key={i} className="bg-white border border-neutral-200 rounded-md p-4 shadow-sm">
                <p className="text-sm text-neutral-800 mb-3">"{t.text}"</p>
                <p className="text-xs text-neutral-500 font-medium">— {t.author}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="w-full bg-white border-t border-neutral-200 py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-semibold text-center mb-3">{ptBR.landing.features.title}</h2>
          <p className="text-sm text-green-700 font-medium text-center mb-8">
            ✓ Modelos otimizados para leitura por sistemas ATS — compatíveis com os sistemas utilizados pelas principais empresas do mercado.
          </p>
          <div className="grid gap-6 md:grid-cols-3 text-sm">
            {[
              { key: "resume", href: "/br/curriculo" },
              { key: "coverLetter", href: "/br/carta" },
              { key: "ats", href: "/br/curriculo" },
            ].map(({ key, href }) => (
              <Link key={key} href={href} className="border border-neutral-200 rounded-md p-4 bg-neutral-50 hover:shadow-md transition">
                <h3 className="font-semibold mb-2">{ptBR.landing.features[key as keyof typeof ptBR.landing.features].title}</h3>
                <p className="text-neutral-700">{ptBR.landing.features[key as keyof typeof ptBR.landing.features].desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* WHATSAPP CTA */}
      <WhatsAppSection />

      {/* PRICING PREVIEW */}
      <section className="w-full bg-neutral-50 border-t border-neutral-300 py-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-2xl font-semibold mb-8">{ptBR.landing.pricing.title}</h2>
          <div className="max-w-sm mx-auto text-sm">
            <div className="border-2 border-green-500 rounded-xl p-8 bg-white shadow-lg text-center">
              <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full mb-4 inline-block">
                🔥 Oferta por Tempo Limitado
              </span>
              <h3 className="text-xl font-bold mb-2">{ptBR.pricing.bundle.name}</h3>
              <p className="text-neutral-600 mb-4">{ptBR.pricing.bundle.desc}</p>
              <div className="flex items-center justify-center gap-3 mb-2">
                <div className="text-5xl font-bold text-green-700">{ptBR.pricing.bundle.price}</div>
                <div className="text-xl text-neutral-400 line-through">{ptBR.pricing.bundle.originalPrice}</div>
              </div>
              <p className="text-xs text-neutral-500 mb-4">Todos os 9 modelos incluídos · Pagamento único</p>
            </div>
          </div>
          <Link href="/br/precos" className="inline-block mt-8 px-8 py-3 rounded-md bg-neutral-900 text-neutral-50 text-sm font-semibold shadow-md hover:bg-neutral-800">
            {ptBR.landing.pricing.cta}
          </Link>
        </div>
      </section>

      {/* NEWSLETTER */}
      <NewsletterBR />

      {/* FOOTER */}
      <footer className="w-full bg-neutral-900 text-neutral-400 text-xs border-t border-neutral-700">
        <div className="flex flex-col items-center justify-center py-8 px-4 gap-4">
          <img src="/brand/Tradepro-logo.svg" alt="TradePro Technologies" className="inline-block w-[220px] sm:w-[300px] h-auto" style={{ filter: "brightness(0) invert(1)", transform: "translateX(-12%)" }} />
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-neutral-500">
            <Link href="/br/termos" className="hover:text-neutral-300 transition">{ptBR.legal.terms}</Link>
            <Link href="/br/privacidade" className="hover:text-neutral-300 transition">{ptBR.legal.privacy}</Link>
            <Link href="/br/reembolso" className="hover:text-neutral-300 transition">{ptBR.legal.refunds}</Link>
            <Link href="/br/contato" className="hover:text-neutral-300 transition">{ptBR.legal.contact}</Link>
            {WA_NUMBER && (
              <a href={WA_URL} target="_blank" rel="noopener noreferrer"
                className="hover:text-green-400 transition flex items-center gap-1.5">
                <svg viewBox="0 0 32 32" className="w-3.5 h-3.5" fill="currentColor">
                  <path d="M16 2C8.268 2 2 8.268 2 16c0 2.444.658 4.733 1.805 6.7L2 30l7.5-1.775A13.93 13.93 0 0 0 16 30c7.732 0 14-6.268 14-14S23.732 2 16 2zm0 25.5a11.43 11.43 0 0 1-5.82-1.593l-.418-.247-4.453 1.053 1.09-4.322-.274-.44A11.432 11.432 0 0 1 4.5 16C4.5 9.649 9.649 4.5 16 4.5S27.5 9.649 27.5 16 22.351 27.5 16 27.5zm6.29-8.47c-.345-.173-2.04-1.005-2.355-1.12-.315-.115-.545-.172-.774.173-.23.345-.89 1.12-1.09 1.348-.2.23-.4.258-.745.086-.345-.172-1.457-.537-2.775-1.713-1.025-.916-1.717-2.047-1.917-2.392-.2-.345-.021-.532.15-.703.154-.154.345-.4.518-.6.172-.2.23-.345.345-.575.115-.23.057-.43-.029-.603-.086-.172-.774-1.866-1.06-2.555-.28-.67-.564-.58-.774-.59-.2-.01-.43-.012-.66-.012-.23 0-.603.086-.918.43-.315.345-1.205 1.177-1.205 2.869s1.233 3.328 1.405 3.557c.172.23 2.427 3.71 5.88 5.204.822.355 1.463.567 1.963.725.824.263 1.575.226 2.168.137.66-.099 2.04-.834 2.327-1.638.287-.805.287-1.494.2-1.638-.085-.143-.315-.23-.66-.4z"/>
                </svg>
                WhatsApp
              </a>
            )}
          </div>
          <span className="text-neutral-600 text-center">TradePro ATS Engine™ — Tecnologia Proprietária de Análise ATS</span>
          <span className="text-neutral-600 text-center">© {new Date().getFullYear()} TradePro Technologies. Todos os direitos reservados.</span>
        </div>
      </footer>
    </div>
  );
}
