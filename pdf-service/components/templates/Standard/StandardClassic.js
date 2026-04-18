const React = require("react");

// PDF service cannot import from "@/components/..."
// so we use a simple stub to avoid errors
const Watermark = ({ show }) => null;

module.exports = function StandardClassic({
  data,
  mode,
  premiumUnlocked,
  showWatermark
}) {
  return React.createElement(
    "div",
    {
      style: {
        fontFamily: "Times New Roman, serif",
        padding: "32px",
        width: "100%",
        boxSizing: "border-box",
        color: "#000"
      }
    },

    // HEADER
    React.createElement(
      "div",
      { style: { marginBottom: "24px", textAlign: "center" } },
      React.createElement(
        "h1",
        {
          style: {
            margin: 0,
            fontSize: "32px",
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
            margin: "4px 0 0 0",
            fontSize: "16px",
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
          marginBottom: "24px",
          textAlign: "center",
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
      { style: { marginBottom: "24px" } },
      React.createElement(
        "h2",
        {
          style: {
            fontSize: "20px",
            marginBottom: "8px",
            borderBottom: "1px solid #000",
            paddingBottom: "4px"
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
            color: "#333"
          }
        },
        data?.summary || ""
      )
    ),

    // EXPERIENCE
    React.createElement(
      "div",
      { style: { marginBottom: "24px" } },
      React.createElement(
        "h2",
        {
          style: {
            fontSize: "20px",
            marginBottom: "8px",
            borderBottom: "1px solid #000",
            paddingBottom: "4px"
          }
        },
        "Experience"
      ),

      (data?.experience || []).map((exp, i) =>
        React.createElement(
          "div",
          { key: i, style: { marginBottom: "16px" } },

          React.createElement(
            "p",
            {
              style: {
                margin: 0,
                fontSize: "15px",
                fontWeight: "bold"
              }
            },
            exp.title || ""
          ),

          React.createElement(
            "p",
            {
              style: {
                margin: "2px 0 0 0",
                fontSize: "14px",
                color: "#333"
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
            marginBottom: "8px",
            borderBottom: "1px solid #000",
            paddingBottom: "4px"
          }
        },
        "Education"
      ),

      (data?.education || []).map((edu, i) =>
        React.createElement(
          "div",
          { key: i, style: { marginBottom: "16px" } },

          React.createElement(
            "p",
            {
              style: {
                margin: 0,
                fontSize: "15px",
                fontWeight: "bold"
              }
            },
            edu.institution || ""
          ),

          React.createElement(
            "p",
            {
              style: {
                margin: "2px 0 0 0",
                fontSize: "14px",
                color: "#333"
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
