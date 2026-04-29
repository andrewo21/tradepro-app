"use client";

import Link from "next/link";
import CheckoutButton from "@/components/CheckoutButton";
import { ProductId } from "@/lib/pricing";
import { useEffect, useState } from "react";
import EntitlementBadge from "@/components/EntitlementBadge";
import StripeTestPanel from "@/components/StripeTestPanel";
import { getOrCreateUserId } from "@/lib/userId";

import Footer from "@/components/Footer";

export default function PricingPage() {
  const [userId, setUserId] = useState("anonymous");
  const [entitlements, setEntitlements] = useState<any>(null);

  useEffect(() => {
    const uid = getOrCreateUserId();
    setUserId(uid);
    async function load() {
      const res = await fetch(`/api/debug/entitlements?userId=${uid}`);
      const data = await res.json();
      setEntitlements(data.entitlements);
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900 flex flex-col">

      

      {/* MAIN CONTENT */}
      <main className="flex-1 w-full">
        <div className="max-w-5xl mx-auto px-4 py-16 text-center">

          <h1 className="text-3xl font-semibold mb-4">
            Simple, Honest Pricing
          </h1>

          <p className="text-neutral-700 mb-12 max-w-xl mx-auto">
            No subscriptions. No hidden fees. No gimmicks.
            Choose the option that fits your needs — all built with the same level of care.
          </p>

          {/* PRICING GRID */}
          <div className="grid gap-8 md:grid-cols-3 items-stretch" style={{ alignItems: "stretch" }}>

            {/* STANDARD RESUME */}
            <div className="bg-white border border-neutral-300 rounded-lg shadow-sm p-6 sm:p-8 flex flex-col">

              <h2 className="text-2xl font-semibold mb-2 min-h-[4rem] flex items-center justify-center text-center">Standard Resume Builder</h2>

              <p className="text-neutral-600 mb-6 text-center min-h-[3rem]">
                A clean, professional resume using our standard templates.
              </p>

              <div className="flex items-center justify-center mb-6">
                <div className="text-5xl font-bold">$14.99</div>
              </div>

              <ul className="text-left text-neutral-700 space-y-3 mb-8">
                <li>• 5 Standard templates</li>
                <li>• AI‑assisted writing and cleanup</li>
                <li>• Edit until you're happy</li>
                <li>• 2 PDF downloads included</li>
                <li className="opacity-60">• Premium templates (not included)</li>
                <li className="opacity-60">• Cover Letter Generator (not included)</li>
                <li className="opacity-60">• Project List Builder (not included)</li>
              </ul>

              <div className="mt-auto">
                {entitlements && (
                  <div className="mb-4">
                    <EntitlementBadge entitlements={entitlements} productId={ProductId.RESUME} />
                  </div>
                )}
                {entitlements && (entitlements.resume || entitlements.bundle) ? (
                  <button disabled className="w-full bg-green-600 text-white px-4 py-2 rounded opacity-75 cursor-default">Already Purchased</button>
                ) : (
                  <CheckoutButton userId={userId} productId={ProductId.RESUME} />
                )}
              </div>
            </div>

            {/* COVER LETTER ONLY */}
            <div className="bg-white border border-neutral-300 rounded-lg shadow-sm p-6 sm:p-8 flex flex-col">

              <h2 className="text-2xl font-semibold mb-2 min-h-[4rem] flex items-center justify-center text-center">Cover Letter Builder</h2>

              <p className="text-neutral-600 mb-6 text-center min-h-[3rem]">
                Honest, straightforward cover letters that sound like you.
              </p>

              <div className="flex items-center justify-center mb-6">
                <div className="text-5xl font-bold">$8.99</div>
              </div>

              <ul className="text-left text-neutral-700 space-y-3 mb-8">
                <li>• AI‑assisted writing</li>
                <li>• Edit until you're happy</li>
                <li>• 2 PDF downloads included</li>
                <li className="opacity-60">• Resume Builder (not included)</li>
                <li className="opacity-60">• Premium templates (not included)</li>
                <li className="opacity-60">• Project List Builder (not included)</li>
              </ul>

              <div className="mt-auto">
                {entitlements && (
                  <div className="mb-4">
                    <EntitlementBadge entitlements={entitlements} productId={ProductId.COVER_LETTER} />
                  </div>
                )}
                {entitlements && (entitlements.coverLetter || entitlements.bundle) ? (
                  <button disabled className="w-full bg-green-600 text-white px-4 py-2 rounded opacity-75 cursor-default">Already Purchased</button>
                ) : (
                  <CheckoutButton userId={userId} productId={ProductId.COVER_LETTER} />
                )}
              </div>
            </div>

            {/* PREMIUM BUNDLE */}
            <div className="relative mt-4 md:mt-0 flex flex-col">

              {/* BADGE */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow">
                Most Popular
              </div>

              <div className="bg-white border border-neutral-300 rounded-lg shadow-sm p-6 sm:p-8 flex flex-col flex-1">

                <h2 className="text-2xl font-semibold mb-2 min-h-[4rem] flex items-center justify-center text-center">Premium Resume Bundle</h2>

                <p className="text-neutral-600 mb-6 text-center min-h-[3rem]">
                  Unlock everything — premium templates, cover letters, and upcoming tools.
                </p>

                <div className="flex items-center justify-center mb-6">
                  <div className="text-5xl font-bold">$29.99</div>
                </div>

                <ul className="text-left text-neutral-700 space-y-3 mb-8">
                  <li>• All 9 templates (5 standard + 4 premium)</li>
                  <li>• AI‑assisted writing and cleanup</li>
                  <li>• Edit until you're happy</li>
                  <li>• 2 PDF downloads per tool included</li>
                  <li>• Cover Letter Generator included</li>
                  <li>• Project Portfolio Builder included</li>
                </ul>

                <div className="mt-auto">
                  {entitlements && (
                    <div className="mb-4">
                      <EntitlementBadge entitlements={entitlements} productId={ProductId.BUNDLE} />
                    </div>
                  )}
                  {entitlements && entitlements.bundle ? (
                    <button disabled className="w-full bg-green-600 text-white px-4 py-2 rounded opacity-75 cursor-default">Already Purchased</button>
                  ) : (
                    <CheckoutButton userId={userId} productId={ProductId.BUNDLE} />
                  )}
                </div>
              </div>
            </div>

          </div>

          <p className="text-neutral-500 text-xs mt-10">
            One‑time purchase per session. Edit freely — 2 PDF downloads included per tool.
          </p>


          {process.env.NEXT_PUBLIC_STRIPE_TEST_MODE === "true" && (
            <StripeTestPanel userId={userId} initial={entitlements} />
          )}

          {/* FAQ */}
          <div className="mt-16 max-w-2xl mx-auto text-left">
            <h2 className="text-2xl font-semibold text-center mb-8">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                { q: "Is this a subscription?", a: "No. TradePro is a one-time purchase. You pay once and get ongoing access to the tools included in your plan." },
                { q: "Do I need to be good with computers to use this?", a: "No. If you can fill out a simple form, you can use TradePro. It's built for real-world workers, not just office careers." },
                { q: "Will this work if my resume is a mess?", a: "Yes. TradePro is designed to take messy, outdated resumes and turn them into clean, professional documents that get callbacks." },
                { q: "Can I use this if I've never had a resume before?", a: "Yes. You can start from scratch and TradePro will help you build a resume step by step." },
                { q: "What if I don't like the result?", a: "You can regenerate sections, tweak the wording, and download as many times as you need until you're happy — within your 2 included downloads." },
              ].map((item, i) => (
                <details key={i} className="bg-white border border-neutral-200 rounded-xl group">
                  <summary className="px-6 py-4 cursor-pointer font-medium text-neutral-900 list-none flex justify-between items-center hover:bg-neutral-50 rounded-xl">
                    {item.q}
                    <span className="text-neutral-400 group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <div className="px-6 pb-4 text-sm text-neutral-600 leading-relaxed">{item.a}</div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* GLOBAL FOOTER */}
      <Footer />
    </div>
  );
}
