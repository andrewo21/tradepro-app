"use client";

import { useState, useEffect } from "react";
import { useCoverLetterStore } from "@/app/store/useCoverLetterStore";
import { overrides } from "@/config/overrides";
import Link from "next/link";

export default function CoverLetterPage() {
  const {
    applicantName, applicantAddress, applicantCityStateZip, applicantEmail, applicantPhone, applicantLinkedIn, date,
    hiringManager, companyName, companyAddress, companyCityStateZip,
    jobTitle, tone, experience, salutationStyle, generatedLetter, setField, setGeneratedLetter,
  } = useCoverLetterStore();

  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [loadingLetter, setLoadingLetter] = useState(false);
  const [loadingPDF, setLoadingPDF] = useState(false);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    if (!date) {
      setField("date", new Date().toISOString().split("T")[0]);
    }
  }, []);

  const canAccess = overrides.devMode || overrides.access || overrides.premium;
  if (!canAccess) return <div className="p-10 text-center"><h1>Access Denied</h1><Link href="/pricing" className="text-blue-600">Unlock Access</Link></div>;

  // 1. FIXED SUMMARY UPLOAD (Matches /api/ai/extract-summary on Render)
  const handleGenerateSummary = async () => {
    if (!resumeFile || !API_BASE) return alert("Please select a file.");
    setLoadingSummary(true);
    try {
      const formData = new FormData();
      formData.append("file", resumeFile);
      const res = await fetch(`${API_BASE}/api/ai/extract-summary`, { method: "POST", body: formData });
      const data = await res.json();
      if (data.summary) setField("experience", data.summary);
    } catch (err) { alert("Upload failed."); } finally { setLoadingSummary(false); }
  };

  // 2. GENERATE LETTER
  const handleGenerateLetter = async () => {
    if (!API_BASE) return;
    setLoadingLetter(true);
    try {
      const payload = { applicantName, jobTitle, companyName, experience };
      const res = await fetch(`${API_BASE}/api/ai/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "cover-letter", payload }),
      });
      const data = await res.json();
      if (data.result) setGeneratedLetter(data.result);
    } catch (err) { alert("Generation failed."); } finally { setLoadingLetter(false); }
  };

  // 3. EXPORT PDF (Matches your blue header logic)
  const handleExportPDF = async () => {
    if (!generatedLetter || !API_BASE) return;
    setLoadingPDF(true);
    try {
      const payload = { applicantName, applicantEmail, applicantPhone, applicantCityStateZip, letter: generatedLetter };
      const res = await fetch(`${API_BASE}/api/export/pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Cover-Letter.pdf`;
      a.click();
    } catch (err) { alert("PDF Error."); } finally { setLoadingPDF(false); }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-6 space-y-10">
      <h1 className="text-3xl font-bold border-b pb-4">Cover Letter Builder</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* LEFT COLUMN: BUILDER */}
        <div className="space-y-6">
          <section className="space-y-3 bg-slate-50 p-4 rounded-lg">
            <h2 className="text-lg font-bold text-blue-800">1. Applicant Info</h2>
            <input className="w-full border p-2 rounded" placeholder="Full Name" value={applicantName} onChange={(e) => setField("applicantName", e.target.value)} />
            <input className="w-full border p-2 rounded" placeholder="Email" value={applicantEmail} onChange={(e) => setField("applicantEmail", e.target.value)} />
            <input className="w-full border p-2 rounded" placeholder="Phone" value={applicantPhone} onChange={(e) => setField("applicantPhone", e.target.value)} />
            <input className="w-full border p-2 rounded" placeholder="City, State ZIP" value={applicantCityStateZip} onChange={(e) => setField("applicantCityStateZip", e.target.value)} />
          </section>

          <section className="space-y-3 bg-slate-50 p-4 rounded-lg">
            <h2 className="text-lg font-bold text-blue-800">2. Hiring Manager Info</h2>
            <input className="w-full border p-2 rounded" placeholder="Hiring Manager Name" value={hiringManager} onChange={(e) => setField("hiringManager", e.target.value)} />
            <input className="w-full border p-2 rounded" placeholder="Company Name" value={companyName} onChange={(e) => setField("companyName", e.target.value)} />
            <input className="w-full border p-2 rounded" placeholder="Company Address" value={companyAddress} onChange={(e) => setField("companyAddress", e.target.value)} />
            <input className="w-full border p-2 rounded" placeholder="Company City, State ZIP" value={companyCityStateZip} onChange={(e) => setField("companyCityStateZip", e.target.value)} />
          </section>

          <section className="space-y-3 bg-blue-50 p-4 rounded-lg border border-blue-100">
            <h2 className="text-lg font-bold text-blue-800">3. Resume Summary</h2>
            <input type="file" accept=".pdf" onChange={(e) => setResumeFile(e.target.files?.[0] || null)} className="text-sm" />
            <button onClick={handleGenerateSummary} disabled={loadingSummary} className="w-full bg-blue-600 text-white p-2 rounded">
              {loadingSummary ? "Analyzing..." : "Auto-Fill from Resume"}
            </button>
            <textarea className="w-full border p-2 rounded h-32 text-sm" value={experience} onChange={(e) => setField("experience", e.target.value)} />
          </section>

          <div className="flex gap-4">
            <button onClick={handleGenerateLetter} className="flex-1 bg-green-600 text-white py-3 rounded font-bold">{loadingLetter ? "Writing..." : "Write Letter"}</button>
            {generatedLetter && <button onClick={handleExportPDF} className="flex-1 bg-slate-800 text-white py-3 rounded font-bold">Download PDF</button>}
          </div>
        </div>

        {/* RIGHT COLUMN: PREVIEW */}
        <div className="border p-6 rounded-lg bg-white min-h-[600px] shadow-inner">
          <h2 className="text-xs font-bold text-gray-400 mb-4">PREVIEW</h2>
          <div className="whitespace-pre-wrap font-serif text-sm leading-relaxed">{generatedLetter || "Fill info and write letter to see preview..."}</div>
        </div>
      </div>
    </div>
  );
}
