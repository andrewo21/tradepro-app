"use client";

import { useState, useEffect, type ReactNode } from "react";
import BrBuilderSaveBar from "@/components/BrBuilderSaveBar";
import BrResumeAssistant from "@/components/assistant/BrResumeAssistant";

/**
 * Client-only shell for the Brazil builder.
 * Wraps BrBuilderSaveBar + page children + BrResumeAssistant.
 * Returns a bare div on server/first-render so nothing that touches
 * useBrResumeStore ever runs before client hydration is complete.
 */
export default function BrBuilderShell({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="min-h-screen bg-neutral-50">
      {mounted && <BrBuilderSaveBar />}
      {children}
      {mounted && <BrResumeAssistant />}
    </div>
  );
}
