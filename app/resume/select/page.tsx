"use client";

import { useResumeStore } from "@/app/store/useResumeStore";
import { templateList } from "@/components/templates/templateList";
import TemplateWrapper from "@/components/templates/TemplateWrapper";
import PreviewPane from "./previewPane";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function SelectPage() {
  const selectedTemplate = useResumeStore((s) => s.selectedTemplate);
  const setSelectedTemplate = useResumeStore((s) => s.setSelectedTemplate);
  const premiumUnlocked = useResumeStore((s) => s.premiumUnlocked);
  const [showPremiumNotice, setShowPremiumNotice] = useState(false);

  const router = useRouter();

  return (
    <div className="min-h-screen bg-neutral-100 px-4 py-8 sm:p-10">
      <h1 className="text-2xl font-semibold mb-6">Choose Your Template</h1>

      {/* Premium notice banner */}
      {showPremiumNotice && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-300 rounded-lg flex items-center justify-between gap-4">
          <div>
            <p className="text-amber-800 font-semibold text-sm">
              Premium Template Preview
            </p>
            <p className="text-amber-700 text-sm">
              You're previewing a premium template. Upgrade to unlock it for your final resume.
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Link
              href="/pricing"
              className="px-4 py-2 bg-amber-500 text-white rounded text-sm font-semibold hover:bg-amber-600 transition"
            >
              Upgrade
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

      {/* 
        FIXED TWO-COLUMN LAYOUT
        LEFT: Template List
        RIGHT: Live Preview
      */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

        {/* LEFT COLUMN — TEMPLATE LIST */}
        <div className="space-y-4">
          {templateList.map((t) => (
            <TemplateWrapper
              key={t.key}
              name={t.name}
              premium={t.premium}
              selected={selectedTemplate === t.key}
              onClick={() => {
                // Always allow previewing any template (standard or premium)
                setSelectedTemplate(t.key);
                // Show upgrade notice when clicking a premium template without access
                if (t.premium && !premiumUnlocked) {
                  setShowPremiumNotice(true);
                } else {
                  setShowPremiumNotice(false);
                }
              }}
            />
          ))}
        </div>

        {/* RIGHT COLUMN — PREVIEW */}
        <div className="w-full">
          <PreviewPane />
        </div>

      </div>

      {/* Continue Button */}
      <div className="mt-10 flex justify-end">
        <button
          onClick={() => router.push("/resume/personal")}
          className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          Continue to Step 2
        </button>
      </div>
    </div>
  );
}
