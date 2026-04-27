"use client";

import Link from "next/link";
import { useResumeStore } from "@/app/store/useResumeStore";
import ExperienceBullet from "./ExperienceBullet";
import { Plus, ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { useState } from "react";

export default function ExperiencePage() {
  const experience = useResumeStore((s) => s.experience);

  const addExperience = useResumeStore((s) => s.addExperience);
  const removeExperience = useResumeStore((s) => s.removeExperience);

  const updateExperience = useResumeStore((s) => s.updateExperience);

  const addResponsibility = useResumeStore((s) => s.addResponsibility);
  const updateResponsibility = useResumeStore((s) => s.updateResponsibility);
  const removeResponsibility = useResumeStore((s) => s.removeResponsibility);

  const addAchievement = useResumeStore((s) => s.addAchievement);
  const updateAchievement = useResumeStore((s) => s.updateAchievement);
  const removeAchievement = useResumeStore((s) => s.removeAchievement);

  const [openAchievements, setOpenAchievements] = useState<Record<string, boolean>>(
    {}
  );

  function toggleAchievements(jobId: string) {
    setOpenAchievements((prev) => ({
      ...prev,
      [jobId]: !prev[jobId],
    }));
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 px-4 py-8 sm:p-10">
      <p className="text-sm text-neutral-500 mb-2">
        Step 3 of 7 — Work Experience
      </p>

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
                  spellCheck={true}   // ⭐ ENABLED
                  value={job.company}
                  onChange={(e) =>
                    updateExperience(job.id, "company", e.target.value)
                  }
                  className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Start Date</label>
                <input
                  type="text"
                  spellCheck={true}   // ⭐ ENABLED
                  value={job.startDate}
                  onChange={(e) =>
                    updateExperience(job.id, "startDate", e.target.value)
                  }
                  className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">End Date</label>
                <input
                  type="text"
                  spellCheck={true}   // ⭐ ENABLED
                  value={job.endDate}
                  onChange={(e) =>
                    updateExperience(job.id, "endDate", e.target.value)
                  }
                  className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm"
                />
              </div>
            </div>

            {/* RESPONSIBILITIES */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-3">Key Responsibilities</h2>

              <div className="space-y-4">
                {job.responsibilities.map((r, i) => (
                  <ExperienceBullet
                    key={r.id}
                    jobId={job.id}
                    index={i}
                    type="responsibility"
                    value={r.text}
                    placeholder="Describe a responsibility..."
                    onChange={(val) =>
                      updateResponsibility(job.id, i, val)
                    }
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
