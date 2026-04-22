"use client";

import { useResumeStore } from "@/app/store/useResumeStore";
import { useState } from "react";
import Link from "next/link";

export default function ResumePreviewPage() {
  const { personalInfo, summary, skills, experience } = useResumeStore();
  const [loading, setLoading] = useState(false);
  const API_BASE = process.env.NEXT_PUBLIC_API_URL;

  const handleDownloadPDF = async () => {
    if (!API_BASE) return alert("API not configured.");
    setLoading(true);
    try {
      const payload = {
        type: "resume",
        applicantName: `${personalInfo.firstName} ${personalInfo.lastName}`,
        applicantEmail: personalInfo.email,
        applicantPhone: personalInfo.phone,
        applicantAddress: `${personalInfo.city}, ${personalInfo.state}`,
        summary: summary,
        experience: experience.map(exp => ({
          title: exp.jobTitle,
          company: exp.company,
          startDate: exp.startDate,
          endDate: exp.endDate,
          description: exp.responsibilities.map(r => r.text).join("\n")
        }))
      };

      const res = await fetch(`${API_BASE}/api/export/pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Resume-TradePro.pdf";
      a.click();
    } catch (err) { alert("Resume PDF Error."); } finally { setLoading(false); }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-6">
      <div className="flex justify-between items-center border-b pb-6 mb-10">
        <h1 className="text-3xl font-bold">Resume Preview</h1>
        <div className="flex gap-4">
          <Link href="/resume/personal" className="px-4 py-2 border rounded">Edit Details</Link>
          <button onClick={handleDownloadPDF} disabled={loading} className="px-6 py-2 bg-blue-600 text-white rounded font-bold shadow-lg">
            {loading ? "Generating..." : "Download Resume PDF"}
          </button>
        </div>
      </div>

      <div className="bg-white shadow-2xl p-10 min-h-[800px] border rounded-lg">
        <div className="text-center border-b pb-6 mb-6">
          <h2 className="text-4xl font-bold uppercase">{personalInfo.firstName} {personalInfo.lastName}</h2>
          <p className="text-blue-600 font-bold">{personalInfo.tradeTitle}</p>
        </div>
        <div className="space-y-6">
          <section><h3 className="font-bold border-b mb-2">SUMMARY</h3><p>{summary}</p></section>
          <section>
            <h3 className="font-bold border-b mb-2">EXPERIENCE</h3>
            {experience.map(exp => (
              <div key={exp.id} className="mb-4">
                <p className="font-bold">{exp.jobTitle} - {exp.company}</p>
                <ul className="list-disc ml-5 text-sm">{exp.responsibilities.map((r, i) => <li key={i}>{r.text}</li>)}</ul>
              </div>
            ))}
          </section>
        </div>
      </div>
    </div>
  );
}
