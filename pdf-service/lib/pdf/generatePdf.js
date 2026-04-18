// lib/pdf/generatePdf.js

const fs = require("fs");
const path = require("path");
const satori = require("satori");
const { Resvg } = require("@resvg/resvg-wasm");

// ✅ renderTemplate is in the SAME folder as this file
const { buildTemplateTree } = require("./renderTemplate");

// ✅ transformResumeData is still in the root /lib folder
// __dirname = /pdf-service/lib/pdf
// ../../../lib/transformResumeData → /lib/transformResumeData.js at repo root
const transformResumeData = require('../transformResumeData');


// PDF dimensions (96 DPI)
const PAGE_WIDTH = 8.5 * 96;
const PAGE_HEIGHT = 11 * 96;

// -------------------------------------------------------------
// FONT PATH (Render + Local + Node-safe)
// -------------------------------------------------------------
// __dirname = /pdf-service/lib/pdf
// ../../public/fonts/Inter-Regular.ttf = /pdf-service/public/fonts/Inter-Regular.ttf
const fontPath = path.join(
  __dirname,
  "..",
  "..",
  "public",
  "fonts",
  "Inter-Regular.ttf"
);

const fontData = fs.readFileSync(fontPath);

// -------------------------------------------------------------
// STATIC CSS PATH (Render + Local)
// -------------------------------------------------------------
// tailwind.built.css lives in the SAME folder as this file
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
        data: fontData,
        weight: 400,
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
