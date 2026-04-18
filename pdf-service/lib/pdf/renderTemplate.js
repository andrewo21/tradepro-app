// lib/pdf/renderTemplate.js
const React = require("react");

// STANDARD
const BasicTwoColumn =
  require("../../components/templates/Standard/BasicTwoColumn").default;
const ModernBlue =
  require("../../components/templates/Standard/ModernBlue").default;
const SidebarGreen =
  require("../../components/templates/Standard/SidebarGreen").default;
const StandardContemporary =
  require("../../components/templates/Standard/StandardContemporary").default;
const StandardClassic =
  require("../../components/templates/Standard/StandardClassic").default;

// PREMIUM
const ExecutiveClassic =
  require("../../components/templates/premium/ExecutiveClassic").default;
const ExecutiveLuxe =
  require("../../components/templates/premium/ExecutiveLuxe").default;
const ModernElite =
  require("../../components/templates/premium/ModernElite").default;
const ModernProfessional =
  require("../../components/templates/premium/ModernProfessional").default;

const templateMap = {
  "basic-two-column": BasicTwoColumn,
  "modern-blue": ModernBlue,
  "sidebar-green": SidebarGreen,
  "standard-contemporary": StandardContemporary,
  "standard-classic": StandardClassic,
  "executive-classic": ExecutiveClassic,
  "executive-luxe": ExecutiveLuxe,
  "modern-elite": ModernElite,
  "modern-professional": ModernProfessional,
};

function buildTemplateTree({
  templateKey,
  data,
  premiumUnlocked,
  showWatermark,
}) {
  const Template = templateMap[templateKey];
  if (!Template) throw new Error(`Unknown template key: ${templateKey}`);

  return React.createElement(Template, {
    data,
    mode: "pdf",
    premiumUnlocked,
    showWatermark,
  });
}

module.exports = { buildTemplateTree };
