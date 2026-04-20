"use client";

import { useResumeStore } from "@/app/store/useResumeStore";
import ResumePreview from "@/components/ResumePreview";
import type { TemplateKey } from "@/components/templates";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function PreviewPage() {
  const router = useRouter();

  // -----------------------------
  // READ STORE VALUES
  // -----------------------------
  const personal = useResumeStore((s) => s.personalInfo);
  const summary = useResumeStore((s) => s.summary);
  const skills = useResumeStore((s) => s.skills);
  const experience = useResumeStore((s) => s.experience);
  const education = useResumeStore((s) => s.education);
  const selectedTemplate = useResumeStore((s) => s.selectedTemplate);
  const premiumUnlocked = useResumeStore((s) => s.premiumUnlocked);

  // -----------------------------
  // HYDRATION GUARD
  // -----------------------------
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const isHydrated =
      personal.firstName !== "" ||
      personal.lastName !== "" ||
      summary !== "" ||
      skills.length > 0 ||
      experience.length > 0 ||
      education.length > 0 ||
      selectedTemplate !== "sidebar-green";

    if (isHydrated) {
      setHydrated(true);
    }
  }, [
    personal.firstName,
    personal.lastName,
    summary,
    skills.length,
    experience.length,
    education.length,
    selectedTemplate,
  ]);

  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center text-neutral-600">
        Loading…
      </div>
    );
  }

  // -----------------------------
  // ALWAYS VALID TEMPLATE KEY
  // -----------------------------
  const template: TemplateKey =
    (selectedTemplate as TemplateKey) || "sidebar-green";

  // -----------------------------
  // CLEAN SERIALIZABLE PAYLOAD
  // -----------------------------
  const cleanData = {
    name: `${personal.firstName || ""} ${personal.lastName || ""}`.trim(),
    title: personal.tradeTitle || "",
    contact: {
      phone: personal.phone || "",
      email: personal.email || "",
      location: `${personal.city || ""}${
        personal.state ? ", " + personal.state : ""
      }`,
    },
    summary: summary || "",
    experience: experience.map((job) => ({
      jobTitle: job.jobTitle || "",
      company: job.company || "",
      startDate: job.startDate || "",
      endDate: job.endDate || "",
      responsibilities: job.responsibilities.map((r) => r.text || ""),
      achievements: job.achievements.map((a) => a.text || ""),
    })),
    education: education.map((edu) => ({
      school: edu.school || "",
      degree: edu.degree || "",
      year: edu.year || "",
      gpa: edu.gpa || "",
    })),
    skills: skills.map((s) => s.text || ""),
    certifications: [],
  };

  // -----------------------------
  // PDF GENERATION (FIXED)
  // -----------------------------
  const handleGeneratePDF = async () => {
    const payload = {
      template,
      premiumUnlocked,
      ...cleanData,
    };

    // Encode payload for print URL
    const base64 = Buffer.from(JSON.stringify(payload), "utf8").toString("base64");
    const encoded = encodeURIComponent(base64);

    const printUrl = `${process.env.NEXT_PUBLIC_SITE}/resume/print?payload=${encoded}`;

    // Correct Render endpoint: /pdf
    const pdfUrl = `${process.env.NEXT_PUBLIC_PDF_SERVICE_URL}/pdf`;

    const res = await fetch(pdfUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url: printUrl }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("PDF generation failed:", text);
      return;
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "resume.pdf";
    a.click();

    URL.revokeObjectURL(url);
  };

  // -----------------------------
  // RENDER
  // -----------------------------
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 p-10">
      <p className="text-sm text-neutral-500 mb-2">
        Step 7 of 7 — Final Preview
      </p>

      <h1 className="text-2xl font-semibold mb-6">Final Preview</h1>

      <div className="relative bg-white rounded-lg shadow p-0 overflow-visible">
        <ResumePreview
          template={template}
          data={cleanData}
          mode="pdf"
          premiumUnlocked={premiumUnlocked}
        />
      </div>

      <div className="flex justify-between mt-10">
        <button
          onClick={() => router.push("/resume/summary")}
          className="px-6 py-2 bg-neutral-200 text-neutral-800 rounded-md text-sm hover:bg-neutral-300"
        >
          Back to Summary
        </button>

        <button
          onClick={handleGeneratePDF}
          className="px-6 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
        >
          Generate PDF
        </button>
      </div>
    </div>
  );
}
