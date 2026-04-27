"use client";

import { useState, useEffect } from "react";
import { useCoverLetterStore } from "@/app/store/useCoverLetterStore";
import { overrides } from "@/config/overrides";
import Link from "next/link";

export default function CoverLetterPage() {
  const {
    applicantName, applicantAddress, applicantCityStateZip, applicantEmail, applicantPhone, date,
    hiringManager, companyName, companyAddress, companyCityStateZip,
    jobTitle, experience, generatedLetter, setField, setGeneratedLetter, salutationStyle
  } = useCoverLetterStore();

  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [loadingLetter, setLoadingLetter] = useState(false);
  const [loadingPDF, setLoadingPDF] = useState(false);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    if (!date) {
      const today = new Date();
      setField("date", `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`);
    }
  }, [date, setField]);

  const handleGenerateSummary = async () => {
    if (!resumeFile || !API_BASE) return alert("Please select a PDF file.");
    setLoadingSummary(true);
    try {
      const formData = new FormData();
      formData.append("file", resumeFile);
      const res = await fetch(`${API_BASE}/api/ai/extract-summary`, { method: "POST", body: formData });
      const data = await res.json();
      if (data.summary) setField("experience", data.summary);
    } catch (err) { alert("Extraction failed."); } finally { setLoadingSummary(false); }
  };

  const handleGenerateLetter = async () => {
    if (!API_BASE) return;
    setLoadingLetter(true);
    try {
      const res = await fetch(`${API_BASE}/api/ai/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: `Write a professional cover letter body for ${applicantName} applying for ${jobTitle} at ${companyName}. Context: ${experience}` }),
      });
      const data = await res.json();
      if (data.text) {
        const salutation = salutationStyle === "To Whom" ? "To whom it may concern," : `Dear ${hiringManager},`;
        const full = `${salutation}\n\n${data.text}\n\nSincerely,\n\n${applicantName}`;
        setGeneratedLetter(full);
      }
    } catch (err) { alert("Generation failed."); } finally { setLoadingLetter(false); }
  };

  const handleExportPDF = async () => {
    if (!generatedLetter || !API_BASE) return;
    setLoadingPDF(true);
    try {
      const res = await fetch(`${API_BASE}/api/export/pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          type: "cover-letter",
          applicantName,
          applicantEmail,
          applicantPhone, 
          applicantAddress,
          applicantCityStateZip,
          date,
          hiringManager,
          companyName,
          companyAddress,
          companyCityStateZip,
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
  if (!canAccess) return <div className="p-20 text-center"><Link href="/pricing" className="text-blue-600">Access Denied</Link></div>;

  return (
    <div className="max-w-7xl mx-auto py-10 px-6 space-y-10">
      <h1 className="text-3xl font-bold border-b pb-4">Cover Letter Builder</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-8">
          <section className="bg-slate-50 p-6 rounded-xl border space-y-4">
            <h2 className="font-bold text-blue-800 uppercase">1. Applicant Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input className="border p-2 rounded" placeholder="Full Name" value={applicantName} onChange={(e) => setField("applicantName", e.target.value)} />
              <input className="border p-2 rounded" placeholder="Email" value={applicantEmail} onChange={(e) => setField("applicantEmail", e.target.value)} />
              <input className="border p-2 rounded" placeholder="Address" value={applicantAddress} onChange={(e) => setField("applicantAddress", e.target.value)} />
              <input className="border p-2 rounded" placeholder="City, State ZIP" value={applicantCityStateZip} onChange={(e) => setField("applicantCityStateZip", e.target.value)} />
            </div>
          </section>

          <section className="bg-slate-50 p-6 rounded-xl border space-y-4">
            <h2 className="font-bold text-blue-800 uppercase">2. Company Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input className="border p-2 rounded" placeholder="Target Job Title" value={jobTitle} onChange={(e) => setField("jobTitle", e.target.value)} />
              <select className="border p-2 rounded bg-white" value={salutationStyle} onChange={(e) => setField("salutationStyle", e.target.value)}>
                <option value="Dear">Dear [Manager Name]</option>
                <option value="To Whom">To whom it may concern</option>
              </select>
              <input className="border p-2 rounded" placeholder="Hiring Manager" value={hiringManager} onChange={(e) => setField("hiringManager", e.target.value)} />
              <input className="border p-2 rounded" placeholder="Company Name" value={companyName} onChange={(e) => setField("companyName", e.target.value)} />
              <input className="border p-2 rounded sm:col-span-2" placeholder="Company Address" value={companyAddress} onChange={(e) => setField("companyAddress", e.target.value)} />
              <input className="border p-2 rounded sm:col-span-2" placeholder="Company City, State ZIP" value={companyCityStateZip} onChange={(e) => setField("companyCityStateZip", e.target.value)} />
            </div>
          </section>

          <section className="bg-blue-50 p-6 rounded-xl border border-blue-100 space-y-4">
            <h2 className="font-bold text-blue-800">3. Resume Data</h2>
            <input 
              type="file" 
              accept=".pdf" 
              onChange={(e) => setResumeFile(e.target.files?.[0] || null)} 
              className="block w-full text-sm text-blue-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer" 
            />
            <button onClick={handleGenerateSummary} disabled={loadingSummary} className="w-full bg-slate-800 text-white p-3 rounded-lg font-bold">
              {loadingSummary ? "Extracting..." : "Extract Resume Summary"}
            </button>
            <textarea className="w-full border p-3 rounded h-32 text-sm" value={experience} onChange={(e) => setField("experience", e.target.value)} />
          </section>

          <div className="flex gap-4">
            <button onClick={handleGenerateLetter} className="flex-1 bg-green-600 text-white py-4 rounded-xl font-bold">Generate Letter</button>
            {generatedLetter && <button onClick={handleExportPDF} className="flex-1 bg-blue-800 text-white py-4 rounded-xl font-bold">Download PDF</button>}
          </div>
        </div>

        <div className="bg-white border rounded-xl shadow-2xl p-8 flex flex-col min-h-[800px]">
          <textarea className="flex-1 w-full border-none focus:ring-0 font-serif leading-relaxed text-slate-800 outline-none resize-none" value={generatedLetter} onChange={(e) => setGeneratedLetter(e.target.value)} />
        </div>
      </div>
    </div>
  );
}
