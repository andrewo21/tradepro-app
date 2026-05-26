"use client";

import { useResumeStore } from "@/app/store/useResumeStore";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { templates } from "@/components/templates";
import type { TemplateKey } from "@/components/templates";
import { getOrCreateUserId } from "@/lib/userId";

const MAX_DOWNLOADS = 3;

export default function ResumePreviewPage() {
  const { 
    personalInfo, 
    summary, 
    skills, 
    experience, 
    education,
    certifications,
    selectedTemplate, 
    premiumUnlocked,
    showWatermark,
    clearAll,
  } = useResumeStore();
  
  const [userId] = useState(() => getOrCreateUserId());
  const [loading, setLoading] = useState(false);
  const [downloadsUsed, setDownloadsUsed] = useState<number | null>(null);
  const [revoked, setRevoked] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Load current download count on mount
  useEffect(() => {
    fetch(`/api/debug/entitlements?userId=${userId}`)
      .then(r => r.json())
      .then(data => {
        const used = data.entitlements?.resumeDownloads ?? 0;
        setDownloadsUsed(used);
        if (!data.entitlements?.resume && !data.entitlements?.bundle) {
          setRevoked(true);
        }
      })
      .catch(() => null);
  }, [userId]);

  const remaining = downloadsUsed !== null ? Math.max(0, MAX_DOWNLOADS - downloadsUsed) : null;

  // Intercept browser print — start PDF download and show instructions
  // Note: e.preventDefault() does NOT stop the print dialog — we must hide
  // the page content in print media so the user doesn't print a blue HTML page
  useEffect(() => {
    function onBeforePrint() {
      handleDownloadPDF();
    }
    window.addEventListener("beforeprint", onBeforePrint);
    return () => window.removeEventListener("beforeprint", onBeforePrint);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const buildPayload = () => ({
    type: "resume",
    selectedTemplate,
    name: `${personalInfo.firstName || ""} ${personalInfo.lastName || ""}`.trim(),
    title: personalInfo.tradeTitle || "",
    contact: {
      phone: personalInfo.phone || "",
      email: personalInfo.email || "",
      location: `${personalInfo.city || ""}${personalInfo.city && personalInfo.state ? ", " : ""}${personalInfo.state || ""}`,
      linkedin: personalInfo.linkedin || "",
    },
    summary: summary || "",
    skills: skills?.map((s: any) => s.text || s).filter(Boolean) || [],
    // Section 1: only render entries that have actual content (filter empty initial slots)
    // Section 2: normalize bullets — always extract .text from objects
    experience: experience
      .filter((exp: any) => exp.jobTitle?.trim() || exp.company?.trim())
      .map((exp: any) => ({
        jobTitle: exp.jobTitle || "",
        company: exp.company || "",
        city: exp.city || "",
        state: exp.state || "",
        startDate: exp.startDate || "",
        endDate: exp.endDate || "",
        roleSummary: exp.roleSummary || "",
        responsibilities: (exp.responsibilities || []).map((r: any) => typeof r === "string" ? r : (r.text || "")).filter(Boolean),
        achievements: (exp.achievements || []).map((a: any) => typeof a === "string" ? a : (a.text || "")).filter(Boolean),
      })),
    education: education || [],
    certifications: certifications?.map((c: any) => typeof c === "string" ? c : (c.text || "")).filter(Boolean) || [],
  });

  const handleDownloadPDF = async () => {
    if (revoked) return;
    setLoading(true);
    try {
      const pdfPayload = buildPayload();

      const pdfRes = await fetch("/api/export/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pdfPayload),
      });

      if (!pdfRes.ok) {
        const errData = await pdfRes.json().catch(() => ({}));
        throw new Error(errData.detail || errData.error || `PDF generation failed (${pdfRes.status})`);
      }

      const blob = await pdfRes.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Resume.pdf";
      a.click();
      window.URL.revokeObjectURL(url);

      // Record the download server-side
      const res = await fetch("/api/stripe/record-download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, type: "resume" }),
      });
      const data = await res.json();

      if (data.success) {
        setDownloadsUsed(data.downloadsUsed);
        if (data.revoked) {
          setRevoked(true);
          clearAll();
        }
      }
    } catch (err: any) {
      alert(`PDF Error: ${err?.message || "Please try again."}`);
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
      linkedin: personalInfo.linkedin || "",
    },
    summary: summary || "",
    experience: experience
      .filter((exp: any) => exp.jobTitle?.trim() || exp.company?.trim())
      .map((exp: any) => ({
      jobTitle: exp.jobTitle || "",
      company: exp.company || "",
      city: exp.city || "",
      state: exp.state || "",
      startDate: exp.startDate || "",
      endDate: exp.endDate || "",
      roleSummary: exp.roleSummary || "",
      responsibilities: (exp.responsibilities || []).map((r: any) => typeof r === "string" ? r : (r.text || "")).filter(Boolean),
      achievements: (exp.achievements || []).map((a: any) => typeof a === "string" ? a : (a.text || "")).filter(Boolean),
    })),
    education: education || [],
    skills: skills?.map((s: any) => s.text || "").filter(Boolean) || [],
    certifications: certifications?.map((c: any) => typeof c === "string" ? c : (c.text || "")).filter(Boolean) || [],
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

      {/* Print interception — hides the whole page and shows a clean message.
          This prevents users from accidentally printing the blue HTML preview
          instead of the properly formatted PDF. */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #print-message, #print-message * { visibility: visible !important; }
          #print-message {
            position: fixed !important;
            top: 50% !important;
            left: 50% !important;
            transform: translate(-50%, -50%) !important;
            text-align: center !important;
            font-family: Helvetica, Arial, sans-serif !important;
            color: #111827 !important;
          }
        }
      `}</style>

      {/* Shown only when browser print is triggered */}
      <div id="print-message" style={{ display: "none" }}>
        <p style={{ fontSize: 20, fontWeight: "bold", color: "#111827" }}>Your PDF is downloading.</p>
        <p style={{ fontSize: 14, color: "#6b7280", marginTop: 8 }}>Open the downloaded file and print from there for best quality.</p>
      </div>

      <div className="mb-4 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800 flex items-center gap-2">
        <span className="text-base">🖨️</span>
        <span>Use the <strong>Download PDF</strong> button below, then print from Adobe Reader or Preview. Printing directly from the browser shows incorrect colors and formatting.</span>
      </div>

      <div className="flex justify-between items-center border-b pb-6 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Step 8 — Final Preview</h1>
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
