"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Footer from "@/components/Footer";

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
  "Safety‑Focused",
  "Problem‑Solving",
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

      {/* TESTIMONIALS */}
      <section className="w-full bg-neutral-100 border-t border-neutral-300 pt-20 pb-12 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-semibold text-center mb-8">
            What tradespeople are saying
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="bg-white border border-neutral-200 rounded-md p-4 shadow-sm">
              <p className="text-sm text-neutral-800 mb-3">
                “TradePro helped me turn years of jobsite experience into a
                resume I’m proud to hand over.”
              </p>
              <p className="text-xs text-neutral-500 font-medium">
                — Miguel, Commercial Electrician
              </p>
            </div>
            <div className="bg-white border border-neutral-200 rounded-md p-4 shadow-sm">
              <p className="text-sm text-neutral-800 mb-3">
                “Cleanest resume I’ve ever had. No fluff, no gimmicks — just my
                work, presented right.”
              </p>
              <p className="text-xs text-neutral-500 font-medium">
                — Dana, Site Superintendent
              </p>
            </div>
            <div className="bg-white border border-neutral-200 rounded-md p-4 shadow-sm">
              <p className="text-sm text-neutral-800 mb-3">
                “Finally something built for trades, not office jobs. It feels
                like it understands how we work.”
              </p>
              <p className="text-xs text-neutral-500 font-medium">
                — Chris, HVAC Technician
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* VIDEO SECTION */}
      <section className="w-full bg-neutral-50 border-t border-neutral-200 py-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-semibold mb-3">
            See TradePro Transform a Resume in Minutes
          </h2>
          <p className="text-neutral-600 mb-8 max-w-2xl mx-auto">
            Turn real work experience into a clean, professional resume — fast, simple, and stress‑free.
          </p>
          <div className="max-w-3xl mx-auto aspect-video bg-neutral-200 border border-dashed border-neutral-400 rounded-md flex items-center justify-center text-neutral-600 text-sm mb-8">
            Video walkthrough coming soon
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

            <div className="border border-neutral-200 rounded-md p-4 bg-neutral-50 opacity-60">
              <h3 className="font-semibold mb-1 flex items-center justify-between">
                <span>More Tools</span>
                <span className="text-[10px] uppercase tracking-wide bg-neutral-200 px-1.5 py-0.5 rounded">In Development</span>
              </h3>
              <p className="text-neutral-700">
                A growing toolkit built around how tradespeople actually work.
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
      <Footer />

    </div>
  );
}
