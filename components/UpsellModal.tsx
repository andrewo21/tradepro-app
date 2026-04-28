"use client";

import CheckoutButton from "./CheckoutButton";
import { ProductId } from "@/lib/pricing";
import Link from "next/link";

export default function UpsellModal({
  userId,
  productId,
}: {
  userId: string;
  productId: ProductId;
}) {
  const isResume = productId === ProductId.RESUME;
  const isCoverLetter = productId === ProductId.COVER_LETTER;

  const headline = isResume
    ? "Professional Resumes Built for the Trades"
    : "Cover Letters That Sound Like You";

  const subline = isResume
    ? "Browse all templates below. Purchase once and start building — no subscription, no gimmicks."
    : "Honest, professional cover letters powered by AI. One-time purchase, 2 downloads included.";

  const bullets = isResume
    ? [
        "5 standard templates purpose-built for trades",
        "AI-assisted writing in any language",
        "PDF export — clean, professional, ATS-ready",
        "2 PDF downloads included",
      ]
    : [
        "AI-powered generation from your resume or a short description",
        "Two styles — Modern Blue or Traditional Clean",
        "PDF export ready to send",
        "2 PDF downloads included",
      ];

  const bundleBullets = [
    "All 9 templates — 5 standard + 4 premium",
    "Resume Builder included",
    "Cover Letter Generator included",
    "Project Portfolio Builder included",
    "2 PDF downloads per tool",
    "Best value — save $",
  ];

  const individualPrice = isResume ? "$14.99" : "$8.99";
  const individualLabel = isResume ? "Resume Builder Only" : "Cover Letter Only";
  const bundleSavings = isResume ? "8.99" : "14.99";

  return (
    <div className="bg-neutral-50">

      {/* Hero */}
      <div className="bg-neutral-900 text-white py-14 px-6 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">{headline}</h1>
        <p className="text-neutral-400 max-w-xl mx-auto mb-10 text-base">{subline}</p>

        {/* Two pricing cards side by side */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-stretch max-w-2xl mx-auto">

          {/* Individual option */}
          <div className="flex-1 bg-white rounded-2xl px-8 py-7 text-neutral-900 shadow-xl flex flex-col">
            <p className="text-xs text-neutral-500 uppercase tracking-wide mb-1">{individualLabel}</p>
            <p className="text-5xl font-bold mb-1">{individualPrice}</p>
            <p className="text-xs text-neutral-400 mb-5">No subscription · 2 downloads</p>
            <ul className="text-left text-sm text-neutral-600 space-y-2 mb-6 flex-1">
              {bullets.map((b, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold flex-shrink-0">✓</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
            <CheckoutButton
              userId={userId}
              productId={productId}
              label={`Get Started — ${individualPrice}`}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl text-sm transition disabled:opacity-50"
            />
          </div>

          {/* Bundle option */}
          <div className="flex-1 bg-white rounded-2xl px-8 py-7 text-neutral-900 shadow-xl flex flex-col border-2 border-amber-400 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-white text-xs font-bold px-3 py-1 rounded-full">
              Best Value
            </div>
            <p className="text-xs text-neutral-500 uppercase tracking-wide mb-1">Premium Bundle</p>
            <p className="text-5xl font-bold mb-1">$29.99</p>
            <p className="text-xs text-green-600 font-medium mb-5">Save ${bundleSavings} vs buying separately</p>
            <ul className="text-left text-sm text-neutral-600 space-y-2 mb-6 flex-1">
              {bundleBullets.map((b, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-amber-500 font-bold flex-shrink-0">✓</span>
                  <span>{b.replace("Save $", `Save $${bundleSavings}`)}</span>
                </li>
              ))}
            </ul>
            <CheckoutButton
              userId={userId}
              productId={ProductId.BUNDLE}
              label="Get Bundle — $29.99"
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 px-6 rounded-xl text-sm transition disabled:opacity-50"
            />
          </div>

        </div>

        <p className="mt-6 text-xs text-neutral-500">
          Already purchased?{" "}
          <button onClick={() => window.location.reload()} className="underline hover:text-neutral-300">
            Refresh to restore access
          </button>
        </p>
      </div>

      {/* What's included detail */}
      <div className="max-w-2xl mx-auto px-6 py-12 text-center">
        <p className="text-sm text-neutral-500">
          All purchases are one-time. No subscription. No hidden fees.{" "}
          <Link href="/pricing" className="text-blue-600 hover:underline font-medium">
            View full pricing →
          </Link>
        </p>
      </div>

    </div>
  );
}
