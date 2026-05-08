"use client";

import { useState, useRef } from "react";
import { useResumeStore } from "@/app/store/useResumeStore";

export default function TargetedResumeBuilder() {
  const [jobDescription, setJobDescription] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState<"idle" | "parsing" | "analyzing" | "optimizing" | "done">("idle");
  const [progress, setProgress] = useState(0);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const store = useResumeStore();

  const ACCEPTED = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  async function handleBuild() {
    if (!resumeFile || !jobDescription.trim()) return;

    const isAccepted = ACCEPTED.includes(resumeFile.type) ||
      resumeFile.name.toLowerCase().endsWith(".pdf") ||
      resumeFile.name.toLowerCase().endsWith(".docx");

    if (!isAccepted) { setError("Please upload a PDF or Word (.docx) file."); return; }
    if (resumeFile.size > 10 * 1024 * 1024) { setError("File too large. Max 10MB."); return; }

    setLoading(true); setError(null); setStep("parsing"); setProgress(15);

    try {
      const formData = new FormData();
      formData.append("file", resumeFile);
      const parseRes = await fetch("/api/ai/parse-resume", { method: "POST", body: formData });
      const parseData = await parseRes.json();
      if (!parseRes.ok || !parseData.data) { setError(parseData.error || "Could not read your resume."); return; }

      setStep("analyzing"); setProgress(40);

      const d = parseData.data;
      const resumeText = [
        `${d.personalInfo?.firstName || ""} ${d.personalInfo?.lastName || ""}`.trim(),
        d.personalInfo?.tradeTitle || "",
        d.personalInfo?.phone || "", d.personalInfo?.email || "",
        `${d.personalInfo?.city || ""} ${d.personalInfo?.state || ""}`.trim(),
        "",
        "SUMMARY", d.summary || "",
        "",
        "SKILLS", (d.skills || []).join(", "),
        "",
        "EXPERIENCE",
        ...(d.experience || []).flatMap((exp: any) => [
          `${exp.jobTitle} | ${exp.company} | ${exp.startDate} – ${exp.endDate}`,
          ...(exp.responsibilities || []).map((r: string) => `• ${r}`),
        ]),
        "",
        "EDUCATION",
        ...(d.education || []).map((edu: any) => `${edu.degree}, ${edu.school}, ${edu.year}`),
      ].join("\n");

      setStep("optimizing"); setProgress(70);

      const buildRes = await fetch("/api/ai/build-targeted-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, jobDescription }),
      });
      const buildData = await buildRes.json();
      if (!buildRes.ok || !buildData.resume) { setError(buildData.error || "Failed to build resume."); return; }

      setProgress(95);
      const r = buildData.resume;

      if (r.personalInfo) {
        const p = r.personalInfo;
        ["firstName","lastName","tradeTitle","phone","email","city","state"]
          .forEach(f => store.updatePersonalInfo(f as any, p[f] || ""));
      }
      if (r.summary) store.updateSummary(r.summary);
      if (Array.isArray(r.skills)) {
        store.setField("skills", r.skills.map((t: string) => ({ text: t, suggestion: null, hasAcceptedSuggestion: false, loading: false })));
      }
      if (Array.isArray(r.experience)) {
        store.setField("experience", r.experience.map((exp: any) => ({
          id: `${Date.now()}-${Math.random()}`,
          jobTitle: exp.jobTitle || "", company: exp.company || "",
          startDate: exp.startDate || "", endDate: exp.endDate || "",
          responsibilities: (exp.responsibilities || []).map((t: string) => ({
            id: `${Date.now()}-${Math.random()}`, text: t,
            suggestion: null, hasAcceptedSuggestion: false, loading: false, error: null, needsRewrite: false,
          })),
          achievements: (exp.achievements || []).map((t: string) => ({
            id: `${Date.now()}-${Math.random()}`, text: t,
            suggestion: null, hasAcceptedSuggestion: false, loading: false,
          })),
        })));
      }
      if (Array.isArray(r.education)) {
        store.setField("education", r.education.map((e: any) => ({ school: e.school||"", degree: e.degree||"", year: e.year||"", gpa: e.gpa||"" })));
      }
      if (r.atsScore) {
        store.setField("jobDescription", jobDescription);
        store.setField("atsPresent", r.atsScore.presentKeywords || []);
        store.setField("atsMissing", r.atsScore.missingKeywords || []);
        store.setField("atsBaseScore", r.atsScore.score || 0);
      }

      setProgress(100); setStep("done"); setSuccess(true);

    } catch (err: any) {
      setError(err?.message || "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="bg-green-50 border-2 border-green-400 rounded-xl p-5 text-center space-y-3">
        <div className="text-4xl">✓</div>
        <p className="font-bold text-green-800 text-base">Your targeted resume is built!</p>
        <p className="text-green-700 text-sm">Your information has been pre-filled. Now pick a template below, then click <strong>"Continue to Step 2"</strong> to review and edit your resume.</p>
        <button
          onClick={() => { setSuccess(false); setStep("idle"); setProgress(0); setResumeFile(null); setJobDescription(""); }}
          className="text-xs text-green-600 hover:underline"
        >
          Build another targeted resume
        </button>
      </div>
    );
  }

  const steps = [
    { key: "parsing", label: "Reading your resume", pct: 15 },
    { key: "analyzing", label: "Analyzing the job description", pct: 40 },
    { key: "optimizing", label: "Optimizing every bullet for this role", pct: 70 },
  ];
  const currentStepLabel = steps.find(s => s.key === step)?.label || "";

  return (
    <div className="space-y-4">
      {/* Upload */}
      <div>
        <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wide mb-1.5">
          Step 1 — Upload Your Resume
        </label>
        <div
          onClick={() => !loading && fileRef.current?.click()}
          onDragOver={e => { e.preventDefault(); if (!loading) setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => {
            e.preventDefault();
            setDragging(false);
            if (loading) return;
            const f = e.dataTransfer.files?.[0];
            if (f) { setResumeFile(f); setError(null); }
          }}
          className={`border-2 border-dashed rounded-xl p-4 text-center transition ${
            loading ? "cursor-not-allowed opacity-60" :
            dragging ? "border-blue-500 bg-blue-100 cursor-copy" :
            resumeFile ? "border-blue-400 bg-blue-50 cursor-pointer" :
            "border-neutral-300 bg-neutral-50 hover:border-blue-400 hover:bg-blue-50 cursor-pointer"
          }`}
        >
          <input ref={fileRef} type="file"
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) { setResumeFile(f); setError(null); } }}
          />
          {resumeFile ? (
            <div className="flex items-center justify-center gap-2 text-blue-700">
              <span className="text-lg">📄</span>
              <span className="text-sm font-semibold truncate max-w-[200px]">{resumeFile.name}</span>
              <button onClick={e => { e.stopPropagation(); setResumeFile(null); }}
                className="text-xs text-red-500 hover:text-red-700 ml-1">✕</button>
            </div>
          ) : (
            <div className="space-y-1">
              <p className="text-sm font-semibold text-neutral-700">Drop your resume here or click to browse</p>
              <p className="text-xs text-neutral-400">PDF or Word (.docx) · Max 10MB</p>
            </div>
          )}
        </div>
      </div>

      {/* Job description */}
      <div>
        <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wide mb-1.5">
          Step 2 — Paste the Job Description
        </label>
        <textarea
          disabled={loading}
          className="w-full border-2 border-neutral-200 rounded-xl p-3 text-sm h-32 resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none bg-white disabled:opacity-60"
          placeholder="Paste the complete job posting — title, company, responsibilities, requirements, qualifications..."
          value={jobDescription}
          onChange={e => setJobDescription(e.target.value)}
        />
        <p className="text-xs text-neutral-400 mt-1">The more complete the job posting, the more precisely your resume will be optimized.</p>
      </div>

      {error && (
        <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
      )}

      {/* Progress bar */}
      {loading && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-neutral-500">
            <span>{currentStepLabel}...</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-center text-neutral-400">Takes 15–20 seconds. The AI analyzes both documents thoroughly.</p>
        </div>
      )}

      <button
        onClick={handleBuild}
        disabled={loading || !resumeFile || !jobDescription.trim()}
        className="w-full py-3.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl disabled:opacity-40 transition text-sm tracking-wide"
      >
        {loading ? "Building your targeted resume..." : "⚡  Build My Targeted Resume"}
      </button>
    </div>
  );
}
