"use client";

// Summary step — CV-1 is the exclusive AI interface.
// Auto-rewrite, accept/discard suggestion buttons removed.
// CV-1 handles summary rewrites via the floating assistant.

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useResumeStore } from "@/app/store/useResumeStore";

export default function SummaryPage() {
  const summary       = useResumeStore((s) => s.summary);
  const updateSummary = useResumeStore((s) => s.updateSummary);

  const [localSummary, setLocalSummary] = useState(summary);
  const [showTip, setShowTip]           = useState(false);
  const saveTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => { setLocalSummary(summary); }, [summary]);

  // Debounced save to store
  useEffect(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      if (localSummary !== summary) updateSummary(localSummary);
    }, 400);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [localSummary]); // eslint-disable-line react-hooks/exhaustive-deps

  const wordCount    = localSummary.trim().split(/\s+/).filter(Boolean).length;
  const hasMetrics   = /[\d$%]/.test(localSummary);
  const isGoodLength = wordCount >= 40 && wordCount <= 100;

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 px-4 py-8 sm:p-10">
      <p className="text-sm text-neutral-500 mb-2">Step 6 of 8 — Professional Summary</p>

      <h1 className="text-2xl font-semibold text-slate-900 mb-1">Professional Summary</h1>
      <p className="text-sm text-neutral-600 mb-6 max-w-2xl">
        Write your summary in your own words — any style is fine.{" "}
        <span className="text-indigo-600 font-medium">
          CV-1 can offer you a stronger version — your call whenever you&apos;re ready.
        </span>
      </p>

      {/* Summary textarea with CV-1 tooltip */}
      <div className="relative mb-4 max-w-2xl">
        <textarea
          spellCheck
          value={localSummary}
          onChange={(e) => setLocalSummary(e.target.value)}
          onFocus={() => setShowTip(true)}
          onBlur={() => setTimeout(() => setShowTip(false), 200)}
          placeholder="e.g. Electrician with 8 years experience in commercial and residential wiring. Led crews of 6, delivered projects under budget. OSHA 30 certified..."
          className="w-full h-44 border border-neutral-300 rounded-xl px-4 py-3 text-sm bg-white resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all"
        />

        {/* CV-1 tooltip on focus */}
        {showTip && localSummary.trim().length > 0 && (
          <div className="absolute -top-12 left-0 right-0 z-20 bg-indigo-600 text-white text-xs rounded-xl px-3 py-2.5 shadow-lg pointer-events-none flex items-center gap-2">
            <span className="text-base">✨</span>
            <span>CV-1: Want me to rewrite this with stronger impact? Just ask in the chat — I&apos;ll give you an optimized version.</span>
            <div className="absolute -bottom-1.5 left-6 w-3 h-3 bg-indigo-600 rotate-45" />
          </div>
        )}

        <div className="absolute bottom-2 right-3 flex items-center gap-3">
          {hasMetrics && (
            <span className="text-xs text-green-600 font-medium">✓ Has metrics</span>
          )}
          <span className={`text-xs font-medium ${isGoodLength ? "text-green-600" : "text-neutral-400"}`}>
            {wordCount} words {isGoodLength ? "✓" : "(aim: 40–80)"}
          </span>
        </div>
      </div>

      {/* Quality signals */}
      <div className="flex flex-wrap gap-3 mb-8 max-w-2xl">
        {[
          { label: "40–80 words",     done: isGoodLength },
          { label: "Includes metrics", done: hasMetrics  },
          { label: "Job title mentioned", done: localSummary.toLowerCase().includes(
              (useResumeStore.getState().personalInfo?.tradeTitle || "").toLowerCase().split(" ")[0] || "___"
            )
          },
        ].map(({ label, done }) => (
          <span key={label} className={`text-xs px-3 py-1 rounded-full font-medium ${
            done ? "bg-green-100 text-green-700" : "bg-neutral-100 text-neutral-500"
          }`}>
            {done ? "✓" : "○"} {label}
          </span>
        ))}
      </div>

      <div className="flex justify-between mt-4 max-w-2xl">
        <Link href="/resume/education"
          className="px-6 py-2.5 bg-neutral-200 text-neutral-900 rounded-xl text-sm hover:bg-neutral-300 transition">
          ← Back to Step 5
        </Link>
        <Link href="/resume/ats"
          onClick={() => { if (localSummary !== summary) updateSummary(localSummary); }}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition">
          Step 7: Job Target →
        </Link>
      </div>
    </div>
  );
}
