"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ptBR } from "@/lib/i18n/pt-BR";

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

            <div className="max-w-2xl mx-auto text-center mb-6">
              <p className="text-base md:text-lg text-neutral-200">{ptBR.landing.mission}</p>
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

            <div className="flex gap-4 flex-wrap justify-center">
              <Link href="/br/curriculo" className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md transition">
                {ptBR.landing.cta}
              </Link>
              <Link href="/br/precos" className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-md border border-white/30 transition">
                {ptBR.landing.ctaPricing}
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* SALE BANNER */}
      <div className="w-full bg-red-600 text-white py-3 px-4 text-center">
        <p className="text-sm font-semibold">
          🔥 <strong>Oferta por tempo limitado:</strong> Pacote Premium por apenas <strong>R$ 99</strong> (de R$ 149) — economize R$ 50!{" "}
          <a href="/br/precos" className="underline font-bold hover:text-red-100">Ver planos →</a>
        </p>
      </div>

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
          <h2 className="text-2xl font-semibold text-center mb-8">{ptBR.landing.features.title}</h2>
          <div className="grid gap-6 md:grid-cols-3 text-sm">
            {[
              { key: "resume", href: "/br/curriculo" },
              { key: "coverLetter", href: "/br/carta" },
              { key: "projects", href: "/br/portfolios" },
            ].map(({ key, href }) => (
              <Link key={key} href={href} className="border border-neutral-200 rounded-md p-4 bg-neutral-50 hover:shadow-md transition">
                <h3 className="font-semibold mb-2">{ptBR.landing.features[key as keyof typeof ptBR.landing.features].title}</h3>
                <p className="text-neutral-700">{ptBR.landing.features[key as keyof typeof ptBR.landing.features].desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING PREVIEW */}
      <section className="w-full bg-neutral-50 border-t border-neutral-300 py-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-2xl font-semibold mb-8">{ptBR.landing.pricing.title}</h2>
          <div className="grid gap-6 md:grid-cols-3 text-sm">
            {[
              { name: ptBR.pricing.resume.name, price: ptBR.pricing.resume.price, desc: ptBR.pricing.resume.desc },
              { name: ptBR.pricing.coverLetter.name, price: ptBR.pricing.coverLetter.price, desc: ptBR.pricing.coverLetter.desc },
              { name: ptBR.pricing.bundle.name, price: ptBR.pricing.bundle.price, desc: ptBR.pricing.bundle.desc },
            ].map((p, i) => (
              <div key={i} className="border border-neutral-200 rounded-md p-6 bg-white shadow-sm">
                <h3 className="font-semibold mb-2">{p.name}</h3>
                <p className="text-neutral-700 mb-4">{p.desc}</p>
                <div className="text-3xl font-bold mb-2">{p.price}</div>
              </div>
            ))}
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
          </div>
          <span className="text-neutral-600 text-center">© {new Date().getFullYear()} TradePro Technologies. Todos os direitos reservados.</span>
        </div>
      </footer>
    </div>
  );
}
