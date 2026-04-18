const React = require("react");

// PDF service cannot import from "@/components/..."
// so we use a simple stub to avoid errors
const Watermark = ({ show }) => null;

module.exports = function StandardContemporary({
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
        padding: "36px",
        width: "100%",
        boxSizing: "border-box",
        color: "#111",
        backgroundColor: "#fafafa"
      }
    },

    // HEADER
    React.createElement(
      "div",
      {
        style: {
          marginBottom: "28px",
          borderBottom: "3px solid #444",
          paddingBottom: "12px"
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
            color: "#555"
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
          color: "#333"
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
            fontSize: "20px",
            marginBottom: "10px",
            color: "#222",
            borderLeft: "4px solid #444",
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

    // EXPERIENCE
    React.createElement(
      "div",
      { style: { marginBottom: "28px" } },
      React.createElement(
        "h2",
        {
          style: {
            fontSize: "20px",
            marginBottom: "10px",
            color: "#222",
            borderLeft: "4px solid #444",
            paddingLeft: "8px"
          }
        },
        "Experience"
      ),

      (data?.experience || []).map((exp, i) =>
        React.createElement(
          "div",
          { key: i, style: { marginBottom: "18px" } },

          React.createElement(
            "p",
            {
              style: {
                margin: 0,
                fontSize: "15px",
                fontWeight: "bold",
                color: "#222"
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
                lineHeight: "1.5"
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
            color: "#222",
            borderLeft: "4px solid #444",
            paddingLeft: "8px"
          }
        },
        "Education"
      ),

      (data?.education || []).map((edu, i) =>
        React.createElement(
          "div",
          { key: i, style: { marginBottom: "18px" } },

          React.createElement(
            "p",
            {
              style: {
                margin: 0,
                fontSize: "15px",
                fontWeight: "bold",
                color: "#222"
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
                lineHeight: "1.5"
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
