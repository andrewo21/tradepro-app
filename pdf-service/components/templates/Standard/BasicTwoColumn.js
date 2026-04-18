const React = require("react");

// PDF service cannot import from "@/components/..."
// so we use a simple stub to avoid errors
const Watermark = ({ show }) => null;

module.exports = function BasicTwoColumn({
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
        padding: "24px",
        width: "100%",
        boxSizing: "border-box"
      }
    },

    // Header
    React.createElement(
      "div",
      { style: { marginBottom: "24px" } },
      React.createElement(
        "h1",
        { style: { margin: 0, fontSize: "28px", fontWeight: "bold" } },
        data?.name || "Untitled"
      ),
      React.createElement(
        "p",
        { style: { margin: 0, fontSize: "14px", color: "#555" } },
        data?.title || ""
      )
    ),

    // Two-column layout
    React.createElement(
      "div",
      {
        style: {
          display: "flex",
          gap: "24px",
          width: "100%"
        }
      },

      // Left column
      React.createElement(
        "div",
        { style: { flex: 1 } },
        React.createElement(
          "h2",
          { style: { fontSize: "18px", marginBottom: "8px" } },
          "Summary"
        ),
        React.createElement(
          "p",
          { style: { fontSize: "14px", lineHeight: "1.5" } },
          data?.summary || ""
        )
      ),

      // Right column
      React.createElement(
        "div",
        { style: { flex: 1 } },
        React.createElement(
          "h2",
          { style: { fontSize: "18px", marginBottom: "8px" } },
          "Details"
        ),
        React.createElement(
          "p",
          { style: { fontSize: "14px", lineHeight: "1.5" } },
          data?.details || ""
        )
      )
    ),

    // Watermark (PDF only)
    mode === "pdf" && !premiumUnlocked
      ? React.createElement(Watermark, { show: showWatermark })
      : null
  );
};
