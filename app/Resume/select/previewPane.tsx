"use client";

import { useResumeStore } from "@/app/store/useResumeStore";
import { templates } from "@/components/templates";
import type { TemplateKey } from "@/components/templates";

export default function PreviewPane() {
  const selectedTemplate = useResumeStore((s) => s.selectedTemplate);
  const premiumUnlocked = useResumeStore((s) => s.premiumUnlocked);
  const showWatermark = useResumeStore((s) => s.showWatermark); // ⭐ NEW

  // ---------------------------------------
  // STEP 1 ALWAYS USES GENERIC PLACEHOLDER DATA
  // ---------------------------------------
  const data = {
    name: "John Doe",
    title: "Professional Title",
    contact: {
      phone: "555-555-5555",
      email: "email@example.com",
      location: "City, State",
    },
    summary: "A short professional summary will appear here.",
    experience: [
      {
        jobTitle: "Job Title",
        company: "Company Name",
        startDate: "2020",
        endDate: "2024",
        responsibilities: [
          "Responsibility bullet point",
          "Another responsibility bullet point",
        ],
        achievements: [
          "Achievement bullet point",
          "Another achievement bullet point",
        ],
      },
    ],
    education: [
      {
        school: "School Name",
        degree: "Degree Name",
        year: "2020",
        gpa: "",
      },
    ],
    skills: ["Skill One", "Skill Two", "Skill Three"],
    certifications: [],
  };

  if (!selectedTemplate) {
    return (
      <div className="p-6 bg-white rounded-lg shadow text-neutral-600">
        Select a template to preview it.
      </div>
    );
  }

  const isValidKey = (selectedTemplate as string) in templates;
  if (!isValidKey) {
    return (
      <div className="p-6 bg-white rounded-lg shadow text-neutral-600">
        Invalid template selected.
      </div>
    );
  }

  const Template = templates[selectedTemplate as TemplateKey].component;

  return (
    <div className="relative bg-white rounded-lg shadow p-0 overflow-visible">
      <Template
        data={data}
        mode="preview"
        premiumUnlocked={premiumUnlocked}
        showWatermark={showWatermark} // ⭐ NEW
      />
    </div>
  );
}
