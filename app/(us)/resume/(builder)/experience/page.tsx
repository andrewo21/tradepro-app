"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
const AskCV1Button = dynamic(() => import("@/components/AskCV1Button"), { ssr: false });
import { useResumeStore } from "@/app/store/useResumeStore";
import ExperienceBullet from "./ExperienceBullet";
import { Plus, ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const YEARS: string[] = Array.from({ length: 50 }, (_, i) => String(new Date().getFullYear() - i));

function parseDateStr(str: string) {
  if (!str) return { month: "", year: "", present: false };
  if (str === "Present") return { month: "", year: "", present: true };
  const parts = str.trim().split(" ");
  if (parts.length >= 2) return { month: parts[0], year: parts[1], present: false };
  return { month: "", year: parts[0] || "", present: false };
}

function buildDateStr(month: string, year: string): string {
  if (!month && !year) return "";
  if (month && year) return `${month} ${year}`;
  return year || month;
}

interface DateState {
  startMonth: string; startYear: string;
  endMonth: string; endYear: string;
  present: boolean;
}

export default function ExperiencePage() {
  const experience = useResumeStore((s) => s.experience);

  const addExperience = useResumeStore((s) => s.addExperience);
  const removeExperience = useResumeStore((s) => s.removeExperience);

  const updateExperience = useResumeStore((s) => s.updateExperience);
  const updateRoleSummary = useResumeStore((s) => s.updateRoleSummary);

  const addResponsibility = useResumeStore((s) => s.addResponsibility);
  const updateResponsibility = useResumeStore((s) => s.updateResponsibility);
  const removeResponsibility = useResumeStore((s) => s.removeResponsibility);

  const addAchievement = useResumeStore((s) => s.addAchievement);
  const updateAchievement = useResumeStore((s) => s.updateAchievement);
  const removeAchievement = useResumeStore((s) => s.removeAchievement);

  const [openAchievements, setOpenAchievements] = useState<Record<string, boolean>>({});
  const [dates, setDates] = useState<Record<string, DateState>>(() => {
    const init: Record<string, DateState> = {};
    experience.forEach((job: any) => {
      const s = parseDateStr(job.startDate);
      const e = parseDateStr(job.endDate);
      init[job.id] = { startMonth: s.month, startYear: s.year, endMonth: e.month, endYear: e.year, present: e.present };
    });
    return init;
  });

  // Sync new jobs added after mount
  useEffect(() => {
    setDates(prev => {
      const next = { ...prev };
      experience.forEach((job: any) => {
        if (!next[job.id]) {
          next[job.id] = { startMonth: "", startYear: "", endMonth: "", endYear: "", present: false };
        }
      });
      return next;
    });
  }, [experience]);

  function setDate(jobId: string, field: keyof DateState, value: string | boolean) {
    setDates(prev => {
      const cur = prev[jobId] || { startMonth: "", startYear: "", endMonth: "", endYear: "", present: false };
      const next = { ...cur, [field]: value };
      // Sync to store
      updateExperience(jobId, "startDate", buildDateStr(next.startMonth, next.startYear));
      updateExperience(jobId, "endDate", next.present ? "Present" : buildDateStr(next.endMonth, next.endYear));
      return { ...prev, [jobId]: next };
    });
  }

  function toggleAchievements(jobId: string) {
    setOpenAchievements((prev) => ({
      ...prev,
      [jobId]: !prev[jobId],
    }));
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 px-4 py-8 sm:p-10">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-neutral-500">Step 3 of 7 — Work Experience</p>
        <AskCV1Button />
      </div>

      <h1 className="text-2xl font-semibold mb-6">Work Experience</h1>

      <div className="space-y-10">
        {experience.map((job, jobIndex) => (
          <div
            key={job.id}
            className="bg-white border border-neutral-300 rounded-lg p-4 sm:p-6 shadow-sm"
          >
            {/* JOB HEADER */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium mb-1">Job Title</label>
                <input
                  type="text"
                  spellCheck={true}   // ⭐ ENABLED
                  value={job.jobTitle}
                  onChange={(e) =>
                    updateExperience(job.id, "jobTitle", e.target.value)
                  }
                  className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Company</label>
                <input
                  type="text"
                  spellCheck={true}
                  value={job.company}
                  onChange={(e) => updateExperience(job.id, "company", e.target.value)}
                  className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">City</label>
                <input
                  type="text"
                  spellCheck={false}
                  value={job.city || ""}
                  onChange={(e) => updateExperience(job.id, "city", e.target.value)}
                  placeholder="e.g. Fort Lauderdale"
                  className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">State</label>
                <input
                  type="text"
                  spellCheck={false}
                  value={job.state || ""}
                  onChange={(e) => updateExperience(job.id, "state", e.target.value)}
                  placeholder="e.g. FL"
                  className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm"
                />
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-sm font-medium mb-1">Start Date</label>
                <div className="flex gap-2">
                  <select
                    value={dates[job.id]?.startMonth || ""}
                    onChange={e => setDate(job.id, "startMonth", e.target.value)}
                    className="flex-1 border border-neutral-300 rounded-md px-2 py-2 text-sm bg-white"
                  >
                    <option value="">Month</option>
                    {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <select
                    value={dates[job.id]?.startYear || ""}
                    onChange={e => setDate(job.id, "startYear", e.target.value)}
                    className="w-24 border border-neutral-300 rounded-md px-2 py-2 text-sm bg-white"
                  >
                    <option value="">Year</option>
                    {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>

              {/* End Date */}
              <div>
                <label className="block text-sm font-medium mb-1">End Date</label>
                {dates[job.id]?.present ? (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-neutral-600 font-medium">Present</span>
                    <button onClick={() => setDate(job.id, "present", false)} className="text-xs text-blue-600 underline">Change</button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <select
                      value={dates[job.id]?.endMonth || ""}
                      onChange={e => setDate(job.id, "endMonth", e.target.value)}
                      className="flex-1 border border-neutral-300 rounded-md px-2 py-2 text-sm bg-white"
                    >
                      <option value="">Month</option>
                      {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <select
                      value={dates[job.id]?.endYear || ""}
                      onChange={e => setDate(job.id, "endYear", e.target.value)}
                      className="w-24 border border-neutral-300 rounded-md px-2 py-2 text-sm bg-white"
                    >
                      <option value="">Year</option>
                      {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                )}
                <label className="flex items-center gap-2 mt-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={dates[job.id]?.present || false}
                    onChange={e => setDate(job.id, "present", e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm text-neutral-600">I currently work here</span>
                </label>
              </div>
            </div>

            {/* ROLE SUMMARY — intro paragraph */}
            {(job.roleSummary !== undefined) && (
              <div className="mb-5">
                <label className="block text-sm font-medium mb-1">
                  Role Overview <span className="text-neutral-400 font-normal text-xs">(optional — intro paragraph shown before bullets)</span>
                </label>
                <textarea
                  spellCheck={true}
                  value={job.roleSummary || ""}
                  onChange={(e) => updateRoleSummary(job.id, e.target.value)}
                  placeholder="Brief description of the role or company context..."
                  className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm resize-none h-20"
                />
              </div>
            )}

            {/* RESPONSIBILITIES */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-3">Key Responsibilities</h2>

              <div className="space-y-4">
                {job.responsibilities.map((r, i) => (
                  <ExperienceBullet
                    key={r.id}
                    jobId={job.id}
                    jobTitle={job.jobTitle}
                    company={job.company}
                    index={i}
                    type="responsibility"
                    value={r.text}
                    placeholder="Describe a responsibility..."
                    onChange={(val) => updateResponsibility(job.id, i, val)}
                    onRemove={() => removeResponsibility(job.id, i)}
                  />
                ))}
              </div>

              <button
                onClick={() => addResponsibility(job.id)}
                className="mt-3 flex items-center gap-2 text-sm text-neutral-700 hover:text-neutral-900"
              >
                <Plus size={16} /> Add Responsibility
              </button>
            </div>

            {/* ACHIEVEMENTS */}
            <div className="border-t border-neutral-200 pt-4">
              <button
                onClick={() => toggleAchievements(job.id)}
                className="flex items-center justify-between w-full text-left"
              >
                <h2 className="text-lg font-semibold">Achievements (Optional)</h2>
                {openAchievements[job.id] ? (
                  <ChevronUp size={20} />
                ) : (
                  <ChevronDown size={20} />
                )}
              </button>

              {openAchievements[job.id] && (
                <div className="mt-4 space-y-4">
                  {job.achievements.map((a, i) => (
                    <ExperienceBullet
                      key={a.id}
                      jobId={job.id}
                      jobTitle={job.jobTitle}
                      company={job.company}
                      index={i}
                      type="achievement"
                      value={a.text}
                      placeholder="Describe an achievement..."
                      onChange={(val) =>
                        updateAchievement(job.id, i, val)
                      }
                      onRemove={() => removeAchievement(job.id, i)}
                    />
                  ))}

                  <button
                    onClick={() => addAchievement(job.id)}
                    className="mt-3 flex items-center gap-2 text-sm text-neutral-700 hover:text-neutral-900"
                  >
                    <Plus size={16} /> Add Achievement
                  </button>
                </div>
              )}
            </div>

            {/* REMOVE JOB */}
            {experience.length > 1 && (
              <button
                onClick={() => removeExperience(job.id)}
                className="mt-6 flex items-center gap-2 text-sm text-red-600 hover:text-red-800"
              >
                <Trash2 size={16} /> Remove Job
              </button>
            )}
          </div>
        ))}

        {/* ADD JOB */}
        <button
          onClick={addExperience}
          className="flex items-center gap-2 text-neutral-700 hover:text-neutral-900 text-sm"
        >
          <Plus size={18} /> Add Another Job
        </button>
      </div>

      {/* NAVIGATION */}
      <div className="flex justify-between mt-12">
        <Link
          href="/resume/personal"
          className="px-6 py-2 bg-neutral-200 text-neutral-800 rounded-md text-sm hover:bg-neutral-300"
        >
          Back to Step 2
        </Link>

        <Link
          href="/resume/skills"
          className="px-6 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
        >
          Continue to Step 4
        </Link>
      </div>
    </div>
  );
}
