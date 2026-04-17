// lib/pdf/generatePdf.js

const fs = require("fs");
const path = require("path");
const satori = require("satori");
const { Resvg } = require("@resvg/resvg-wasm");

const { buildTemplateTree } = require("./renderTemplate");
const { transformResumeData } = require("../transformResumeData");
const { getTailwindCss } = require("./tailwindRuntime");

const PAGE_WIDTH = 8.5 * 96;
const PAGE_HEIGHT = 11 * 96;

// Load embedded font ONCE at startup
const fontPath = path.join(process.cwd(), "public", "fonts", "Inter-Regular.ttf");
const fontData = fs.readFileSync(fontPath);

async function generatePdfFromResume({
  templateKey,
  rawResumeData,
  premiumUnlocked = false,
  showWatermark = true,
}) {
  // Normalize data
  const data = transformResumeData(rawResumeData);

  // Build the React tree for Satori
  const tree = buildTemplateTree({
    templateKey,
    data,
    premiumUnlocked,
    showWatermark,
  });

  // Tailwind CSS (runtime)
  const css = await getTailwindCss();

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
    css,
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
