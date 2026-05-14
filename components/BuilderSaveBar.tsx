"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useResumeStore } from "@/app/store/useResumeStore";
import { getSupabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function BuilderSaveBar() {
  const store = useResumeStore();
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [editing, setEditing] = useState(false);
  const [resumeName, setResumeName] = useState("My Resume");
  const resumeIdRef = useRef<string | null>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Sync default name from personal info when it changes
  useEffect(() => {
    const p = store.personalInfo || {};
    const auto = [p.firstName, p.lastName].filter(Boolean).join(" ");
    if (auto && resumeName === "My Resume") setResumeName(auto);
  }, [store.personalInfo?.firstName, store.personalInfo?.lastName]);

  useEffect(() => {
    if (editing) nameInputRef.current?.focus();
  }, [editing]);

  const handleSave = useCallback(async (): Promise<boolean> => {
    const sb = getSupabase();
    if (!sb) { setStatus("error"); return false; }
    const { data: { session } } = await sb.auth.getSession();
    if (!session) { router.push("/login"); return false; }

    setStatus("saving");
    const data = {
      personalInfo:  store.personalInfo,
      summary:       store.summary,
      skills:        store.skills,
      experience:    store.experience,
      education:     store.education,
      certifications: store.certifications,
      selectedTemplate: store.selectedTemplate,
    };

    try {
      const res = await fetch("/api/resume/save", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ resumeId: resumeIdRef.current, title: resumeName || "My Resume", data, locale: "en" }),
      });
      const json = await res.json();
      if (json.resumeId) {
        resumeIdRef.current = json.resumeId;
        setStatus("saved");
        setTimeout(() => setStatus("idle"), 3000);
        return true;
      }
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
      return false;
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
      return false;
    }
  }, [store, resumeName, router]);

  async function handleSaveAndExit() {
    await handleSave();
    const sb = getSupabase();
    if (sb) await sb.auth.signOut();
    router.push("/");
  }

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-neutral-200 text-sm">
      <Link href="/minhas-versoes" className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1.5 flex-shrink-0">
        <span>←</span> My Resumes
      </Link>

      {/* Editable resume name */}
      <div className="flex-1 mx-4">
        {editing ? (
          <input
            ref={nameInputRef}
            type="text"
            value={resumeName}
            onChange={e => setResumeName(e.target.value)}
            onBlur={() => setEditing(false)}
            onKeyDown={e => { if (e.key === "Enter" || e.key === "Escape") setEditing(false); }}
            className="w-full max-w-xs border border-blue-400 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Resume name..."
          />
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-1.5 text-neutral-600 hover:text-neutral-900 transition group max-w-xs truncate"
            title="Click to rename"
          >
            <span className="truncate font-medium">{resumeName}</span>
            <span className="text-neutral-400 group-hover:text-blue-500 flex-shrink-0">✏️</span>
          </button>
        )}
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        {status === "saved" && <span className="text-green-600 font-medium">✓ Saved</span>}
        {status === "error" && <span className="text-red-500 text-xs">Sign in to save</span>}
        {status === "saving" && <span className="text-neutral-400 text-xs animate-pulse">Saving…</span>}
        <button onClick={handleSave} disabled={status === "saving"}
          className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-60">
          {status === "saving" ? "Saving…" : "Save"}
        </button>
        <button onClick={handleSaveAndExit} disabled={status === "saving"}
          className="px-4 py-1.5 bg-neutral-700 text-white rounded-lg text-sm font-medium hover:bg-neutral-900 transition disabled:opacity-60">
          Save &amp; Exit
        </button>
      </div>
    </div>
  );
}
