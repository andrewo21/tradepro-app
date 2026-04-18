// lib/pdf/generatePdf.js

const fs = require("fs");
const path = require("path");
const satori = require("satori");
const { Resvg } = require("@resvg/resvg-wasm");

const { buildTemplateTree } = require("./renderTemplate");
const { transformResumeData } = require("../transformResumeData");

const PAGE_WIDTH = 8.5 * 96;
const PAGE_HEIGHT = 11 * 96;

// From this file (lib/pdf) to /public/fonts/Inter-Regular.ttf
const fontPath = path.join(
  __dirname,
  "..",
  "..",
  "public",
  "fonts",
  "Inter-Regular.ttf"
);
const fontData = fs.readFileSync(fontPath);

// From this file to tailwind.built.css in same folder
const cssPath = path.join(__dirname, "tailwind.built.css");
const staticCss = fs.readFileSync(cssPath, "utf8");

async function generatePdfFromResume({
  templateKey,
  rawResumeData,
  premiumUnlocked = false,
  showWatermark = true,
}) {
  const data = transformResumeData(rawResumeData);

  const tree = buildTemplateTree({
    templateKey,
    data,
    premiumUnlocked,
    showWatermark,
  });

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

  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: PAGE_WIDTH },
    background: "white",
  });

  const pdf = resvg.render().asPdf();
  return Buffer.from(pdf);
}

module.exports = { generatePdfFromResume };
