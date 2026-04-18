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
// Sidebar Header Component
// ------------------------------
const SidebarHeader = ({ title }) =>
  React.createElement(
    "h2",
    {
      className:
        "text-[11px] font-semibold uppercase tracking-wide text-gray-800 border-b border-gray-400 pb-1",
    },
    title
  );

// ------------------------------
// Main Header Component
// ------------------------------
const MainHeader = ({ title }) =>
  React.createElement(
    "h2",
    {
      className:
        "text-[12px] font-semibold uppercase tracking-wide text-gray-800 border-b border-gray-300 pb-1",
    },
    title
  );

// ------------------------------
// Experience Block Component
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
      { className: "flex justify-between items-baseline" },
      React.createElement(
        "div",
        null,
        React.createElement(
          "div",
          { className: "font-semibold text-[11px]" },
          job.jobTitle
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
              className: "mt-[5px] h-[3px] w-[3px] rounded-full bg-gray-800",
            }),
            React.createElement("span", null, line)
          )
        )
      )
  );
};

// ------------------------------
// Education Block Component
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
module.exports = function SidebarGreen({
  data,
  premiumUnlocked,
  showWatermark,
}) {
  const {
    name = "First Last",
    title = "Professional Title",
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

  return React.createElement(
    "div",
    {
      className:
        "relative w-full bg-white text-gray-900 text-[11px] leading-snug flex",
    },

    // Watermark
    React.createElement(Watermark, { show: showWatermark }),

    // SIDEBAR
    React.createElement(
      "aside",
      {
        className: "w-[32%] min-h-full p-5 text-gray-900",
        style: { backgroundColor: "#E6F4EA" },
      },

      React.createElement(
        "h1",
        { className: "text-[18px] font-semibold leading-tight" },
        name
      ),
      React.createElement(
        "p",
        { className: "text-[11px] text-gray-700 mt-1" },
        title
      ),

      // Contact
      React.createElement(
        "div",
        { className: "mt-4 space-y-1 text-[10px] text-gray-700" },
        location && React.createElement("div", null, location),
        email && React.createElement("div", null, email),
        phone && React.createElement("div", null, phone),
        linkedin &&
          React.createElement("div", { className: "break-all" }, linkedin)
      ),

      // Skills
      skills.length > 0 &&
        React.createElement(
          "div",
          { className: "mt-6" },
          React.createElement(SidebarHeader, { title: "Skills" }),
          React.createElement(
            "ul",
            { className: "mt-2 space-y-1" },
            skills.map((skill, idx) =>
              React.createElement(
                "li",
                { key: idx, className: "flex items-start gap-1" },
                React.createElement("span", {
                  className: "mt-[5px] h-[3px] w-[3px] rounded-full bg-gray-800",
                }),
                React.createElement("span", null, skill)
              )
            )
          )
        ),

      // Certifications
      certifications.length > 0 &&
        React.createElement(
          "div",
          { className: "mt-6" },
          React.createElement(SidebarHeader, { title: "Certifications" }),
          React.createElement(
            "ul",
            { className: "mt-2 space-y-1" },
            certifications.map((cert, idx) =>
              React.createElement(
                "li",
                { key: idx, className: "flex items-start gap-1" },
                React.createElement("span", {
                  className: "mt-[5px] h-[3px] w-[3px] rounded-full bg-gray-800",
                }),
                React.createElement("span", null, cert)
              )
            )
          )
        )
    ),

    // MAIN CONTENT
    React.createElement(
      "main",
      { className: "w-[68%] p-6 space-y-6" },

      // Summary
      summary &&
        React.createElement(
          "section",
          null,
          React.createElement(MainHeader, { title: "Professional Summary" }),
          React.createElement("p", { className: "mt-1 text-[11px]" }, summary)
        ),

      // Experience
      experience.length > 0 &&
        React.createElement(
          "section",
          null,
          React.createElement(MainHeader, { title: "Experience" }),
          React.createElement(
            "div",
            { className: "mt-2 space-y-4" },
            experience.map((job, idx) =>
              React.createElement(ExperienceBlock, { key: idx, job })
            )
          )
        ),

      // Education
      education.length > 0 &&
        React.createElement(
          "section",
          null,
          React.createElement(MainHeader, { title: "Education" }),
          React.createElement(
            "div",
            { className: "mt-2 space-y-1.5" },
            education.map((edu, idx) =>
              React.createElement(EducationBlock, { key: idx, edu })
            )
          )
        )
    )
  );
};
