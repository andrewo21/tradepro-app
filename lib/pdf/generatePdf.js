// lib/pdf/generatePdf.js
const satori = require("satori");

// IMPORTANT: load WASM + init
const { Resvg, initWasm } = require("@resvg/resvg-wasm");
const resvgWasm = require("@resvg/resvg-wasm/index_bg.wasm");

const { buildTemplateTree } = require("./renderTemplate");
const { transformResumeData } = require("../transformResumeData");
const { getTailwindCss } = require("./tailwindRuntime");

const PAGE_WIDTH = 8.5 * 96;  // 816px
const PAGE_HEIGHT = 11 * 96;  // 1056px

async function generatePdfFromResume({
  templateKey,
  rawResumeData,
  premiumUnlocked = false,
  showWatermark = true,
}) {
  // Initialize WASM (fixes ENOENT on Render)
  await initWasm(resvgWasm);

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
