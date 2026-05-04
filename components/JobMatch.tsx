"use client";

import { useState } from "react";
import { useResumeStore } from "@/app/store/useResumeStore";

interface MatchResult {
  missingKeywords: string[];
  presentKeywords: string[];
  optimizedSummary: string;
  bulletSuggestions: string[];
  smartSkillAdditions: string[];
}

export default function JobMatch() {
  const { jobDescription, summary, skills, experience, setField, updateSummary, addSkill } = useResumeStore();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MatchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [applied, setApplied] = useState<{ summary: boolean; skills: boolean }>({ summary: false, skills: false });

  async function handleAnalyze() {
    if (!jobDescription.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setApplied({ summary: false, skills: false });
    try {
      const res = await fetch("/api/ai/match-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobDescription, currentSummary: summary, skills, experience }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || data.error || "Analysis failed");
      setResult(data);
    } catch (err: any) {
      setError(err?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function applySummary() {
    if (!result?.optimizedSummary) return;
    updateSummary(result.optimizedSummary);
    setApplied(prev => ({ ...prev, summary: true }));
  }

  function applySkills() {
    if (!result?.smartSkillAdditions?.length) return;
    result.smartSkillAdditions.forEach(skill => {
      // Only add if not already in skills list
      const alreadyExists = skills.some((s: any) =>
        (s.text || s).toLowerCase().includes(skill.toLowerCase().split(" ")[0])
      );
      if (!alreadyExists) addSkill(skill);
    });
    setApplied(prev => ({ ...prev, skills: true }));
  }

  function applyAll() {
    applySummary();
    applySkills();
  }

  const total = (result?.missingKeywords.length || 0) + (result?.presentKeywords.length || 0);
  const score = total > 0 ? Math.round(((result?.presentKeywords.length || 0) / total) * 100) : 0;
  const projectedScore = total > 0
    ? Math.min(100, Math.round(((( result?.presentKeywords.length || 0) + (result?.smartSkillAdditions?.length || 0)) / total) * 100))
    : 0;

  return (
    <div className="border border-blue-200 rounded-xl bg-blue-50 overflow-hidden">

      {/* Header toggle */}
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-blue-100 transition">
        <div className="flex items-center gap-3">
          <span className="text-xl">🎯</span>
          <div>
            <p className="font-bold text-blue-900 text-sm">Job Match Optimizer</p>
            <p className="text-blue-600 text-xs">Paste a job posting — AI rewrites your resume to beat their ATS filter</p>
          </div>
        </div>
        <span className="text-blue-400 text-lg">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-4">

          {/* Job description input */}
          <div>
            <label className="block text-sm font-semibold text-blue-900 mb-1">Paste the Job Description</label>
            <textarea
              className="w-full border border-blue-200 rounded-lg p-3 text-sm h-36 resize-none focus:ring-2 focus:ring-blue-400 focus:outline-none bg-white"
              placeholder="Paste the full job posting here — job title, requirements, responsibilities..."
              value={jobDescription}
              onChange={(e) => setField("jobDescription", e.target.value)}
            />
          </div>

          <button onClick={handleAnalyze} disabled={loading || !jobDescription.trim()}
            className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 rounded-lg disabled:opacity-50 transition text-sm">
            {loading ? "Analyzing job posting..." : "Analyze & Optimize My Resume →"}
          </button>

          {error && <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded p-3">{error}</p>}

          {result && (
            <div className="space-y-4">

              {/* Keyword chips */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {result.missingKeywords.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-xs font-bold text-red-700 uppercase tracking-wide mb-2">
                      ⚠ Missing Keywords ({result.missingKeywords.length})
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {result.missingKeywords.map((kw, i) => (
                        <span key={i} className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">{kw}</span>
                      ))}
                    </div>
                  </div>
                )}
                {result.presentKeywords.length > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-xs font-bold text-green-700 uppercase tracking-wide mb-2">
                      ✓ Already Present ({result.presentKeywords.length})
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {result.presentKeywords.map((kw, i) => (
                        <span key={i} className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">{kw}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* ATS score bar */}
              {total > 0 && (
                <div>
                  <div className="flex justify-between text-xs text-neutral-600 mb-1">
                    <span>ATS Match Score</span>
                    <span className="font-bold">
                      {score}% now
                      {projectedScore > score && (
                        <span className="text-green-600"> → {projectedScore}% after applying</span>
                      )}
                    </span>
                  </div>
                  <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full transition-all" style={{ width: `${score}%` }} />
                  </div>
                </div>
              )}

              {/* ── APPLY IMPROVEMENTS SECTION ── */}
              {(result.optimizedSummary || result.smartSkillAdditions?.length > 0) && (
                <div className="bg-white border-2 border-blue-300 rounded-xl p-4 space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">✦</span>
                    <p className="font-bold text-blue-900 text-sm">Apply Improvements to Your Resume</p>
                  </div>

                  {/* Optimized summary preview */}
                  {result.optimizedSummary && (
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-xs font-bold text-blue-800 uppercase tracking-wide mb-1">Optimized Summary</p>
                      <p className="text-xs text-neutral-700 leading-relaxed mb-3 line-clamp-3">{result.optimizedSummary}</p>
                      <button onClick={applySummary} disabled={applied.summary}
                        className={`w-full py-2 rounded-lg text-sm font-semibold transition ${
                          applied.summary
                            ? "bg-green-100 text-green-700 cursor-default"
                            : "bg-blue-600 hover:bg-blue-700 text-white"
                        }`}>
                        {applied.summary ? "✓ Summary Applied" : "Apply Optimized Summary"}
                      </button>
                    </div>
                  )}

                  {/* Smart skill additions */}
                  {result.smartSkillAdditions?.length > 0 && (
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-xs font-bold text-blue-800 uppercase tracking-wide mb-1">
                        Skills to Add ({result.smartSkillAdditions.length} relevant to your background)
                      </p>
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {result.smartSkillAdditions.map((skill, i) => (
                          <span key={i} className="text-xs bg-blue-100 text-blue-800 border border-blue-300 px-2 py-0.5 rounded-full font-medium">
                            + {skill}
                          </span>
                        ))}
                      </div>
                      <button onClick={applySkills} disabled={applied.skills}
                        className={`w-full py-2 rounded-lg text-sm font-semibold transition ${
                          applied.skills
                            ? "bg-green-100 text-green-700 cursor-default"
                            : "bg-blue-600 hover:bg-blue-700 text-white"
                        }`}>
                        {applied.skills ? "✓ Skills Added" : "Add Skills to Resume"}
                      </button>
                    </div>
                  )}

                  {/* Apply All button */}
                  {result.optimizedSummary && result.smartSkillAdditions?.length > 0 && (
                    <button
                      onClick={applyAll}
                      disabled={applied.summary && applied.skills}
                      className={`w-full py-3 rounded-xl font-bold text-sm transition ${
                        applied.summary && applied.skills
                          ? "bg-green-100 text-green-700 cursor-default"
                          : "bg-neutral-900 hover:bg-neutral-800 text-white"
                      }`}
                    >
                      {applied.summary && applied.skills
                        ? "✓ All Improvements Applied — Download Your Resume"
                        : "⚡ Apply Everything — Maximize My Score"}
                    </button>
                  )}

                  {(applied.summary || applied.skills) && (
                    <p className="text-xs text-center text-green-700 font-medium">
                      Changes applied to your resume. Review the Skills and Summary sections, then download.
                    </p>
                  )}
                </div>
              )}

              {/* Bullet suggestions */}
              {result.bulletSuggestions?.length > 0 && (
                <div className="bg-white border border-blue-200 rounded-lg p-4">
                  <p className="text-xs font-bold text-blue-900 uppercase tracking-wide mb-2">
                    💡 Suggested Bullet Points to Add Manually
                  </p>
                  <ul className="space-y-2">
                    {result.bulletSuggestions.map((s, i) => (
                      <li key={i} className="text-sm text-neutral-700 flex items-start gap-2">
                        <span className="text-blue-500 flex-shrink-0 mt-0.5">▸</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            </div>
          )}
        </div>
      )}
    </div>
  );
}
