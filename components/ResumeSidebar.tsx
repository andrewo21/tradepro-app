// components/ResumeSidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const steps = [
  { label: "Template", path: "/resume" },
  { label: "Summary", path: "/resume/summary" },
  { label: "Experience", path: "/resume/experience" },
  { label: "Skills", path: "/resume/skills" },
  { label: "Education", path: "/resume/education" },
  { label: "Preview", path: "/resume/preview" },
];

export default function ResumeSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 border-r border-slate-200 bg-white">
      <nav className="flex flex-col">
        {steps.map((step) => {
          const isActive = pathname === step.path;

          const baseClasses =
            "px-4 py-3 text-base transition-colors border-l-4";
          const activeClasses =
            "border-slate-600 font-medium text-slate-900 bg-slate-50";
          const inactiveClasses =
            "border-transparent text-slate-700 hover:text-slate-600";

          const className = `${baseClasses} ${
            isActive ? activeClasses : inactiveClasses
          }`;

          return (
            <Link key={step.path} href={step.path} className={className}>
              {step.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
