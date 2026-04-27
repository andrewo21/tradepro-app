"use client";

import { useResumeStore } from "@/app/store/useResumeStore";
import { useState } from "react";
import Link from "next/link";
import { templates } from "@/components/templates";
import type { TemplateKey } from "@/components/templates";

export default function ResumePreviewPage() {
  const { 
    personalInfo, 
    summary, 
    skills, 
    experience, 
    education, 
    selectedTemplate, 
    premiumUnlocked,
    showWatermark 
  } = useResumeStore();
  
  const [loading, setLoading] = useState(false);

  // Safe data mapping (string-only values for template rendering)
  const previewData = {
    name: `${personalInfo.firstName || ""} ${personalInfo.lastName || ""}`.trim(),
    title: personalInfo.tradeTitle || "",
    contact: {
      phone: personalInfo.phone || "",
      email: personalInfo.email || "",
      location: `${personalInfo.city || ""}${personalInfo.city && personalInfo.state ? ", " : ""}${personalInfo.state || ""}`,
    },
    summary: summary || "",
    experience: experience.map((exp: any) => ({
      jobTitle: exp.jobTitle || "",
      company: exp.company || "",
      startDate: exp.startDate || "",
      endDate: exp.endDate || "",
      responsibilities: exp.responsibilities?.map((r: any) => r.text || "").filter(Boolean) || [],
      achievements: exp.achievements?.map((a: any) => a.text || "").filter(Boolean) || [],
    })),
    education: education || [],
    skills: skills?.map((s: any) => s.text || "").filter(Boolean) || [],
    certifications: [],
  };

  /**
   * Opens the React-rendered template in a dedicated print popup window.
   * The PDF page itself hides the site header and auto-triggers window.print()
   * once the template has fully mounted.
   */
  const handleDownloadPDF = () => {
    setLoading(true);
    try {
      const payload = {
        templateId: selectedTemplate || "sidebar-green",
        resumeData: previewData,
      };
      const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
      const printUrl = `/pdf/template?payload=${encoded}`;

      const win = window.open(printUrl, "_blank", "width=900,height=1200");
      if (!win) {
        alert("Please allow popups for this site to download your resume.");
        setLoading(false);
        return;
      }

      // The PDF page triggers its own print dialog after the template renders.
      // Reset the button state after a safe delay.
      setTimeout(() => {
        setLoading(false);
      }, 4000);
    } catch (err) {
      alert("PDF Error. Please try again.");
      setLoading(false);
    }
  };

  // 2. SAFE COMPONENT LOOKUP
  const TemplateEntry = templates[selectedTemplate as TemplateKey];
  const TemplateComponent = TemplateEntry?.component;

  return (
    <div className="max-w-6xl mx-auto py-10 px-6">
      <div className="flex justify-between items-center border-b pb-6 mb-10">
        <div>
          <h1 className="text-3xl font-bold">Final Preview</h1>
          <p className="text-sm text-slate-500 capitalize tracking-wide">
            Design Style: <span className="text-blue-600 font-bold">{selectedTemplate?.replace('-', ' ') || 'Default'}</span>
          </p>
        </div>
        <div className="flex gap-4">
          <Link href="/resume/personal" className="px-4 py-2 border rounded hover:bg-gray-50 transition">Edit Details</Link>
          <button 
            onClick={handleDownloadPDF} 
            disabled={loading} 
            className="px-6 py-2 bg-blue-600 text-white rounded font-bold shadow-lg hover:bg-blue-700 disabled:bg-slate-400 transition"
          >
            {loading ? "Generating..." : "Download Resume PDF"}
          </button>
        </div>
      </div>

      <div className="bg-white shadow-2xl rounded-lg overflow-hidden border">
        {TemplateComponent ? (
          <TemplateComponent 
            data={previewData} 
            mode="preview" 
            premiumUnlocked={premiumUnlocked}
            showWatermark={showWatermark}
          />
        ) : (
          <div className="p-20 text-center text-slate-400">
            Select a design in the first step to preview it here.
          </div>
        )}
      </div>
    </div>
  );
}
