const React = require("react");

// PDF service cannot import from "@/components/..."
// so we use a simple stub to avoid errors
const Watermark = ({ show }) => null;

module.exports = function ModernElite({
  data,
  mode,
  premiumUnlocked,
  showWatermark
}) {
  return React.createElement(
    "div",
    {
      style: {
        fontFamily: "Arial, sans-serif",
        padding: "40px",
        width: "100%",
        boxSizing: "border-box",
        backgroundColor: "#ffffff",
        color: "#111"
      }
    },

    // HEADER (dark modern bar)
    React.createElement(
      "div",
      {
        style: {
          backgroundColor: "#1f2937",
          color: "#ffffff",
          padding: "28px",
          borderRadius: "6px",
          marginBottom: "32px"
        }
      },
      React.createElement(
        "h1",
        {
          style: {
            margin: 0,
            fontSize: "34px",
            fontWeight: "bold",
            letterSpacing: "0.5px"
          }
        },
        data?.name || "Untitled"
      ),
      React.createElement(
        "p",
        {
          style: {
            margin: "6px 0 0 0",
            fontSize: "16px",
            color: "#d1d5db"
          }
        },
        data?.title || ""
      )
    ),

    // CONTACT INFO
    React.createElement(
      "div",
      {
        style: {
          marginBottom: "32px",
          fontSize: "14px",
          color: "#333",
          lineHeight: "1.5"
        }
      },
      React.createElement("p", { style: { margin: "2px 0" } }, data?.email || ""),
      React.createElement("p", { style: { margin: "2px 0" } }, data?.phone || ""),
      React.createElement("p", { style: { margin: "2px 0" } }, data?.location || "")
    ),

    // SUMMARY
    React.createElement(
      "div",
      { style: { marginBottom: "32px" } },
      React.createElement(
        "h2",
        {
          style: {
            fontSize: "20px",
            marginBottom: "10px",
            color: "#1f2937",
            borderBottom: "2px solid #1f2937",
            paddingBottom: "6px"
          }
        },
        "Professional Summary"
      ),
      React.createElement(
        "p",
        {
          style: {
            fontSize: "14px",
            lineHeight: "1.7",
            color: "#444"
          }
        },
        data?.summary || ""
      )
    ),

    // SKILLS (modern pill-style)
    React.createElement(
      "div",
      { style: { marginBottom: "32px" } },
      React.createElement(
        "h2",
        {
          style: {
            fontSize: "20px",
            marginBottom: "10px",
            color: "#1f2937",
            borderBottom: "2px solid #1f2937",
            paddingBottom: "6px"
          }
        },
        "Skills"
      ),
      React.createElement(
        "div",
        { style: { display: "flex", flexWrap: "wrap", gap: "8px" } },
        (data?.skills || []).map((skill, i) =>
          React.createElement(
            "span",
            {
              key: i,
              style: {
                padding: "6px 12px",
                backgroundColor: "#e5e7eb",
                borderRadius: "20px",
                fontSize: "13px",
                color: "#111"
              }
            },
            skill
          )
        )
      )
    ),

    // EXPERIENCE
    React.createElement(
      "div",
      { style: { marginBottom: "32px" } },
      React.createElement(
        "h2",
        {
          style: {
            fontSize: "20px",
            marginBottom: "10px",
            color: "#1f2937",
            borderBottom: "2px solid #1f2937",
            paddingBottom: "6px"
          }
        },
        "Experience"
      ),

      (data?.experience || []).map((exp, i) =>
        React.createElement(
          "div",
          { key: i, style: { marginBottom: "20px" } },

          React.createElement(
            "p",
            {
              style: {
                margin: 0,
                fontSize: "16px",
                fontWeight: "bold",
                color: "#111"
              }
            },
            exp.title || ""
          ),

          React.createElement(
            "p",
            {
              style: {
                margin: "4px 0 0 0",
                fontSize: "14px",
                color: "#444",
                lineHeight: "1.6"
              }
            },
            exp.details || ""
          )
        )
      )
    ),

    // EDUCATION
    React.createElement(
      "div",
      null,
      React.createElement(
        "h2",
        {
          style: {
            fontSize: "20px",
            marginBottom: "10px",
            color: "#1f2937",
            borderBottom: "2px solid #1f2937",
            paddingBottom: "6px"
          }
        },
        "Education"
      ),

      (data?.education || []).map((edu, i) =>
        React.createElement(
          "div",
          { key: i, style: { marginBottom: "20px" } },

          React.createElement(
            "p",
            {
              style: {
                margin: 0,
                fontSize: "16px",
                fontWeight: "bold",
                color: "#111"
              }
            },
            edu.institution || ""
          ),

          React.createElement(
            "p",
            {
              style: {
                margin: "4px 0 0 0",
                fontSize: "14px",
                color: "#444",
                lineHeight: "1.6"
              }
            },
            edu.details || ""
          )
        )
      )
    ),

    // WATERMARK (PDF ONLY)
    mode === "pdf" && !premiumUnlocked
      ? React.createElement(Watermark, { show: showWatermark })
      : null
  );
};
