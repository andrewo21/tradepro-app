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
    if (!resumeFile || !API_BASE) return alert("Select a PDF first.");
    setLoadingSummary(true);
    try {
      const formData = new FormData();
      formData.append("file", resumeFile);
      const res = await fetch(`${API_BASE}/api/ai/extract-summary`, { method: "POST", body: formData });
      const data = await res.json();
      if (data.summary) setField("experience", data.summary);
    } catch (err) { alert("AI Summary failed."); } finally { setLoadingSummary(false); }
  };

  const handleGenerateLetter = async () => {
    if (!API_BASE) return;
    setLoadingLetter(true);
    try {
      const res = await fetch(`${API_BASE}/api/ai/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payload: { applicantName, jobTitle, experience } }),
      });
      const data = await res.json();
      if (data.result) setGeneratedLetter(data.result);
    } catch (err) { alert("AI Letter failed."); } finally { setLoadingLetter(false); }
  };

  const handleExportPDF = async () => {
    if (!generatedLetter || !API_BASE) return;
    setLoadingPDF(true);
    try {
      const res = await fetch(`${API_BASE}/api/export/pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicantName, applicantAddress, applicantCityStateZip, applicantEmail, applicantPhone,
          date, hiringManager, companyName, companyAddress, companyCityStateZip, letter: generatedLetter
        }),
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Cover-Letter.pdf`;
      a.click();
    } catch (err) { alert("PDF Failed."); } finally { setLoadingPDF(false); }
  };

  return (
    <div className="max-w-6xl mx-auto py-10 px-6 space-y-10">
      <h1 className="text-3xl font-bold border-b pb-4">Cover Letter Builder</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <section className="bg-slate-50 p-4 rounded-lg space-y-3">
            <h2 className="font-bold text-blue-800">1. Applicant & Employer Info</h2>
            <div className="grid grid-cols-2 gap-2">
              <input className="border p-2 rounded" placeholder="Full Name" value={applicantName} onChange={(e) => setField("applicantName", e.target.value)} />
              <input className="border p-2 rounded" placeholder="Your Address" value={applicantAddress} onChange={(e) => setField("applicantAddress", e.target.value)} />
              <input className="border p-2 rounded" placeholder="City, State ZIP" value={applicantCityStateZip} onChange={(e) => setField("applicantCityStateZip", e.target.value)} />
              <input className="border p-2 rounded" placeholder="Email" value={applicantEmail} onChange={(e) => setField("applicantEmail", e.target.value)} />
              <input className="border p-2 rounded" placeholder="Manager Name" value={hiringManager} onChange={(e) => setField("hiringManager", e.target.value)} />
              <input className="border p-2 rounded" placeholder="Company Name" value={companyName} onChange={(e) => setField("companyName", e.target.value)} />
              <input className="border p-2 rounded" placeholder="Co. Address" value={companyAddress} onChange={(e) => setField("companyAddress", e.target.value)} />
              <input className="border p-2 rounded" placeholder="Co. City/State/ZIP" value={companyCityStateZip} onChange={(e) => setField("companyCityStateZip", e.target.value)} />
            </div>
          </section>

          <section className="bg-blue-50 p-4 rounded-lg space-y-3">
            <h2 className="font-bold text-blue-800">2. Resume Summary (AI)</h2>
            <input type="file" accept=".pdf" onChange={(e) => setResumeFile(e.target.files?.[0] || null)} />
            <button onClick={handleGenerateSummary} className="w-full bg-blue-600 text-white p-2 rounded font-bold">
              {loadingSummary ? "Analyzing..." : "Auto-Fill Summary"}
            </button>
            <textarea className="w-full border p-2 rounded h-32" value={experience} onChange={(e) => setField("experience", e.target.value)} />
          </section>

          <div className="flex gap-4">
            <button onClick={handleGenerateLetter} className="flex-1 bg-green-600 text-white py-4 rounded font-bold">{loadingLetter ? "Generating..." : "Generate Cover-Letter"}</button>
            {generatedLetter && <button onClick={handleExportPDF} className="flex-1 bg-slate-800 text-white py-4 rounded font-bold">Download PDF</button>}
          </div>
        </div>

        {/* EDITABLE PREVIEW */}
        <div className="bg-white border p-6 rounded-lg shadow-inner min-h-[600px]">
          <h2 className="text-xs font-bold text-gray-400 mb-2 uppercase">Letter Preview (Editable)</h2>
          <textarea className="w-full h-full min-h-[550px] border-none focus:ring-0 font-serif leading-relaxed text-gray-800 outline-none" value={generatedLetter} onChange={(e) => setGeneratedLetter(e.target.value)} placeholder="Generate letter to see preview..." />
        </div>
      </div>
    </div>
  );
}
