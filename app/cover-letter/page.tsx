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
        <h1 className="text-2xl font-bold mb-4 text-slate-800">Cover Letter Builder</h1>
        <p className="text-gray-600 mb-6">
          You don’t have access to the Cover Letter Builder yet.
        </p>
        <Link
          href="/pricing"
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          Unlock Access
        </Link>
      </div>
    );
  }

  // 1. Fixed Summary Generation (Now using local API)
  const handleGenerateSummary = async () => {
    if (!resumeFile) return;
    setLoadingSummary(true);

    try {
      const formData = new FormData();
      formData.append("file", resumeFile);

      // Changed from hardcoded Render URL to local API route
      const res = await fetch("/api/cover-letter/upload-resume", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.summary) {
        setField("experience", data.summary);
      }
    } catch (err) {
      console.error("Summary error:", err);
      alert("Failed to read resume. Please check your connection.");
    } finally {
      setLoadingSummary(false);
    }
  };

  // 2. Fixed Letter Generation (Now using local API)
  const handleGenerateLetter = async () => {
    setLoadingLetter(true);

    try {
      const payload = {
        applicantName, applicantAddress, applicantCityStateZip,
        applicantEmail, applicantPhone, applicantLinkedIn,
        date, hiringManager, companyName, companyAddress,
        companyCityStateZip, jobTitle, tone, experience, salutationStyle,
      };

      // Changed from hardcoded Render URL to local API route
      const res = await fetch("/api/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.letter) {
        setGeneratedLetter(data.letter);
      }
    } catch (err) {
      console.error("Letter generation error:", err);
      alert("Failed to generate letter. Please try again.");
    } finally {
      setLoadingLetter(false);
    }
  };

  // 3. Fixed PDF Export (Now using local API)
  const handleExportPDF = async () => {
    if (!generatedLetter) {
      alert("Please generate a letter first.");
      return;
    }
    setLoadingPDF(true);

    try {
      const payload = {
        applicantName, applicantCityStateZip, applicantEmail,
        applicantPhone, applicantLinkedIn, date,
        letter: generatedLetter,
      };

      // Changed from hardcoded Render URL to local API route
      const res = await fetch("/api/export/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("PDF Generation Failed");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Cover-Letter-${applicantName.replace(/\s+/g, '-')}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF error:", err);
      alert("Could not generate PDF. Please try again later.");
    } finally {
      setLoadingPDF(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 space-y-10">
      <h1 className="text-3xl font-bold text-slate-900 border-b pb-4">Cover Letter Builder</h1>

      {/* Applicant Info */}
      <section className="space-y-4 bg-white p-6 rounded-xl shadow-sm border">
        <h2 className="text-xl font-semibold text-blue-600">Applicant Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input className="border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Full Name" value={applicantName} onChange={(e) => setField("applicantName", e.target.value)} />
          <input className="border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Email" value={applicantEmail} onChange={(e) => setField("applicantEmail", e.target.value)} />
          <input className="border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Address" value={applicantAddress} onChange={(e) => setField("applicantAddress", e.target.value)} />
          <input className="border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="City, State ZIP" value={applicantCityStateZip} onChange={(e) => setField("applicantCityStateZip", e.target.value)} />
          <input className="border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Phone" value={applicantPhone} onChange={(e) => setField("applicantPhone", e.target.value)} />
          <input className="border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="LinkedIn URL" value={applicantLinkedIn} onChange={(e) => setField("applicantLinkedIn", e.target.value)} />
          <input className="border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" type="date" value={date} onChange={(e) => setField("date", e.target.value)} />
        </div>
      </section>

      {/* Employer Info */}
      <section className="space-y-4 bg-white p-6 rounded-xl shadow-sm border">
        <h2 className="text-xl font-semibold text-blue-600">Employer Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input className="border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Hiring Manager" value={hiringManager} onChange={(e) => setField("hiringManager", e.target.value)} />
          <input className="border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Company Name" value={companyName} onChange={(e) => setField("companyName", e.target.value)} />
          <input className="border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Company Address" value={companyAddress} onChange={(e) => setField("companyAddress", e.target.value)} />
          <input className="border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="City, State ZIP" value={companyCityStateZip} onChange={(e) => setField("companyCityStateZip", e.target.value)} />
        </div>
      </section>

      {/* Job & Experience */}
      <section className="space-y-4 bg-white p-6 rounded-xl shadow-sm border">
        <h2 className="text-xl font-semibold text-blue-600">Job Details & Experience</h2>
        <input className="w-full border p-3 rounded-lg mb-4" placeholder="Job Title" value={jobTitle} onChange={(e) => setField("jobTitle", e.target.value)} />
        
        <div className="flex flex-col space-y-2">
          <label className="text-sm font-medium text-gray-700">Upload Resume to Auto-Fill Summary</label>
          <input type="file" accept="application/pdf" className="text-sm" onChange={(e) => {
            const file = e.target.files?.[0] || null;
            setResumeFile(file);
            setFileName(file ? file.name : "");
          }} />
          <button onClick={handleGenerateSummary} disabled={loadingSummary || !resumeFile} className="bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-900 disabled:opacity-50">
            {loadingSummary ? "Reading Resume..." : "Extract Summary from Resume"}
          </button>
        </div>

        <textarea className="w-full border p-3 rounded-lg h-32" placeholder="Tell us about your experience..." value={experience} onChange={(e) => setField("experience", e.target.value)} />
      </section>

      {/* Actions */}
      <div className="flex flex-col md:flex-row gap-4 pt-6">
        <button onClick={handleGenerateLetter} disabled={loadingLetter} className="flex-1 bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 shadow-lg transition-all">
          {loadingLetter ? "Writing your letter..." : "Generate Cover Letter"}
        </button>
        
        {generatedLetter && (
          <button onClick={handleExportPDF} disabled={loadingPDF} className="flex-1 bg-green-600 text-white py-4 rounded-xl font-bold hover:bg-green-700 disabled:opacity-50 shadow-lg transition-all">
            {loadingPDF ? "Creating PDF..." : "Download PDF"}
          </button>
        )}
      </div>

      {generatedLetter && (
        <section className="mt-10 p-8 bg-white border-2 border-dashed rounded-xl shadow-inner whitespace-pre-wrap font-serif text-gray-800 leading-relaxed">
          {generatedLetter}
        </section>
      )}
    </div>
  );
}
