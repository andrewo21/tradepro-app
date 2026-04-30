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

      {/* Resume Upload — pre-fill builder from existing PDF */}
      <div className="mb-6 bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">⚡</span>
          <div>
            <p className="font-semibold text-sm text-neutral-900">Already have a resume? Upload it and we'll pre-fill everything.</p>
            <p className="text-xs text-neutral-500">AI extracts your info and drops you straight into the builder — review and edit from there.</p>
          </div>
        </div>
        <ResumeUpload />
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
