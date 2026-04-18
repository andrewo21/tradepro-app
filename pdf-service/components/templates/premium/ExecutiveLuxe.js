const React = require("react");

// PDF service cannot import from "@/components/..."
// so we use a simple stub to avoid errors
const Watermark = ({ show }) => null;

module.exports = function ExecutiveLuxe({
  data,
  mode,
  premiumUnlocked,
  showWatermark
}) {
  return React.createElement(
    "div",
    {
      style: {
        fontFamily: "Georgia, serif",
        padding: "48px",
        width: "100%",
        boxSizing: "border-box",
        backgroundColor: "#fdfcf8",
        color: "#222"
      }
    },

    // HEADER
    React.createElement(
      "div",
      {
        style: {
          marginBottom: "36px",
          borderBottom: "2px solid #c6a667",
          paddingBottom: "14px"
        }
      },
      React.createElement(
        "h1",
        {
          style: {
            margin: 0,
            fontSize: "40px",
            fontWeight: "bold",
            letterSpacing: "1px",
            color: "#2b2b2b"
          }
        },
        data?.name || "Untitled"
      ),
      React.createElement(
        "p",
        {
          style: {
            margin: "8px 0 0 0",
            fontSize: "18px",
            color: "#8a6d3b"
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
          marginBottom: "36px",
          fontSize: "15px",
          color: "#444",
          lineHeight: "1.5"
        }
      },
      React.createElement("p", { style: { margin: "2px 0" } }, data?.email || ""),
      React.createElement("p", { style: { margin: "2px 0" } }, data?.phone || ""),
      React.createElement("p", { style: { margin: "2px 0" } }, data?.location || "")
    ),

    // EXECUTIVE SUMMARY
    React.createElement(
      "div",
      { style: { marginBottom: "36px" } },
      React.createElement(
        "h2",
        {
          style: {
            fontSize: "22px",
            marginBottom: "12px",
            color: "#2b2b2b",
            borderLeft: "6px solid #c6a667",
            paddingLeft: "12px"
          }
        },
        "Executive Summary"
      ),
      React.createElement(
        "p",
        {
          style: {
            fontSize: "15px",
            lineHeight: "1.7",
            color: "#333"
          }
        },
        data?.summary || ""
      )
    ),

    // CORE COMPETENCIES
    React.createElement(
      "div",
      { style: { marginBottom: "36px" } },
      React.createElement(
        "h2",
        {
          style: {
            fontSize: "22px",
            marginBottom: "12px",
            color: "#2b2b2b",
            borderLeft: "6px solid #c6a667",
            paddingLeft: "12px"
          }
        },
        "Core Competencies"
      ),
      React.createElement(
        "ul",
        { style: { paddingLeft: "22px", margin: 0 } },
        (data?.skills || []).map((skill, i) =>
          React.createElement(
            "li",
            {
              key: i,
              style: {
                fontSize: "15px",
                marginBottom: "6px",
                color: "#444"
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
      { style: { marginBottom: "36px" } },
      React.createElement(
        "h2",
        {
          style: {
            fontSize: "22px",
            marginBottom: "12px",
            color: "#2b2b2b",
            borderLeft: "6px solid #c6a667",
            paddingLeft: "12px"
          }
        },
        "Professional Experience"
      ),

      (data?.experience || []).map((exp, i) =>
        React.createElement(
          "div",
          { key: i, style: { marginBottom: "22px" } },

          React.createElement(
            "p",
            {
              style: {
                margin: 0,
                fontSize: "16px",
                fontWeight: "bold",
                color: "#2b2b2b"
              }
            },
            exp.title || ""
          ),

          React.createElement(
            "p",
            {
              style: {
                margin: "6px 0 0 0",
                fontSize: "15px",
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
            fontSize: "22px",
            marginBottom: "12px",
            color: "#2b2b2b",
            borderLeft: "6px solid #c6a667",
            paddingLeft: "12px"
          }
        },
        "Education"
      ),

      (data?.education || []).map((edu, i) =>
        React.createElement(
          "div",
          { key: i, style: { marginBottom: "22px" } },

          React.createElement(
            "p",
            {
              style: {
                margin: 0,
                fontSize: "16px",
                fontWeight: "bold",
                color: "#2b2b2b"
              }
            },
            edu.institution || ""
          ),

          React.createElement(
            "p",
            {
              style: {
                margin: "6px 0 0 0",
                fontSize: "15px",
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
