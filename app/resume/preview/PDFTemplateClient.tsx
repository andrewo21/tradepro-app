"use client";

import React from "react";
import dynamic from "next/dynamic";
import { useResumeStore } from "@/app/store/useResumeStore";

const templates = {
  "basic-two-column": dynamic(() =>
    import("@/components/templates/Standard/BasicTwoColumn")
  ),
  "modern-blue": dynamic(() =>
    import("@/components/templates/Standard/ModernBlue")
  ),
  "sidebar-green": dynamic(() =>
    import("@/components/templates/Standard/SidebarGreen")
  ),
  "standard-contemporary": dynamic(() =>
    import("@/components/templates/Standard/StandardContemporary")
  ),
  "standard-classic": dynamic(() =>
    import("@/components/templates/Standard/StandardClassic")
  ),
  "executive-classic": dynamic(() =>
    import("@/components/templates/premium/ExecutiveClassic")
  ),
  "executive-luxe": dynamic(() =>
    import("@/components/templates/premium/ExecutiveLuxe")
  ),
  "modern-elite": dynamic(() =>
    import("@/components/templates/premium/ModernElite")
  ),
  "modern-professional": dynamic(() =>
    import("@/components/templates/premium/ModernProfessional")
  ),
} as const;

interface PDFTemplateClientProps {
  templateId: string;
  resumeData: any;
}

export default function PDFTemplateClient({
  templateId,
  resumeData
}: PDFTemplateClientProps) {
  const Template = templates[templateId as keyof typeof templates];
  const showWatermark = useResumeStore((s) => s.showWatermark);

  return (
    <div id="pdf-root">
      <Template
        data={resumeData}
        premiumUnlocked={true}
        showWatermark={showWatermark}
        mode="pdf"
      />
    </div>
  );
}
