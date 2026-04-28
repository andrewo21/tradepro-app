// Top-level resume layout — no gate here.
// The paywall is in app/resume/(builder)/layout.tsx which only wraps
// the builder steps (personal, skills, experience, education, summary, preview).
// The template select page (app/resume/select) is intentionally public.
import { ReactNode } from "react";

export default function ResumeLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
