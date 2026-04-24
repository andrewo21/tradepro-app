"use client";

import { useResumeStore } from "@/app/store/useResumeStore";
import { useState } from "react";
import Link from "next/link";

export default function ResumePreviewPage() {
  const { personalInfo, summary, skills, experience, selectedTemplate } = useResumeStore();
  const [loading, setLoading] = useState(false);
  const API_BASE = process.env.NEXT_PUBLIC_API_URL;

  const handleDownloadPDF = async () => {
    if (!API_BASE) return alert("API not configured.");
    setLoading(true);
    try {
      const payload = {
        type: "resume",
        applicantName: `${personalInfo.firstName || ""} ${personalInfo.lastName || ""}`,
        applicantEmail: personalInfo.email,
        applicantPhone: personalInfo.phone,
        applicantAddress: personalInfo.city && personalInfo.state ? `${personalInfo.city}, ${personalInfo.state}` : "",
        summary: summary,
        // FIX: Ensure skills are passed as text array for the PDF engine
        skills: skills?.map((s: any) => s.text) || [],
        experience: experience.map((exp: any) => ({
          jobTitle: exp.jobTitle,
          company: exp.company,
          startDate: exp.startDate,
          endDate: exp.endDate,
          responsibilities: exp.responsibilities || [] // Pass full array for server.js logic
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
      a.download = `${personalInfo.lastName || "Resume"}_TradePro.pdf`;
      a.click();
    } catch (err) { alert("Resume PDF Error."); } finally { setLoading(false); }
  };

  // Logic to handle on-screen template styles
  const isGreenSidebar = selectedTemplate === "sidebar-green";

  return (
    <div className="max-w-5xl mx-auto py-10 px-6">
      <div className="flex justify-between items-center border-b pb-6 mb-10">
        <div>
          <h1 className="text-3xl font-bold">Resume Preview</h1>
          <p className="text-sm text-gray-500">Template: <span className="font-bold capitalize">{selectedTemplate.replace('-', ' ')}</span></p>
        </div>
        <div className="flex gap-4">
          <Link href="/resume/personal" className="px-4 py-2 border rounded hover:bg-gray-50 transition">Edit Details</Link>
          <button 
            onClick={handleDownloadPDF} 
            disabled={loading} 
            className="px-6 py-2 bg-blue-600 text-white rounded font-bold shadow-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
          >
            {loading ? "Generating..." : "Download Resume PDF"}
          </button>
        </div>
      </div>

      {/* DYNAMIC PREVIEW CONTAINER */}
      <div className={`bg-white shadow-2xl min-h-[1000px] border rounded-lg overflow-hidden flex ${isGreenSidebar ? 'flex-row' : 'flex-col'}`}>
        
        {/* SIDEBAR (Only shows for sidebar templates) */}
        {isGreenSidebar && (
          <div className="w-1/3 bg-slate-800 text-white p-8 space-y-8">
             <div className="border-b border-slate-600 pb-6 text-center">
                <div className="w-24 h-24 bg-green-500 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-bold text-white">
                    {personalInfo.firstName?.[0]}{personalInfo.lastName?.[0]}
                </div>
                <h2 className="text-xl font-bold">{personalInfo.firstName} {personalInfo.lastName}</h2>
                <p className="text-green-400 text-sm">{personalInfo.tradeTitle}</p>
             </div>
             <section>
                <h3 className="text-xs font-bold text-green-400 uppercase tracking-widest mb-4">Contact</h3>
                <p className="text-sm break-all">{personalInfo.email}</p>
                <p className="text-sm">{personalInfo.phone}</p>
                <p className="text-sm">{personalInfo.city}, {personalInfo.state}</p>
             </section>
             <section>
                <h3 className="text-xs font-bold text-green-400 uppercase tracking-widest mb-4">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {skills.map((s: any, i: number) => (
                    <span key={i} className="text-xs bg-slate-700 px-2 py-1 rounded">{s.text}</span>
                  ))}
                </div>
             </section>
          </div>
        )}

        {/* MAIN CONTENT AREA */}
        <div className={`p-10 ${isGreenSidebar ? 'w-2/3' : 'w-full'}`}>
          {/* HEADER (Only for non-sidebar templates) */}
          {!isGreenSidebar && (
            <div className="text-center border-b pb-8 mb-8">
              <h2 className="text-4xl font-bold uppercase tracking-tight">{personalInfo.firstName} {personalInfo.lastName}</h2>
              <p className="text-blue-600 font-bold text-xl mt-1">{personalInfo.tradeTitle}</p>
              <div className="text-sm text-gray-500 mt-2">
                {personalInfo.email} | {personalInfo.phone} | {personalInfo.city}, {personalInfo.state}
              </div>
            </div>
          )}

          <div className="space-y-8">
            <section>
                <h3 className={`font-bold border-b-2 mb-3 pb-1 ${isGreenSidebar ? 'border-green-500' : 'border-blue-800'}`}>PROFESSIONAL SUMMARY</h3>
                <p className="text-gray-700 leading-relaxed">{summary || "Add a professional summary to see it here."}</p>
            </section>

            <section>
              <h3 className={`font-bold border-b-2 mb-4 pb-1 ${isGreenSidebar ? 'border-green-500' : 'border-blue-800'}`}>WORK EXPERIENCE</h3>
              {experience.map((exp: any) => (
                <div key={exp.id} className="mb-6">
                  <div className="flex justify-between items-baseline">
                    <p className="font-bold text-lg">{exp.jobTitle}</p>
                    <p className="text-sm text-gray-500">{exp.startDate} - {exp.endDate || "Present"}</p>
                  </div>
                  <p className="text-blue-700 font-semibold mb-2">{exp.company}</p>
                  <ul className="list-disc ml-5 text-sm space-y-1 text-gray-600">
                    {exp.responsibilities.map((r: any, i: number) => (
                      <li key={i}>{r.text}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </section>

            {/* SKILLS FOR NON-SIDEBAR TEMPLATES */}
            {!isGreenSidebar && (
                 <section>
                    <h3 className="font-bold border-b-2 border-blue-800 mb-3 pb-1">SKILLS</h3>
                    <p className="text-gray-700">{skills.map((s: any) => s.text).join(" | ")}</p>
                 </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
