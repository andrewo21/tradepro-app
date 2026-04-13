"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useResumeStore } from "@/app/store/useResumeStore";

export default function SummaryPage() {
  const summary = useResumeStore((s) => s.summary);
  const updateSummary = useResumeStore((s) => s.updateSummary);

  const [localSummary, setLocalSummary] = useState(summary);
  const [suggestion, setSuggestion] = useState("");
  const [loading, setLoading] = useState(false);

  // Keep local state synced with store
  useEffect(() => {
    setLocalSummary(summary);
  }, [summary]);

  // Auto‑rewrite after typing (debounced)
  useEffect(() => {
    const handler = setTimeout(async () => {
      if (!localSummary.trim() || localSummary === summary) return;

      try {
        setLoading(true);

        const res = await fetch("/api/rewrite", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "summary",
            text: localSummary,
          }),
        });

        const data = await res.json();

        if (data?.suggestion) {
          setSuggestion(data.suggestion);
        }
      } catch (err) {
        console.error("Summary rewrite error:", err);
      } finally {
        setLoading(false);
      }
    }, 700);

    return () => clearTimeout(handler);
  }, [localSummary, summary]);

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 p-10">

      {/* Step Label */}
      <p className="text-sm text-neutral-500 mb-2">
        Step 6 of 7 — Professional Summary
      </p>

      {/* Header */}
      <h1 className="text-2xl font-semibold text-slate-900 mb-6">
        Professional Summary
      </h1>

      {/* Description */}
      <p className="text-sm text-neutral-600 mb-6 max-w-2xl">
        Write a short summary that highlights your experience. AI will suggest improvements — you choose whether to accept them.
      </p>

      {/* Summary Input */}
      <textarea
        spellCheck={true}   // ⭐ ENABLED
        value={localSummary}
        onChange={(e) => setLocalSummary(e.target.value)}
        placeholder="Write your professional summary..."
        className="w-full h-40 border border-neutral-300 rounded-md px-3 py-2 text-sm mb-6 bg-white"
      />

      {/* Suggestion Box */}
      {suggestion && suggestion !== summary && (
        <div className="p-4 bg-neutral-100 border border-neutral-300 rounded-md mb-6">
          <p className="text-sm text-neutral-700 mb-2">Suggested improvement:</p>

          <p className="text-sm text-neutral-900 italic mb-3">
            {loading ? "Rewriting..." : suggestion}
          </p>

          <button
            onClick={() => {
              updateSummary(suggestion);
              setSuggestion("");
            }}
            className="px-4 py-2 bg-neutral-200 text-neutral-900 rounded-md text-sm hover:bg-neutral-300"
          >
            Apply Suggestion
          </button>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-10">
        <Link
          href="/resume/education"
          className="px-6 py-2 bg-neutral-200 text-neutral-900 rounded-md text-sm hover:bg-neutral-300"
        >
          Back to Step 5
        </Link>

        <Link
          href="/resume/preview"
          className="px-6 py-2 bg-neutral-200 text-neutral-900 rounded-md text-sm hover:bg-neutral-300"
        >
          Proceed to Full Preview
        </Link>
      </div>
    </div>
  );
}
