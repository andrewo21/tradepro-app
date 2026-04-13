"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useResumeStore } from "@/app/store/useResumeStore";

export default function SkillsPage() {
  const {
    skills,
    addSkill,
    updateSkill,
    removeSkill,
    rewriteSkill,
    acceptSkillSuggestion,
  } = useResumeStore();

  // Auto‑rewrite after typing (debounced, using needsRewrite)
  useEffect(() => {
    const timeouts: NodeJS.Timeout[] = [];

    skills.forEach((skill, index) => {
      const text = skill.text.trim();
      if (!text) return;
      if (skill.hasAcceptedSuggestion) return;
      if (skill.loading) return;
      if (!skill.needsRewrite) return;

      const timeout = setTimeout(() => {
        rewriteSkill(index);
      }, 800);

      timeouts.push(timeout);
    });

    return () => timeouts.forEach((t) => clearTimeout(t));
  }, [skills, rewriteSkill]);

  const handleChange = (index: number, value: string) => {
    updateSkill(index, value);
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 p-10">
      {/* Step Label */}
      <p className="text-sm text-neutral-500 mb-2">
        Step 4 of 7 — Skills
      </p>

      <h1 className="text-2xl font-semibold mb-6">Skills</h1>

      <div className="bg-white border border-neutral-300 rounded-lg p-6 shadow-sm max-w-3xl mx-auto">
        <div className="space-y-6">
          {skills.map((skill, index) => (
            <div
              key={index}
              className="border border-neutral-300 rounded-lg p-4 bg-white"
            >
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  spellCheck={true}   // ⭐ ENABLED
                  value={skill.text}
                  onChange={(e) => handleChange(index, e.target.value)}
                  className="flex-1 border border-neutral-300 rounded px-3 py-2 text-sm"
                  placeholder="Enter a skill..."
                />

                <button
                  onClick={() => removeSkill(index)}
                  className="px-3 py-2 bg-neutral-200 rounded hover:bg-neutral-300 text-sm"
                >
                  Remove
                </button>
              </div>

              {/* Suggestion area with stable height */}
              <div className="mt-2 min-h-[2.5rem]">
                {skill.loading && (
                  <p className="text-sm text-neutral-500">Rewriting…</p>
                )}

                {skill.error && (
                  <p className="text-sm text-red-500">{skill.error}</p>
                )}

                {skill.suggestion && !skill.hasAcceptedSuggestion && (
                  <div className="mt-1 p-3 bg-neutral-100 border border-neutral-300 rounded">
                    <p className="text-sm text-neutral-700">
                      {skill.suggestion}
                    </p>

                    <button
                      onClick={() => acceptSkillSuggestion(index)}
                      className="mt-2 px-3 py-1 bg-black text-white rounded text-sm hover:bg-neutral-800"
                    >
                      Accept Suggestion
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => addSkill("")}
          className="mt-6 px-4 py-2 bg-black text-white rounded hover:bg-neutral-800 text-sm"
        >
          Add Skill
        </button>
      </div>

      {/* NAVIGATION */}
      <div className="flex justify-between mt-12 max-w-3xl mx-auto">
        <Link
          href="/resume/experience"
          className="px-6 py-2 bg-neutral-200 text-neutral-800 rounded-md text-sm hover:bg-neutral-300"
        >
          Back to Step 3
        </Link>

        <Link
          href="/resume/education"
          className="px-6 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
        >
          Continue to Step 5
        </Link>
      </div>
    </div>
  );
}
