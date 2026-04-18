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

module.exports = function ModernBlue({
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
    skills = [],
    experience = [],
    education = [],
    certifications = [],
  } = data ?? {};

  const fullName = name || "";
  const jobTitle = title || "";
  const phone = contact.phone || "";
  const email = contact.email || "";
  const location = contact.location || "";

  return React.createElement(
    "div",
    {
      className: `relative font-sans ${
        mode === "pdf" ? "text-[12px]" : "text-[14px]"
      } text-neutral-900`,
    },

    // Watermark
    React.createElement(Watermark, { show: showWatermark }),

    // HEADER
    React.createElement(
      "div",
      { className: "bg-blue-700 text-white p-6 rounded-t-lg" },
      React.createElement(
        "h1",
        { className: "text-3xl font-bold" },
        fullName
      ),
      React.createElement(
        "p",
        { className: "text-lg opacity-90" },
        jobTitle
      ),
      React.createElement(
        "div",
        { className: "mt-3 text-sm opacity-90" },
        phone && React.createElement("p", null, phone),
        email && React.createElement("p", null, email),
        location && React.createElement("p", null, location)
      )
    ),

    // BODY
    React.createElement(
      "div",
      { className: "p-6 bg-white border border-neutral-300 rounded-b-lg" },

      // SUMMARY
      summary &&
        React.createElement(
          "section",
          { className: "mb-6" },
          React.createElement(
            "h2",
            { className: "text-blue-700 font-semibold text-lg mb-2" },
            "Summary"
          ),
          React.createElement("p", { className: "leading-relaxed" }, summary)
        ),

      // SKILLS
      skills.length > 0 &&
        React.createElement(
          "section",
          { className: "mb-6" },
          React.createElement(
            "h2",
            { className: "text-blue-700 font-semibold text-lg mb-2" },
            "Skills"
          ),
          React.createElement(
            "ul",
            { className: "list-disc ml-5 space-y-1" },
            skills.map((skill, idx) =>
              React.createElement("li", { key: idx }, skill)
            )
          )
        ),

      // EXPERIENCE
      experience.length > 0 &&
        React.createElement(
          "section",
          { className: "mb-6" },
          React.createElement(
            "h2",
            { className: "text-blue-700 font-semibold text-lg mb-2" },
            "Experience"
          ),
          React.createElement(
            "div",
            { className: "space-y-4" },
            experience.map((job, idx) =>
              React.createElement(
                "div",
                { key: idx },
                React.createElement(
                  "p",
                  { className: "font-semibold" },
                  `${job.jobTitle} — ${job.company}`
                ),
                React.createElement(
                  "p",
                  { className: "text-sm text-neutral-600 mb-2" },
                  `${job.startDate} – ${job.endDate}`
                ),

                job.responsibilities?.length > 0 &&
                  React.createElement(
                    "ul",
                    { className: "list-disc ml-5 space-y-1" },
                    job.responsibilities.map((r, i) =>
                      React.createElement("li", { key: i }, r)
                    )
                  ),

                job.achievements?.length > 0 &&
                  React.createElement(
                    "ul",
                    { className: "list-disc ml-5 space-y-1 mt-2" },
                    job.achievements.map((a, i) =>
                      React.createElement("li", { key: i }, a)
                    )
                  )
              )
            )
          )
        ),

      // EDUCATION
      education.length > 0 &&
        React.createElement(
          "section",
          { className: "mb-6" },
          React.createElement(
            "h2",
            { className: "text-blue-700 font-semibold text-lg mb-2" },
            "Education"
          ),
          React.createElement(
            "div",
            { className: "space-y-3" },
            education.map((edu, idx) =>
              React.createElement(
                "div",
                { key: idx },
                React.createElement(
                  "p",
                  { className: "font-semibold" },
                  edu.school
                ),
                React.createElement(
                  "p",
                  { className: "text-sm text-neutral-700" },
                  edu.degree
                ),
                React.createElement(
                  "p",
                  { className: "text-sm text-neutral-600" },
                  edu.year
                )
              )
            )
          )
        ),

      // CERTIFICATIONS
      certifications.length > 0 &&
        React.createElement(
          "section",
          null,
          React.createElement(
            "h2",
            { className: "text-blue-700 font-semibold text-lg mb-2" },
            "Certifications"
          ),
          React.createElement(
            "ul",
            { className: "list-disc ml-5 space-y-1" },
            certifications.map((cert, idx) =>
              React.createElement("li", { key: idx }, cert)
            )
          )
        )
    )
  );
};
