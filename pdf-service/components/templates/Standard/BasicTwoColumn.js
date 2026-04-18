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

module.exports = function BasicTwoColumn({
  data,
  mode,
  premiumUnlocked,
  showWatermark,
}) {
  const {
    name = "",
    title = "",
    contact = {},
    summary = "",
    experience = [],
    skills = [],
    education = [],
    certifications = [],
  } = data ?? {};

  return React.createElement(
    "div",
    {
      className:
        "relative w-[8.5in] min-h-[11in] bg-white text-gray-900 flex font-sans",
      style: {
        padding: mode === "pdf" ? "0" : undefined,
      },
    },

    // Watermark
    React.createElement(Watermark, { show: showWatermark }),

    // LEFT SIDEBAR
    React.createElement(
      "aside",
      {
        className: "w-[30%] p-6 border-r border-gray-300",
        style: { backgroundColor: "#f3f4f6" },
      },

      // Name
      React.createElement(
        "h1",
        { className: "text-2xl font-bold leading-tight" },
        name
      ),
      React.createElement(
        "p",
        { className: "text-sm text-gray-700 mt-1" },
        title
      ),

      // Contact
      React.createElement(
        "div",
        { className: "mt-6" },
        React.createElement(
          "h2",
          {
            className:
              "text-xs uppercase tracking-wide font-bold text-gray-700 mb-2",
          },
          "Contact"
        ),
        contact.phone &&
          React.createElement("p", { className: "text-sm" }, contact.phone),
        contact.email &&
          React.createElement("p", { className: "text-sm" }, contact.email),
        contact.location &&
          React.createElement("p", { className: "text-sm" }, contact.location)
      ),

      // Skills
      skills.length > 0 &&
        React.createElement(
          "div",
          { className: "mt-6" },
          React.createElement(
            "h2",
            {
              className:
                "text-xs uppercase tracking-wide font-bold text-gray-700 mb-2",
            },
            "Skills"
          ),
          React.createElement(
            "ul",
            { className: "text-sm space-y-1" },
            skills.map((skill, i) =>
              React.createElement("li", { key: i }, `• ${skill}`)
            )
          )
        ),

      // Certifications
      certifications.length > 0 &&
        React.createElement(
          "div",
          { className: "mt-6" },
          React.createElement(
            "h2",
            {
              className:
                "text-xs uppercase tracking-wide font-bold text-gray-700 mb-2",
            },
            "Certifications"
          ),
          React.createElement(
            "ul",
            { className: "text-sm space-y-1" },
            certifications.map((cert, i) =>
              React.createElement("li", { key: i }, `• ${cert}`)
            )
          )
        )
    ),

    // MAIN CONTENT
    React.createElement(
      "main",
      { className: "w-[70%] p-10" },

      // Summary
      summary &&
        React.createElement(
          "section",
          { className: "mb-8" },
          React.createElement(
            "h2",
            {
              className:
                "text-gray-800 font-bold uppercase tracking-wide text-sm mb-2",
            },
            "Professional Summary"
          ),
          React.createElement(
            "p",
            { className: "text-sm leading-relaxed" },
            summary
          )
        ),

      // Experience
      experience.length > 0 &&
        React.createElement(
          "section",
          { className: "mb-8" },
          React.createElement(
            "h2",
            {
              className:
                "text-gray-800 font-bold uppercase tracking-wide text-sm mb-4",
            },
            "Experience"
          ),

          experience.map((job, i) =>
            React.createElement(
              "div",
              { key: i, className: "mb-6" },

              React.createElement(
                "div",
                { className: "flex justify-between text-sm font-semibold" },
                React.createElement(
                  "span",
                  null,
                  `${job.jobTitle} — ${job.company}`
                ),
                React.createElement(
                  "span",
                  { className: "text-gray-600" },
                  `${job.startDate} – ${job.endDate}`
                )
              ),

              job.responsibilities.length > 0 &&
                React.createElement(
                  "ul",
                  {
                    className:
                      "list-disc ml-5 mt-2 text-sm text-gray-700 space-y-1",
                  },
                  job.responsibilities.map((r, j) =>
                    React.createElement("li", { key: j }, r)
                  )
                ),

              job.achievements.length > 0 &&
                React.createElement(
                  "div",
                  { className: "mt-3" },
                  React.createElement(
                    "h3",
                    {
                      className:
                        "text-gray-800 font-semibold text-xs tracking-wide uppercase mb-1",
                    },
                    "Key Achievements"
                  ),
                  React.createElement(
                    "ul",
                    {
                      className:
                        "list-disc ml-5 mt-1 text-sm text-gray-700 space-y-1",
                    },
                    job.achievements.map((a, j) =>
                      React.createElement("li", { key: j }, a)
                    )
                  )
                )
            )
          )
        ),

      // Education
      education.length > 0 &&
        React.createElement(
          "section",
          null,
          React.createElement(
            "h2",
            {
              className:
                "text-gray-800 font-bold uppercase tracking-wide text-sm mb-2",
            },
            "Education"
          ),
          education.map((edu, i) =>
            React.createElement(
              "p",
              { key: i, className: "text-sm mb-1" },
              `${edu.degree}, ${edu.school} (${edu.year})`
            )
          )
        )
    )
  );
};
