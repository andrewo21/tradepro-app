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
  const isResume = productId === ProductId.RESUME || productId === ProductId.BUNDLE;
  const isCoverLetter = productId === ProductId.COVER_LETTER;

  const price = {
    [ProductId.RESUME]: "$14.99",
    [ProductId.COVER_LETTER]: "$8.99",
    [ProductId.BUNDLE]: "$29.99",
    [ProductId.UPGRADE_RESUME_TO_BUNDLE]: "$15.00",
    [ProductId.UPGRADE_COVER_LETTER_TO_BUNDLE]: "$21.00",
    [ProductId.UPGRADE_BOTH_TO_BUNDLE]: "$6.01",
  }[productId] || "";

  const headline = isResume
    ? "Professional Resumes Built for the Trades"
    : "Cover Letters That Sound Like You";

  const subline = isResume
    ? "Browse all templates below. Purchase once and start building — no subscription, no gimmicks."
    : "Honest, professional cover letters powered by AI. One-time purchase, 2 downloads included.";

  const bullets = isResume
    ? [
        "8 standard templates purpose-built for trades",
        "AI-assisted writing in any language",
        "PDF export — clean, professional, ATS-ready",
        "2 PDF downloads included",
        "Upgrade to bundle for premium templates + cover letters",
      ]
    : [
        "AI-powered generation from your resume or a short description",
        "Two styles — Modern Blue or Traditional Clean",
        "PDF export ready to send",
        "2 PDF downloads included",
        "Upgrade to bundle to add the Resume Builder",
      ];

  return (
    <div className="bg-neutral-50">

      {/* Hero section */}
      <div className="bg-neutral-900 text-white py-16 px-6 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">{headline}</h1>
        <p className="text-neutral-400 max-w-xl mx-auto mb-8 text-lg">{subline}</p>

        <div className="inline-block bg-white rounded-2xl px-10 py-8 text-neutral-900 shadow-xl">
          <p className="text-sm text-neutral-500 mb-1">One-time purchase</p>
          <p className="text-5xl font-bold mb-2">{price}</p>
          <p className="text-sm text-neutral-500 mb-6">No subscription · 2 PDF downloads included</p>
          <CheckoutButton
            userId={userId}
            productId={productId}
            label={`Get Started — ${price}`}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-xl text-base transition disabled:opacity-50"
          />
          <p className="mt-4 text-xs text-neutral-400">
            Already purchased?{" "}
            <button onClick={() => window.location.reload()} className="underline hover:text-neutral-600">
              Refresh to restore access
            </button>
          </p>
        </div>
      </div>

      {/* What's included */}
      <div className="max-w-2xl mx-auto px-6 py-12">
        <h2 className="text-xl font-semibold mb-6 text-center">What's included</h2>
        <ul className="space-y-3">
          {bullets.map((b, i) => (
            <li key={i} className="flex items-start gap-3 text-neutral-700">
              <span className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">✓</span>
              <span>{b}</span>
            </li>
          ))}
        </ul>

        <div className="mt-10 text-center text-sm text-neutral-500">
          Want both? <Link href="/pricing" className="text-blue-600 hover:underline font-medium">View all options →</Link>
        </div>
      </div>

    </div>
  );
}
