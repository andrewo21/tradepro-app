"use client";

import Link from "next/link";
import CheckoutButton from "@/components/CheckoutButton";
import { ProductId } from "@/lib/pricing";
import { useEffect, useState } from "react";
import EntitlementBadge from "@/components/EntitlementBadge";
import StripeTestPanel from "@/components/StripeTestPanel";
import { getOrCreateUserId } from "@/lib/userId";
import { ModernBlueCoverLetter, TraditionalCoverLetter } from "@/components/CoverLetterTemplates";

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
                <li>• 8 Standard templates</li>
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
                  <li>• 8 Standard templates</li>
                  <li>• 6 Premium templates</li>
                  <li>• AI‑assisted writing and cleanup</li>
                  <li>• Edit until you're happy</li>
                  <li>• 2 PDF downloads per tool included</li>
                  <li>• Cover Letter Generator included</li>
                  <li>• Project List Builder (Coming Soon)</li>
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

          {/* COVER LETTER SAMPLE PREVIEW */}
          <div className="mt-16 text-left">
            <h2 className="text-2xl font-semibold text-center mb-2">See What You'll Get</h2>
            <p className="text-neutral-500 text-center text-sm mb-8">
              Two professional cover letter styles — pick the one that fits you.
            </p>
            <div className="grid gap-8 md:grid-cols-2">
              <div>
                <p className="text-sm font-semibold text-neutral-600 mb-3 text-center">Modern Blue</p>
                <ModernBlueCoverLetter data={{
                  applicantName: "James Martinez",
                  applicantEmail: "james.martinez@email.com",
                  applicantPhone: "(555) 867-5309",
                  applicantAddress: "1428 Elm Street",
                  applicantCityStateZip: "Houston, TX 77001",
                  date: "April 28, 2025",
                  hiringManager: "Mr. Dave Thompson",
                  companyName: "Thompson Industrial LLC",
                  companyAddress: "900 Commerce Blvd",
                  companyCityStateZip: "Houston, TX 77002",
                  jobTitle: "Lead Electrician",
                  letter: `Dear Mr. Thompson,\n\nWith over 12 years of hands-on experience in commercial and industrial electrical systems, I am confident in my ability to contribute immediately as your Lead Electrician. Throughout my career I have overseen panel installations, conduit runs, and full fit-outs on projects ranging from $500K to $4M, consistently delivering on time and within budget.\n\nI hold a Master Electrician license and OSHA 30 certification, and I take pride in building crews that operate safely and efficiently. My most recent role at Gulf Coast Electric saw me supervise a team of eight journeymen across three concurrent job sites while maintaining zero lost-time incidents over 18 months.\n\nI would welcome the opportunity to discuss how my background aligns with your needs.\n\nSincerely,\n\nJames Martinez`,
                }} />
              </div>
              <div>
                <p className="text-sm font-semibold text-neutral-600 mb-3 text-center">Traditional Clean</p>
                <TraditionalCoverLetter data={{
                  applicantName: "Sarah Chen",
                  applicantEmail: "sarah.chen@email.com",
                  applicantPhone: "(555) 234-5678",
                  applicantAddress: "742 Pinecrest Drive",
                  applicantCityStateZip: "Phoenix, AZ 85001",
                  date: "April 28, 2025",
                  hiringManager: "Ms. Linda Ortega",
                  companyName: "Southwest Construction Group",
                  companyAddress: "2200 N. Central Ave",
                  companyCityStateZip: "Phoenix, AZ 85004",
                  jobTitle: "Site Superintendent",
                  letter: `Dear Ms. Ortega,\n\nI am writing to express my strong interest in the Site Superintendent position at Southwest Construction Group. With eight years of progressive experience managing ground-up commercial builds from foundation to certificate of occupancy, I bring the organizational rigor and field leadership your team requires.\n\nIn my current role I coordinate subcontractors, manage RFI and submittal logs, and ensure daily GC reporting is accurate and timely. My background in concrete, steel, and MEP coordination has prepared me to anticipate conflicts before they impact the schedule.\n\nThank you for your consideration. I look forward to speaking with you.\n\nSincerely,\n\nSarah Chen`,
                }} />
              </div>
            </div>
            <div className="text-center mt-8">
              <CheckoutButton userId={userId || "anonymous"} productId={ProductId.COVER_LETTER} label="Get Cover Letter Builder — $8.99" />
            </div>
          </div>

          {process.env.NEXT_PUBLIC_STRIPE_TEST_MODE === "true" && (
            <StripeTestPanel userId={userId} initial={entitlements} />
          )}
        </div>
      </main>

      {/* GLOBAL FOOTER */}
      <Footer />
    </div>
  );
}
