"use client";

import { templates, TemplateKey } from "@/components/templates";
import { useResumeStore } from "@/app/store/useResumeStore";

interface ResumePreviewProps {
  template: TemplateKey;
  data: any;
  mode: "preview" | "pdf";
  premiumUnlocked?: boolean;
}

export default function ResumePreview({
  template,
  data,
  mode,
  premiumUnlocked,
}: ResumePreviewProps) {
  const entry = templates[template];

  if (!entry) {
    return <div className="p-6 text-neutral-600">Template not found.</div>;
  }

  const Template = entry.component;

  // ⭐ Pull the new override flag from the store
  const showWatermark = useResumeStore((s) => s.showWatermark);

  const unlocked = premiumUnlocked ?? false;

  return (
    <div className="w-full">
      <Template
        data={data}
        premiumUnlocked={unlocked}
        showWatermark={showWatermark}   // ⭐ NEW
        mode={mode}
      />
    </div>
  );
}
