"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
const AskCV1Button = dynamic(() => import("@/components/AskCV1Button"), { ssr: false });
import { useResumeStore } from "@/app/store/useResumeStore";

export default function EducationPage() {
  const education = useResumeStore((s) => s.education);
  const addEducation = useResumeStore((s) => s.addEducation);
  const updateEducation = useResumeStore((s) => s.updateEducation);
  const removeEducation = useResumeStore((s) => s.removeEducation);
  const certifications = useResumeStore((s: any) => s.certifications || []);
  const addCertification = useResumeStore((s: any) => s.addCertification);
  const updateCertification = useResumeStore((s: any) => s.updateCertification);
  const removeCertification = useResumeStore((s: any) => s.removeCertification);

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 px-4 py-8 sm:p-10">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-neutral-500">Step 5 of 7 — Education</p>
        <AskCV1Button />
      </div>

      <h1 className="text-2xl font-semibold mb-6">Education</h1>

      <p className="text-sm text-neutral-600 mb-6">
        Add your education history. This section does not use AI — everything is entered manually.
      </p>

      <div className="space-y-8 mb-10">
        {education.map((edu, index) => (
          <div key={index} className="border-b pb-6">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-medium">Entry {index + 1}</h2>
              <button
                onClick={() => removeEducation(index)}
                className="text-red-600 text-sm hover:underline"
              >
                Remove
              </button>
            </div>

            <input
              type="text"
              spellCheck={true}          // ⭐ ENABLED
              value={edu.school}
              onChange={(e) => updateEducation(index, "school", e.target.value)}
              placeholder="School Name"
              className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm mb-3"
            />

            <input
              type="text"
              spellCheck={true}          // ⭐ ENABLED
              value={edu.degree}
              onChange={(e) => updateEducation(index, "degree", e.target.value)}
              placeholder="Degree or Certification"
              className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm mb-3"
            />

            <input
              type="text"
              spellCheck={true}          // ⭐ ENABLED
              value={edu.gpa || ""}
              onChange={(e) => updateEducation(index, "gpa", e.target.value)}
              placeholder="GPA (optional)"
              className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm"
            />
          </div>
        ))}

        <button
          onClick={addEducation}
          className="px-4 py-2 bg-neutral-200 rounded-md text-sm hover:bg-neutral-300"
        >
          + Add Education
        </button>
      </div>

      {/* Certificates & Licenses */}
      <div className="bg-white border border-neutral-300 rounded-lg p-4 sm:p-6 shadow-sm mb-10">
        <h2 className="text-lg font-semibold mb-1">Certificates &amp; Licenses</h2>
        <p className="text-sm text-neutral-600 mb-4">
          Add professional certifications, trade licenses, safety credentials, and continuing education.
        </p>
        <div className="space-y-3">
          {certifications.map((cert: any) => (
            <div key={cert.id} className="flex items-center gap-2">
              <input
                type="text"
                spellCheck={true}
                value={cert.text}
                onChange={(e) => updateCertification(cert.id, e.target.value)}
                placeholder="e.g. PMP, OSHA 30, EPA 608, CDL Class A, AWS Solutions Architect..."
                className="flex-1 border border-neutral-300 rounded-md px-3 py-2 text-sm"
              />
              <button
                onClick={() => removeCertification(cert.id)}
                className="flex-shrink-0 px-3 py-2 bg-neutral-200 rounded hover:bg-neutral-300 text-sm"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={() => addCertification()}
          className="mt-4 px-4 py-2 bg-black text-white rounded hover:bg-neutral-800 text-sm"
        >
          + Add Certificate / License
        </button>
      </div>

      <div className="flex justify-between mt-10">
        <Link
          href="/resume/skills"
          className="px-6 py-2 bg-neutral-200 text-neutral-800 rounded-md text-sm hover:bg-neutral-300"
        >
          Back to Step 4
        </Link>

        <Link
          href="/resume/summary"
          className="px-6 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
        >
          Continue to Step 6
        </Link>
      </div>
    </div>
  );
}
