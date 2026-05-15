"use client";

import Link from "next/link";
import { useResumeStore } from "@/app/store/useResumeStore";
import { useAssistantStore } from "@/app/store/useAssistantStore";
import CV1Hero from "@/components/assistant/CV1Hero";
import { Check, AlertCircle, ChevronRight } from "lucide-react";

function completionItems(store: any) {
  const items = [
    {
      label: "Personal info",
      done: !!(store.personalInfo?.firstName && store.personalInfo?.tradeTitle),
      hint: "Name and job title",
    },
    {
      label: "Professional summary",
      done: (store.summary || "").trim().split(/\s+/).filter(Boolean).length >= 30,
      hint: "At least 30 words",
    },
    {
      label: "Work experience",
      done: (store.experience || []).some((e: any) =>
        (e.responsibilities || []).some((r: any) => r.text?.trim())
      ),
      hint: "At least one job with bullets",
    },
    {
      label: "Skills",
      done: (store.skills || []).filter((s: any) => s.text?.trim()).length >= 5,
      hint: "5 or more skills listed",
    },
    {
      label: "Education",
      done: (store.education || []).some((e: any) => e.school?.trim() || e.degree?.trim()),
      hint: "School or degree",
    },
    {
      label: "Certifications",
      done: (store.certifications || []).some((c: any) => c.text?.trim()),
      hint: "At least one certification",
    },
  ];
  return items;
}

export default function CV1ReviewStep() {
  const store        = useResumeStore();
  const { open }     = useAssistantStore();
  const items        = completionItems(store);
  const doneCount    = items.filter(i => i.done).length;
  const totalCount   = items.length;
  const pct          = Math.round((doneCount / totalCount) * 100);

  const firstName = store.personalInfo?.firstName || "there";

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <p className="text-sm text-neutral-500 mb-1">Step 7 of 8</p>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-10">
        <CV1Hero size={100} />
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-1">
            CV-1™ Resume Review
          </h1>
          <p className="text-neutral-500 text-sm leading-relaxed">
            Hey {firstName}! I&apos;ve been with you through every step. Here&apos;s where your resume stands right now.
          </p>
        </div>
      </div>

      {/* Overall progress */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-6 mb-6 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <p className="font-semibold text-neutral-800">Resume completeness</p>
          <span className="text-2xl font-bold text-blue-600">{pct}%</span>
        </div>
        <div className="h-3 bg-neutral-100 rounded-full overflow-hidden mb-4">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${pct}%`,
              background: pct >= 80 ? "#16a34a" : pct >= 50 ? "#d97706" : "#dc2626",
            }}
          />
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {items.map(item => (
            <div key={item.label} className={`flex items-start gap-3 p-3 rounded-xl ${item.done ? "bg-green-50 border border-green-100" : "bg-amber-50 border border-amber-100"}`}>
              {item.done
                ? <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                : <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              }
              <div>
                <p className={`text-sm font-semibold ${item.done ? "text-green-800" : "text-amber-800"}`}>{item.label}</p>
                <p className="text-xs text-neutral-500 mt-0.5">{item.hint}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CV-1 CTA */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-2xl p-6 mb-6 border border-blue-800/30 text-center">
        <p className="text-blue-300 text-xs font-bold uppercase tracking-widest mb-2">CV-1™ is ready</p>
        <p className="text-white font-semibold mb-4">
          {doneCount < totalCount
            ? `I see ${totalCount - doneCount} section${totalCount - doneCount !== 1 ? "s" : ""} that could be stronger. Want me to fix them now?`
            : "Your resume looks complete. Want me to review it one more time for any final improvements?"}
        </p>
        <button
          onClick={open}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-400 text-white font-bold rounded-xl transition shadow-lg shadow-blue-500/20"
        >
          🤖 Open CV-1 Chat
          <ChevronRight className="w-4 h-4" />
        </button>
        <p className="text-blue-400/60 text-xs mt-3">CV-1 is also available in the corner of every builder step</p>
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-4">
        <Link href="/resume/summary" className="px-6 py-2.5 bg-neutral-200 text-neutral-800 rounded-xl text-sm font-medium hover:bg-neutral-300 transition">
          ← Back
        </Link>
        <Link href="/resume/preview" className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition">
          Final Preview →
        </Link>
      </div>
    </div>
  );
}
