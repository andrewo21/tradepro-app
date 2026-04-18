// NO "use client" — this must stay server-safe

// STANDARD TEMPLATES
import BasicTwoColumn from "../../pdf-service/components/templates/Standard/BasicTwoColumn";
import ModernBlue from "../../pdf-service/components/templates/Standard/ModernBlue";
import SidebarGreen from "../../pdf-service/components/templates/Standard/SidebarGreen";
import StandardContemporary from "../../pdf-service/components/templates/Standard/StandardContemporary";

// PREMIUM TEMPLATES
import ExecutiveClassic from "../../pdf-service/components/templates/premium/ExecutiveClassic";
import ExecutiveLuxe from "../../pdf-service/components/templates/premium/ExecutiveLuxe";
import ModernElite from "../../pdf-service/components/templates/premium/ModernElite";
import ModernProfessional from "../../pdf-service/components/templates/premium/ModernProfessional";

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
