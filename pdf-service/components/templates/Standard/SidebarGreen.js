const React = require("react");

// PDF service cannot import from "@/components/..."
// so we use a simple stub to avoid errors
const Watermark = ({ show }) => null;

module.exports = function SidebarGreen({
  data,
  mode,
  premiumUnlocked,
  showWatermark
}) {
  return React.createElement(
    "div",
    {
      style: {
        display: "flex",
        width: "100%",
        fontFamily: "Arial, sans-serif",
        boxSizing: "border-box"
      }
    },

    // LEFT SIDEBAR
    React.createElement(
      "div",
      {
        style: {
          width: "28%",
          backgroundColor: "#e8f5e9",
          padding: "24px",
          boxSizing: "border-box",
          borderRight: "4px solid #2e7d32"
        }
      },

      // Name
      React.createElement(
        "h1",
        {
          style: {
            margin: 0,
            marginBottom: "8px",
            fontSize: "26px",
            fontWeight: "bold",
            color: "#1b5e20"
          }
        },
        data?.name || "Untitled"
      ),

      // Title
      React.createElement(
        "p",
        {
          style: {
            margin: 0,
            marginBottom: "24px",
            fontSize: "14px",
            color: "#2e7d32"
          }
        },
        data?.title || ""
      ),

      // Contact section
      React.createElement(
        "div",
        { style: { marginBottom: "24px" } },
        React.createElement(
          "h2",
          {
            style: {
              fontSize: "16px",
              marginBottom: "6px",
              color: "#1b5e20"
            }
          },
          "Contact"
        ),
        React.createElement(
          "p",
          { style: { margin: 0, fontSize: "13px", color: "#333" } },
          data?.email || ""
        ),
        React.createElement(
          "p",
          { style: { margin: 0, fontSize: "13px", color: "#333" } },
          data?.phone || ""
        ),
        React.createElement(
          "p",
          { style: { margin: 0, fontSize: "13px", color: "#333" } },
          data?.location || ""
        )
      ),

      // Skills
      React.createElement(
        "div",
        null,
        React.createElement(
          "h2",
          {
            style: {
              fontSize: "16px",
              marginBottom: "6px",
              color: "#1b5e20"
            }
          },
          "Skills"
        ),
        React.createElement(
          "ul",
          { style: { paddingLeft: "18px", margin: 0 } },
          (data?.skills || []).map((skill, i) =>
            React.createElement(
              "li",
              {
                key: i,
                style: { fontSize: "13px", marginBottom: "4px", color: "#333" }
              },
              skill
            )
          )
        )
      )
    ),

    // MAIN CONTENT
    React.createElement(
      "div",
      {
        style: {
          flex: 1,
          padding: "32px",
          boxSizing: "border-box"
        }
      },

      // Summary
      React.createElement(
        "div",
        { style: { marginBottom: "24px" } },
        React.createElement(
          "h2",
          {
            style: {
              fontSize: "20px",
              marginBottom: "8px",
              color: "#1b5e20"
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

      // Experience
      React.createElement(
        "div",
        null,
        React.createElement(
          "h2",
          {
            style: {
              fontSize: "20px",
              marginBottom: "8px",
              color: "#1b5e20"
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
                  fontWeight: "bold",
                  color: "#2e7d32"
                }
              },
              exp.title || ""
            ),
            React.createElement(
              "p",
              {
                style: {
                  margin: 0,
                  fontSize: "14px",
                  color: "#333"
                }
              },
              exp.details || ""
            )
          )
        )
      )
    ),

    // Watermark (PDF only)
    mode === "pdf" && !premiumUnlocked
      ? React.createElement(Watermark, { show: showWatermark })
      : null
  );
};
