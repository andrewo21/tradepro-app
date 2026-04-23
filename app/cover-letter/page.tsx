"use client";

import { useState, useEffect } from "react";
import { useCoverLetterStore } from "@/app/store/useCoverLetterStore";
import { overrides } from "@/config/overrides";
import Link from "next/link";

export default function CoverLetterPage() {
  const {
    applicantName, applicantAddress, applicantCityStateZip, applicantEmail, applicantPhone, date,
    hiringManager, companyName, companyAddress, companyCityStateZip,
    jobTitle, experience, generatedLetter, setField, setGeneratedLetter,
  } = useCoverLetterStore();

  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [loadingLetter, setLoadingLetter] = useState(false);
  const [loadingPDF, setLoadingPDF] = useState(false);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    if (!date) setField("date", new Date().toISOString().split("T")[0]);
  }, []);

  const handleGenerateSummary = async () => {
    if (!resumeFile || !API_BASE) return alert("Please select a PDF file.");
    setLoadingSummary(true);
    try {
      const formData = new FormData();
      formData.append("file", resumeFile);
      const res = await fetch(`${API_BASE}/api/ai/extract-summary`, { method: "POST", body: formData });
      const data = await res.json();
      if (data.summary) setField("experience", data.summary);
    } catch (err) { alert("Summary Generator failed."); } finally { setLoadingSummary(false); }
  };

  const handleGenerateLetter = async () => {
    if (!API_BASE) return;
    setLoadingLetter(true);
    try {
      // FIX: Payload now matches the prompt logic required by the AI
      const res = await fetch(`${API_BASE}/api/ai/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          type: "cover-letter", 
          prompt: `Write a professional cover letter for ${applicantName} applying for the ${jobTitle} role at ${companyName}. Context: ${experience}` 
        }),
      });
      const data = await res.json();
      
      // FIX: Mapping the returned 'text' and building the full professional header
      if (data.text) {
        const full = `${applicantName}\n${applicantAddress}\n${applicantCityStateZip}\n\n${date}\n\n${hiringManager}\n${companyName}\n${companyAddress}\n${companyCityStateZip}\n\nDear ${hiringManager},\n\n${data.text}\n\nSincerely,\n\n${applicantName}`;
        setGeneratedLetter(full);
      }
    } catch (err) { alert("Generation failed."); } finally { setLoadingLetter(false); }
  };

  const handleExportPDF = async () => {
    if (!generatedLetter || !API_BASE) return;
    setLoadingPDF(true);
    try {
      // FIX: Passing recipientAddress to the PDF Engine
      const res = await fetch(`${API_BASE}/api/export/pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          type: "cover-letter",
          applicantName, applicantEmail, applicantPhone, applicantAddress, 
          applicantCityStateZip, 
          recipientAddress: `${companyName}\n${companyAddress}\n${companyCityStateZip}`,
          letter: generatedLetter 
        }),
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Cover-Letter.pdf";
      a.click();
    } catch (err) { alert("PDF Error."); } finally { setLoadingPDF(false); }
  };

  const canAccess = overrides.devMode || overrides.access || overrides.premium;
  if (!canAccess) return <div className="p-20 text-center"><Link href="/pricing" className="text-blue-600">Access Denied - Upgrade Here</Link></div>;

  return (
    <div className="max-w-7xl mx-auto py-10 px-6 space-y-10">
      <h1 className="text-3xl font-bold border-b pb-4">Cover Letter Builder</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-8">
          <section className="bg-slate-50 p-6 rounded-xl border space-y-4">
            <h2 className="font-bold text-blue-800 uppercase">1. Applicant Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <input className="border p-2 rounded" placeholder="Full Name" value={applicantName} onChange={(e) => setField("applicantName", e.target.value)} />
              <input className="border p-2 rounded" placeholder="Email" value={applicantEmail} onChange={(e) => setField("applicantEmail", e.target.value)} />
              <input className="border p-2 rounded" placeholder="Address" value={applicantAddress} onChange={(e) => setField("applicantAddress", e.target.value)} />
              <input className="border p-2 rounded" placeholder="City, State ZIP" value={applicantCityStateZip} onChange={(e) => setField("applicantCityStateZip", e.target.value)} />
            </div>
          </section>

          <section className="bg-slate-50 p-6 rounded-xl border space-y-4">
            <h2 className="font-bold text-blue-800 uppercase">2. Company Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <input className="border p-2 rounded" placeholder="Hiring Manager" value={hiringManager} onChange={(e) => setField("hiringManager", e.target.value)} />
              <input className="border p-2 rounded" placeholder="Company Name" value={companyName} onChange={(e) => setField("companyName", e.target.value)} />
              {/* RESTORED MISSING INPUTS */}
              <input className="border p-2 rounded col-span-2" placeholder="Company Address" value={companyAddress} onChange={(e) => setField("companyAddress", e.target.value)} />
              <input className="border p-2 rounded col-span-2" placeholder="Company City, State ZIP" value={companyCityStateZip} onChange={(e) => setField("companyCityStateZip", e.target.value)} />
            </div>
          </section>

          <section className="bg-blue-50 p-6 rounded-xl border border-blue-100 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="font-bold text-blue-800">3. Summary Generator</h2>
              <input className="border p-1 rounded text-sm w-1/2" placeholder="Target Job Title" value={jobTitle} onChange={(e) => setField("jobTitle", e.target.value)} />
            </div>
            <input type="file" accept=".pdf" onChange={(e) => setResumeFile(e.target.files?.[0] || null)} className="text-sm" />
            <button onClick={handleGenerateSummary} disabled={loadingSummary} className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700">
              {loadingSummary ? "Reading Resume..." : "Extract Resume Summary"}
            </button>
            <textarea className="w-full border p-3 rounded h-32 text-sm" value={experience} onChange={(e) => setField("experience", e.target.value)} />
          </section>

          <div className="flex gap-4">
            <button onClick={handleGenerateLetter} className="flex-1 bg-green-600 text-white py-4 rounded-xl font-bold shadow-lg">Generate Cover-Letter</button>
            {generatedLetter && <button onClick={handleExportPDF} className="flex-1 bg-slate-800 text-white py-4 rounded-xl font-bold shadow-lg">Download PDF</button>}
          </div>
        </div>

        <div className="bg-white border rounded-xl shadow-2xl p-8 flex flex-col min-h-[800px]">
          <h2 className="text-xs font-bold text-slate-400 mb-4 uppercase tracking-widest border-b pb-2">Letter Preview (Editable)</h2>
          <textarea className="flex-1 w-full border-none focus:ring-0 font-serif leading-relaxed text-slate-800 outline-none resize-none" value={generatedLetter} onChange={(e) => setGeneratedLetter(e.target.value)} />
        </div>
      </div>
    </div>
  );
}
