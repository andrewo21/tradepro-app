"use client";

import { useEffect, useRef, useCallback } from "react";
import { getSupabase } from "@/lib/supabase";

/**
 * Call this hook in any page/layout that should autosave resume data.
 * Pass the full store state snapshot and a resumeId ref (starts as null, gets filled on first save).
 */
export function useAutosave(
  data: any,
  options: { locale?: string; title?: string; enabled?: boolean } = {}
) {
  const { locale = "en", title, enabled = true } = options;
  const resumeIdRef = useRef<string | null>(null);
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedRef = useRef<string>("");

  const save = useCallback(async () => {
    if (!enabled) return;
    const sb = getSupabase();
    if (!sb) return; // Supabase not configured yet

    const { data: { session } } = await sb.auth.getSession();
    if (!session) return; // Not logged in — skip silently

    const snapshot = JSON.stringify(data);
    if (snapshot === lastSavedRef.current) return; // Nothing changed
    lastSavedRef.current = snapshot;

    // Derive a title from personalInfo if not provided
    const autoTitle = title || (
      data?.personalInfo
        ? `${data.personalInfo.firstName || ""} ${data.personalInfo.lastName || ""}`.trim() || "My Resume"
        : "My Resume"
    );

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
          locale,
        }),
      });
      const json = await res.json();
      if (json.resumeId) resumeIdRef.current = json.resumeId;
    } catch {
      // Autosave failures are silent — don't interrupt the user
    }
  }, [data, locale, title, enabled]);

  // Debounced autosave: fires 2s after last change
  useEffect(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(save, 2000);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [save]);

  // Flush on unmount (step navigation)
  useEffect(() => {
    return () => {
      save();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { manualSave: save };
}
