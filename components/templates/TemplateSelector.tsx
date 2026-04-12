"use client";

import { templateList, TemplateKey } from "@/components/templates/templateList";
import TemplateWrapper from "@/components/templates/TemplateWrapper";
import { useResumeStore } from "@/app/store/useResumeStore";

export default function TemplateSelector() {
  const selectedTemplate = useResumeStore((s) => s.selectedTemplate);
  const setSelectedTemplate = useResumeStore((s) => s.setSelectedTemplate);
  const premiumUnlocked = useResumeStore((s) => s.premiumUnlocked);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
  );
}
