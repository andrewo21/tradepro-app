const React = require("react");

// PDF service cannot import from "@/components/..."
// so we use a simple stub to avoid errors
const Watermark = ({ show }) => null;

module.exports = function ExecutiveClassic({
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
        padding: "40px",
        width: "100%",
        boxSizing: "border-box",
        color: "#111",
        backgroundColor: "#ffffff"
      }
    },

    // HEADER
    React.createElement(
      "div",
      {
        style: {
          marginBottom: "32px",
          borderBottom: "2px solid #333",
          paddingBottom: "12px"
        }
      },
      React.createElement(
        "h1",
        {
          style: {
            margin: 0,
            fontSize: "36px",
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
            fontSize: "18px",
            color: "#444"
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
          fontSize: "15px",
          color: "#333",
          lineHeight: "1.4"
        }
      },
      React.createElement("p", { style: { margin: "2px 0" } }, data?.email || ""),
      React.createElement("p", { style: { margin: "2px 0" } }, data?.phone || ""),
      React.createElement("p", { style: { margin: "2px 0" } }, data?.location || "")
    ),

    // EXECUTIVE SUMMARY
    React.createElement(
      "div",
      { style: { marginBottom: "32px" } },
      React.createElement(
        "h2",
        {
          style: {
            fontSize: "22px",
            marginBottom: "10px",
            color: "#222",
            borderBottom: "1px solid #333",
            paddingBottom: "6px"
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
      { style: { marginBottom: "32px" } },
      React.createElement(
        "h2",
        {
          style: {
            fontSize: "22px",
            marginBottom: "10px",
            color: "#222",
            borderBottom: "1px solid #333",
            paddingBottom: "6px"
          }
        },
        "Core Competencies"
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
                fontSize: "15px",
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
      { style: { marginBottom: "32px" } },
      React.createElement(
        "h2",
        {
          style: {
            fontSize: "22px",
            marginBottom: "10px",
            color: "#222",
            borderBottom: "1px solid #333",
            paddingBottom: "6px"
          }
        },
        "Professional Experience"
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
            marginBottom: "10px",
            color: "#222",
            borderBottom: "1px solid #333",
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
