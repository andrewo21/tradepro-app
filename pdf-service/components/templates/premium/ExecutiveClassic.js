const React = require("react");

// Stub for Watermark (PDF service cannot import Next.js components)
const Watermark = ({ show }) =>
  show
    ? React.createElement(
        "div",
        {
          style: {
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%) rotate(-30deg)",
            opacity: 0.08,
            fontSize: "80px",
            fontWeight: "bold",
            color: "#000",
            pointerEvents: "none",
            whiteSpace: "nowrap",
          },
        },
        "PREVIEW"
      )
    : null;

// ------------------------------
// Section Header
// ------------------------------
const SectionHeader = ({ title }) =>
  React.createElement(
    "div",
    { className: "flex items-center gap-2" },
    React.createElement(
      "h2",
      {
        className:
          "text-[11px] font-semibold tracking-[0.16em] uppercase text-[#003A70]",
      },
      title
    ),
    React.createElement("div", { className: "flex-1 h-px bg-gray-300" })
  );

// ------------------------------
// Experience Block
// ------------------------------
const ExperienceBlock = ({ job }) => {
  const location =
    job.city && job.state
      ? `${job.city}, ${job.state}`
      : job.city || job.state || "";

  const dates =
    job.startDate && job.endDate
      ? `${job.startDate} – ${job.endDate}`
      : job.startDate || job.endDate || "";

  const bullets = [
    ...(job.responsibilities || []),
    ...(job.achievements || []),
  ].filter(Boolean);

  return React.createElement(
    "div",
    null,

    // Header row
    React.createElement(
      "div",
      { className: "flex justify-between items-baseline gap-2" },
      React.createElement(
        "div",
        null,
        React.createElement(
          "div",
          { className: "font-semibold text-[11px]" },
          job.jobTitle || "Project Manager"
        ),
        React.createElement(
          "div",
          { className: "text-[10px] text-gray-700" },
          job.company,
          location ? ` | ${location}` : ""
        )
      ),
      dates &&
        React.createElement(
          "div",
          { className: "text-[10px] text-gray-700 whitespace-nowrap" },
          dates
        )
    ),

    // Bullets
    bullets.length > 0 &&
      React.createElement(
        "ul",
        { className: "mt-1.5 space-y-0.5" },
        bullets.map((line, idx) =>
          React.createElement(
            "li",
            { key: idx, className: "flex items-start gap-1" },
            React.createElement("span", {
              className: "mt-[5px] h-[3px] w-[3px] rounded-full bg-[#F28C28]",
            }),
            React.createElement("span", null, line)
          )
        )
      )
  );
};

// ------------------------------
// Education Block
// ------------------------------
const EducationBlock = ({ edu }) => {
  const location =
    edu.city && edu.state
      ? `${edu.city}, ${edu.state}`
      : edu.city || edu.state || "";

  const lineParts = [edu.degree, edu.school, location, edu.year].filter(
    Boolean
  );

  return React.createElement(
    "div",
    { className: "text-[11px]" },
    lineParts.join(" | ")
  );
};

// ------------------------------
// MAIN TEMPLATE
// ------------------------------
module.exports = function ExecutiveClassic({
  data,
  premiumUnlocked,
  showWatermark,
}) {
  const {
    name = "First Last",
    title = "Sr. Leader, Project Director",
    contact = {},
    summary = "",
    skills = [],
    experience = [],
    education = [],
    certifications = [],
  } = data ?? {};

  const location = contact.location || "";
  const email = contact.email || "";
  const phone = contact.phone || "";
  const linkedin = contact.linkedin || "";

  const hasContactRight = location || email || phone || linkedin;

  return React.createElement(
    "div",
    {
      className:
        "relative w-full bg-white text-gray-800 text-[11px] leading-snug",
    },

    // Watermark
    React.createElement(Watermark, { show: showWatermark }),

    // TOP BAR
    React.createElement(
      "div",
      { className: "w-full bg-[#003A70] text-white" },
      React.createElement(
        "div",
        {
          className:
            "max-w-3xl mx-auto px-6 py-3 flex items-center justify-between gap-4",
        },
        React.createElement(
          "div",
          { className: "font-semibold text-[20px] tracking-wide" },
          name
        ),
        hasContactRight &&
          React.createElement(
            "div",
            { className: "text-[10px] text-right space-y-0.5" },
            location && React.createElement("div", null, location),
            email && React.createElement("div", null, email),
            phone && React.createElement("div", null, phone),
            linkedin &&
              React.createElement("div", { className: "break-all" }, linkedin)
          )
      )
    ),

    // TITLE ROW
    React.createElement(
      "div",
      {
        className:
          "max-w-3xl mx-auto px-6 pt-3 pb-4 border-b border-[#F28C28] text-center",
      },
      React.createElement(
        "div",
        {
          className:
            "text-[12px] font-semibold text-[#0A1F44] tracking-[0.08em] uppercase",
        },
        title
      )
    ),

    // BODY
    React.createElement(
      "div",
      { className: "max-w-3xl mx-auto px-6 py-4 space-y-6" },

      // SUMMARY
      summary &&
        React.createElement(
          "section",
          null,
          React.createElement(SectionHeader, {
            title: "Professional Summary",
          }),
          React.createElement("p", { className: "text-[11px] mt-1" }, summary)
        ),

      // SKILLS
      skills.length > 0 &&
        React.createElement(
          "section",
          null,
          React.createElement(SectionHeader, { title: "Core Competencies" }),
          React.createElement(
            "div",
            { className: "grid grid-cols-2 gap-x-6 gap-y-1 mt-1" },
            skills.map((skill, idx) =>
              React.createElement(
                "div",
                { key: idx, className: "flex items-start gap-1" },
                React.createElement("span", {
                  className:
                    "mt-[5px] h-[3px] w-[3px] rounded-full bg-[#F28C28]",
                }),
                React.createElement("span", null, skill)
              )
            )
          )
        ),

      // EXPERIENCE
      experience.length > 0 &&
        React.createElement(
          "section",
          null,
          React.createElement(SectionHeader, {
            title: "Professional Experience",
          }),
          React.createElement(
            "div",
            { className: "mt-2 space-y-3" },
            experience.map((job, idx) =>
              React.createElement(ExperienceBlock, { key: idx, job })
            )
          )
        ),

      // EDUCATION
      education.length > 0 &&
        React.createElement(
          "section",
          null,
          React.createElement(SectionHeader, { title: "Education" }),
          React.createElement(
            "div",
            { className: "mt-2 space-y-1.5" },
            education.map((edu, idx) =>
              React.createElement(EducationBlock, { key: idx, edu })
            )
          )
        ),

      // CERTIFICATIONS
      certifications.length > 0 &&
        React.createElement(
          "section",
          null,
          React.createElement(SectionHeader, { title: "Certifications" }),
          React.createElement(
            "ul",
            { className: "mt-1 space-y-0.5" },
            certifications.map((cert, idx) =>
              React.createElement(
                "li",
                { key: idx, className: "flex items-start gap-1" },
                React.createElement("span", {
                  className:
                    "mt-[5px] h-[3px] w-[3px] rounded-full bg-[#F28C28]",
                }),
                React.createElement("span", null, cert)
              )
            )
          )
        )
    )
  );
};
