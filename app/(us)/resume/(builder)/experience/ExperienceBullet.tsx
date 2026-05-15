"use client";

// ExperienceBullet — CV-1 is the exclusive AI interface.
// Generic rewrite/accept/decline buttons removed per architecture rules.
// Tooltip on focus nudges user toward CV-1 instead.

import { useState } from "react";
import { X } from "lucide-react";

interface ExperienceBulletProps {
  jobId:       string;
  index:       number;
  value:       string;
  type:        "responsibility" | "achievement";
  placeholder?: string;
  onChange:    (value: string) => void;
  onRemove:    () => void;
}

export default function ExperienceBullet({
  value, placeholder, onChange, onRemove,
}: ExperienceBulletProps) {
  const [showTip, setShowTip] = useState(false);

  const hasMetrics = /[\d$%]/.test(value);
  const isWeak     = value.trim().length > 0 && !hasMetrics;

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
            className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-1 transition-colors ${
              isWeak
                ? "border-amber-300 focus:border-amber-400 focus:ring-amber-300"
                : "border-neutral-300 focus:border-blue-400 focus:ring-blue-300"
            }`}
          />

          {/* CV-1 tooltip on focus */}
          {showTip && value.trim() && (
            <div className="absolute -top-10 left-0 right-0 z-20 bg-indigo-600 text-white text-xs rounded-lg px-3 py-2 shadow-lg pointer-events-none flex items-center gap-1.5">
              <span className="text-base">✨</span>
              <span>CV-1: Want this bullet stronger? Ask me — I&apos;ll give you an optimized replacement.</span>
              <div className="absolute -bottom-1.5 left-4 w-3 h-3 bg-indigo-600 rotate-45" />
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onRemove}
          className="mt-1 text-neutral-400 hover:text-red-500 flex-shrink-0 transition-colors"
          title="Remove bullet"
        >
          <X size={16} />
        </button>
      </div>

      {/* Subtle metric nudge — no AI button, just a hint */}
      {isWeak && value.trim().length > 15 && (
        <p className="text-[11px] text-amber-600 pl-1 flex items-center gap-1">
          <span>⚡</span>
          Add a number, %, or $ value — metric bullets score higher with recruiters.
        </p>
      )}
    </div>
  );
}
