"use client";

// ExperienceBullet — CV-1 is the exclusive AI interface.
// Each bullet has an "Ask CV-1 to improve" button that sends the specific
// bullet + job context directly to CV-1 for a targeted rewrite.

import { useState } from "react";
import { X, Sparkles } from "lucide-react";
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
              <span>✨</span>
              <span>CV-1: I can suggest a stronger version — click the spark button.</span>
              <div className="absolute -bottom-1.5 left-4 w-3 h-3 bg-indigo-600 rotate-45" />
            </div>
          )}
        </div>

        {/* Ask CV-1 to improve */}
        {value.trim() && (
          <button
            type="button"
            onClick={handleAskCV1}
            title={`Ask CV-1 to improve this ${type}`}
            className="mt-1 flex-shrink-0 p-1.5 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
          >
            <Sparkles size={15} />
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
