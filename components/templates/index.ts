// STANDARD TEMPLATES
import BasicTwoColumn from "../../pdf-service/components/templates/Standard/BasicTwoColumn";
import ModernBlue from "../../pdf-service/components/templates/Standard/ModernBlue";
import SidebarGreen from "../../pdf-service/components/templates/Standard/SidebarGreen";
import StandardContemporary from "../../pdf-service/components/templates/Standard/StandardContemporary";
import StandardClassic from "../../pdf-service/components/templates/Standard/StandardClassic"; // ⭐ NEW

// PREMIUM TEMPLATES
import ExecutiveClassic from "../../pdf-service/components/templates/premium/ExecutiveClassic";
import ExecutiveLuxe from "../../pdf-service/components/templates/premium/ExecutiveLuxe";
import ModernElite from "../../pdf-service/components/templates/premium/ModernElite";
import ModernProfessional from "../../pdf-service/components/templates/premium/ModernProfessional";

/**
 * TEMPLATE REGISTRY
 * Single source of truth for:
 * - Template selection
 * - Preview rendering
 * - PDF rendering
 * - Premium gating
 */

export const templates = {
  // STANDARD
  "basic-two-column": {
    name: "Basic Two Column",
    component: BasicTwoColumn,
    premium: false,
  },
  "modern-blue": {
    name: "Modern Blue",
    component: ModernBlue,
    premium: false,
  },
  "sidebar-green": {
    name: "Sidebar Green",
    component: SidebarGreen,
    premium: false,
  },
  "standard-contemporary": {
    name: "Standard Contemporary",
    component: StandardContemporary,
    premium: false,
  },
  "standard-classic": {
    name: "Standard Classic",
    component: StandardClassic,
    premium: false,
  }, // ⭐ NEW

  // PREMIUM
  "executive-classic": {
    name: "Executive Classic",
    component: ExecutiveClassic,
    premium: true,
  },
  "executive-luxe": {
    name: "Executive Luxe",
    component: ExecutiveLuxe,
    premium: true,
  },
  "modern-elite": {
    name: "Modern Elite",
    component: ModernElite,
    premium: true,
  },
  "modern-professional": {
    name: "Modern Professional",
    component: ModernProfessional,
    premium: true,
  },
};

export type TemplateKey = keyof typeof templates;

/**
 * OPTIONAL: Template metadata (layout, accent, etc.)
 * Useful for UI, filtering, future features.
 */

export const templateMeta: Record<
  TemplateKey,
  {
    name: string;
    layout: "single-column" | "two-column" | "sidebar";
    accent: string;
    premium: boolean;
  }
> = {
  // STANDARD
  "basic-two-column": {
    name: "Basic Two Column",
    layout: "two-column",
    accent: "neutral",
    premium: false,
  },
  "modern-blue": {
    name: "Modern Blue",
    layout: "single-column",
    accent: "blue",
    premium: false,
  },
  "sidebar-green": {
    name: "Sidebar Green",
    layout: "sidebar",
    accent: "green",
    premium: false,
  },
  "standard-contemporary": {
    name: "Standard Contemporary",
    layout: "single-column",
    accent: "neutral",
    premium: false,
  },
  "standard-classic": {
    name: "Standard Classic",
    layout: "single-column",
    accent: "neutral",
    premium: false,
  }, // ⭐ NEW

  // PREMIUM
  "executive-classic": {
    name: "Executive Classic",
    layout: "single-column",
    accent: "navy",
    premium: true,
  },
  "executive-luxe": {
    name: "Executive Luxe",
    layout: "sidebar",
    accent: "gold",
    premium: true,
  },
  "modern-elite": {
    name: "Modern Elite",
    layout: "single-column",
    accent: "dark",
    premium: true,
  },
  "modern-professional": {
    name: "Modern Professional",
    layout: "single-column",
    accent: "gray",
    premium: true,
  },
};
