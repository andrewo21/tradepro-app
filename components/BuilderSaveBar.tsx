"use client";

import { useState, useCallback, useRef } from "react";
import { useResumeStore } from "@/app/store/useResumeStore";
import { getSupabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function BuilderSaveBar() {
  const store = useResumeStore();
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const resumeIdRef = useRef<string | null>(null);

  const handleSave = useCallback(async () => {
    const sb = getSupabase();
    if (!sb) {
      setStatus("error");
      return;
    }
    const { data: { session } } = await sb.auth.getSession();
    if (!session) {
      // Not logged in — prompt them
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
      return;
    }

    setStatus("saving");

    const personalInfo = store.personalInfo || {};
    const autoTitle = [personalInfo.firstName, personalInfo.lastName].filter(Boolean).join(" ") || "My Resume";

    // Capture full store state (exclude functions)
    const data = {
      personalInfo: store.personalInfo,
      summary: store.summary,
      skills: store.skills,
      experience: store.experience,
      education: store.education,
      certifications: store.certifications,
      selectedTemplate: store.selectedTemplate,
    };

    try {
      const res = await fetch("/api/resume/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          resumeId: resumeIdRef.current,
          title: autoTitle,
          data,
          locale: "en",
        }),
      });
      const json = await res.json();
      if (json.resumeId) {
        resumeIdRef.current = json.resumeId;
        setStatus("saved");
        setTimeout(() => setStatus("idle"), 3000);
        return true;
      } else {
        setStatus("error");
        setTimeout(() => setStatus("idle"), 3000);
        return false;
      }
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
      return false;
    }
  }, [store]);

  async function handleSaveAndExit() {
    const success = await handleSave();
    const sb = getSupabase();
    if (sb) await sb.auth.signOut();
    router.push("/");
  }

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-neutral-200 text-sm">
      <Link href="/minhas-versoes" className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1.5">
        <span>←</span> My Resumes
      </Link>

      <div className="flex items-center gap-3">
        {status === "saved" && (
          <span className="text-green-600 font-medium flex items-center gap-1">
            <span>✓</span> Saved
          </span>
        )}
        {status === "error" && (
          <span className="text-red-500 text-xs">
            Sign in to save
          </span>
        )}
        {status === "saving" && (
          <span className="text-neutral-400 text-xs animate-pulse">Saving…</span>
        )}
        <button
          onClick={handleSave}
          disabled={status === "saving"}
          className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-60"
        >
          {status === "saving" ? "Saving…" : "Save"}
        </button>
        <button
          onClick={handleSaveAndExit}
          disabled={status === "saving"}
          className="px-4 py-1.5 bg-neutral-700 text-white rounded-lg text-sm font-medium hover:bg-neutral-900 transition disabled:opacity-60"
        >
          Save &amp; Exit
        </button>
      </div>
    </div>
  );
}
