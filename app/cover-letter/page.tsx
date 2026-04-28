"use client";

import { useState, useEffect } from "react";
import { useCoverLetterStore } from "@/app/store/useCoverLetterStore";
import Link from "next/link";
import { getOrCreateUserId } from "@/lib/userId";

const MAX_DOWNLOADS = 2;

export default function CoverLetterPage() {
  const {
    applicantName, applicantAddress, applicantCityStateZip, applicantEmail, applicantPhone, date,
    hiringManager, companyName, companyAddress, companyCityStateZip,
    jobTitle, experience, generatedLetter, setField, setGeneratedLetter, salutationStyle, clearAll
  } = useCoverLetterStore();

  const [userId] = useState(() => getOrCreateUserId());
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [loadingLetter, setLoadingLetter] = useState(false);
  const [loadingPDF, setLoadingPDF] = useState(false);
  const [downloadsUsed, setDownloadsUsed] = useState<number | null>(null);
  const [revoked, setRevoked] = useState(false);

  const API_BASE = "";

  useEffect(() => {
    if (!date) {
      const today = new Date();
      setField("date", `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`);
    }
  }, [date, setField]);

  useEffect(() => {
    fetch(`/api/debug/entitlements?userId=${userId}`)
      .then(r => r.json())
      .then(data => {
        const used = data.entitlements?.coverLetterDownloads ?? 0;
        setDownloadsUsed(used);
        if (!data.entitlements?.coverLetter && !data.entitlements?.bundle) {
          setRevoked(true);
        }
      })
      .catch(() => null);
  }, [userId]);

  const handleGenerateSummary = async () => {
    if (!resumeFile) return alert("Please select a PDF file.");
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
    if (!generatedLetter || revoked) return;
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

      // Record the download server-side
      const record = await fetch("/api/stripe/record-download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, type: "coverLetter" }),
      });
      const data = await record.json();
      if (data.success) {
        setDownloadsUsed(data.downloadsUsed);
        if (data.revoked) {
          setRevoked(true);
          clearAll();
        }
      }
    } catch (err) { alert("PDF Error."); } finally { setLoadingPDF(false); }
  };

  const remaining = downloadsUsed !== null ? Math.max(0, MAX_DOWNLOADS - downloadsUsed) : null;

  if (revoked) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-6 text-center">
        <div className="text-5xl mb-6">✓</div>
        <h1 className="text-3xl font-bold mb-4">You're all set!</h1>
        <p className="text-slate-600 mb-4">
          You've used both of your included PDF downloads. Your cover letter has been delivered.
        </p>
        <p className="text-slate-600 mb-8">
          Need to make changes? Purchase a new session to start fresh.
        </p>
        <Link href="/pricing" className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700">
          Buy a New Session
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-10 px-6 space-y-10">
      <div className="border-b pb-4 flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Cover Letter Builder</h1>
        {remaining !== null && (
          <div className={`px-4 py-2 rounded-lg text-sm font-medium w-fit ${
            remaining === 0 ? "bg-red-50 border border-red-200 text-red-700"
            : remaining === 1 ? "bg-amber-50 border border-amber-200 text-amber-800"
            : "bg-blue-50 border border-blue-200 text-blue-700"
          }`}>
            {remaining === MAX_DOWNLOADS && `${MAX_DOWNLOADS} PDF downloads included with your purchase.`}
            {remaining === 1 && "⚠ Last download remaining — make sure your letter is perfect before downloading."}
            {remaining === 0 && "You have used all included downloads. Purchase a new session to continue."}
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-8">
          <section className="bg-slate-50 p-6 rounded-xl border space-y-4">
            <h2 className="font-bold text-blue-800 uppercase">1. Applicant Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input className="border p-2 rounded" placeholder="Full Name" value={applicantName} onChange={(e) => setField("applicantName", e.target.value)} />
              <input className="border p-2 rounded" placeholder="Email" value={applicantEmail} onChange={(e) => setField("applicantEmail", e.target.value)} />
              <input className="border p-2 rounded" placeholder="Phone" value={applicantPhone} onChange={(e) => setField("applicantPhone", e.target.value)} />
              <input className="border p-2 rounded" placeholder="Address" value={applicantAddress} onChange={(e) => setField("applicantAddress", e.target.value)} />
              <input className="border p-2 rounded sm:col-span-2" placeholder="City, State ZIP" value={applicantCityStateZip} onChange={(e) => setField("applicantCityStateZip", e.target.value)} />
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
            {generatedLetter && (
              <button
                onClick={handleExportPDF}
                disabled={loadingPDF || remaining === 0}
                className="flex-1 bg-blue-800 text-white py-4 rounded-xl font-bold disabled:opacity-50"
              >
                {loadingPDF ? "Generating..." : "Download PDF"}
              </button>
            )}
          </div>
        </div>

        <div className="bg-white border rounded-xl shadow-2xl p-8 flex flex-col min-h-[800px]">
          <textarea className="flex-1 w-full border-none focus:ring-0 font-serif leading-relaxed text-slate-800 outline-none resize-none" value={generatedLetter} onChange={(e) => setGeneratedLetter(e.target.value)} />
        </div>
      </div>
    </div>
  );
}
