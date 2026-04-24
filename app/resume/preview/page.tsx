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
  const API_BASE = process.env.NEXT_PUBLIC_API_URL;

  // 1. Map data for the Template Component
  const resumeData = {
    name: `${personalInfo.firstName || ""} ${personalInfo.lastName || ""}`,
    title: personalInfo.tradeTitle || "",
    contact: {
      phone: personalInfo.phone || "",
      email: personalInfo.email || "",
      location: `${personalInfo.city || ""}, ${personalInfo.state || ""}`,
    },
    summary: summary || "",
    experience: experience.map((exp: any) => ({
      jobTitle: exp.jobTitle,
      company: exp.company,
      startDate: exp.startDate,
      endDate: exp.endDate,
      responsibilities: exp.responsibilities.map((r: any) => r.text),
      achievements: exp.achievements?.map((a: any) => a.text) || [],
    })),
    education: education || [],
    skills: skills.map((s: any) => s.text),
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
          applicantName: resumeData.name,
          applicantEmail: resumeData.contact.email,
          applicantPhone: resumeData.contact.phone,
          applicantAddress: resumeData.contact.location,
          summary: resumeData.summary,
          skills: skills.map((s: any) => s.text),
          experience: experience 
        }),
      });

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${personalInfo.lastName || "Resume"}_TradePro.pdf`;
      a.click();
    } catch (err) { 
      alert("PDF Error."); 
    } finally { 
      setLoading(false); // FIXED: Correct variable name
    }
  };

  const TemplateComponent = templates[selectedTemplate as TemplateKey]?.component;

  return (
    <div className="max-w-6xl mx-auto py-10 px-6">
      <div className="flex justify-between items-center border-b pb-6 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Final Preview</h1>
          <p className="text-sm text-slate-500 capitalize">Design: {selectedTemplate.replace('-', ' ')}</p>
        </div>
        <div className="flex gap-4">
          <Link href="/resume/personal" className="px-4 py-2 border rounded hover:bg-gray-50 transition">
            Edit Details
          </Link>
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
            data={resumeData} 
            mode="preview" 
            premiumUnlocked={premiumUnlocked}
            showWatermark={showWatermark} // FIXED: Added missing prop
          />
        ) : (
          <div className="p-20 text-center text-slate-400">
            Template not found. Please go back and select one.
          </div>
        )}
      </div>
    </div>
  );
}
