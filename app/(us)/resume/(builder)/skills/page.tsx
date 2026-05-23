"use client";

// Skills step — CV-1 is the exclusive AI interface.
// Auto-rewrite, accept suggestion, and rewriteSkill buttons removed.
// CV-1 handles skill suggestions via the floating assistant.

import Link from "next/link";
import dynamic from "next/dynamic";
const AskCV1Button = dynamic(() => import("@/components/AskCV1Button"), { ssr: false });
import { X } from "lucide-react";
import { useResumeStore } from "@/app/store/useResumeStore";

export default function SkillsPage() {
  const skills     = useResumeStore((s) => s.skills);
  const addSkill   = useResumeStore((s) => s.addSkill);
  const updateSkill = useResumeStore((s) => s.updateSkill);
  const removeSkill = useResumeStore((s) => s.removeSkill);

  const filledCount = skills.filter((s: any) => s.text?.trim()).length;

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 px-4 py-8 sm:p-10">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-neutral-500">Step 4 of 8 — Skills</p>
        <AskCV1Button />
      </div>
      <h1 className="text-2xl font-semibold mb-1">Skills</h1>
      <p className="text-sm text-neutral-500 mb-6">
        List your technical skills, tools, certifications, and specialties.
        Aim for 8–12.{" "}
        <span className="text-indigo-600 font-medium">
          CV-1 can suggest missing skills for your role — just ask.
        </span>
      </p>

      {/* Progress indicator */}
      <div className="flex items-center gap-2 mb-6">
        <div className="h-2 flex-1 bg-neutral-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-500 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, (filledCount / 10) * 100)}%` }}
          />
        </div>
        <span className="text-xs text-neutral-500 font-medium whitespace-nowrap">
          {filledCount} / 10 recommended
        </span>
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm max-w-3xl mx-auto space-y-3">
        {skills.map((skill: any, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <input
              type="text"
              spellCheck
              value={skill.text}
              onChange={(e) => updateSkill(index, e.target.value)}
              className="flex-1 border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200 transition-all"
              placeholder="e.g. AutoCAD, Project Management, OSHA 30..."
            />
            <button
              onClick={() => removeSkill(index)}
              className="flex-shrink-0 p-1.5 text-neutral-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
              title="Remove skill"
            >
              <X size={15} />
            </button>
          </div>
        ))}

        <button
          onClick={() => addSkill("")}
          className="mt-2 w-full py-2.5 border-2 border-dashed border-neutral-300 text-neutral-500 rounded-xl text-sm hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
        >
          + Add Skill
        </button>
      </div>

      <div className="flex justify-between mt-10 max-w-3xl mx-auto">
        <Link href="/resume/experience"
          className="px-6 py-2.5 bg-neutral-200 text-neutral-800 rounded-xl text-sm hover:bg-neutral-300 transition">
          ← Back to Step 3
        </Link>
        <Link href="/resume/education"
          className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition">
          Continue to Step 5 →
        </Link>
      </div>
    </div>
  );
}
