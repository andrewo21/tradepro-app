"use client";

import { useState, useEffect } from "react";
import { useCoverLetterStore } from "@/app/store/useCoverLetterStore";
import { overrides } from "@/config/overrides";
import Link from "next/link";

export default function CoverLetterPage() {
  const {
    applicantName,
    applicantAddress,
    applicantCityStateZip,
    applicantEmail,
    applicantPhone,
    date,
    hiringManager,
    companyName,
    companyAddress,
    companyCityStateZip,
    jobTitle,
    tone,
    experience,
    salutationStyle,
    generatedLetter,
    setField,
    setGeneratedLetter,
  } = useCoverLetterStore();

  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");

  // AUTO‑SET DATE
  useEffect(() => {
    if (!date) {
      const today = new Date().toISOString().split("T")[0];
      setField("date", today);
    }
  }, []);

  const canAccess =
    overrides.devMode || overrides.access || overrides.premium;

  if (!canAccess) {
    return (
      <div className="max-w-2xl mx-auto py-10">
        <h1 className="text-2xl font-bold mb-4">Cover Letter Builder</h1>
        <p className="text-gray-600 mb-6">
          You don’t have access to the Cover Letter Builder yet.
        </p>
        <Link
          href="/pricing"
          className="px-4 py-2 bg-blue-600 text-white rounded-md"
        >
          Unlock Access
        </Link>
      </div>
    );
  }

  // TEMPORARILY DISABLED — until backend resume parser is added
  const handleGenerateSummary = async () => {
    alert("Resume summary feature is being upgraded and will return soon.");
    return;
  };

  // GENERATE COVER LETTER (Render backend)
  const handleGenerateLetter = async () => {
    const payload = {
      applicantName,
      applicantAddress,
      applicantCityStateZip,
      applicantEmail,
      applicantPhone,
      date,
      hiringManager,
      companyName,
      companyAddress,
      companyCityStateZip,
      jobTitle,
      tone,
      experience,
      salutationStyle,
    };

    const res = await fetch(
      "https://tradepro-app.onrender.com/cover-letter/generate",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    const data = await res.json();

    if (data.letter) {
      setGeneratedLetter(data.letter);
    }
  };

  // EXPORT PDF (Render backend)
  const handleExportPDF = async () => {
    const res = await fetch(
      "https://tradepro-app.onrender.com/export/pdf",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ letter: generatedLetter }),
      }
    );

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "cover-letter.pdf";
    a.click();

    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-3xl mx-auto py-10 space-y-10">
      <h1 className="text-3xl font-bold">Cover Letter Builder</h1>

      {/* Applicant Info */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Applicant Information</h2>

        <input
          className="w-full border p-2 rounded"
          placeholder="Full Name"
          value={applicantName}
          onChange={(e) => setField("applicantName", e.target.value)}
        />

        <input
          className="w-full border p-2 rounded"
          placeholder="Address"
          value={applicantAddress}
          onChange={(e) => setField("applicantAddress", e.target.value)}
        />

        <input
          className="w-full border p-2 rounded"
          placeholder="City, State ZIP"
          value={applicantCityStateZip}
          onChange={(e) => setField("applicantCityStateZip", e.target.value)}
        />

        <input
          className="w-full border p-2 rounded"
          placeholder="Email"
          value={applicantEmail}
          onChange={(e) => setField("applicantEmail", e.target.value)}
        />

        <input
          className="w-full border p-2 rounded"
          placeholder="Phone"
          value={applicantPhone}
          onChange={(e) => setField("applicantPhone", e.target.value)}
        />

        <input
          className="w-full border p-2 rounded"
          placeholder="Date"
          value={date}
          onChange={(e) => setField("date", e.target.value)}
        />
      </section>

      {/* Employer Info */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Employer Information</h2>

        <input
          className="w-full border p-2 rounded"
          placeholder="Hiring Manager"
          value={hiringManager}
          onChange={(e) => setField("hiringManager", e.target.value)}
        />

        <input
          className="w-full border p-2 rounded"
          placeholder="Company Name"
          value={companyName}
          onChange={(e) => setField("companyName", e.target.value)}
        />

        <input
          className="w-full border p-2 rounded"
          placeholder="Company Address"
          value={companyAddress}
          onChange={(e) => setField("companyAddress", e.target.value)}
        />

        <input
          className="w-full border p-2 rounded"
          placeholder="City, State ZIP"
          value={companyCityStateZip}
          onChange={(e) => setField("companyCityStateZip", e.target.value)}
        />
      </section>

      {/* Job Details */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Job Details</h2>

        <input
          className="w-full border p-2 rounded"
          placeholder="Job Title"
          value={jobTitle}
          onChange={(e) => setField("jobTitle", e.target.value)}
        />

        <select
          className="w-full border p-2 rounded"
          value={tone}
          onChange={(e) => setField("tone", e.target.value)}
        >
          <option>Professional</option>
          <option>Friendly</option>
          <option>Confident</option>
          <option>Formal</option>
        </select>

        <select
          className="w-full border p-2 rounded"
          value={salutationStyle}
          onChange={(e) => setField("salutationStyle", e.target.value)}
        >
          <option value="A">Dear Hiring Manager,</option>
          <option value="B">Dear [Name],</option>
          <option value="C">To Whom It May Concern,</option>
        </select>
      </section>

      {/* Experience Summary */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Experience Summary</h2>

        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => {
            const file = e.target.files?.[0] || null;
            setResumeFile(file);
            setFileName(file ? file.name : "");
          }}
        />

        {fileName && (
          <p className="text-sm text-gray-700">{fileName}</p>
        )}

        <button
          onClick={handleGenerateSummary}
          className="px-4 py-2 bg-gray-800 text-white rounded"
        >
          Generate Summary from Resume
        </button>

        <textarea
          className="w-full border p-2 rounded h-40"
          placeholder="Experience summary..."
          value={experience}
          onChange={(e) => setField("experience", e.target.value)}
        />
      </section>

      {/* Generate Cover Letter */}
      <button
        onClick={handleGenerateLetter}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Generate Cover Letter
      </button>

      {/* Editable Live Preview */}
      {generatedLetter && (
        <section className="mt-10 p-6 border rounded bg-white shadow">
          <h2 className="text-xl font-semibold mb-4">Preview (Editable)</h2>

          <textarea
            className="w-full border p-3 rounded h-80 whitespace-pre-wrap"
            value={generatedLetter}
            onChange={(e) => setGeneratedLetter(e.target.value)}
          />

          <button
            onClick={handleExportPDF}
            className="inline-block mt-4 px-4 py-2 bg-green-600 text-white rounded"
          >
            Export PDF
          </button>
        </section>
      )}
    </div>
  );
}
