"use client";

// ExperienceBullet — CV-1 rewrites bullets inline with a teacher-style explanation.
// Clicking "CV-1" calls the API directly, shows the improved bullet AND
// explains exactly what makes it stronger. No modal, no floating chat.

import { useState } from "react";
import { X, Check } from "lucide-react";

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
  const [loading,    setLoading]    = useState(false);
  const [suggestion, setSuggestion] = useState<{ text: string; reason: string } | null>(null);
  const [error,      setError]      = useState<string | null>(null);

  async function handleAskCV1() {
    if (!value.trim() || loading) return;
    setLoading(true);
    setError(null);
    setSuggestion(null);

    try {
      const res = await fetch("/api/ai/assistant/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode:    "resume",
          step:    "experience",
          locale:  "en",
          jobTitle,
          data: {
            personalInfo: { tradeTitle: jobTitle },
            experience: [{ jobTitle, company, responsibilities: [{ text: value }], achievements: [] }],
          },
          userMessage: `I need you to rewrite this bullet point for ${jobTitle} at ${company} and teach me why the new version is stronger:

Current bullet: "${value}"

Rules:
1. Write ONE complete, professional replacement sentence using the X-Y-Z formula (action verb + what you did + measurable result/scale).
2. If a specific number is unknown, use a realistic placeholder like [X]% or [$___].
3. In your message (not the suggestion), explain in 2-3 sentences exactly what you changed and why — name the specific techniques used (e.g. "I added a result metric", "I replaced a weak verb with a stronger one", "I added the scope of the project").
4. Be direct and specific. Teach me what makes a bullet strong.`,
        }),
      });

      if (!res.ok) throw new Error("API error");
      const data = await res.json();

      const s = data.suggestions?.[0];
      if (s?.preview) {
        setSuggestion({ text: s.preview, reason: data.message || s.reason || "" });
      } else if (data.message) {
        setSuggestion({ text: "", reason: data.message });
      } else {
        setError("CV-1 couldn't generate a suggestion. Try again.");
      }
    } catch {
      setError("Connection issue — try again.");
    } finally {
      setLoading(false);
    }
  }

  function accept() {
    if (suggestion?.text) onChange(suggestion.text);
    setSuggestion(null);
  }

  function dismiss() {
    setSuggestion(null);
    setError(null);
  }

  return (
    <div className="space-y-1">
      <div className="relative flex items-start gap-2">
        <div className="flex-1">
          <textarea
            spellCheck
            value={value}
            onChange={(e) => { onChange(e.target.value); setSuggestion(null); }}
            placeholder={placeholder}
            rows={2}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:border-blue-400 focus:ring-blue-300 transition-colors"
          />
        </div>

        {/* CV-1 rewrite button */}
        {value.trim() && (
          <button
            type="button"
            onClick={handleAskCV1}
            disabled={loading}
            title="CV-1: rewrite this bullet stronger"
            className="mt-1 flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-[11px] font-bold rounded-lg transition-colors shadow-sm whitespace-nowrap"
          >
            {loading ? (
              <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
              </svg>
            )}
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

      {/* Error state */}
      {error && (
        <div className="ml-0 p-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={dismiss} className="text-red-400 hover:text-red-600 ml-2"><X size={12} /></button>
        </div>
      )}

      {/* CV-1 teacher panel */}
      {suggestion && (
        <div className="ml-0 border border-indigo-200 rounded-xl overflow-hidden shadow-sm">
          {/* Teaching explanation */}
          {suggestion.reason && (
            <div className="px-4 py-3 bg-indigo-50 border-b border-indigo-100">
              <p className="text-xs font-bold text-indigo-700 uppercase tracking-wide mb-1">✦ CV-1 explains</p>
              <p className="text-sm text-indigo-900 leading-relaxed">{suggestion.reason}</p>
            </div>
          )}

          {/* The actual rewrite */}
          {suggestion.text && (
            <div className="px-4 py-3 bg-white">
              <p className="text-xs font-bold text-neutral-500 uppercase tracking-wide mb-1.5">Stronger version</p>
              <p className="text-sm text-neutral-900 leading-relaxed font-medium">{suggestion.text}</p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={accept}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Check size={12} /> Use this
                </button>
                <button
                  onClick={dismiss}
                  className="px-4 py-1.5 bg-neutral-100 text-neutral-600 text-xs font-semibold rounded-lg hover:bg-neutral-200 transition-colors"
                >
                  Keep mine
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
