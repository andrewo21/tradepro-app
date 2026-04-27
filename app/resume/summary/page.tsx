"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useResumeStore } from "@/app/store/useResumeStore";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export default function SummaryPage() {
  const summary = useResumeStore((s) => s.summary);
  const updateSummary = useResumeStore((s) => s.updateSummary);

  const [localSummary, setLocalSummary] = useState(summary);
  const [suggestion, setSuggestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Keep local state in sync when store changes externally
  useEffect(() => {
    setLocalSummary(summary);
  }, [summary]);

  // Persist the user's typed text to the store whenever it changes
  // This ensures the summary is always saved even without accepting an AI suggestion
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

  const handleRewrite = async () => {
    const text = localSummary.trim();
    if (!text) {
      setError("Please write something first so AI can improve it.");
      return;
    }
    if (!API_BASE) {
      setError("API not configured.");
      return;
    }

    setError("");
    setLoading(true);
    setSuggestion("");

    try {
      const res = await fetch(`${API_BASE}/api/ai/rewrite-summary`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }

      const data = await res.json();
      const result = data?.suggestion?.trim() || "";

      if (result) {
        setSuggestion(result);
      } else {
        setError("No suggestion returned. Please try again.");
      }
    } catch (err) {
      console.error("Summary rewrite error:", err);
      setError("AI rewrite failed. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    updateSummary(suggestion);
    setLocalSummary(suggestion);
    setSuggestion("");
  };

  const handleDiscard = () => {
    setSuggestion("");
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
        Hit <strong>AI Rewrite</strong> and the AI will turn it into a polished, keyword-rich summary that
        gets past recruiter software (ATS).
      </p>

      {/* Summary Input */}
      <div className="relative mb-4">
        <textarea
          spellCheck={true}
          value={localSummary}
          onChange={(e) => {
            setLocalSummary(e.target.value);
            setError("");
          }}
          placeholder="e.g. I done concrete work for 10 years, poured slabs, framed walls, did drywall too. I speak Spanish and English. I'm a foreman and manage crews up to 15 guys..."
          className="w-full h-44 border border-neutral-300 rounded-md px-3 py-2 text-sm bg-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="absolute bottom-2 right-3 text-xs text-neutral-400">
          {localSummary.length} chars
        </div>
      </div>

      {/* AI Rewrite Button */}
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={handleRewrite}
          disabled={loading || !localSummary.trim()}
          className="px-5 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="inline-block h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Rewriting...
            </span>
          ) : (
            "✨ AI Rewrite"
          )}
        </button>
        <span className="text-xs text-neutral-500">
          Works with any language, trade slang, or mixed input
        </span>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Suggestion Box */}
      {suggestion && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-md mb-6">
          <p className="text-sm font-medium text-blue-800 mb-2">✅ AI Suggested Rewrite:</p>
          <p className="text-sm text-neutral-900 leading-relaxed mb-4 whitespace-pre-wrap">
            {suggestion}
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleApply}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition"
            >
              Apply Suggestion
            </button>
            <button
              onClick={handleDiscard}
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
            // Ensure any unsaved text is committed before navigating
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
