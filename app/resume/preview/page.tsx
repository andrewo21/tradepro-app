"use client";

import { useResumeStore } from "@/app/store/useResumeStore";
import { useState, useEffect } from "react";
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
  const API_BASE = process.env.NEXT_PUBLIC_API_URL;

  // 1. DYNAMIC PREVIEW DATA MAPPING
  // We map objects to simple strings here to prevent the "Objects are not valid as a React child" error.
  const previewData = {
    name: `${personalInfo.firstName || ""} ${personalInfo.lastName || ""}`,
    title: personalInfo.tradeTitle || "",
    contact: {
      phone: personalInfo.phone || "",
      email: personalInfo.email || "",
      location: `${personalInfo.city || ""}${personalInfo.city && personalInfo.state ? ", " : ""}${personalInfo.state || ""}`,
    },
    summary: summary || "",
    experience: experience.map((exp: any) => ({
      jobTitle: exp.jobTitle || "Job Title",
      company: exp.company || "Company Name",
      startDate: exp.startDate || "",
      endDate: exp.endDate || "",
      responsibilities: exp.responsibilities?.map((r: any) => r.text || "") || [],
      achievements: exp.achievements?.map((a: any) => a.text || "") || [],
    })),
    education: education || [],
    skills: skills?.map((s: any) => s.text || "") || [],
    certifications: [],
  };

  const handleDownloadPDF = async () => {
    if (!API_BASE) return alert("API not configured.");
    setLoading(true);
    
    try {
      const res = await fetch(`${API_BASE}/api/export/pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "resume",
          selectedTemplate: selectedTemplate,
          applicantName: previewData.name,
          tradeTitle: previewData.title,
          applicantEmail: previewData.contact.email,
          applicantPhone: previewData.contact.phone,
          applicantAddress: previewData.contact.location,
          summary: previewData.summary,
          skills: previewData.skills,
          // Sending full experience objects so Render can loop through bullets correctly
          experience: experience.map((exp: any) => ({
            jobTitle: exp.jobTitle,
            company: exp.company,
            responsibilities: exp.responsibilities || []
          }))
        }),
      });

      if (!res.ok) throw new Error("Server failed to generate PDF");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${personalInfo.lastName || "TradePro"}_Resume.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) { 
      console.error("PDF Download Error:", err);
      alert("Resume PDF Error. Please check if the server is live."); 
    } finally { 
      setLoading(false);
    }
  };

  const TemplateComponent = templates[selectedTemplate as TemplateKey]?.component;

  return (
    <div className="max-w-6xl mx-auto py-10 px-6 min-h-screen">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row justify-between items-center border-b pb-6 mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Final Preview</h1>
          <p className="text-sm text-slate-500 capitalize tracking-wide">
            Selected Style: <span className="text-blue-600 font-bold">{selectedTemplate?.replace('-', ' ')}</span>
          </p>
        </div>
        <div className="flex gap-4">
          <Link 
            href="/resume/personal" 
            className="px-4 py-2 border border-slate-300 rounded hover:bg-slate-50 transition font-medium text-slate-700"
          >
            Edit Details
          </Link>
          <button 
            onClick={handleDownloadPDF} 
            disabled={loading} 
            className="px-8 py-2 bg-blue-600 text-white rounded font-bold shadow-lg hover:bg-blue-700 disabled:bg-slate-400 transition flex items-center gap-2"
          >
            {loading ? (
              <>
                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                Generating...
              </>
            ) : "Download Resume PDF"}
          </button>
        </div>
      </div>

      {/* The Visual Preview Pane */}
      <div className="bg-white shadow-2xl rounded-xl overflow-hidden border border-slate-200">
        {TemplateComponent ? (
          <div className="transform origin-top transition-all duration-500">
            <TemplateComponent 
              data={previewData} 
              mode="preview" 
              premiumUnlocked={premiumUnlocked}
              showWatermark={showWatermark}
            />
          </div>
        ) : (
          <div className="p-32 text-center">
            <p className="text-slate-400 text-lg mb-4">No template layout found.</p>
            <Link href="/resume/select" className="text-blue-600 font-bold underline">
              Return to Template Selection
            </Link>
          </div>
        )}
      </div>
      
      <div className="mt-10 text-center text-slate-400 text-xs">
        © {new Date().getFullYear()} TradePro Tech AI - Construction Career Tools
      </div>
    </div>
  );
}
