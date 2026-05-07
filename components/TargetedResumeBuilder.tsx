"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useResumeStore } from "@/app/store/useResumeStore";

export default function TargetedResumeBuilder() {
  const [jobDescription, setJobDescription] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState<"idle" | "parsing" | "analyzing" | "building" | "done">("idle");
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
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

    setLoading(true);
    setError(null);
    setStep("parsing");

    try {
      // Step 1: Extract text from resume
      const formData = new FormData();
      formData.append("file", resumeFile);
      const parseRes = await fetch("/api/ai/parse-resume", { method: "POST", body: formData });
      const parseData = await parseRes.json();

      if (!parseRes.ok || !parseData.data) {
        setError(parseData.error || "Could not read your resume. Try a different file.");
        return;
      }

      // Build resume text from parsed data for the AI
      const d = parseData.data;
      const resumeText = [
        `${d.personalInfo?.firstName || ""} ${d.personalInfo?.lastName || ""}`.trim(),
        d.personalInfo?.tradeTitle || "",
        d.personalInfo?.phone || "",
        d.personalInfo?.email || "",
        `${d.personalInfo?.city || ""} ${d.personalInfo?.state || ""}`.trim(),
        "",
        "SUMMARY",
        d.summary || "",
        "",
        "SKILLS",
        (d.skills || []).join(", "),
        "",
        "EXPERIENCE",
        ...(d.experience || []).flatMap((exp: any) => [
          `${exp.jobTitle} at ${exp.company} (${exp.startDate} – ${exp.endDate})`,
          ...(exp.responsibilities || []).map((r: string) => `• ${r}`),
        ]),
        "",
        "EDUCATION",
        ...(d.education || []).map((edu: any) => `${edu.degree}, ${edu.school}, ${edu.year}`),
      ].join("\n");

      setStep("analyzing");

      // Step 2: Build targeted resume
      const buildRes = await fetch("/api/ai/build-targeted-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, jobDescription }),
      });

      const buildData = await buildRes.json();
      if (!buildRes.ok || !buildData.resume) {
        setError(buildData.error || "Failed to build resume. Please try again.");
        return;
      }

      setStep("building");

      const r = buildData.resume;

      // Pre-fill the store with the targeted resume
      if (r.personalInfo) {
        const p = r.personalInfo;
        store.updatePersonalInfo("firstName", p.firstName || "");
        store.updatePersonalInfo("lastName", p.lastName || "");
        store.updatePersonalInfo("tradeTitle", p.tradeTitle || "");
        store.updatePersonalInfo("phone", p.phone || "");
        store.updatePersonalInfo("email", p.email || "");
        store.updatePersonalInfo("city", p.city || "");
        store.updatePersonalInfo("state", p.state || "");
      }

      if (r.summary) store.updateSummary(r.summary);

      if (Array.isArray(r.skills)) {
        store.setField("skills", r.skills.map((text: string) => ({
          text,
          suggestion: null,
          hasAcceptedSuggestion: false,
          loading: false,
        })));
      }

      if (Array.isArray(r.experience)) {
        store.setField("experience", r.experience.map((exp: any) => ({
          id: `${Date.now()}-${Math.random()}`,
          jobTitle: exp.jobTitle || "",
          company: exp.company || "",
          startDate: exp.startDate || "",
          endDate: exp.endDate || "",
          responsibilities: (exp.responsibilities || []).map((text: string) => ({
            id: `${Date.now()}-${Math.random()}`,
            text,
            suggestion: null,
            hasAcceptedSuggestion: false,
            loading: false,
            error: null,
            needsRewrite: false,
          })),
          achievements: (exp.achievements || []).map((text: string) => ({
            id: `${Date.now()}-${Math.random()}`,
            text,
            suggestion: null,
            hasAcceptedSuggestion: false,
            loading: false,
          })),
        })));
      }

      if (Array.isArray(r.education)) {
        store.setField("education", r.education.map((edu: any) => ({
          school: edu.school || "",
          degree: edu.degree || "",
          year: edu.year || "",
          gpa: edu.gpa || "",
        })));
      }

      // Store ATS data for the score tracker
      if (r.atsScore) {
        store.setField("jobDescription", jobDescription);
        store.setField("atsPresent", r.atsScore.presentKeywords || []);
        store.setField("atsMissing", r.atsScore.missingKeywords || []);
        store.setField("atsBaseScore", r.atsScore.score || 0);
      }

      setStep("done");
      setSuccess(true);
      setTimeout(() => router.push("/resume/personal"), 1800);

    } catch (err: any) {
      setError(err?.message || "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="border-2 border-green-400 bg-green-50 rounded-xl p-6 text-center">
        <div className="text-3xl mb-2">✓</div>
        <p className="font-bold text-green-800">Resume built and optimized!</p>
        <p className="text-green-700 text-sm mt-1">Taking you to the builder — review, edit, and download.</p>
      </div>
    );
  }

  const stepLabels: Record<string, string> = {
    parsing: "Reading your resume...",
    analyzing: "Analyzing the job description...",
    building: "Building your targeted resume...",
  };

  return (
    <div className="space-y-4">
      {/* Resume upload */}
      <div>
        <label className="block text-sm font-semibold text-neutral-800 mb-1">
          1. Upload Your Existing Resume
        </label>
        <div
          onClick={() => fileRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition ${
            resumeFile ? "border-green-400 bg-green-50" : "border-neutral-300 bg-neutral-50 hover:border-blue-400"
          }`}
        >
          <input ref={fileRef} type="file"
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) { setResumeFile(f); setError(null); } }}
          />
          {resumeFile ? (
            <div className="flex items-center justify-center gap-2 text-green-700">
              <span>✓</span>
              <span className="text-sm font-medium">{resumeFile.name}</span>
              <button onClick={e => { e.stopPropagation(); setResumeFile(null); }}
                className="text-xs text-red-500 hover:underline ml-2">Remove</button>
            </div>
          ) : (
            <div>
              <p className="text-sm font-medium text-neutral-700">Click to upload your resume</p>
              <p className="text-xs text-neutral-400 mt-0.5">PDF or Word (.docx) · Max 10MB</p>
            </div>
          )}
        </div>
      </div>

      {/* Job description */}
      <div>
        <label className="block text-sm font-semibold text-neutral-800 mb-1">
          2. Paste the Job Description
        </label>
        <textarea
          className="w-full border-2 border-neutral-200 rounded-xl p-3 text-sm h-36 resize-none focus:ring-2 focus:ring-blue-400 focus:outline-none bg-white focus:border-blue-400"
          placeholder="Paste the full job posting here — job title, company, requirements, responsibilities, qualifications..."
          value={jobDescription}
          onChange={e => setJobDescription(e.target.value)}
        />
        <p className="text-xs text-neutral-400 mt-1">The more complete the job posting, the better the match.</p>
      </div>

      {error && (
        <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
      )}

      <button
        onClick={handleBuild}
        disabled={loading || !resumeFile || !jobDescription.trim()}
        className="w-full py-4 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl disabled:opacity-40 transition text-sm"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            {stepLabels[step] || "Building..."}
          </span>
        ) : (
          "⚡ Build My Targeted Resume →"
        )}
      </button>

      {loading && (
        <div className="text-xs text-center text-neutral-400">
          This takes 15-20 seconds — the AI is doing a deep analysis of both documents.
        </div>
      )}
    </div>
  );
}
