"use client";

import { useState } from "react";
import { useResumeStore } from "@/app/store/useResumeStore";
import Link from "next/link";

interface ATSResult {
  mode: string;
  final_ats_score: number | null;
  strength_label: string;
  structure_score: number;
  skills_coverage_score?: number;
  semantic_match_score?: number;
  skills_found?: string[];
  skills_missing?: string[];
  suggestions_pt_br?: string[];
  suggestions?: string[];
  role_recommendations_pt_br?: string[];
  role_recommendations?: string[];
  specific_enhancements?: string[];
  raw_extraction?: any;
}

function labelStyle(label: string) {
  if (label === "Strong" || label === "Forte") return { border: "border-green-500", bg: "bg-green-50", color: "text-green-800", bar: "#16a34a" };
  if (label === "Good" || label === "Mediano") return { border: "border-amber-400", bg: "bg-amber-50", color: "text-amber-800", bar: "#d97706" };
  return { border: "border-red-400", bg: "bg-red-50", color: "text-red-700", bar: "#dc2626" };
}

function buildResumeText(store: any): string {
  const p = store.personalInfo || {};
  const parts: string[] = [];

  const name = [p.firstName, p.lastName].filter(Boolean).join(" ");
  if (name) parts.push(`Name: ${name}`);
  if (p.tradeTitle) parts.push(`Job Title: ${p.tradeTitle}`);
  if (p.city || p.state) parts.push(`Location: ${[p.city, p.state].filter(Boolean).join(", ")}`);
  if (p.linkedin) parts.push(`LinkedIn: ${p.linkedin}`);

  if (store.summary?.trim()) parts.push(`\nProfessional Summary:\n${store.summary.trim()}`);

  const skills = (store.skills || []).map((s: any) => (typeof s === "string" ? s : s.text || "")).filter(Boolean);
  if (skills.length) parts.push(`\nSkills: ${skills.join(", ")}`);

  const certs = (store.certifications || []).map((c: any) => c.text || c).filter(Boolean);
  if (certs.length) parts.push(`Certifications: ${certs.join(", ")}`);

  const experience = (store.experience || []).filter((e: any) => e.jobTitle || e.company);
  if (experience.length) {
    parts.push("\nWork Experience:");
    experience.forEach((exp: any) => {
      const dates = [exp.startDate, exp.endDate].filter(Boolean).join(" – ");
      const loc = [exp.city, exp.state].filter(Boolean).join(", ");
      parts.push(`${exp.jobTitle || ""}${exp.company ? " | " + exp.company : ""}${loc ? " | " + loc : ""}${dates ? " (" + dates + ")" : ""}`);
      if (exp.roleSummary?.trim()) parts.push(exp.roleSummary.trim());
      (exp.responsibilities || []).forEach((r: any) => {
        const t = typeof r === "string" ? r.trim() : (r.text || "").trim();
        if (t) parts.push(`• ${t}`);
      });
    });
  }

  const education = (store.education || []).filter((e: any) => e.school || e.degree);
  if (education.length) {
    parts.push("\nEducation:");
    education.forEach((e: any) => {
      const line = [e.degree, e.school].filter(Boolean).join(" — ");
      if (line) parts.push(line);
    });
  }

  return parts.join("\n");
}

