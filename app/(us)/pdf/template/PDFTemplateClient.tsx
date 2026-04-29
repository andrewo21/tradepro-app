"use client";

import React, { useEffect, useState } from "react";
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
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Hide the site header and any navigation elements in this print popup
    const style = document.createElement("style");
    style.id = "pdf-print-styles";
    style.textContent = `
      header, nav, footer, .menu-ui-only {
        display: none !important;
      }
      @page {
        size: letter;
        margin: 0;
        /* Suppress browser-injected header/footer (date, title, URL) */
        margin-top: 0;
        margin-bottom: 0;
      }
      @media print {
        header, nav, footer, .menu-ui-only {
          display: none !important;
        }
        * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        html, body { margin: 0; padding: 0; }
        #pdf-root { width: 100%; }
      }
      body { margin: 0; padding: 0; background: white; }
    `;
    document.head.appendChild(style);
    return () => { document.getElementById("pdf-print-styles")?.remove(); };
  }, []);

  // Signal that the template component has mounted
  useEffect(() => {
    if (ready) {
      // Give the template an extra moment to finish any internal rendering
      const timer = setTimeout(() => {
        window.print();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [ready]);

  return (
    <div id="pdf-root">
      <Template
        data={resumeData}
        premiumUnlocked={true}
        showWatermark={false}
        mode="pdf"
        // @ts-ignore — onLoad/ref not part of template props, but we use a wrapper trick
      />
      {/* Invisible sentinel: once this renders, the template chunk is loaded */}
      <span
        style={{ display: "none" }}
        ref={() => { setReady(true); }}
      />
    </div>
  );
}
