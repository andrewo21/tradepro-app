"use client";

// Summary step — the wizard owns data collection.
// One "Generate with AI" button calls the API exactly once.
// User reviews the result and chooses to use it or keep their own.

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useResumeStore } from "@/app/store/useResumeStore";
import { Sparkles, Check, RotateCcw } from "lucide-react";

export default function SummaryPage() {
  const summary       = useResumeStore((s) => s.summary);
  const updateSummary = useResumeStore((s) => s.updateSummary);
  const resumeStore   = useResumeStore();

  const [localSummary, setLocalSummary] = useState(summary);
  const [aiDraft, setAiDraft]           = useState<string | null>(null);
  const [generating, setGenerating]     = useState(false);
  const [genError, setGenError]         = useState<string | null>(null);
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

  async function handleGenerate() {
    setGenerating(true);
    setGenError(null);
    setAiDraft(null);
    try {
      const state = resumeStore;
      const res = await fetch("/api/ai/assistant/suggest", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode:     "resume",
          step:     "summary",
          locale:   "en",
          firstName: state.personalInfo?.firstName,
          jobTitle:  state.personalInfo?.tradeTitle,
          userMessage: "Write me a strong professional summary based on my resume data.",
          data: {
            personalInfo:   state.personalInfo,
            experience:     state.experience,
            skills:         state.skills,
            education:      state.education,
            certifications: state.certifications,
            currentSummary: localSummary || "(empty)",
          },
        }),
      });
      const json = await res.json();
      // Extract the generated summary from the first suggestion preview or message
      const draft =
        json.suggestions?.[0]?.preview ||
        (json.message?.length > 40 ? json.message : null);
      if (draft) {
        setAiDraft(draft);
      } else {
        setGenError("CV-1 couldn't generate a summary right now. Try again.");
      }
    } catch {
      setGenError("Connection error. Please try again.");
    } finally {
      setGenerating(false);
    }
  }

  function acceptAiDraft() {
    if (!aiDraft) return;
    setLocalSummary(aiDraft);
    updateSummary(aiDraft);
    setAiDraft(null);
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 px-4 py-8 sm:p-10">
      <p className="text-sm text-neutral-500 mb-2">Step 6 of 8 — Professional Summary</p>

      <h1 className="text-2xl font-semibold text-slate-900 mb-1">Professional Summary</h1>
      <p className="text-sm text-neutral-600 mb-6 max-w-2xl">
        Write 2–4 sentences in your own words, or let CV-1 generate one from your resume data.
        You stay in control — review before using.
      </p>

      {/* Summary textarea */}
      <div className="relative mb-4 max-w-2xl">
        <textarea
          spellCheck
          value={localSummary}
          onChange={(e) => setLocalSummary(e.target.value)}
          placeholder="e.g. Electrician with 8 years experience in commercial and residential wiring. Led crews of 6, delivered projects under budget. OSHA 30 certified..."
          className="w-full h-44 border border-neutral-300 rounded-xl px-4 py-3 text-sm bg-white resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all"
        />
        <div className="absolute bottom-2 right-3 flex items-center gap-3">
          {hasMetrics && (
            <span className="text-xs text-green-600 font-medium">✓ Has metrics</span>
          )}
          <span className={`text-xs font-medium ${isGoodLength ? "text-green-600" : "text-neutral-400"}`}>
            {wordCount} words {isGoodLength ? "✓" : "(aim: 40–80)"}
          </span>
        </div>
      </div>

      {/* AI Generate button */}
      <div className="max-w-2xl mb-6">
        <button
          type="button"
          onClick={handleGenerate}
          disabled={generating}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
        >
          <Sparkles className="w-4 h-4" />
          {generating ? "CV-1 is writing…" : "Generate Summary with CV-1"}
        </button>
        {genError && (
          <p className="text-xs text-red-500 mt-2">{genError}</p>
        )}
      </div>

      {/* AI draft review card */}
      {aiDraft && (
        <div className="max-w-2xl mb-6 border border-indigo-200 rounded-xl bg-indigo-50 overflow-hidden">
          <div className="px-4 py-2.5 bg-indigo-600 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-white" />
            <span className="text-white text-xs font-bold">CV-1 Draft — Review before using</span>
          </div>
          <div className="px-4 py-3">
            <p className="text-sm text-gray-800 leading-relaxed italic">&ldquo;{aiDraft}&rdquo;</p>
          </div>
          <div className="flex border-t border-indigo-100">
            <button
              onClick={acceptAiDraft}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors"
            >
              <Check className="w-4 h-4" />
              Use this summary
            </button>
            <div className="w-px bg-indigo-100" />
            <button
              onClick={() => setAiDraft(null)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Keep mine
            </button>
          </div>
        </div>
      )}

      {/* Quality signals */}
      <div className="flex flex-wrap gap-3 mb-8 max-w-2xl">
        {[
          { label: "40–80 words",        done: isGoodLength },
          { label: "Includes metrics",   done: hasMetrics  },
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
