"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useResumeStore } from "@/app/store/useResumeStore";

export default function ResumeUpload() {
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const store = useResumeStore();

  async function handleFile(file: File) {
    if (!file || file.type !== "application/pdf") {
      setError("Please upload a PDF file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("File too large. Max 10MB.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/ai/parse-resume", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();

      if (!res.ok || !json.data) {
        setError(json.detail || json.error || "Could not read your resume. Try a different file.");
        return;
      }

      const d = json.data;

      // Pre-fill the resume store
      if (d.personalInfo) {
        const p = d.personalInfo;
        store.updatePersonalInfo("firstName", p.firstName || "");
        store.updatePersonalInfo("lastName", p.lastName || "");
        store.updatePersonalInfo("tradeTitle", p.tradeTitle || "");
        store.updatePersonalInfo("phone", p.phone || "");
        store.updatePersonalInfo("email", p.email || "");
        store.updatePersonalInfo("city", p.city || "");
        store.updatePersonalInfo("state", p.state || "");
      }

      if (d.summary) store.updateSummary(d.summary);

      if (Array.isArray(d.skills) && d.skills.length > 0) {
        // Clear existing skills and add parsed ones
        store.setField("skills", d.skills.map((text: string) => ({
          text,
          suggestion: null,
          hasAcceptedSuggestion: false,
          loading: false,
        })));
      }

      if (Array.isArray(d.experience) && d.experience.length > 0) {
        store.setField("experience", d.experience.map((exp: any) => ({
          id: `${Date.now()}-${Math.random()}`,
          jobTitle: exp.jobTitle || "",
          company: exp.company || "",
          startDate: exp.startDate || "",
          endDate: exp.endDate || "",
          responsibilities: (exp.responsibilities || []).map((text: string) => ({
            id: `${Date.now()}-${Math.random()}`,
            text,
            suggestion: null,
            hasAcceptedSuggestion: false,
            loading: false,
            error: null,
            needsRewrite: false,
          })),
          achievements: (exp.achievements || []).map((text: string) => ({
            id: `${Date.now()}-${Math.random()}`,
            text,
            suggestion: null,
            hasAcceptedSuggestion: false,
            loading: false,
          })),
        })));
      }

      if (Array.isArray(d.education) && d.education.length > 0) {
        store.setField("education", d.education.map((edu: any) => ({
          school: edu.school || "",
          degree: edu.degree || "",
          year: edu.year || "",
          gpa: edu.gpa || "",
        })));
      }

      setSuccess(true);

      // Brief pause so user sees the success state, then redirect to builder
      setTimeout(() => router.push("/resume/personal"), 1500);
    } catch (err: any) {
      setError(err?.message || "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  if (success) {
    return (
      <div className="border-2 border-green-400 bg-green-50 rounded-xl p-6 text-center">
        <div className="text-3xl mb-2">✓</div>
        <p className="font-semibold text-green-800">Resume uploaded and parsed!</p>
        <p className="text-green-700 text-sm mt-1">Taking you to the builder — review and edit your details.</p>
      </div>
    );
  }

  return (
    <div>
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition ${
          dragging
            ? "border-blue-500 bg-blue-50"
            : "border-neutral-300 bg-neutral-50 hover:border-blue-400 hover:bg-blue-50"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />

        {loading ? (
          <div className="space-y-3">
            <div className="flex justify-center">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="text-blue-700 font-medium text-sm">Reading your resume...</p>
            <p className="text-neutral-500 text-xs">AI is extracting your information — this takes about 10 seconds.</p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-4xl">📄</div>
            <p className="font-semibold text-neutral-800">Drop your resume here or click to upload</p>
            <p className="text-sm text-neutral-500">PDF only · Max 10MB</p>
            <p className="text-xs text-neutral-400">AI will extract your info and pre-fill the builder</p>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-3 text-red-600 text-sm text-center bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
    </div>
  );
}
