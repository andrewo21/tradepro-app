// lib/pdf/generatePdf.js
const satori = require("satori");
const { Resvg } = require("@resvg/resvg-wasm");
const { buildTemplateTree } = require("./renderTemplate");
const { transformResumeData } = require("../transformResumeData");
const { getTailwindCss } = require("./tailwindRuntime");

const PAGE_WIDTH = 8.5 * 96;
const PAGE_HEIGHT = 11 * 96;

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

  const css = await getTailwindCss();

  const svg = await satori(tree, {
    width: PAGE_WIDTH,
    height: PAGE_HEIGHT,
    fonts: [
      {
        name: "system-ui",
        data: new Uint8Array(),
        weight: 400,
        style: "normal",
      },
    ],
    css,
  });

  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: PAGE_WIDTH },
    background: "white",
  });

  const pdf = resvg.render().asPdf();
  return Buffer.from(pdf);
}

module.exports = { generatePdfFromResume };
