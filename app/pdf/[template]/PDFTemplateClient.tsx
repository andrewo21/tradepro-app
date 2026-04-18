"use client";

import React from "react";
import dynamic from "next/dynamic";
import { useResumeStore } from "@/app/store/useResumeStore";   // ⭐ NEW

// Dynamically load templates on the client
const templates = {
  // STANDARD
  "basic-two-column": dynamic(() =>
    import("@/pdf-service/components/templates/Standard/BasicTwoColumn")
  ),
  "modern-blue": dynamic(() =>
    import("@/pdf-service/components/templates/Standard/ModernBlue")
  ),
  "sidebar-green": dynamic(() =>
    import("@/pdf-service/components/templates/Standard/SidebarGreen")
  ),
  "standard-contemporary": dynamic(() =>
    import("@/pdf-service/components/templates/Standard/StandardContemporary")
  ),
  "standard-classic": dynamic(() =>
    import("@/pdf-service/components/templates/Standard/StandardClassic")
  ), // ⭐ NEW

  // PREMIUM
  "executive-classic": dynamic(() =>
    import("@/pdf-service/components/templates/premium/ExecutiveClassic")
  ),
  "executive-luxe": dynamic(() =>
    import("@/pdf-service/components/templates/premium/ExecutiveLuxe")
  ),
  "modern-elite": dynamic(() =>
    import("@/pdf-service/components/templates/premium/ModernElite")
  ),
  "modern-professional": dynamic(() =>
    import("@/pdf-service/components/templates/premium/ModernProfessional")
  ),
} as const;

interface PDFTemplateClientProps {
  templateId: string;
}

export default function PDFTemplateClient({ templateId }: PDFTemplateClientProps) {
  const Template = templates[templateId as keyof typeof templates];

  const [resumeData, setResumeData] = React.useState<any | null>(null);

  // ⭐ NEW — pull watermark flag from store
  const showWatermark = useResumeStore((s) => s.showWatermark);

  React.useEffect(() => {
    (async () => {
      try {
        const payload = await (window as any).__INJECT_RESUME_DATA__();
        console.log("[PDF] Injected resumeData:", payload.resumeData);
        setResumeData(payload.resumeData || {});
      } catch (err) {
        console.error("Failed to inject resume data:", err);
      }
    })();
  }, []);

  React.useEffect(() => {
    if (resumeData) {
      (window as any).__RESUME_DATA_READY__ = true;
    }
  }, [resumeData]);

  if (!resumeData) {
    return <div>Loading PDF…</div>;
  }

  return (
    <div id="pdf-root">
      <Template
        data={resumeData}
        premiumUnlocked={true}
        showWatermark={showWatermark}   // ⭐ FIXED
        mode="pdf"
      />
    </div>
  );
}
