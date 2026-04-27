"use client";

import React, { useEffect } from "react";
import dynamic from "next/dynamic";

const templates = {
  "basic-two-column": dynamic(() => import("@/components/templates/Standard/BasicTwoColumn")),
  "modern-blue": dynamic(() => import("@/components/templates/Standard/ModernBlue")),
  "sidebar-green": dynamic(() => import("@/components/templates/Standard/SidebarGreen")),
  "standard-contemporary": dynamic(() => import("@/components/templates/Standard/StandardContemporary")),
  "standard-classic": dynamic(() => import("@/components/templates/Standard/StandardClassic")),
  "executive-classic": dynamic(() => import("@/components/templates/premium/ExecutiveClassic")),
  "executive-luxe": dynamic(() => import("@/components/templates/premium/ExecutiveLuxe")),
  "modern-elite": dynamic(() => import("@/components/templates/premium/ModernElite")),
  "modern-professional": dynamic(() => import("@/components/templates/premium/ModernProfessional")),
} as const;

interface PDFTemplateClientProps {
  templateId: string;
  resumeData: any;
}

export default function PDFTemplateClient({ templateId, resumeData }: PDFTemplateClientProps) {
  const Template = templates[templateId as keyof typeof templates] || templates["sidebar-green"];

  useEffect(() => {
    // Inject print-friendly CSS so backgrounds, colors, and sidebar colors render correctly in print/PDF
    const style = document.createElement("style");
    style.textContent = `
      @media print {
        * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        body { margin: 0; padding: 0; }
        #pdf-root { width: 100%; }
      }
      body { margin: 0; padding: 0; background: white; }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  return (
    <div id="pdf-root">
      <Template
        data={resumeData}
        premiumUnlocked={true}
        showWatermark={false}
        mode="pdf"
      />
    </div>
  );
}
