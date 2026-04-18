const React = require("react");

// PDF service cannot import from "@/components/..."
// so we use a simple stub to avoid errors
const Watermark = ({ show }) => null;

module.exports = function ModernBlue({
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
        padding: "32px",
        width: "100%",
        boxSizing: "border-box",
        backgroundColor: "#f7faff"
      }
    },

    // Header section
    React.createElement(
      "div",
      {
        style: {
          borderBottom: "4px solid #1e3a8a",
          paddingBottom: "12px",
          marginBottom: "24px"
        }
      },
      React.createElement(
        "h1",
        {
          style: {
            margin: 0,
            fontSize: "32px",
            fontWeight: "bold",
            color: "#1e3a8a"
          }
        },
        data?.name || "Untitled"
      ),
      React.createElement(
        "p",
        {
          style: {
            margin: 0,
            fontSize: "16px",
            color: "#3b82f6"
          }
        },
        data?.title || ""
      )
    ),

    // Content section
    React.createElement(
      "div",
      { style: { marginBottom: "24px" } },
      React.createElement(
        "h2",
        {
          style: {
            fontSize: "20px",
            marginBottom: "8px",
            color: "#1e3a8a"
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

    // Experience section
    React.createElement(
      "div",
      null,
      React.createElement(
        "h2",
        {
          style: {
            fontSize: "20px",
            marginBottom: "8px",
            color: "#1e3a8a"
          }
        },
        "Experience"
      ),
      React.createElement(
        "div",
        { style: { marginBottom: "16px" } },
        React.createElement(
          "p",
          {
            style: {
              fontSize: "14px",
              margin: 0,
              fontWeight: "bold",
              color: "#1e40af"
            }
          },
          data?.experienceTitle || ""
        ),
        React.createElement(
          "p",
          {
            style: {
              fontSize: "14px",
              margin: 0,
              color: "#333"
            }
          },
          data?.experienceDetails || ""
        )
      )
    ),

    // Watermark (PDF only)
    mode === "pdf" && !premiumUnlocked
      ? React.createElement(Watermark, { show: showWatermark })
      : null
  );
};
