"use client";

import { useEffect } from "react";
import { useResumeStore } from "@/app/store/useResumeStore";

/**
 * Syncs the Zustand showWatermark / premiumUnlocked flags with the server-side
 * entitlement state on every page load. Renders nothing visible.
 */
export default function WatermarkSync({
  hasResume,
  hasBundle,
}: {
  hasResume: boolean;
  hasBundle: boolean;
}) {
  const setField = useResumeStore((s: any) => s.setField);

  useEffect(() => {
    if (hasResume || hasBundle) {
      setField("showWatermark", false);
      setField("premiumUnlocked", hasBundle);
    }
  }, [hasResume, hasBundle, setField]);

  return null;
}
