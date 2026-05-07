"use client";

import { useResumeStore } from "@/app/store/useResumeStore";
import { useMemo } from "react";

export default function ATSScoreTracker() {
  const { summary, skills, experience, jobDescription, atsPresent, atsMissing, atsBaseScore } = useResumeStore();

  const liveScore = useMemo(() => {
    if (!atsPresent.length && !atsMissing.length) return atsBaseScore;

    // Build a string of all current resume content
    const resumeContent = [
      summary,
      (skills || []).map((s: any) => s.text || s).join(" "),
      (experience || []).flatMap((e: any) => [
        e.jobTitle, e.company,
        ...(e.responsibilities || []).map((r: any) => r.text || r),
        ...(e.achievements || []).map((a: any) => a.text || a),
      ]).join(" "),
    ].join(" ").toLowerCase();

    const allKeywords = [...atsPresent, ...atsMissing];
    if (allKeywords.length === 0) return atsBaseScore;

    const nowPresent = allKeywords.filter(kw =>
      resumeContent.includes(kw.toLowerCase().split(" ")[0].toLowerCase())
    );

    return Math.min(100, Math.round((nowPresent.length / allKeywords.length) * 100));
  }, [summary, skills, experience, atsPresent, atsMissing, atsBaseScore]);

  // Only show if we have ATS data from a targeted build
  if (!atsPresent.length && !atsMissing.length && atsBaseScore === 0) return null;

  const color = liveScore >= 85 ? "#16a34a" : liveScore >= 65 ? "#d97706" : "#dc2626";
  const label = liveScore >= 85 ? "Excellent match" : liveScore >= 65 ? "Good match" : "Needs improvement";

  return (
    <div className="border border-neutral-200 rounded-xl bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-semibold text-neutral-800">ATS Match Score</p>
        <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: `${color}15`, color }}>
          {label}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-3 bg-neutral-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${liveScore}%`, backgroundColor: color }}
          />
        </div>
        <span className="text-xl font-bold tabular-nums" style={{ color }}>
          {liveScore}%
        </span>
      </div>

      <p className="text-xs text-neutral-400 mt-2">
        Score updates as you edit. Optimized for the job you applied to.
      </p>
    </div>
  );
}
