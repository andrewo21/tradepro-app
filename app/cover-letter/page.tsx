"use client";

import { useState, useEffect } from "react";
import { useCoverLetterStore } from "@/app/store/useCoverLetterStore";
import { overrides } from "@/config/overrides";
import Link from "next/link";

export default function CoverLetterPage() {
  const {
    applicantName,
    applicantAddress,
    applicantCityStateZip,
    applicantEmail,
    applicantPhone,
    applicantLinkedIn,
    date,
    hiringManager,
    companyName,
    companyAddress,
    companyCityStateZip,
    jobTitle,
    tone,
    experience,
    salutationStyle,
    generatedLetter,
    setField,
    setGeneratedLetter,
  } = useCoverLetterStore();

  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");

  const [loadingSummary, setLoadingSummary] = useState(false);
  const [loadingLetter, setLoadingLetter] = useState(false);
  const [loadingPDF, setLoadingPDF] = useState(false);

  // Use the variable from your Vercel screenshot
  const API_BASE = process.env.NEXT_PUBLIC_COVER_LETTER_API;

  useEffect(() => {
    if (!date) {
      const today = new Date().toISOString().split("T")[0];
      setField("date", today);
    }
  }, []);

  const canAccess =
    overrides.devMode || overrides.access || overrides.premium;

  if (!canAccess) {
    return (
      <div className="max-w-2xl mx-auto py-10 text-center">
        <h1 className="text-2xl font-bold mb-4">Cover Letter Builder</h1>
        <p className="text-gray-600 mb-6">
          You don’t have access to the Cover Letter Builder yet.
        </p>
        <Link
          href="/pricing"
          className="px-4 py-2 bg-blue-600 text-white rounded-md"
        >
          Unlock Access
        </Link>
      </div>
    );
  }

  // 1. EXTRACT SUMMARY FROM RESUME
  const handleGenerateSummary = async () => {
    if (!resumeFile || !API_BASE) return;
    setLoadingSummary(true);

    try {
      const formData = new FormData();
      formData.append("file", resumeFile);

      const res = await fetch(`${API_BASE}/api/cover-letter/upload-resume`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.summary) {
        setField("experience", data.summary);
      }
    } catch (err) {
      console.error("Summary error:", err);
      alert("Error connecting to server for resume extraction.");
    } finally {
      setLoadingSummary(false);
    }
  };

  // 2. GENERATE THE LETTER TEXT
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

      const res = await fetch(`${API_BASE}/api/cover-letter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.letter) {
        setGeneratedLetter(data.letter);
      }
    } catch (err) {
      console.error("Letter error:", err);
      alert("Error generating letter. Please try again.");
    } finally {
      setLoadingLetter(false);
    }
  };

  // 3. EXPORT TO PDF
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
      a.download = `Cover-Letter-${applicantName.replace(/\s+/g, '-')}.pdf`;
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
    <div className="max-w-3xl mx-auto py-10 px-4 space-y-8">
      <h1 className="text-3xl font-bold border-b pb-4">Cover Letter Builder</h1>

      {/* Applicant Information */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-blue-700">Applicant Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input className="border p-2 rounded" placeholder="Full Name" value={applicantName} onChange={(e) => setField("applicantName", e.target.value)} />
          <input className="border p-2 rounded" placeholder="Address" value={applicantAddress} onChange={(e) => setField("applicantAddress", e.target.value)} />
          <input className="border p-2 rounded" placeholder="City, State ZIP" value={applicantCityStateZip} onChange={(e) => setField("applicantCityStateZip", e.target.value)} />
          <input className="border p-2 rounded" placeholder="Email" value={applicantEmail} onChange={(e) => setField("applicantEmail", e.target.value)} />
          <input className="border p-2 rounded" placeholder="Phone" value={applicantPhone} onChange={(e) => setField("applicantPhone", e.target.value)} />
          <input className="border p-2 rounded" placeholder="LinkedIn URL" value={applicantLinkedIn} onChange={(e) => setField("applicantLinkedIn", e.target.value)} />
          <input className="border p-2 rounded" type="date" value={date} onChange={(e) => setField("date", e.target.value)} />
        </div>
      </section>

      {/* Employer Information */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-blue-700">Employer Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input className="border p-2 rounded" placeholder="Hiring Manager" value={hiringManager} onChange={(e) => setField("hiringManager", e.target.value)} />
          <input className="border p-2 rounded" placeholder="Company Name" value={companyName} onChange={(e) => setField("companyName", e.target.value)} />
          <input className="border p-2 rounded" placeholder="Company Address" value={companyAddress} onChange={(e) => setField("companyAddress", e.target.value)} />
          <input className="border p-2 rounded" placeholder="City, State ZIP" value={companyCityStateZip} onChange={(e) => setField("companyCityStateZip", e.target.value)} />
        </div>
      </section>

      {/* Experience & AI Summary */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-blue-700">Job Experience</h2>
        <input className="w-full border p-2 rounded" placeholder="Target Job Title" value={jobTitle} onChange={(e) => setField("jobTitle", e.target.value)} />
        
        <div className="bg-slate-50 p-4 rounded border space-y-3">
          <label className="text-sm font-medium">Optional: Upload Resume to extract summary</label>
          <input type="file" accept="application/pdf" onChange={(e) => {
            const file = e.target.files?.[0] || null;
            setResumeFile(file);
            setFileName(file ? file.name : "");
          }} />
          <button onClick={handleGenerateSummary} disabled={loadingSummary || !resumeFile} className="bg-slate-700 text-white px-4 py-2 rounded hover:bg-slate-800 disabled:opacity-50">
            {loadingSummary ? "Analyzing..." : "Auto-Fill Summary"}
          </button>
        </div>

        <textarea className="w-full border p-2 rounded h-32" placeholder="Describe your experience or paste your resume highlights here..." value={experience} onChange={(e) => setField("experience", e.target.value)} />
      </section>

      {/* Generation Options */}
      <section className="flex gap-4">
        <select className="flex-1 border p-2 rounded" value={tone} onChange={(e) => setField("tone", e.target.value)}>
          <option>Professional</option>
          <option>Friendly</option>
          <option>Confident</option>
          <option>Formal</option>
        </select>

        <select className="flex-1 border p-2 rounded" value={salutationStyle} onChange={(e) => setField("salutationStyle", e.target.value)}>
          <option value="A">Dear Hiring Manager,</option>
          <option value="B">Dear [Name],</option>
          <option value="C">To Whom It May Concern,</option>
        </select>
      </section>

      {/* Final Action Buttons */}
      <div className="flex flex-col gap-4">
        <button onClick={handleGenerateLetter} disabled={loadingLetter} className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 transition-all">
          {loadingLetter ? "Writing Letter..." : "Generate Cover Letter"}
        </button>

        {generatedLetter && (
          <button onClick={handleExportPDF} disabled={loadingPDF} className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 disabled:opacity-50 transition-all">
            {loadingPDF ? "Downloading..." : "Download as PDF"}
          </button>
        )}
      </div>

      {/* Letter Preview */}
      {generatedLetter && (
        <div className="mt-8 p-6 bg-white border shadow-inner rounded whitespace-pre-wrap font-serif leading-relaxed text-gray-800">
          {generatedLetter}
        </div>
      )}
    </div>
  );
}
