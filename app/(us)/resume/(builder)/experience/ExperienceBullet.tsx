"use client";

import { X, Sparkles } from "lucide-react";
import { useResumeStore } from "@/app/store/useResumeStore";

interface ExperienceBulletProps {
  jobId: string;
  index: number;
  value: string;
  type: "responsibility" | "achievement";
  placeholder?: string;
  onChange: (value: string) => void;
  onRemove: () => void;
}

export default function ExperienceBullet({
  jobId,
  index,
  value,
  type,
  placeholder,
  onChange,
  onRemove,
}: ExperienceBulletProps) {
  const experience = useResumeStore((s) => s.experience);
  const rewriteResponsibility = useResumeStore((s) => s.rewriteResponsibility);
  const rewriteAchievement = useResumeStore((s) => s.rewriteAchievement);
  const acceptResponsibilitySuggestion = useResumeStore((s) => s.acceptResponsibilitySuggestion);
  const acceptAchievementSuggestion = useResumeStore((s) => s.acceptAchievementSuggestion);

  // Discard actions — set suggestion to null without accepting
  const discardResponsibility = useResumeStore((s: any) => s.discardResponsibilitySuggestion);
  const discardAchievement = useResumeStore((s: any) => s.discardAchievementSuggestion);

  const bullet =
    type === "responsibility"
      ? experience.find((j) => j.id === jobId)?.responsibilities[index]
      : experience.find((j) => j.id === jobId)?.achievements[index];

  function triggerRewrite() {
    if (!value.trim() || !bullet) return;
    if (type === "responsibility") {
      rewriteResponsibility(jobId, index);
    } else {
      rewriteAchievement(jobId, index);
    }
  }

  function acceptSuggestion() {
    if (!bullet?.suggestion) return;
    if (type === "responsibility") {
      acceptResponsibilitySuggestion(jobId, index);
    } else {
      acceptAchievementSuggestion(jobId, index);
    }
  }

  function discardSuggestion() {
    if (type === "responsibility" && discardResponsibility) {
      discardResponsibility(jobId, index);
    } else if (type === "achievement" && discardAchievement) {
      discardAchievement(jobId, index);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-start gap-2">
        <textarea
          spellCheck={true}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500"
          rows={2}
        />

        {/* AI Rewrite button */}
        <button
          type="button"
          onClick={triggerRewrite}
          disabled={!value.trim() || bullet?.loading}
          title="AI Rewrite"
          className="mt-1 text-blue-500 hover:text-blue-700 disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
        >
          <Sparkles size={16} />
        </button>

        <button
          type="button"
          onClick={onRemove}
          className="mt-1 text-neutral-400 hover:text-red-500 flex-shrink-0"
        >
          <X size={16} />
        </button>
      </div>

      {bullet?.loading && (
        <div className="text-xs text-neutral-400 pl-1 flex items-center gap-1">
          <span className="inline-block h-2 w-2 border border-neutral-400 border-t-transparent rounded-full animate-spin" />
          Improving...
        </div>
      )}

      {bullet?.suggestion && !bullet.hasAcceptedSuggestion && (
        <div className="rounded-md bg-blue-50 border border-blue-200 p-3 text-xs space-y-2">
          <p className="text-[10px] font-semibold text-blue-700 uppercase tracking-wide">✦ AI Suggestion</p>
          <div className="text-neutral-800 leading-relaxed">{bullet.suggestion}</div>
          <div className="flex gap-2 pt-1">
            <button
              onClick={acceptSuggestion}
              className="px-3 py-1 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition"
            >
              Accept
            </button>
            <button
              onClick={discardSuggestion}
              className="px-3 py-1 bg-neutral-200 text-neutral-700 rounded font-medium hover:bg-neutral-300 transition"
            >
              Decline
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
