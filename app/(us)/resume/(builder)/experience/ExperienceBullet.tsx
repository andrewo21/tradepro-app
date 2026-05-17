"use client";

// ExperienceBullet — CV-1 is the exclusive AI interface.
// Each bullet has an "Ask CV-1 to improve" button that sends the specific
// bullet + job context directly to CV-1 for a targeted rewrite.

import { useState } from "react";
import { X } from "lucide-react";
import { useAssistantStore } from "@/app/store/useAssistantStore";

interface ExperienceBulletProps {
  jobId:       string;
  jobTitle:    string;
  company:     string;
  index:       number;
  value:       string;
  type:        "responsibility" | "achievement";
  placeholder?: string;
  onChange:    (value: string) => void;
  onRemove:    () => void;
}

export default function ExperienceBullet({
  jobId, jobTitle, company, index, value, type, placeholder, onChange, onRemove,
}: ExperienceBulletProps) {
  const [showTip, setShowTip] = useState(false);
  const requestBulletImprovement = useAssistantStore((s) => s.requestBulletImprovement);

  function handleAskCV1() {
    if (!value.trim()) return;
    requestBulletImprovement({
      bulletText:  value,
      jobTitle:    jobTitle || "this role",
      company:     company  || "this company",
      jobId,
      bulletIndex: index,
      bulletType:  type,
      locale:      "en",
    });
  }

  return (
    <div className="space-y-1">
      <div className="relative flex items-start gap-2">
        <div className="relative flex-1">
          <textarea
            spellCheck
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setShowTip(true)}
            onBlur={() => setTimeout(() => setShowTip(false), 200)}
            placeholder={placeholder}
            rows={2}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:border-blue-400 focus:ring-blue-300 transition-colors"
          />

          {/* CV-1 tooltip on focus */}
          {showTip && value.trim() && (
            <div className="absolute -top-10 left-0 right-10 z-20 bg-indigo-600 text-white text-xs rounded-lg px-3 py-2 shadow-lg pointer-events-none flex items-center gap-1.5">
              <span>CV-1: I can rewrite this stronger — click the button.</span>
              <div className="absolute -bottom-1.5 left-4 w-3 h-3 bg-indigo-600 rotate-45" />
            </div>
          )}
        </div>

        {/* CV-1 AI Rewrite button */}
        {value.trim() && (
          <button
            type="button"
            onClick={handleAskCV1}
            title="CV-1: rewrite this bullet"
            className="mt-1 flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-[11px] font-bold rounded-lg transition-colors shadow-sm select-none whitespace-nowrap"
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
            </svg>
            CV-1
          </button>
        )}

        <button
          type="button"
          onClick={onRemove}
          className="mt-1 flex-shrink-0 p-1 text-neutral-400 hover:text-red-500 transition-colors"
          title="Remove"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
}
