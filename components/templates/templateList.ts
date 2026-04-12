"use client";

// FULL 9-TEMPLATE KEY UNION
export type TemplateKey =
  | "basic-two-column"
  | "modern-blue"
  | "sidebar-green"
  | "standard-contemporary"
  | "standard-classic" // ⭐ NEW
  | "executive-classic"
  | "executive-luxe"
  | "modern-elite"
  | "modern-professional";

// 🔥 Map keys → actual file paths
export const templatePaths: Record<TemplateKey, string> = {
  // STANDARD
  "basic-two-column": "Standard/BasicTwoColumn",
  "modern-blue": "Standard/ModernBlue",
  "sidebar-green": "Standard/SidebarGreen",
  "standard-contemporary": "Standard/StandardContemporary",
  "standard-classic": "Standard/StandardClassic", // ⭐ NEW

  // PREMIUM
  "executive-classic": "premium/ExecutiveClassic",
  "executive-luxe": "premium/ExecutiveLuxe",
  "modern-elite": "premium/ModernElite",
  "modern-professional": "premium/ModernProfessional",
};

// 🔥 Used by PreviewPane + PDF
export const templates = {
  // STANDARD
  "basic-two-column": require("./Standard/BasicTwoColumn").default,
  "modern-blue": require("./Standard/ModernBlue").default,
  "sidebar-green": require("./Standard/SidebarGreen").default,
  "standard-contemporary": require("./Standard/StandardContemporary").default,
  "standard-classic": require("./Standard/StandardClassic").default, // ⭐ NEW

  // PREMIUM
  "executive-classic": require("./premium/ExecutiveClassic").default,
  "executive-luxe": require("./premium/ExecutiveLuxe").default,
  "modern-elite": require("./premium/ModernElite").default,
  "modern-professional": require("./premium/ModernProfessional").default,
};

// 🔥 Used by SelectPage + TemplateSelector
export const templateList = [
  // STANDARD FIRST
  {
    key: "basic-two-column" as TemplateKey,
    name: "Basic Two Column",
    premium: false,
  },
  {
    key: "modern-blue" as TemplateKey,
    name: "Modern Blue",
    premium: false,
  },
  {
    key: "sidebar-green" as TemplateKey,
    name: "Sidebar Green",
    premium: false,
  },
  {
    key: "standard-contemporary" as TemplateKey,
    name: "Standard Contemporary",
    premium: false,
  },
  {
    key: "standard-classic" as TemplateKey, // ⭐ NEW
    name: "Standard Classic",
    premium: false,
  },

  // PREMIUM SECOND
  {
    key: "executive-classic" as TemplateKey,
    name: "Executive Classic",
    premium: true,
  },
  {
    key: "executive-luxe" as TemplateKey,
    name: "Executive Luxe",
    premium: true,
  },
  {
    key: "modern-elite" as TemplateKey,
    name: "Modern Elite",
    premium: true,
  },
  {
    key: "modern-professional" as TemplateKey,
    name: "Modern Professional",
    premium: true,
  },
];

// 🔥 Optional metadata
export const templateMeta = {
  // STANDARD
  "basic-two-column": {
    name: "Basic Two Column",
    premium: false,
  },
  "modern-blue": {
    name: "Modern Blue",
    premium: false,
  },
  "sidebar-green": {
    name: "Sidebar Green",
    premium: false,
  },
  "standard-contemporary": {
    name: "Standard Contemporary",
    premium: false,
  },
  "standard-classic": {
    name: "Standard Classic",
    premium: false,
  }, // ⭐ NEW

  // PREMIUM
  "executive-classic": {
    name: "Executive Classic",
    premium: true,
  },
  "executive-luxe": {
    name: "Executive Luxe",
    premium: true,
  },
  "modern-elite": {
    name: "Modern Elite",
    premium: true,
  },
  "modern-professional": {
    name: "Modern Professional",
    premium: true,
  },
};
