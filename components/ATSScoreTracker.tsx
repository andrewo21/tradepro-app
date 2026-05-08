"use client";

import { useResumeStore } from "@/app/store/useResumeStore";
import { useMemo, useState } from "react";

export default function ATSScoreTracker() {
  const {
    summary, skills, experience,
    jobDescription, atsPresent, atsMissing, atsBaseScore, atsBulletSuggestions,
    addSkill, updateSummary,
  } = useResumeStore();

  const [tab, setTab] = useState<"score" | "suggestions">("score");
  const [accepted, setAccepted] = useState<Set<string>>(new Set());
  const [summaryAccepted, setSummaryAccepted] = useState(false);

  // Build live resume text for keyword matching
  const resumeContent = useMemo(() => [
    summary,
    (skills || []).map((s: any) => s.text || s).join(" "),
    (experience || []).flatMap((e: any) => [
      e.jobTitle, e.company,
      ...(e.responsibilities || []).map((r: any) => r.text || r),
      ...(e.achievements || []).map((a: any) => a.text || a),
    ]).join(" "),
  ].join(" ").toLowerCase(), [summary, skills, experience]);

  const { liveScore, totalKeywords, coveredCount } = useMemo(() => {
    const all = [...(atsPresent || []), ...(atsMissing || [])];
    if (!all.length) return { liveScore: atsBaseScore || 0, totalKeywords: 0, coveredCount: 0 };
    const covered = all.filter(kw => resumeContent.includes(kw.toLowerCase().split(" ")[0]));
    return {
      liveScore: Math.min(100, Math.round((covered.length / all.length) * 100)),
      totalKeywords: all.length,
      coveredCount: covered.length,
    };
  }, [resumeContent, atsPresent, atsMissing, atsBaseScore]);

  // Point value per keyword
  const pointsPerKeyword = totalKeywords > 0
    ? Math.max(1, Math.round(100 / totalKeywords))
    : 5;

  // Still-missing keywords
  const stillMissing = useMemo(() =>
    (atsMissing || []).filter(kw =>
      !resumeContent.includes(kw.toLowerCase().split(" ")[0]) &&
      !accepted.has(kw)
    ), [resumeContent, atsMissing, accepted]);

  // Estimate how many missing keywords the optimized summary covers
  // (stored in jobDescription as context — we check how many atsMissing words appear in it)
  const summaryPoints = useMemo(() => {
    if (summaryAccepted || !stillMissing.length) return 0;
    // Rough estimate: summary typically covers 2-4 keywords
    const estimatedCoverage = Math.min(stillMissing.length, Math.max(2, Math.round(stillMissing.length * 0.3)));
    return estimatedCoverage * pointsPerKeyword;
  }, [stillMissing, pointsPerKeyword, summaryAccepted]);

  // Don't show if no ATS data
  if (!atsPresent?.length && !atsMissing?.length && !atsBaseScore) return null;

  const scoreColor = liveScore >= 85 ? "#16a34a" : liveScore >= 65 ? "#d97706" : "#dc2626";
  const scoreBg = liveScore >= 85 ? "#f0fdf4" : liveScore >= 65 ? "#fffbeb" : "#fef2f2";
  const scoreBorder = liveScore >= 85 ? "#86efac" : liveScore >= 65 ? "#fcd34d" : "#fca5a5";
  const scoreLabel = liveScore >= 85 ? "Excellent match" : liveScore >= 65 ? "Good match" : "Keep optimizing";

  function acceptSkill(skill: string) {
    addSkill(skill);
    setAccepted(prev => new Set([...prev, skill]));
  }

  function acceptAll() {
    stillMissing.forEach(s => addSkill(s));
    setAccepted(prev => new Set([...prev, ...stillMissing]));
  }

  const bulletSuggestions = (atsBulletSuggestions || []).filter(Boolean);
  const hasSuggestions = stillMissing.length > 0 || bulletSuggestions.length > 0;
  const totalSuggestions = stillMissing.length + bulletSuggestions.length;

  return (
    <div className="rounded-xl overflow-hidden border shadow-sm" style={{ borderColor: scoreBorder, backgroundColor: scoreBg }}>

      {/* Tabs */}
      <div className="flex border-b" style={{ borderColor: scoreBorder }}>
        <button
          onClick={() => setTab("score")}
          className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wide transition ${
            tab === "score"
              ? "bg-white/70 text-neutral-800 border-b-2"
              : "text-neutral-500 hover:text-neutral-700"
          }`}
          style={tab === "score" ? { borderBottomColor: scoreColor } : {}}
        >
          ATS Score
        </button>
        <button
          onClick={() => setTab("suggestions")}
          className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wide transition relative ${
            tab === "suggestions"
              ? "bg-white/70 text-neutral-800 border-b-2"
              : "text-neutral-500 hover:text-neutral-700"
          }`}
          style={tab === "suggestions" ? { borderBottomColor: scoreColor } : {}}
        >
          Suggestions
          {hasSuggestions && (
            <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-white text-[10px] font-bold"
              style={{ backgroundColor: scoreColor }}>
              {totalSuggestions}
            </span>
          )}
        </button>
      </div>

      {/* Score tab */}
      {tab === "score" && (
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-bold text-neutral-800">ATS Match Score</p>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                style={{ color: scoreColor, backgroundColor: `${scoreColor}20` }}>
                {scoreLabel}
              </span>
              <span className="text-2xl font-black tabular-nums" style={{ color: scoreColor }}>
                {liveScore}%
              </span>
            </div>
          </div>
          <div className="h-2.5 bg-white/60 rounded-full overflow-hidden border border-white/40">
            <div className="h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${liveScore}%`, backgroundColor: scoreColor }} />
          </div>
          <p className="text-xs text-neutral-500 mt-1.5">
            {coveredCount} of {totalKeywords} job keywords matched · Updates live as you edit
          </p>
          {hasSuggestions && (
            <button onClick={() => setTab("suggestions")}
              className="mt-3 text-xs font-semibold underline underline-offset-2"
              style={{ color: scoreColor }}>
              View {totalSuggestions} suggestion{totalSuggestions !== 1 ? "s" : ""} to improve your resume →
            </button>
          )}
          {!hasSuggestions && liveScore >= 85 && (
            <p className="text-xs font-medium mt-2" style={{ color: scoreColor }}>
              ✓ All key skills covered — your resume is well-matched to this job.
            </p>
          )}
        </div>
      )}

      {/* Suggestions tab */}
      {tab === "suggestions" && (
        <div className="px-4 py-4 space-y-3">
          {!hasSuggestions ? (
            <div className="text-center py-4">
              <p className="text-sm font-semibold" style={{ color: scoreColor }}>✓ All suggestions applied!</p>
              <p className="text-xs text-neutral-500 mt-1">Your score is now at {liveScore}%</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <p className="text-xs text-neutral-600 font-medium">
                  {stillMissing.length} improvement{stillMissing.length !== 1 ? "s" : ""} available
                </p>
                <button onClick={acceptAll}
                  className="text-xs font-bold px-3 py-1.5 rounded-lg text-white transition"
                  style={{ backgroundColor: scoreColor }}>
                  Accept All (+{stillMissing.length * pointsPerKeyword} pts)
                </button>
              </div>

              <div className="space-y-2">
                {stillMissing.map((skill, i) => (
                  <div key={i}
                    className="flex items-center justify-between bg-white/70 rounded-lg px-3 py-2.5 border border-white">
                    <div className="flex items-start gap-2 flex-1 min-w-0">
                      <div className="flex-shrink-0 mt-0.5 w-2 h-2 rounded-full mt-1.5"
                        style={{ backgroundColor: scoreColor }} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-neutral-800 truncate">{skill}</p>
                        <p className="text-xs text-neutral-500">Add to Skills section</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white border"
                        style={{ color: scoreColor, borderColor: scoreBorder }}>
                        +{pointsPerKeyword} pts
                      </span>
                      <button onClick={() => acceptSkill(skill)}
                        className="text-xs font-semibold px-3 py-1 rounded-lg text-white transition"
                        style={{ backgroundColor: scoreColor }}>
                        Accept
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-xs text-neutral-400 pt-1">
                Accepting a skill adds it to your Skills section. Your score updates instantly.
              </p>

              {/* AI Bullet suggestions */}
              {bulletSuggestions.length > 0 && (
                <div className="pt-2 border-t" style={{ borderColor: scoreBorder }}>
                  <p className="text-xs font-bold text-neutral-700 uppercase tracking-wide mb-2">
                    💡 AI-Suggested Bullets to Add
                  </p>
                  <div className="space-y-2">
                    {bulletSuggestions.map((bullet, i) => (
                      <div key={i} className="bg-white/70 rounded-lg px-3 py-2.5 border border-white text-xs text-neutral-700 leading-relaxed">
                        <span className="flex-shrink-0 font-bold mr-1" style={{ color: scoreColor }}>▸</span>
                        {bullet}
                        <p className="text-neutral-400 mt-1 text-[10px]">Add this to your Work Experience section.</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

    </div>
  );
}
