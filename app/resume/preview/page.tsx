"use client";

import { useResumeStore } from "@/app/store/useResumeStore";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { templates } from "@/components/templates";
import type { TemplateKey } from "@/components/templates";

const USER_ID = "demo-user";
const MAX_DOWNLOADS = 2;

export default function ResumePreviewPage() {
  const { 
    personalInfo, 
    summary, 
    skills, 
    experience, 
    education, 
    selectedTemplate, 
    premiumUnlocked,
    showWatermark,
    clearAll,
  } = useResumeStore();
  
  const [loading, setLoading] = useState(false);
  const [downloadsUsed, setDownloadsUsed] = useState<number | null>(null);
  const [revoked, setRevoked] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Load current download count on mount
  useEffect(() => {
    fetch(`/api/debug/entitlements?userId=${USER_ID}`)
      .then(r => r.json())
      .then(data => {
        const used = data.entitlements?.resumeDownloads ?? 0;
        setDownloadsUsed(used);
        if (!data.entitlements?.resume && !data.entitlements?.bundle) {
          setRevoked(true);
        }
      })
      .catch(() => null);
  }, []);

  const remaining = downloadsUsed !== null ? Math.max(0, MAX_DOWNLOADS - downloadsUsed) : null;

  const handleDownloadPDF = async () => {
    if (!previewRef.current || revoked) return;
    setLoading(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");

      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "letter" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pageWidth / imgWidth, pageHeight / imgHeight);
      const imgX = (pageWidth - imgWidth * ratio) / 2;

      pdf.addImage(imgData, "PNG", imgX, 0, imgWidth * ratio, imgHeight * ratio);
      pdf.save("Resume.pdf");

      // Record the download server-side
      const res = await fetch("/api/stripe/record-download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: USER_ID, type: "resume" }),
      });
      const data = await res.json();

      if (data.success) {
        setDownloadsUsed(data.downloadsUsed);
        if (data.revoked) {
          setRevoked(true);
          // Clear the resume store so data doesn't persist
          clearAll();
        }
      }
    } catch (err) {
      alert("PDF Error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const TemplateEntry = templates[selectedTemplate as TemplateKey];
  const TemplateComponent = TemplateEntry?.component;

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

  if (revoked) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-6 text-center">
        <div className="text-5xl mb-6">✓</div>
        <h1 className="text-3xl font-bold mb-4">You're all set!</h1>
        <p className="text-slate-600 mb-4">
          You've used both of your included PDF downloads. Your resume has been delivered.
        </p>
        <p className="text-slate-600 mb-8">
          Need to make changes? Purchase a new session to start fresh.
        </p>
        <Link
          href="/pricing"
          className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700"
        >
          Buy a New Session
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-10 px-6">
      <div className="flex justify-between items-center border-b pb-6 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Final Preview</h1>
          <p className="text-sm text-slate-500 capitalize tracking-wide">
            Design Style: <span className="text-blue-600 font-bold">{selectedTemplate?.replace('-', ' ') || 'Default'}</span>
          </p>
        </div>
        <div className="flex gap-4 items-center">
          <Link href="/resume/personal" className="px-4 py-2 border rounded hover:bg-gray-50 transition">Edit Details</Link>
          <button 
            onClick={handleDownloadPDF} 
            disabled={loading || remaining === 0}
            className="px-6 py-2 bg-blue-600 text-white rounded font-bold shadow-lg hover:bg-blue-700 disabled:bg-slate-400 transition"
          >
            {loading ? "Generating..." : "Download Resume PDF"}
          </button>
        </div>
      </div>

      {/* Download counter banner */}
      {remaining !== null && (
        <div className={`mb-6 px-4 py-3 rounded-lg text-sm font-medium ${
          remaining === 0
            ? "bg-red-50 border border-red-200 text-red-700"
            : remaining === 1
            ? "bg-amber-50 border border-amber-200 text-amber-800"
            : "bg-blue-50 border border-blue-200 text-blue-700"
        }`}>
          {remaining === MAX_DOWNLOADS && `You have ${MAX_DOWNLOADS} PDF downloads included with your purchase.`}
          {remaining === 1 && "⚠ Last download remaining — make sure your resume is perfect before downloading."}
          {remaining === 0 && "You have used all included downloads. Purchase a new session to continue."}
        </div>
      )}

      <div ref={previewRef} className="bg-white shadow-2xl rounded-lg overflow-hidden border">
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
