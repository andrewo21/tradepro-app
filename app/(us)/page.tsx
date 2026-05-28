"use client";
import CinematicIntro from "@/components/CinematicIntro";

import Image from "next/image";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Footer from "@/components/Footer";
import { CV1TourButton } from "@/components/assistant/CV1Tour";
import CV1Welcome from "@/components/assistant/CV1Welcome";

function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      if (res.ok) {
        setSubmitted(true);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="w-full bg-neutral-900 border-t border-neutral-700 py-14 px-4">
      <div className="max-w-xl mx-auto text-center">
        <h2 className="text-2xl font-semibold text-white mb-2">
          Stay in the loop
        </h2>
        <p className="text-neutral-400 text-sm mb-8">
          New tools, templates, and updates — built for the trades. No spam, ever.
        </p>

        {submitted ? (
          <div className="text-green-400 font-medium text-lg">
            ✓ You're on the list. We'll be in touch.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 justify-center">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-md text-sm text-neutral-900 bg-white border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-md disabled:opacity-50 whitespace-nowrap"
            >
              {loading ? "Signing up…" : "Get Updates"}
            </button>
          </form>
        )}

        {error && (
          <p className="text-red-400 text-sm mt-3">{error}</p>
        )}
      </div>
    </section>
  );
}

const TYPED_WORDS = [
  "Precision",
  "Craftsmanship",
  "Leadership",
  "Safety-Focused",
  "Problem-Solving",
];

