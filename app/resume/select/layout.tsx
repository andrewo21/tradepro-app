// This layout intentionally has NO gate — template selection is free to browse.
// The paywall kicks in at Step 2 (personal info) via the parent resume/layout.tsx
// which is overridden here by this more-specific layout.
export const dynamic = "force-dynamic";

import { ReactNode } from "react";

export default function SelectLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-50 px-2 py-4 sm:p-6">
      {children}
    </div>
  );
}
