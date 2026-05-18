"use client";

// Step 7 — Job Target Compare Matrix
// CV-1 delivers final resume strength + interactive job description comparison.
// Architecture rule: this is the ONLY place ATS scoring is surfaced to the user.

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { useResumeStore } from "@/app/store/useResumeStore";
import { useAssistantStore } from "@/app/store/useAssistantStore";
import { computeLiveAtsScore, atsLabelColor } from "@/lib/ats/live/liveAtsScore";
import CV1Character from "@/components/assistant/CV1Character";
import {
  Check, AlertCircle, Zap, MessageCircle,
  ChevronRight, Target, TrendingUp
} from "lucide-react";

// ─── Resume text builder for ATS analysis ────────────────────────────────────

function buildResumeText(store: any): string {
  // Build the richest possible resume text for semantic comparison.
  // More content = better embeddings = more accurate job match score.
  const p = store.personalInfo || {};
  const parts: string[] = [];

  const name = [p.firstName, p.lastName].filter(Boolean).join(" ");
  if (name)         parts.push(`Name: ${name}`);
  if (p.tradeTitle) parts.push(`Professional Title: ${p.tradeTitle}`);
  if (p.city || p.state) parts.push(`Location: ${[p.city, p.state].filter(Boolean).join(", ")}`);

  if (store.summary?.trim()) parts.push(`\nProfessional Summary:\n${store.summary.trim()}`);

  const skills = (store.skills || []).map((s: any) => (typeof s === "string" ? s : s.text || "")).filter(Boolean);
  if (skills.length) parts.push(`\nCore Skills: ${skills.join(", ")}`);

  const certs = (store.certifications || []).map((c: any) => (typeof c === "string" ? c : c.text || "")).filter(Boolean);
  if (certs.length) parts.push(`Certifications & Licenses: ${certs.join(", ")}`);

  const edu = (store.education || []).filter((e: any) => e.school || e.degree);
  if (edu.length) {
    parts.push(`\nEducation:`);
    edu.forEach((e: any) => {
      if (e.degree || e.school) parts.push(`${e.degree || ""} ${e.school ? "— " + e.school : ""}`.trim());
    });
  }

  const experience = (store.experience || []).filter((e: any) => e.jobTitle || e.company);
  if (experience.length) {
    parts.push(`\nWork Experience:`);
    experience.forEach((exp: any) => {
      const dates = [exp.startDate, exp.endDate].filter(Boolean).join(" – ");
      const loc   = [exp.city, exp.state].filter(Boolean).join(", ");
      parts.push(`\n${exp.jobTitle || ""}${exp.company ? " | " + exp.company : ""}${loc ? " | " + loc : ""}${dates ? " (" + dates + ")" : ""}`);
      if (exp.roleSummary?.trim()) parts.push(exp.roleSummary.trim());
      [...(exp.responsibilities || []), ...(exp.achievements || [])].forEach((b: any) => {
        const txt = typeof b === "string" ? b.trim() : (b.text || "").trim();
        if (txt) parts.push(`• ${txt}`);
      });
    });
  }

  return parts.join("\n");
}

// ─── Score ring component ─────────────────────────────────────────────────────