export default function HomePage() {
  const [lineIndex, setLineIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [lines, setLines] = useState<string[]>(
    Array(TYPED_WORDS.length).fill("")
  );
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    if (isResetting) return;

    const currentWord = TYPED_WORDS[lineIndex];
    const typingSpeed = 90;

    const interval = setInterval(() => {
      setLines((prev) => {
        const next = [...prev];
        next[lineIndex] = currentWord.slice(0, charIndex + 1);
        return next;
      });

      if (charIndex < currentWord.length - 1) {
        setCharIndex((c) => c + 1);
      } else {
        clearInterval(interval);
        if (lineIndex < TYPED_WORDS.length - 1) {
          setTimeout(() => {
            setLineIndex((l) => l + 1);
            setCharIndex(0);
          }, 350);
        } else {
          setTimeout(() => {
            setIsResetting(true);
            setLines(Array(TYPED_WORDS.length).fill(""));
            setLineIndex(0);
            setCharIndex(0);
            setIsResetting(false);
          }, 1200);
        }
      }
    }, typingSpeed);

    return () => clearInterval(interval);
  }, [charIndex, lineIndex, isResetting]);

  return (
    <div className="min-h-screen flex flex-col bg-neutral-200 text-neutral-900">
      <CinematicIntro videoId="1196132428" />

      {/* Brazil region banner */}
      <div className="w-full bg-green-800 text-white text-xs py-2 px-4 text-center">
        🇧🇷 Você é do Brasil?{" "}
        <Link href="/br" className="underline font-semibold hover:text-green-200">
          Clique aqui para a versão em português →
        </Link>
      </div>

      {/* HERO */}
      <section
        className="
          relative z-0 w-full flex items-center justify-center
          min-h-[600px] md:h-[80vh] lg:h-[90vh]
        "
      >
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="relative w-full h-full min-h-[600px] md:min-h-0 overflow-hidden"
        >

          {/* Base rugged texture */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                "url('https://www.transparenttextures.com/patterns/rough-paper.png')",
              backgroundSize: "cover",
              backgroundRepeat: "repeat",
              opacity: 0.25,
            }}
          />

          {/* Dark overlay */}
          <div className="absolute inset-0 bg-[rgba(60,48,36,0.8)] mix-blend-multiply pointer-events-none" />

          {/* Noise + vignette */}
          <div className="absolute inset-0 opacity-40 pointer-events-none bg-[radial-gradient(circle_at_0_0,rgba(255,255,255,0.08)_0,transparent_50%),radial-gradient(circle_at_100%_0,rgba(0,0,0,0.25)_0,transparent_55%)]" />
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle,_transparent_50%,_rgba(0,0,0,0.65)_100%)]" />

          {/* CONTENT — centered within full-width backdrop */}
          <div className="relative px-8 py-10 md:px-16 md:py-16 text-neutral-50 flex flex-col items-center justify-center min-h-[600px] md:min-h-[80vh] lg:min-h-[90vh]">

            {/* NEW WELCOME LINE — no white shading */}
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                <span className="text-white">Welcome to </span>
                <span className="text-black">TradePro</span>
                <span className="text-red-600"> Technologies</span>
              </h1>
            </div>

            {/* TAGLINE + MISSION */}
            <div className="max-w-2xl mx-auto text-center mb-6">
              <h2 className="text-3xl md:text-4xl font-semibold mb-2">
                
              </h2>
              <p className="text-base md:text-lg text-neutral-200">
                TradePro’s mission is to build resumes that command confidence,
                pride, and excitement.
              </p>
            </div>

            {/* SKILLS */}
            <div className="max-w-xl mx-auto">
              <h3 className="text-lg font-semibold tracking-wide uppercase mb-1 border-b border-neutral-400 pb-1">
                Skills
              </h3>
              <div className="font-mono text-base md:text-lg leading-relaxed mt-2 min-h-[120px]">
                {TYPED_WORDS.map((_, idx) => (
                  <div key={idx} className="h-7">
                    {lines[idx]}
                    {idx === lineIndex && (
                      <span className="inline-block w-2 animate-pulse">|</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </motion.div>
      </section>

      {/* REST OF PAGE (unchanged) */}

      {/* BRAND VIDEO */}
      <section className="w-full bg-neutral-900 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="aspect-video rounded-xl overflow-hidden shadow-2xl">
            <iframe
              src="https://player.vimeo.com/video/1190159148?badge=0&autopause=0&player_id=0&app_id=58479"
              title="TradePro — Built for the people who build everything else"
              allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="w-full bg-neutral-100 border-t border-neutral-300 pt-20 pb-12 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-semibold text-center mb-8">
            What tradespeople are saying
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="bg-white border border-neutral-200 rounded-md p-4 shadow-sm">
              <p className="text-sm text-neutral-800 mb-3">
                "Got a sneak peek at the early access version of TradeProTech.Ai and honestly had a great experience. The platform helped me build a professional resume from start to finish while also analyzing my strengths, weak points, and areas I could improve professionally. Really clean process and a great tool for anyone looking to level up their career."
              </p>
              <p className="text-xs text-neutral-500 font-medium">
                — Luis C.
              </p>
            </div>
            <div className="bg-white border border-neutral-200 rounded-md p-4 shadow-sm">
              <p className="text-sm text-neutral-800 mb-3">
                "Cleanest resume I’ve ever had. No fluff, no gimmicks — just my
                work, presented right."
              </p>
              <p className="text-xs text-neutral-500 font-medium">
                — Amanda O.
              </p>
            </div>
            <div className="bg-white border border-neutral-200 rounded-md p-4 shadow-sm">
              <p className="text-sm text-neutral-800 mb-3">
                "Working with TradePro was an excellent experience. TradePro delivers polished, professional resumes that effectively highlight skills, accomplishments, and career experience. The process is efficient, responsive, and tailored to individual career goals. Their attention to detail and ability to strengthen professional presentation helps clients feel more confident when pursuing new opportunities."
              </p>
              <p className="text-xs text-neutral-500 font-medium">
                — Toni D.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CV-1 INTRODUCTION SECTION */}
      <section className="w-full bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 py-20 px-4 overflow-hidden">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12">

            {/* Left — text */}
            <div className="flex-1 text-center lg:text-left">
              <span className="inline-block bg-blue-500/20 text-blue-300 text-xs font-bold px-3 py-1 rounded-full mb-5 uppercase tracking-widest border border-blue-500/30">
                Introducing CV-1™
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-5 leading-tight">
                Your personal AI resume<br className="hidden md:block" /> coach. Built into every step.
              </h2>
              <p className="text-blue-100/80 text-lg mb-6 leading-relaxed">
                CV-1 is here to guide you throughout your entire resume building experience.
              </p>
              <ul className="space-y-3 mb-8 text-sm text-blue-100/70 text-left max-w-md mx-auto lg:mx-0">
                {[
                  "Knows you're an HVAC tech — suggests HVAC-specific skills",
                  "Sees a weak bullet — rewrites it with real metrics",
                  "One click adds it directly to your resume",
                  "Preview the complete resume before you pay anything",
                ].map(item => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="text-blue-400 mt-0.5 flex-shrink-0">✦</span>
                    {item}
                  </li>
                ))}
              </ul>
              <p className="text-blue-300/70 text-sm mt-2 lg:text-left text-center">
                Find CV-1 in the menu — available on every builder page to guide you through each step.
              </p>
            </div>

            {/* Right — CV-1 hero */}
            <div className="flex-shrink-0 flex items-center justify-center">
              <Image
                src="/cv1-landing-hero.png"
                alt="CV-1 AI Resume Coach"
                width={380}
                height={480}
                className="object-contain drop-shadow-2xl"
                priority
              />
            </div>

          </div>
        </div>
      </section>

     {/* CV-1 INTRODUCTION VIDEO */}
      <section className="w-full bg-neutral-50 border-t border-neutral-200 py-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-semibold mb-3">
            CV-1 Introduction Video
          </h2>
          <p className="text-neutral-600 mb-8 max-w-2xl mx-auto">
            Turn real work experience into a clean, professional resume — fast, simple, and stress‑free.
          </p>
          <div className="max-w-3xl mx-auto aspect-video rounded-xl overflow-hidden shadow-2xl mb-8">
            <iframe
              src="https://player.vimeo.com/video/1196131519?badge=0&autopause=0&player_id=0&app_id=58479"
              title="CV-1 Introduction Video"
              allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
          <Link
            href="/resume"
            className="inline-block px-8 py-3 rounded-md bg-neutral-900 text-neutral-50 text-sm font-semibold tracking-wide shadow-md hover:bg-neutral-800"
          >
            Try TradePro Now
          </Link>
          <p className="text-xs text-neutral-500 mt-2">One‑time purchase. No subscription.</p>
        </div>
      </section>

      {/* BUILT FOR TRADES SECTION */}
      <section className="w-full bg-white border-t border-neutral-200 py-14 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-semibold mb-6">
            Built for Trades, Students, and Real‑World Workers
          </h2>
          <div className="grid gap-4 sm:grid-cols-3 text-sm text-neutral-700">
            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-5">
              <div className="text-2xl mb-3">⚡</div>
              <p>Perfect for electricians, HVAC, welders, mechanics, and more.</p>
            </div>
            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-5">
              <div className="text-2xl mb-3">🎓</div>
              <p>Great for students, career changers, and anyone who wants a clean, professional resume.</p>
            </div>
            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-5">
              <div className="text-2xl mb-3">✓</div>
              <p>One‑time purchase — no subscriptions, ever.</p>
            </div>
            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-5 sm:col-span-3">
              <div className="text-2xl mb-3">📱</div>
              <p><strong>Works as an app.</strong> Visit on your phone and tap "Add to Home Screen" — TradePro installs like a native app. No App Store, no download required.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURE GRID */}
      <section className="w-full bg-white border-t border-neutral-200 py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-semibold text-center mb-8">
            Your tools for getting hired
          </h2>
          <div className="grid gap-6 md:grid-cols-4 text-sm">

            <div className="border border-neutral-200 rounded-md p-4 bg-neutral-50">
              <h3 className="font-semibold mb-2">Resume Builder</h3>
              <p className="text-neutral-700">
                Structured for real jobsite experience, not generic templates.
              </p>
            </div>

            <div className="border border-neutral-200 rounded-md p-4 bg-neutral-50">
              <h3 className="font-semibold mb-2">Cover Letter Generator</h3>
              <p className="text-neutral-700">
                Straightforward, honest cover letters that sound like you.
              </p>
            </div>

            <Link href="/projects" className="border border-neutral-200 rounded-md p-4 bg-neutral-50 hover:shadow-md transition">
              <h3 className="font-semibold mb-1 flex items-center justify-between">
                <span>Project Portfolio Builder</span>
                <span className="text-[10px] uppercase tracking-wide bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                  Bundle
                </span>
              </h3>
              <p className="text-neutral-700">
                Showcase the jobs that actually prove what you can do.
              </p>
            </Link>

            <div className="border border-blue-200 rounded-md p-4 bg-blue-50">
              <h3 className="font-semibold mb-1 flex items-center justify-between">
                <span>CV-1™ AI Coach</span>
                <span className="text-[10px] uppercase tracking-wide bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">Included</span>
              </h3>
              <p className="text-neutral-700">
                Your personal AI coach guides every step — suggests missing skills, rewrites weak bullets, and adds them with one click.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="w-full bg-neutral-900 py-6 px-4">
        <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-3">
          {[
            { icon: "✓", label: "One‑Time Purchase" },
            { icon: "✕", label: "No Subscription" },
            { icon: "🔒", label: "Secure Checkout" },
            { icon: "⚡", label: "Instant Access" },
          ].map((b) => (
            <div key={b.label} className="flex items-center gap-2 bg-neutral-800 border border-neutral-700 rounded-full px-4 py-2 text-sm text-neutral-200 font-medium">
              <span className="text-green-400">{b.icon}</span>
              {b.label}
            </div>
          ))}
        </div>
      </section>

      {/* PRICING PREVIEW */}
      <section className="w-full bg-neutral-50 border-t border-neutral-300 py-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-2xl font-semibold mb-8">Straightforward Pricing</h2>

          <div className="grid gap-6 md:grid-cols-3 text-sm">

            <div className="border border-neutral-200 rounded-md p-6 bg-white shadow-sm">
              <h3 className="font-semibold mb-2">Standard Resume Builder</h3>
              <p className="text-neutral-700 mb-4">
                Clean, professional resumes built for the trades.
              </p>
              <div className="text-3xl font-bold mb-2">$14.99</div>
            </div>

            <div className="border border-neutral-200 rounded-md p-6 bg-white shadow-sm">
              <h3 className="font-semibold mb-2">Cover Letter Builder</h3>
              <p className="text-neutral-700 mb-4">
                Honest, straightforward cover letters that sound like you.
              </p>
              <div className="text-3xl font-bold mb-2">$8.99</div>
            </div>

            <div className="border border-neutral-200 rounded-md p-6 bg-white shadow-sm">
              <h3 className="font-semibold mb-2">Premium Resume Builder</h3>
              <p className="text-neutral-700 mb-4">
                Unlock premium templates and upcoming tools.
              </p>
              <div className="text-3xl font-bold mb-2">$29.99</div>
            </div>

          </div>

          <Link
            href="/pricing"
            className="inline-block mt-8 px-8 py-3 rounded-md bg-neutral-900 text-neutral-50 text-sm font-semibold tracking-wide shadow-md hover:bg-neutral-800"
          >
            View Full Pricing
          </Link>
        </div>
      </section>

      {/* CTA BOTTOM */}
      <section className="w-full bg-neutral-100 border-t border-neutral-300 py-12 px-4">
        <div className="max-w-5xl mx-auto flex flex-col items-center text-center">
          <h2 className="text-2xl font-semibold mb-3">
            Ready to build a resume you’re proud of?
          </h2>
          <p className="text-neutral-700 mb-6 max-w-xl">
            Not a resume that just works, but a resume that projects confidence,
            pride, and excitement..
          </p>

          <Link
            href="/pricing"
            className="px-8 py-3 rounded-md bg-neutral-900 text-neutral-50 text-sm font-semibold tracking-wide shadow-md hover:bg-neutral-800"
          >
            Build My Resume
          </Link>
        </div>
      </section>

      {/* EMAIL SIGNUP */}
      <NewsletterSignup />

      {/* GLOBAL FOOTER */}
      <CV1Welcome />
      <Footer />

    </div>
  );
}
