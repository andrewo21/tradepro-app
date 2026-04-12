// NO "use client" — this must stay server-safe

// STANDARD TEMPLATES
import BasicTwoColumn from "./Standard/BasicTwoColumn";
import ModernBlue from "./Standard/ModernBlue";
import SidebarGreen from "./Standard/SidebarGreen";
import StandardContemporary from "./Standard/StandardContemporary";

// PREMIUM TEMPLATES
import ExecutiveClassic from "./premium/ExecutiveClassic";
import ExecutiveLuxe from "./premium/ExecutiveLuxe";
import ModernElite from "./premium/ModernElite";
import ModernProfessional from "./premium/ModernProfessional";

export const serverTemplates = {
  // STANDARD
  "basic-two-column": BasicTwoColumn,
  "modern-blue": ModernBlue,
  "sidebar-green": SidebarGreen,
  "standard-contemporary": StandardContemporary,

  // PREMIUM
  "executive-classic": ExecutiveClassic,
  "executive-luxe": ExecutiveLuxe,
  "modern-elite": ModernElite,
  "modern-professional": ModernProfessional,
} as const;

export type ServerTemplateKey = keyof typeof serverTemplates;
