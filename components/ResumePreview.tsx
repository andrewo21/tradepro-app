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
  // Get the template entry object
  const entry = templates[template];

  // If template key is invalid
  if (!entry || !entry.component) {
    return (
      <div className="p-6 text-neutral-600">
        Template not found.
      </div>
    );
  }

  // Extract the actual React component
  const Template = entry.component;

  // Pull watermark override from store
  const showWatermark = useResumeStore((s) => s.showWatermark);

  // Premium flag
  const unlocked = premiumUnlocked ?? false;

  return (
    <div className="w-full">
      <Template
        data={data}
        premiumUnlocked={unlocked}
        showWatermark={showWatermark}
        mode={mode}
      />
    </div>
  );
}
