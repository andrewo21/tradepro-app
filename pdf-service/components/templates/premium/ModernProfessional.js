const React = require("react");

// PDF service cannot import from "@/components/..."
// so we use a simple stub to avoid errors
const Watermark = ({ show }) => null;

module.exports = function ModernProfessional({
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

    // HEADER
    React.createElement(
      "div",
      {
        style: {
          marginBottom: "28px",
          borderBottom: "2px solid #0f172a",
          paddingBottom: "12px"
        }
      },
      React.createElement(
        "h1",
        {
          style: {
            margin: 0,
            fontSize: "32px",
            fontWeight: "bold",
            color: "#0f172a"
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
            color: "#334155"
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
          marginBottom: "28px",
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
      { style: { marginBottom: "28px" } },
      React.createElement(
        "h2",
        {
          style: {
            fontSize: "18px",
            marginBottom: "10px",
            color: "#0f172a",
            borderLeft: "4px solid #0f172a",
            paddingLeft: "8px"
          }
        },
        "Professional Summary"
      ),
      React.createElement(
        "p",
        {
          style: {
            fontSize: "14px",
            lineHeight: "1.6",
            color: "#444"
          }
        },
        data?.summary || ""
      )
    ),

    // SKILLS
    React.createElement(
      "div",
      { style: { marginBottom: "28px" } },
      React.createElement(
        "h2",
        {
          style: {
            fontSize: "18px",
            marginBottom: "10px",
            color: "#0f172a",
            borderLeft: "4px solid #0f172a",
            paddingLeft: "8px"
          }
        },
        "Skills"
      ),
      React.createElement(
        "ul",
        { style: { paddingLeft: "20px", margin: 0 } },
        (data?.skills || []).map((skill, i) =>
          React.createElement(
            "li",
            {
              key: i,
              style: {
                fontSize: "14px",
                marginBottom: "4px",
                color: "#333"
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
      { style: { marginBottom: "28px" } },
      React.createElement(
        "h2",
        {
          style: {
            fontSize: "18px",
            marginBottom: "10px",
            color: "#0f172a",
            borderLeft: "4px solid #0f172a",
            paddingLeft: "8px"
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
                fontSize: "15px",
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
            fontSize: "18px",
            marginBottom: "10px",
            color: "#0f172a",
            borderLeft: "4px solid #0f172a",
            paddingLeft: "8px"
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
                fontSize: "15px",
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
