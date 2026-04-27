"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useResumeStore } from "@/app/store/useResumeStore";

export default function SummaryPage() {
  const summary = useResumeStore((s) => s.summary);
  const summarySuggestion = useResumeStore((s) => s.summarySuggestion);
  const summaryLoading = useResumeStore((s) => s.summaryLoading);
  const summaryError = useResumeStore((s) => s.summaryError);
  const updateSummary = useResumeStore((s) => s.updateSummary);
  const rewriteSummary = useResumeStore((s) => s.rewriteSummary);
  const acceptSummarySuggestion = useResumeStore((s) => s.acceptSummarySuggestion);
  const discardSummarySuggestion = useResumeStore((s) => s.discardSummarySuggestion);

  const [localSummary, setLocalSummary] = useState(summary);
  // Tracks when the user has just accepted a suggestion so auto-rewrite is suppressed
  const justAcceptedRef = useRef(false);

  // Keep local state in sync when store changes externally
  useEffect(() => {
    setLocalSummary(summary);
  }, [summary]);

  // Persist typed text to the store (debounced)
  const saveTimer = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      if (localSummary !== summary) {
        updateSummary(localSummary);
      }
    }, 400);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [localSummary]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-rewrite after the user stops typing (debounced)
  const rewriteTimer = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (rewriteTimer.current) clearTimeout(rewriteTimer.current);

    const trimmed = localSummary.trim();
    // Skip if empty, already has a suggestion, loading, or text came from accepting a suggestion
    if (!trimmed || summarySuggestion || summaryLoading || justAcceptedRef.current) return;

    rewriteTimer.current = setTimeout(() => {
      rewriteSummary();
    }, 1200);

    return () => {
      if (rewriteTimer.current) clearTimeout(rewriteTimer.current);
    };
  }, [localSummary]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (value: string) => {
    // User is editing manually — allow auto-rewrite again
    justAcceptedRef.current = false;
    setLocalSummary(value);
    if (summarySuggestion) discardSummarySuggestion();
  };

  const handleAccept = () => {
    justAcceptedRef.current = true;
    acceptSummarySuggestion();
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 p-10">

      <p className="text-sm text-neutral-500 mb-2">
        Step 6 of 7 — Professional Summary
      </p>

      <h1 className="text-2xl font-semibold text-slate-900 mb-2">
        Professional Summary
      </h1>

      <p className="text-sm text-neutral-600 mb-6 max-w-2xl">
        Write a short summary in your own words — any language, trade slang, or mix of languages is fine.
        The AI will automatically improve it as you type.
      </p>

      {/* Summary Input */}
      <div className="relative mb-4">
        <textarea
          spellCheck={true}
          value={localSummary}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="e.g. I done concrete work for 10 years, poured slabs, framed walls, did drywall too. I speak Spanish and English. I'm a foreman and manage crews up to 15 guys..."
          className="w-full h-44 border border-neutral-300 rounded-md px-3 py-2 text-sm bg-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="absolute bottom-2 right-3 text-xs text-neutral-400">
          {localSummary.length} chars
        </div>
      </div>

      {/* Loading indicator (auto-rewrite in progress) */}
      {summaryLoading && !summarySuggestion && (
        <div className="mb-4 text-sm text-neutral-500 flex items-center gap-2">
          <span className="inline-block h-3 w-3 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin" />
          AI is improving your summary…
        </div>
      )}

      {/* Error */}
      {summaryError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
          {summaryError}
        </div>
      )}

      {/* Suggestion Box */}
      {summarySuggestion && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-md mb-6">
          <p className="text-sm font-medium text-blue-800 mb-2">✅ AI Suggested Rewrite:</p>
          <p className="text-sm text-neutral-900 leading-relaxed mb-4 whitespace-pre-wrap">
            {summarySuggestion}
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleAccept}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition"
            >
              Accept Suggestion
            </button>
            <button
              onClick={discardSummarySuggestion}
              className="px-4 py-2 bg-neutral-200 text-neutral-700 rounded-md text-sm hover:bg-neutral-300 transition"
            >
              Discard
            </button>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-10">
        <Link
          href="/resume/education"
          className="px-6 py-2 bg-neutral-200 text-neutral-900 rounded-md text-sm hover:bg-neutral-300"
        >
          ← Back to Step 5
        </Link>

        <Link
          href="/resume/preview"
          onClick={() => {
            if (localSummary !== summary) {
              updateSummary(localSummary);
            }
          }}
          className="px-6 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition"
        >
          Proceed to Full Preview →
        </Link>
      </div>
    </div>
  );
}
