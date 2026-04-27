"use client";

import { useResumeStore } from "@/app/store/useResumeStore";
import { templateList } from "@/components/templates/templateList";
import TemplateWrapper from "@/components/templates/TemplateWrapper";
import PreviewPane from "./previewPane";
import { useRouter } from "next/navigation";

export default function SelectPage() {
  const selectedTemplate = useResumeStore((s) => s.selectedTemplate);
  const setSelectedTemplate = useResumeStore((s) => s.setSelectedTemplate);
  const premiumUnlocked = useResumeStore((s) => s.premiumUnlocked);

  const router = useRouter();

  return (
    <div className="min-h-screen bg-neutral-100 px-4 py-8 sm:p-10">
      <h1 className="text-2xl font-semibold mb-6">Choose Your Template</h1>

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
                if (!t.premium || premiumUnlocked) {
                  setSelectedTemplate(t.key);
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
