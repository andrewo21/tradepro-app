"use client";

import { X } from "lucide-react";
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

  const acceptResponsibilitySuggestion = useResumeStore(
    (s) => s.acceptResponsibilitySuggestion
  );
  const acceptAchievementSuggestion = useResumeStore(
    (s) => s.acceptAchievementSuggestion
  );

  const bullet =
    type === "responsibility"
      ? experience.find((j) => j.id === jobId)?.responsibilities[index]
      : experience.find((j) => j.id === jobId)?.achievements[index];

  function triggerRewrite() {
    if (!value.trim()) return;
    if (!bullet) return;

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

  return (
    <div className="space-y-2">
      <div className="flex items-start gap-2">
        <textarea
          /* ⭐ ENABLED — spellcheck */
          spellCheck={true}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            triggerRewrite();
          }}
          placeholder={placeholder}
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500"
          rows={2}
        />

        <button
          type="button"
          onClick={onRemove}
          className="mt-1 text-neutral-400 hover:text-red-500"
        >
          <X size={16} />
        </button>
      </div>

      {bullet?.suggestion && !bullet.hasAcceptedSuggestion && (
        <div className="rounded-md bg-neutral-100 border border-neutral-300 p-2 text-xs">
          <div className="text-neutral-800">{bullet.suggestion}</div>

          <button
            onClick={acceptSuggestion}
            className="mt-1 text-neutral-700 hover:text-neutral-900 text-xs font-medium"
          >
            Use suggestion
          </button>
        </div>
      )}

      {bullet?.loading && (
        <div className="text-xs text-neutral-400 pl-1">Improving...</div>
      )}
    </div>
  );
}
