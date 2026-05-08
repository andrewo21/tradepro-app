"use client";

import { useResumeStore } from "@/app/store/useResumeStore";
import { useMemo, useState } from "react";

export default function ATSScoreTracker() {
  const { summary, skills, experience, jobDescription, atsPresent, atsMissing, atsBaseScore, addSkill } = useResumeStore();
  const [accepted, setAccepted] = useState<string[]>([]);

  const { liveScore, stillMissing } = useMemo(() => {
    const allKeywords = [...(atsPresent || []), ...(atsMissing || [])];
    if (allKeywords.length === 0) return { liveScore: atsBaseScore || 0, stillMissing: [] };

    const resumeContent = [
      summary,
      (skills || []).map((s: any) => s.text || s).join(" "),
      (experience || []).flatMap((e: any) => [
        e.jobTitle, e.company,
        ...(e.responsibilities || []).map((r: any) => r.text || r),
        ...(e.achievements || []).map((a: any) => a.text || a),
      ]).join(" "),
    ].join(" ").toLowerCase();

    const nowPresent = allKeywords.filter(kw =>
      resumeContent.includes(kw.toLowerCase().split(" ")[0])
    );
    const score = Math.min(100, Math.round((nowPresent.length / allKeywords.length) * 100));

    // Missing keywords from atsMissing that aren't yet in resume
    const stillMissing = (atsMissing || []).filter(kw =>
      !resumeContent.includes(kw.toLowerCase().split(" ")[0]) &&
      !accepted.includes(kw)
    );

    return { liveScore: score, stillMissing };
  }, [summary, skills, experience, atsPresent, atsMissing, atsBaseScore, accepted]);

  // Don't show if no ATS data
  if (!atsPresent?.length && !atsMissing?.length && !atsBaseScore) return null;

  const color = liveScore >= 85 ? "#16a34a" : liveScore >= 65 ? "#d97706" : "#dc2626";
  const bgColor = liveScore >= 85 ? "#f0fdf4" : liveScore >= 65 ? "#fffbeb" : "#fef2f2";
  const borderColor = liveScore >= 85 ? "#86efac" : liveScore >= 65 ? "#fcd34d" : "#fca5a5";
  const label = liveScore >= 85 ? "Excellent match" : liveScore >= 65 ? "Good match — keep editing" : "Keep optimizing";

  function acceptSkill(skill: string) {
    addSkill(skill);
    setAccepted(prev => [...prev, skill]);
  }

  function acceptAll() {
    stillMissing.forEach(skill => addSkill(skill));
    setAccepted(prev => [...prev, ...stillMissing]);
  }

  return (
    <div className="rounded-xl overflow-hidden border shadow-sm" style={{ borderColor, backgroundColor: bgColor }}>

      {/* Score bar */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-bold text-neutral-800">ATS Match Score</p>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ color, backgroundColor: `${color}20` }}>
              {label}
            </span>
            <span className="text-2xl font-black tabular-nums" style={{ color }}>{liveScore}%</span>
          </div>
        </div>
        <div className="h-2.5 bg-white/60 rounded-full overflow-hidden border border-white/40">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${liveScore}%`, backgroundColor: color }}
          />
        </div>
        <p className="text-xs text-neutral-500 mt-1.5">Updates live as you edit your resume.</p>
      </div>

      {/* Skill suggestions — only if there are gaps */}
      {stillMissing.length > 0 && (
        <div className="px-4 pb-4 border-t pt-3" style={{ borderColor }}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-neutral-700 uppercase tracking-wide">
              Suggested skills to add ({stillMissing.length})
            </p>
            <button
              onClick={acceptAll}
              className="text-xs font-semibold px-3 py-1 rounded-lg text-white transition"
              style={{ backgroundColor: color }}
            >
              Accept All
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {stillMissing.map((skill, i) => (
              <button
                key={i}
                onClick={() => acceptSkill(skill)}
                className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border bg-white font-medium transition hover:shadow-sm"
                style={{ borderColor: color, color }}
              >
                <span>+</span> {skill}
              </button>
            ))}
          </div>
          <p className="text-xs text-neutral-400 mt-2">Click a skill to add it to your Skills section.</p>
        </div>
      )}

      {/* All gaps filled */}
      {stillMissing.length === 0 && liveScore >= 85 && (
        <div className="px-4 pb-3 border-t pt-2" style={{ borderColor }}>
          <p className="text-xs font-medium" style={{ color }}>✓ All key skills covered — your resume is well-matched to this job.</p>
        </div>
      )}

    </div>
  );
}
