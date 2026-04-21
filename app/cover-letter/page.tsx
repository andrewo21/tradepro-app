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
    } catch (err) { alert("Summary Generator failed."); } finally { setLoadingSummary(false); }
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
      if (data.result) {
        // Montamos o preview completo com cabeçalhos para o usuário ver
        const fullPreview = `${applicantName}\n${applicantAddress}\n${applicantCityStateZip}\n${applicantEmail}\n\n${date}\n\n${hiringManager}\n${companyName}\n${companyAddress}\n${companyCityStateZip}\n\nDear ${hiringManager},\n\n${data.result}\n\nSincerely,\n\n${applicantName}`;
        setGeneratedLetter(fullPreview);
      }
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

  const canAccess = overrides.devMode || overrides.access || overrides.premium;
  if (!canAccess) return <div className="p-10 text-center"><h1>Access Denied</h1><Link href="/pricing" className="text-blue-600">Unlock Access</Link></div>;

  return (
    <div className="max-w-7xl mx-auto py-10 px-6 space-y-10">
      <h1 className="text-3xl font-bold border-b pb-4">Cover Letter Builder</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* COLUNA DA ESQUERDA: CAMPOS */}
        <div className="space-y-10">
          
          {/* Dados do Candidato */}
          <section className="bg-slate-50 p-6 rounded-xl space-y-4 border shadow-sm">
            <h2 className="font-bold text-blue-800 text-lg uppercase tracking-tight">1. Applicant Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input className="border p-2 rounded" placeholder="Full Name" value={applicantName} onChange={(e) => setField("applicantName", e.target.value)} />
              <input className="border p-2 rounded" placeholder="Email" value={applicantEmail} onChange={(e) => setField("applicantEmail", e.target.value)} />
              <input className="border p-2 rounded" placeholder="Your Address" value={applicantAddress} onChange={(e) => setField("applicantAddress", e.target.value)} />
              <input className="border p-2 rounded" placeholder="City, State ZIP" value={applicantCityStateZip} onChange={(e) => setField("applicantCityStateZip", e.target.value)} />
              <input className="border p-2 rounded" placeholder="Phone" value={applicantPhone} onChange={(e) => setField("applicantPhone", e.target.value)} />
              <input className="border p-2 rounded" type="date" value={date} onChange={(e) => setField("date", e.target.value)} />
            </div>
          </section>

          {/* ESPAÇO ENTRE SEÇÕES: Dados da Empresa */}
          <section className="bg-slate-50 p-6 rounded-xl space-y-4 border shadow-sm">
            <h2 className="font-bold text-blue-800 text-lg uppercase tracking-tight">2. Company & Employer Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input className="border p-2 rounded" placeholder="Hiring Manager Name" value={hiringManager} onChange={(e) => setField("hiringManager", e.target.value)} />
              <input className="border p-2 rounded" placeholder="Company Name" value={companyName} onChange={(e) => setField("companyName", e.target.value)} />
              <input className="border p-2 rounded" placeholder="Company Address" value={companyAddress} onChange={(e) => setField("companyAddress", e.target.value)} />
              <input className="border p-2 rounded" placeholder="Company City, State ZIP" value={companyCityStateZip} onChange={(e) => setField("companyCityStateZip", e.target.value)} />
            </div>
          </section>

          {/* Summary Generator */}
          <section className="bg-blue-50 p-6 rounded-xl space-y-4 border border-blue-100 shadow-sm">
            <h2 className="font-bold text-blue-800 text-lg">3. Experience Summary</h2>
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-500 uppercase">Upload Resume for AI Rewrite</label>
              <input type="file" accept=".pdf" onChange={(e) => setResumeFile(e.target.files?.[0] || null)} className="text-sm" />
              <button onClick={handleGenerateSummary} disabled={loadingSummary} className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700 transition-colors">
                {loadingSummary ? "Generating Summary..." : "Summary Generator"}
              </button>
              <textarea className="w-full border p-3 rounded-lg h-32 text-sm" value={experience} onChange={(e) => setField("experience", e.target.value)} />
            </div>
          </section>

          <div className="flex gap-4">
            <button onClick={handleGenerateLetter} disabled={loadingLetter} className="flex-1 bg-green-600 text-white py-4 rounded-xl font-bold shadow-lg">
              {loadingLetter ? "Generating..." : "Generate Cover-Letter"}
            </button>
            {generatedLetter && (
              <button onClick={handleExportPDF} disabled={loadingPDF} className="flex-1 bg-slate-800 text-white py-4 rounded-xl font-bold shadow-lg">
                {loadingPDF ? "Downloading..." : "Download PDF"}
              </button>
            )}
          </div>
        </div>

        {/* COLUNA DA DIREITA: PREVIEW EDITÁVEL */}
        <div className="bg-white border rounded-xl shadow-2xl p-8 flex flex-col h-full min-h-[800px]">
          <h2 className="text-xs font-bold text-slate-400 mb-4 uppercase tracking-widest border-b pb-2">Full Letter Preview (Editable)</h2>
          <textarea 
            className="flex-1 w-full border-none focus:ring-0 font-serif leading-relaxed text-slate-800 outline-none resize-none text-base" 
            value={generatedLetter} 
            onChange={(e) => setGeneratedLetter(e.target.value)} 
            placeholder="The full letter including headers will appear here..." 
          />
        </div>
      </div>
    </div>
  );
}
