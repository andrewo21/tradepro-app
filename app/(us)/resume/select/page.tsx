"use client";

import { useResumeStore } from "@/app/store/useResumeStore";
import { templateList } from "@/components/templates/templateList";
import TemplateWrapper from "@/components/templates/TemplateWrapper";
import PreviewPane from "./previewPane";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getOrCreateUserId } from "@/lib/userId";
import ResumeUpload from "@/components/ResumeUpload";
import InstallPrompt from "@/components/InstallPrompt";
import TargetedResumeBuilder from "@/components/TargetedResumeBuilder";

export default function SelectPage() {
  const selectedTemplate = useResumeStore((s) => s.selectedTemplate);
  const setSelectedTemplate = useResumeStore((s) => s.setSelectedTemplate);
  const premiumUnlocked = useResumeStore((s) => s.premiumUnlocked);
  const [showPremiumNotice, setShowPremiumNotice] = useState(false);
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);

  const router = useRouter();

  // Check entitlement so the CTA and Continue button reflect purchase status
  useEffect(() => {
    const uid = getOrCreateUserId();
    fetch(`/api/debug/entitlements?userId=${uid}`)
      .then(r => r.json())
      .then(data => {
        const e = data.entitlements;
        setHasAccess(!!(e?.resume || e?.bundle));
      })
      .catch(() => setHasAccess(false));
  }, []);

  function handleContinue() {
    if (hasAccess) {
      router.push("/resume/personal");
    } else {
      router.push("/pricing");
    }
  }

  return (
    <div className="min-h-screen bg-neutral-100 px-4 py-8 sm:p-10">

      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-semibold">Choose Your Template</h1>
        {!hasAccess && (
          <Link
            href="/pricing"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
          >
            Unlock Builder — from $14.99
          </Link>
        )}
      </div>

      {!hasAccess && (
        <p className="text-neutral-500 text-sm mb-6">
          Browse all templates below. Purchase to start building your resume.
        </p>
      )}

      {/* Premium notice banner */}
      {showPremiumNotice && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-300 rounded-lg flex items-center justify-between gap-4">
          <div>
            <p className="text-amber-800 font-semibold text-sm">Premium Template — $29.99</p>
            <p className="text-amber-700 text-sm">
              This template is included in the Premium Bundle. Get all 9 templates + Cover Letter Generator.
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Link
              href="/pricing"
              className="px-4 py-2 bg-amber-500 text-white rounded text-sm font-semibold hover:bg-amber-600 transition"
            >
              Get Bundle — $29.99
            </Link>
            <button
              onClick={() => setShowPremiumNotice(false)}
              className="px-3 py-2 text-amber-700 hover:text-amber-900 text-sm"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <InstallPrompt />

      {/* Upload options — visually differentiated */}
      <div className="mb-8 space-y-3">

        {/* PRIMARY: Targeted resume (job-specific) */}
        <div className="relative rounded-2xl overflow-hidden shadow-md border-2 border-blue-500">
          {/* Header band */}
          <div className="bg-gradient-to-r from-blue-700 to-blue-600 px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">🎯</span>
              <div>
                <p className="font-bold text-white text-sm leading-tight">Build a Resume for a Specific Job</p>
                <p className="text-blue-200 text-xs">AI-optimized for your target role</p>
              </div>
            </div>
            <span className="bg-white text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap">
              Best Results
            </span>
          </div>

          {/* Feature pills */}
          <div className="bg-blue-50 px-5 py-2.5 flex flex-wrap gap-2 border-b border-blue-100">
            {["Matches job requirements", "Rewrites every bullet", "ATS score tracker", "Preserves all experience"].map(f => (
              <span key={f} className="text-xs bg-white border border-blue-200 text-blue-700 px-2.5 py-0.5 rounded-full font-medium">{f}</span>
            ))}
          </div>

          {/* Form */}
          <div className="bg-white px-5 py-5">
            <TargetedResumeBuilder />
          </div>
        </div>

        {/* SECONDARY: Simple clean-up */}
        <details className="rounded-2xl overflow-hidden border border-neutral-200 shadow-sm bg-white group">
          <summary className="px-5 py-4 cursor-pointer list-none flex items-center gap-3 hover:bg-neutral-50 transition">
            <div className="w-9 h-9 rounded-xl bg-neutral-100 flex items-center justify-center flex-shrink-0 text-lg">📋</div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-neutral-900">Clean Up an Existing Resume</p>
              <p className="text-xs text-neutral-500 truncate">Upload your resume — we pre-fill the builder so you can edit and download.</p>
            </div>
            <span className="text-neutral-300 text-xs font-medium group-open:hidden">TAP TO EXPAND</span>
            <span className="text-neutral-400 text-sm hidden group-open:block">▲</span>
          </summary>
          <div className="px-5 pb-5 pt-1 border-t border-neutral-100">
            <p className="text-xs text-neutral-500 mb-3">No job description needed. Your info gets extracted and dropped into the builder — you review and edit everything.</p>
            <ResumeUpload />
          </div>
        </details>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

        {/* LEFT — TEMPLATE LIST */}
        <div className="space-y-4">
          {templateList.map((t) => (
            <TemplateWrapper
              key={t.key}
              name={t.name}
              premium={t.premium}
              selected={selectedTemplate === t.key}
              onClick={() => {
                setSelectedTemplate(t.key);
                if (t.premium && !premiumUnlocked) {
                  setShowPremiumNotice(true);
                } else {
                  setShowPremiumNotice(false);
                }
              }}
            />
          ))}
        </div>

        {/* RIGHT — PREVIEW sticky so it follows the user as they scroll the template list */}
        <div className="w-full lg:sticky lg:top-6 lg:self-start">
          <PreviewPane />
          {!hasAccess && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
              <p className="text-blue-800 font-semibold mb-2">Ready to build your resume?</p>
              <p className="text-blue-700 text-sm mb-3">
                Purchase to remove the watermark and start filling in your details.
              </p>
              <Link
                href="/pricing"
                className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Get Started — from $14.99
              </Link>
            </div>
          )}
        </div>

      </div>

      {/* Continue Button */}
      <div className="mt-10 flex justify-end">
        <button
          onClick={handleContinue}
          className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          {hasAccess ? "Continue to Step 2 →" : "Purchase to Continue →"}
        </button>
      </div>
    </div>
  );
}
