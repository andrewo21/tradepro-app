// lib/pdf/generatePdf.js

const fs = require("fs");
const path = require("path");
const satori = require("satori");
const { Resvg } = require("@resvg/resvg-wasm");

const { buildTemplateTree } = require("./renderTemplate");
const { transformResumeData } = require("../transformResumeData");

// PDF dimensions (96 DPI)
const PAGE_WIDTH = 8.5 * 96;
const PAGE_HEIGHT = 11 * 96;

// Load font from /public (works in Vercel)
const fontPath = path.join(process.cwd(), "public/fonts/Inter-Regular.ttf");
const fontData = fs.readFileSync(fontPath);

// Load STATIC Tailwind CSS
const cssPath = path.join(process.cwd(), "lib/pdf/tailwind.built.css");
const staticCss = fs.readFileSync(cssPath, "utf8");

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
