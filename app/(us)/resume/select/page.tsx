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
import CV1Dynamic from "@/components/assistant/CV1Dynamic";

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
      </div>

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

      {/* CV-1 banner */}
      <div className="mb-8 rounded-2xl overflow-hidden bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 border border-blue-800/40 shadow-lg">
        <div className="flex items-center gap-6 px-6 py-5">
          <div className="flex-shrink-0 hidden sm:block">
            <CV1Dynamic size={160} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-blue-300 text-xs font-bold uppercase tracking-widest mb-1">CV-1™ AI Resume Assistant</p>
            <p className="text-white font-bold text-base leading-snug mb-1">
              Don&apos;t have an existing resume? CV-1 will guide you through every step.
            </p>
            <p className="text-blue-200/70 text-sm">
              CV-1 is built into the step-by-step builder — your personal assistant for every section, from start to finish.
            </p>
          </div>
          <div className="flex-shrink-0">
            <a href="/resume/start"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-400 text-white text-sm font-bold rounded-xl transition shadow-lg shadow-blue-500/20 whitespace-nowrap">
              Start with CV-1 →
            </a>
          </div>
        </div>
      </div>

      {/* Upload existing resume */}
      <div className="mb-8 rounded-2xl overflow-hidden border border-neutral-200 shadow-sm bg-white">
        <div className="bg-neutral-50 px-5 py-4 border-b border-neutral-200 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-neutral-200 flex items-center justify-center flex-shrink-0 text-lg">📋</div>
          <div>
            <p className="font-semibold text-sm text-neutral-900">Already have a resume? Drop it in.</p>
            <p className="text-xs text-neutral-500">Upload a PDF or Word file — AI extracts your info and pre-fills the builder so you can edit and download.</p>
          </div>
        </div>
        <div className="px-5 py-5">
          <ResumeUpload />
        </div>
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
      <div className="mt-10 flex flex-col items-end gap-2">
        {hasAccess && !selectedTemplate && (
          <p className="text-sm text-amber-600 font-medium">← Select a template above to continue</p>
        )}
        <button
          onClick={handleContinue}
          disabled={hasAccess && !selectedTemplate}
          className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {hasAccess ? "Continue to Step 2 →" : "Purchase to Continue →"}
        </button>
      </div>
    </div>
  );
}
