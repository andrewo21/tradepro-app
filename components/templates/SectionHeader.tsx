import React from "react";

export default function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xl font-semibold tracking-wide mb-2">
      {children}
    </h2>
  );
}