function ScoreRing({ score, max = 95, label, color }: { score: number; max?: number; label: string; color: string }) {
  const pct = Math.min(100, (score / max) * 100);
  const r   = 36;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-24 h-24">
        <svg width="96" height="96" viewBox="0 0 96 96" className="-rotate-90">
          <circle cx="48" cy="48" r={r} fill="none" stroke="#f1f5f9" strokeWidth="8"/>
          <circle
            cx="48" cy="48" r={r} fill="none"
            stroke={color} strokeWidth="8"
            strokeDasharray={`${dash} ${circ}`}
            strokeLinecap="round"
            style={{ transition: "stroke-dasharray 0.8s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-black" style={{ color }}>{score}</span>
          <span className="text-[10px] text-neutral-400 font-medium">/{max}</span>
        </div>
      </div>
      <span className="text-xs font-bold" style={{ color }}>{label}</span>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const EMPTY_ATS = { score: 15, label: "Building" as const, flags: [] as any[], breakdown: { personal: 0, summary: 0, experience: 0, skills: 0, education: 0, certifications: 0 } };

export default function JobTargetStep() {
  const store      = useResumeStore();
  const { open }   = useAssistantStore();

  // Guard against hydration mismatch — Zustand persisted store is empty on
  // server render, populated on client. Only compute score after mount.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Detect empty store — user navigated here directly without building
  const hasResumeData = mounted && !!(store.personalInfo?.firstName || store.experience?.some((e: any) => e.jobTitle));

  const firstName  = mounted ? (store.personalInfo?.firstName || "there") : "there";

  let liveAts = EMPTY_ATS;
  if (mounted) {
    try { liveAts = computeLiveAtsScore(store); } catch { /* silent */ }
  }
  const scoreColor = atsLabelColor(liveAts.label);

  const [jobText,  setJobText]  = useState("");
  const [loading,  setLoading]  = useState(false);
  const isThinking = loading;
  const [result,   setResult]   = useState<any>(null);
  const [error,    setError]    = useState<string | null>(null);

  const errorFlags  = liveAts.flags.filter(f => f.severity === "error");
  const warnFlags   = liveAts.flags.filter(f => f.severity === "warning");

  // ── Run job comparison ──────────────────────────────────────────────────
  const runComparison = useCallback(async () => {
    if (!jobText.trim()) return;
    setLoading(true); setError(null); setResult(null);

    const resumeText = buildResumeText(store);
    if (resumeText.trim().split(/\s+/).length < 20) {
      setError("Please complete more of your resume before running a comparison.");
      setLoading(false); return;
    }

    try {
      const res  = await fetch("/api/ai/br/ats-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText,
          jobDescription: jobText,
          locale: "en",
          // Pass job title for semantic floor calculation
          candidateTitle: store.personalInfo?.tradeTitle || null,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.detail || json.error || `Error ${res.status}`);
      setResult(json);
    } catch (e: any) {
      setError(e.message || "Analysis failed. Please try again.");
    } finally { setLoading(false); }
  }, [jobText, store]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-32">

      {/* ── Header ── */}
      <p className="text-sm text-neutral-500 mb-1">Step 7 of 8</p>

      <div className="flex items-start gap-5 mb-8">
        <CV1Character mood={isThinking ? "thinking" : "talking"} size={90} />
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-1">
            CV-1 Final Review + Job Target
          </h1>
          <p className="text-neutral-500 text-sm leading-relaxed">
            Hey {firstName}! Here&apos;s your current resume strength. Want to see how it matches a specific job?
            Paste the description below — I&apos;ll run a full gap analysis.
          </p>
        </div>
      </div>

      {/* ── Empty state: navigated here directly without building ── */}
      {mounted && !hasResumeData && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6 text-center">
          <p className="text-amber-800 font-semibold mb-2">No resume data found</p>
          <p className="text-amber-700 text-sm mb-4">
            It looks like you navigated here directly. Please start from Step 1 to build your resume — CV-1 will be with you the whole way.
          </p>
          <Link href="/resume/personal" className="inline-block px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition">
            Start Building →
          </Link>
        </div>
      )}

      {/* ── Live score panel ── */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-6 mb-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="font-bold text-neutral-800 text-base">Current Resume Strength</p>
            <p className="text-xs text-neutral-500 mt-0.5">Based on completeness, structure, and content quality</p>
          </div>
          <ScoreRing score={liveAts.score} label={liveAts.label} color={scoreColor} />
        </div>

        {/* Breakdown bars */}
        <div className="space-y-2.5">
          {([
            ["Personal Info", liveAts.breakdown.personal, 12],
            ["Summary",       liveAts.breakdown.summary,  13],
            ["Experience",    liveAts.breakdown.experience, 35],
            ["Skills",        liveAts.breakdown.skills,    12],
            ["Education",     liveAts.breakdown.education,  8],
            ["Certifications", liveAts.breakdown.certifications, 6],
          ] as [string, number, number][]).map(([label, pts, max]) => (
            <div key={label}>
              <div className="flex justify-between text-xs text-neutral-600 mb-1">
                <span>{label}</span>
                <span className="font-semibold">{pts} / {max}</span>
              </div>
              <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(100, (pts / max) * 100)}%`, backgroundColor: scoreColor }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Validation flags ── */}
      {(errorFlags.length > 0 || warnFlags.length > 0) && (
        <div className="bg-white border border-neutral-200 rounded-2xl p-5 mb-6 shadow-sm">
          <p className="font-semibold text-neutral-800 text-sm mb-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            CV-1 detected {errorFlags.length + warnFlags.length} item{errorFlags.length + warnFlags.length !== 1 ? "s" : ""} to address
          </p>
          <div className="space-y-2">
            {errorFlags.map((f, i) => (
              <div key={i} className="flex items-start gap-2 p-2.5 bg-red-50 rounded-xl border border-red-100 text-xs text-red-700">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                <span>⚠️ Missing Data: {f.message}</span>
              </div>
            ))}
            {warnFlags.map((f, i) => (
              <div key={i} className="flex items-start gap-2 p-2.5 bg-amber-50 rounded-xl border border-amber-100 text-xs text-amber-700">
                <Zap className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                <span>{f.message}</span>
              </div>
            ))}
          </div>
          <button
            onClick={open}
            className="mt-3 flex items-center gap-2 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            Ask CV-1 to fix these now →
          </button>
        </div>
      )}

      {/* ── Job Target Compare Matrix ── */}
      <div className="bg-gradient-to-br from-slate-900 to-blue-950 border border-blue-800/30 rounded-2xl p-6 mb-6 shadow-xl">
        <div className="flex items-center gap-2.5 mb-2">
          <Target className="w-5 h-5 text-blue-400" />
          <h2 className="text-white font-bold text-base">Compare Your Resume to a Target Job</h2>
        </div>
        <p className="text-blue-200/70 text-sm mb-4">
          Paste any job description — CV-1 will scan for keyword gaps, missing skills, and give you a match score.
        </p>

        <textarea
          value={jobText}
          onChange={(e) => setJobText(e.target.value)}
          placeholder="Paste the job description here — from LinkedIn, Indeed, company website, or email..."
          className="w-full h-40 bg-slate-800/80 border border-blue-700/30 rounded-xl px-4 py-3 text-sm text-white placeholder:text-blue-300/40 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 resize-none transition-all"
        />

        {error && (
          <div className="mt-3 px-3 py-2 bg-red-500/20 border border-red-500/30 rounded-xl text-sm text-red-300">
            {error}
          </div>
        )}

        <button
          onClick={runComparison}
          disabled={!jobText.trim() || loading}
          className="mt-4 w-full py-3.5 bg-blue-500 hover:bg-blue-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              CV-1 is analyzing the match…
            </>
          ) : (
            <>
              <TrendingUp className="w-4 h-4" />
              Run Job Target Analysis →
            </>
          )}
        </button>
      </div>

      {/* ── Analysis results ── */}
      {result && (
        <div className="space-y-4 mb-6">
          {/* Match score */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-start gap-6 mb-4">
              <ScoreRing
                score={result.final_ats_score ?? result.structure_score ?? 0}
                max={95}
                label={result.strength_label}
                color={result.strength_label === "Strong" ? "#16a34a" : result.strength_label === "Good" || result.strength_label === "Building" ? "#d97706" : "#dc2626"}
              />
              <div className="flex-1">
                <p className="font-bold text-neutral-800 text-base">Job Match Score</p>
                <p className="text-xs text-neutral-500 mt-0.5 mb-2">CV-1 read both documents as a recruiter would</p>
                {result.match_summary && (
                  <p className="text-sm text-neutral-700 leading-relaxed bg-neutral-50 rounded-xl p-3 border border-neutral-100">
                    {result.match_summary}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Skill gap */}
          {(result.skills_found?.length > 0 || result.skills_missing?.length > 0) && (
            <div className="grid sm:grid-cols-2 gap-3">
              {result.skills_found?.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
                  <p className="font-semibold text-green-800 text-xs uppercase mb-2">✓ Skills Matched</p>
                  <ul className="space-y-1">
                    {result.skills_found.map((s: string, i: number) => (
                      <li key={i} className="flex items-center gap-1.5 text-xs text-green-700">
                        <Check className="w-3 h-3 flex-shrink-0" />{s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {result.skills_missing?.length > 0 && (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4">
                  <p className="font-semibold text-rose-800 text-xs uppercase mb-2">✗ Skill Gaps</p>
                  <ul className="space-y-1">
                    {result.skills_missing.map((s: string, i: number) => (
                      <li key={i} className="text-xs text-rose-700">• {s}</li>
                    ))}
                  </ul>
                  <button onClick={open} className="mt-3 text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1">
                    <MessageCircle className="w-3 h-3" /> Ask CV-1 to add these →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Recommendations */}
          {result.specific_enhancements?.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
              <h3 className="font-semibold text-blue-900 text-sm mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" /> Targeted Improvements
              </h3>
              <ul className="space-y-2">
                {result.specific_enhancements.map((s: string, i: number) => (
                  <li key={i} className="text-sm text-blue-900 flex items-start gap-2">
                    <ChevronRight className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-blue-500" />{s}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* ── Navigation ── */}
      <div className="flex justify-between mt-4">
        <Link href="/resume/summary"
          className="px-6 py-2.5 bg-neutral-200 text-neutral-800 rounded-xl text-sm font-medium hover:bg-neutral-300 transition">
          ← Back to Step 6
        </Link>
        <Link href="/resume/preview"
          className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition flex items-center gap-2">
          Final Preview → <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
