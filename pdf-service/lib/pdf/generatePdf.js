// lib/pdf/generatePdf.js

const fs = require("fs");
const path = require("path");
const satori = require("satori");
const { Resvg } = require("@resvg/resvg-wasm");

// renderTemplate is in the same folder
const { buildTemplateTree } = require("./renderTemplate");

// transformResumeData is one folder up from /pdf
const transformResumeData = require("../transformResumeData");

// PDF dimensions (96 DPI)
const PAGE_WIDTH = 8.5 * 96;
const PAGE_HEIGHT = 11 * 96;

// -------------------------------------------------------------
// FONT PATHS (Render + Local)
// -------------------------------------------------------------
// __dirname = /pdf-service/lib/pdf
// ../../public/fonts/... = /pdf-service/public/fonts/...
const FONT_DIR = path.join(__dirname, "..", "..", "public", "fonts");

const fontRegularPath = path.join(FONT_DIR, "Inter-Regular.ttf");
const fontBoldPath = path.join(FONT_DIR, "Inter-Bold.ttf");
const fontMediumPath = path.join(FONT_DIR, "Inter-Medium.ttf");

// Load fonts
const fontRegular = fs.readFileSync(fontRegularPath);
const fontBold = fs.readFileSync(fontBoldPath);
const fontMedium = fs.readFileSync(fontMediumPath);

// -------------------------------------------------------------
// STATIC CSS PATH
// -------------------------------------------------------------
const cssPath = path.join(__dirname, "tailwind.built.css");
const staticCss = fs.readFileSync(cssPath, "utf8");

// -------------------------------------------------------------
// MAIN PDF GENERATOR
// -------------------------------------------------------------
async function generatePdfFromResume({
  templateKey,
  rawResumeData,
  premiumUnlocked = false,
  showWatermark = true,
}) {
  // Normalize resume data
  const data = transformResumeData(rawResumeData);

  // Build React tree for Satori
  const tree = buildTemplateTree({
    templateKey,
    data,
    premiumUnlocked,
    showWatermark,
  });

  // Generate SVG using Satori
  const svg = await satori(tree, {
    width: PAGE_WIDTH,
    height: PAGE_HEIGHT,
    fonts: [
      {
        name: "Inter",
        data: fontRegular,
        weight: 400,
        style: "normal",
      },
      {
        name: "Inter",
        data: fontMedium,
        weight: 500,
        style: "normal",
      },
      {
        name: "Inter",
        data: fontBold,
        weight: 700,
        style: "normal",
      },
    ],
    css: staticCss,
  });

  // Convert SVG → PDF using Resvg
  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: PAGE_WIDTH },
    background: "white",
  });

  const pdf = resvg.render().asPdf();
  return Buffer.from(pdf);
}

module.exports = { generatePdfFromResume };
