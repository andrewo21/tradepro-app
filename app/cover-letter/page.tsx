"use client";

import { useState, useEffect } from "react";
import { useCoverLetterStore } from "@/app/store/useCoverLetterStore";
import { overrides } from "@/config/overrides";
import Link from "next/link";

export default function CoverLetterPage() {
  const {
    applicantName, applicantAddress, applicantCityStateZip,
    applicantEmail, applicantPhone, applicantLinkedIn,
    date, hiringManager, companyName, companyAddress,
    companyCityStateZip, jobTitle, tone, experience,
    salutationStyle, generatedLetter, setField, setGeneratedLetter,
  } = useCoverLetterStore();

  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [loadingLetter, setLoadingLetter] = useState(false);
  const [loadingPDF, setLoadingPDF] = useState(false);

  // Using the unified API URL from your Vercel settings
  const API_BASE = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    if (!date) {
      const today = new Date().toISOString().split("T")[0];
      setField("date", today);
    }
  }, []);

  const canAccess = overrides.devMode || overrides.access || overrides.premium;

  if (!canAccess) {
    return (
      <div className="max-w-2xl mx-auto py-10 text-center">
        <h1 className="text-2xl font-bold mb-4">Cover Letter Builder</h1>
        <p className="text-gray-600 mb-6">You don’t have access to the Cover Letter Builder yet.</p>
        <Link href="/pricing" className="px-4 py-2 bg-blue-600 text-white rounded-md">Unlock Access</Link>
      </div>
    );
  }

  // 1. EXTRACT & REWRITE SUMMARY (PDF -> Professional 3rd Person Summary)
  const handleGenerateSummary = async () => {
    if (!resumeFile || !API_BASE) {
      alert("Please upload a resume first.");
      return;
    }
    setLoadingSummary(true);

    try {
      const formData = new FormData();
      formData.append("file", resumeFile);

      // Hits the Master Brain extraction route
      const res = await fetch(`${API_BASE}/api/ai/extract-summary`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.summary) {
        // Automatically updates the store with the professional rewrite
        setField("experience", data.summary);
      }
    } catch (err) {
      console.error("Summary error:", err);
      alert("Error extracting professional summary. Check server connection.");
    } finally {
      setLoadingSummary(false);
    }
  };

  // 2. GENERATE COVER LETTER TEXT
  const handleGenerateLetter = async () => {
    if (!API_BASE) return;
    setLoadingLetter(true);

    try {
      const payload = {
        applicantName, applicantAddress, applicantCityStateZip,
        applicantEmail, applicantPhone, applicantLinkedIn,
        date, hiringManager, companyName, companyAddress,
        companyCityStateZip, jobTitle, tone, experience, salutationStyle,
      };

      const res = await fetch(`${API_BASE}/api/ai/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "cover-letter", payload }),
      });

      const data = await res.json();
      if (data.result) {
        setGeneratedLetter(data.result);
      }
    } catch (err) {
      console.error("Letter error:", err);
      alert("Error generating letter. Please try again.");
    } finally {
      setLoadingLetter(false);
    }
  };

  // 3. EXPORT TO PDF (Uses the high-quality Blue Header PDF logic)
  const handleExportPDF = async () => {
    if (!generatedLetter || !API_BASE) return;
    setLoadingPDF(true);

    try {
      const payload = {
        applicantName, applicantCityStateZip, applicantEmail,
        applicantPhone, applicantLinkedIn, date,
        letter: generatedLetter,
      };

      const res = await fetch(`${API_BASE}/api/export/pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("PDF generation failed");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Cover-Letter-${applicantName.replace(/\s+/g, '-') || 'TradePro'}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF export error:", err);
      alert("Failed to generate PDF. Check server logs.");
    } finally {
      setLoadingPDF(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-6 space-y-10">
      <h1 className="text-3xl font-bold border-b pb-4">Cover Letter Builder</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-8">
          {/* Section 1: Applicant Details */}
          <section className="space-y-4 bg-slate-50 p-6 rounded-xl border">
            <h2 className="text-xl font-semibold text-blue-700">1. Applicant Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input className="border p-2 rounded" placeholder="Full Name" value={applicantName} onChange={(e) => setField("applicantName", e.target.value)} />
              <input className="border p-2 rounded" placeholder="Email" value={applicantEmail} onChange={(e) => setField("applicantEmail", e.target.value)} />
              <input className="border p-2 rounded" placeholder="Address" value={applicantAddress} onChange={(e) => setField("applicantAddress", e.target.value)} />
              <input className="border p-2 rounded" placeholder="City, State ZIP" value={applicantCityStateZip} onChange={(e) => setField("applicantCityStateZip", e.target.value)} />
              <input className="border p-2 rounded" placeholder="Phone" value={applicantPhone} onChange={(e) => setField("applicantPhone", e.target.value)} />
              <input className="border p-2 rounded" type="date" value={date} onChange={(e) => setField("date", e.target.value)} />
            </div>
          </section>

          {/* Section 2: AI Experience Summary */}
          <section className="space-y-4 bg-blue-50 p-6 rounded-xl border border-blue-100">
            <h2 className="text-xl font-semibold text-blue-700">2. Professional Experience</h2>
            <p className="text-sm text-gray-600 italic">Upload your resume. Our AI will write a 3rd-person professional summary for you.</p>
            <input type="file" accept="application/pdf" className="text-sm" onChange={(e) => setResumeFile(e.target.files?.[0] || null)} />
            <button 
              onClick={handleGenerateSummary} 
              disabled={loadingSummary || !resumeFile}
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              {loadingSummary ? "AI is rewriting..." : "Auto-Fill Summary"}
            </button>
            <textarea 
              className="w-full border p-3 rounded-lg h-40 text-sm" 
              placeholder="Your professional summary will appear here..." 
              value={experience} 
              onChange={(e) => setField("experience", e.target.value)} 
            />
          </section>

          {/* Section 3: Job Details & Action */}
          <section className="space-y-4 bg-slate-50 p-6 rounded-xl border">
            <h2 className="text-xl font-semibold text-blue-700">3. Job Details</h2>
            <input className="w-full border p-2 rounded mb-2" placeholder="Target Job Title" value={jobTitle} onChange={(e) => setField("jobTitle", e.target.value)} />
            <input className="w-full border p-2 rounded mb-2" placeholder="Company Name" value={companyName} onChange={(e) => setField("companyName", e.target.value)} />
            
            <div className="flex gap-4 pt-4">
              <button onClick={handleGenerateLetter} disabled={loadingLetter} className="flex-1 bg-green-600 text-white py-4 rounded-xl font-bold hover:bg-green-700 disabled:bg-gray-400 shadow-md">
                {loadingLetter ? "Writing..." : "Generate Letter"}
              </button>
              {generatedLetter && (
                <button onClick={handleExportPDF} disabled={loadingPDF} className="flex-1 bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-black shadow-md">
                  {loadingPDF ? "Downloading..." : "Download PDF"}
                </button>
              )}
            </div>
          </section>
        </div>

        {/* Live Preview Area */}
        <div className="bg-white border-2 border-dashed p-8 rounded-xl shadow-inner min-h-[600px]">
          <h2 className="text-xs font-bold text-gray-300 uppercase tracking-widest mb-6">Preview Area</h2>
          {generatedLetter ? (
            <div className="whitespace-pre-wrap font-serif text-gray-800 leading-relaxed text-sm">
              {generatedLetter}
            </div>
          ) : (
            <div className="text-gray-300 italic text-center mt-32">
              Your professional cover letter will appear here once generated.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