export default function USATSStepPage() {
  const store = useResumeStore();
  const [mode, setMode] = useState<"general" | "with_job">("general");
  const [jobText, setJobText] = useState("");
  const [cleaning, setCleaning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ATSResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleCleanJobText() {
    if (!jobText.trim()) return;
    setCleaning(true);
    try {
      const res = await fetch("/api/ai/br/clean-job-text", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: jobText }),
      });
      const json = await res.json();
      if (json.cleaned) setJobText(json.cleaned);
    } catch { /* silent */ }
    finally { setCleaning(false); }
  }

  async function handleAnalyze() {
    setLoading(true); setError(null); setResult(null);

    const resumeText = buildResumeText(store);
    const wordCount = resumeText.trim().split(/\s+/).filter(Boolean).length;

    if (wordCount < 20) {
      setError("Please fill in more information in the builder before analyzing — at least your experience and skills.");
      setLoading(false);
      return;
    }
    if (mode === "with_job" && !jobText.trim()) {
      setError("Please paste a job description to compare against.");
      setLoading(false);
      return;
    }

    const payload: any = {
      resumeText,
      locale: "en",
      profession: store.personalInfo?.tradeTitle || null,
    };
    if (mode === "with_job") payload.jobDescription = jobText;

    try {
      const res = await fetch("/api/ai/br/ats-analyze", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.detail || json.error || `Error ${res.status}`);
      setResult(json);
    } catch (e: any) {
      setError(e.message || "Analysis failed. Please try again.");
    } finally { setLoading(false); }
  }

  const styles = result ? labelStyle(result.strength_label) : null;
  const suggestions = result?.suggestions_pt_br || result?.suggestions || [];
  const roleRecs = result?.role_recommendations_pt_br || result?.role_recommendations || [];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <p className="text-sm text-neutral-500 mb-1">Step 7 of 8 — ATS Analysis</p>
      <h1 className="text-2xl font-semibold mb-1">ATS Resume Analysis</h1>
      <p className="text-sm text-neutral-500 mb-6">
        See how your resume scores against automated screening systems — and exactly what to improve.
        This step is <strong>optional</strong> — you can skip straight to the preview.
      </p>

      {/* Mode selector */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button onClick={() => { setMode("general"); setResult(null); }}
          className={`px-4 py-4 rounded-xl border-2 text-left transition ${mode === "general" ? "border-blue-600 bg-blue-50" : "border-neutral-200 bg-white hover:border-blue-300"}`}>
          <p className="font-semibold text-sm text-neutral-900">📋 General strength check</p>
          <p className="text-xs text-neutral-500 mt-1">Analyzes your resume against typical expectations for your trade or role.</p>
        </button>
        <button onClick={() => { setMode("with_job"); setResult(null); }}
          className={`px-4 py-4 rounded-xl border-2 text-left transition ${mode === "with_job" ? "border-blue-600 bg-blue-50" : "border-neutral-200 bg-white hover:border-blue-300"}`}>
          <p className="font-semibold text-sm text-neutral-900">🎯 Compare to a job posting</p>
          <p className="text-xs text-neutral-500 mt-1">Paste a job description to see your ATS score and missing skills.</p>
        </button>
      </div>

      {/* Job description */}
      {mode === "with_job" && (
        <div className="bg-white border border-neutral-200 rounded-xl p-5 mb-5">
          <div className="flex items-center justify-between mb-2">
            <label className="font-semibold text-sm text-neutral-800">Job Description</label>
            {jobText.trim().length > 50 && (
              <button onClick={handleCleanJobText} disabled={cleaning}
                className="text-xs px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-60 flex items-center gap-1.5">
                {cleaning ? <><span className="inline-block h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />Cleaning…</> : "✦ Clean & Extract Requirements"}
              </button>
            )}
          </div>
          <textarea
            className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm resize-none h-40 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Paste the job posting here — from LinkedIn, Indeed, company website, or email. Click 'Clean & Extract' to strip out company boilerplate automatically."
            value={jobText}
            onChange={e => setJobText(e.target.value)}
          />
          <p className="text-xs text-neutral-400 mt-1">Paste any raw job text — the cleaner extracts just the requirements.</p>
        </div>
      )}

      {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 mb-4">{error}</div>}

      <button onClick={handleAnalyze} disabled={loading}
        className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition disabled:opacity-60 text-base mb-8">
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Analyzing with AI…
          </span>
        ) : "✦ Analyze My Resume"}
      </button>

      {/* Results */}
      {result && styles && (
        <div className="space-y-5 mb-8">
          {/* Score card */}
          <div className={`rounded-2xl border-2 p-6 ${styles.border} ${styles.bg}`}>
            <div className="flex items-center gap-5 mb-5">
              <div className="text-5xl font-bold" style={{ color: styles.bar }}>
                {result.final_ats_score !== null ? result.final_ats_score : result.structure_score}
              </div>
              <div>
                <span className={`inline-block font-bold px-3 py-1 rounded-full text-sm ${styles.color} bg-white border`} style={{ borderColor: styles.bar }}>
                  {result.strength_label}
                </span>
                <p className="text-xs text-neutral-500 mt-1.5">
                  {result.mode === "with_job" ? "ATS score against job description" : "General resume strength"}
                </p>
              </div>
            </div>
            <div className="space-y-3">
              {[
                { label: "Resume Structure", value: result.structure_score },
                ...(result.skills_coverage_score !== undefined ? [{ label: "Skills Coverage", value: result.skills_coverage_score }] : []),
                ...(result.semantic_match_score !== undefined ? [{ label: "Job Alignment", value: result.semantic_match_score }] : []),
              ].map(({ label, value }) => (
                <div key={label}>
                  <div className="flex justify-between text-sm text-neutral-700 mb-1">
                    <span>{label}</span><span className="font-semibold">{Math.round(value)}%</span>
                  </div>
                  <div className="h-2 bg-white/60 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${value}%`, backgroundColor: styles.bar }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Skills */}
          {result.mode === "with_job" && (result.skills_found?.length || result.skills_missing?.length) && (
            <div className="grid grid-cols-2 gap-3">
              {result.skills_found?.length ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <p className="font-semibold text-green-800 text-xs uppercase mb-2">✓ Skills Found</p>
                  <ul className="space-y-1">{result.skills_found.map((s, i) => <li key={i} className="text-xs text-green-700">• {s}</li>)}</ul>
                </div>
              ) : null}
              {result.skills_missing?.length ? (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <p className="font-semibold text-amber-800 text-xs uppercase mb-2">⚠ Missing Skills</p>
                  <ul className="space-y-1">{result.skills_missing.map((s, i) => <li key={i} className="text-xs text-amber-700">• {s}</li>)}</ul>
                </div>
              ) : null}
            </div>
          )}

          {/* Specific enhancements */}
          {result.specific_enhancements?.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
              <h3 className="font-semibold text-blue-900 flex items-center gap-2 mb-1 text-sm"><span>📈 Specific Improvements</span></h3>
              <p className="text-xs text-blue-700 mb-3">Concrete actions with estimated score impact.</p>
              <ul className="list-disc pl-5 space-y-2">
                {result.specific_enhancements.map((s, i) => <li key={i} className="text-sm text-blue-900">{s}</li>)}
              </ul>
            </div>
          )}

          {/* Role recommendations */}
          {roleRecs.length > 0 && (
            <div className="bg-white border border-blue-200 rounded-xl p-5">
              <h3 className="font-semibold text-neutral-800 flex items-center gap-2 mb-1 text-sm">
                <span>🎯 Recommendations for {result.raw_extraction?.resume_titles?.[0] || store.personalInfo?.tradeTitle || "your role"}</span>
              </h3>
              <p className="text-xs text-neutral-500 mb-3">What professionals in your field typically include — compared to your resume.</p>
              <ol className="list-decimal pl-5 space-y-2">
                {roleRecs.map((s: string, i: number) => <li key={i} className="text-sm text-neutral-700">{s}</li>)}
              </ol>
            </div>
          )}

          {/* General tips */}
          {suggestions.length > 0 && (
            <div className="bg-white border border-neutral-200 rounded-xl p-5">
              <h3 className="font-semibold text-neutral-800 flex items-center gap-2 mb-3 text-sm"><span>💡 General Structure Tips</span></h3>
              <ol className="list-decimal pl-5 space-y-2">
                {suggestions.map((s: string, i: number) => <li key={i} className="text-sm text-neutral-700">{s}</li>)}
              </ol>
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-4">
        <Link href="/resume/summary" className="px-6 py-2 bg-neutral-200 text-neutral-800 rounded-md text-sm hover:bg-neutral-300">← Back to Step 6</Link>
        <Link href="/resume/preview" className="px-6 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">Step 8: Final Preview →</Link>
      </div>
    </div>
  );
}
