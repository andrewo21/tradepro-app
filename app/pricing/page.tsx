"use client";

import Link from "next/link";
import CheckoutButton from "@/components/CheckoutButton";
import { ProductId } from "@/lib/pricing";
import { useEffect, useState } from "react";
import EntitlementBadge from "@/components/EntitlementBadge";

// NEW imports

import Footer from "@/components/Footer";

export default function PricingPage() {
  const userId = "demo-user";

  const [entitlements, setEntitlements] = useState<any>(null);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/debug/entitlements?userId=${userId}`);
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
          <div className="grid gap-8 md:grid-cols-3 items-stretch">

            {/* STANDARD RESUME */}
            <div className="bg-white border border-neutral-300 rounded-lg shadow-sm p-8 flex flex-col h-full">

              <h2 className="text-2xl font-semibold mb-2">Standard Resume Builder</h2>

              <p className="text-neutral-600 mb-6 h-16 flex items-center justify-center text-center">
                A clean, professional resume using our standard templates.
              </p>

              <div className="h-24 flex items-center justify-center -mt-1">
                <div className="text-5xl font-bold">$14.99</div>
              </div>

              <ul className="text-left text-neutral-700 space-y-3 mb-8 h-64">
                <li>• 8 Standard templates</li>
                <li>• AI‑assisted writing and cleanup</li>
                <li>• Unlimited edits</li>
                <li>• PDF export included</li>
                <li className="opacity-60">• Premium templates (not included)</li>
                <li className="opacity-60">• Cover Letter Generator (not included)</li>
                <li className="opacity-60">• Project List Builder (not included)</li>
              </ul>

              <div className="mt-auto">
                {entitlements && (
                  <div className="mb-4">
                    <EntitlementBadge entitlements={entitlements} />
                  </div>
                )}
                <CheckoutButton userId={userId} productId={ProductId.RESUME} />
              </div>
            </div>

            {/* COVER LETTER ONLY */}
            <div className="bg-white border border-neutral-300 rounded-lg shadow-sm p-8 flex flex-col h-full">

              <h2 className="text-2xl font-semibold mb-2">Cover Letter Builder</h2>

              <p className="text-neutral-600 mb-6 h-16 flex items-center justify-center text-center">
                Honest, straightforward cover letters that sound like you.
              </p>

              <div className="h-24 flex items-center justify-center mt-7">
                <div className="text-5xl font-bold">$8.99</div>
              </div>

              <ul className="text-left text-neutral-700 space-y-3 mb-8 h-64">
                <li>• AI‑assisted writing</li>
                <li>• Unlimited edits</li>
                <li>• PDF export included</li>
                <li className="opacity-60">• Resume Builder (not included)</li>
                <li className="opacity-60">• Premium templates (not included)</li>
                <li className="opacity-60">• Project List Builder (not included)</li>
              </ul>

              <div className="mt-auto">
                {entitlements && (
                  <div className="mb-4">
                    <EntitlementBadge entitlements={entitlements} />
                  </div>
                )}
                <CheckoutButton userId={userId} productId={ProductId.COVER_LETTER} />
              </div>
            </div>

            {/* PREMIUM BUNDLE */}
            <div className="relative">

              {/* BADGE */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow">
                Most Popular
              </div>

              <div className="bg-white border border-neutral-300 rounded-lg shadow-sm p-8 flex flex-col h-full">

                <h2 className="text-2xl font-semibold mb-2">Premium Resume Bundle</h2>

                <p className="text-neutral-600 mb-6 h-16 flex items-center justify-center text-center">
                  Unlock everything — premium templates, cover letters, and upcoming tools.
                </p>

                <div className="h-24 flex items-center justify-center">
                  <div className="text-5xl font-bold">$29.99</div>
                </div>

                <ul className="text-left text-neutral-700 space-y-3 mb-8 h-64">
                  <li>• 8 Standard templates</li>
                  <li>• 6 Premium templates</li>
                  <li>• AI‑assisted writing and cleanup</li>
                  <li>• Unlimited edits</li>
                  <li>• PDF export included</li>
                  <li>• Cover Letter Generator included</li>
                  <li>• Project List Builder (Coming Soon)</li>
                </ul>

                <div className="mt-auto">
                  {entitlements && (
                    <div className="mb-4">
                      <EntitlementBadge entitlements={entitlements} />
                    </div>
                  )}
                  <CheckoutButton userId={userId} productId={ProductId.BUNDLE} />
                </div>
              </div>
            </div>

          </div>

          <p className="text-neutral-500 text-xs mt-10">
            One‑time purchase. Lifetime access to all features included in your tier.
          </p>
        </div>
      </main>

      {/* GLOBAL FOOTER */}
      <Footer />
    </div>
  );
}
