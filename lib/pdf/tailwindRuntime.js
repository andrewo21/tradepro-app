// lib/pdf/tailwindRuntime.js
const postcss = require("postcss");
const tailwindcss = require("tailwindcss");
const tailwindConfig = require("../../tailwind.config.js");

// This is your EXACT globals.css content:
const GLOBALS_SOURCE = `
@tailwind base;
@tailwind components;
@tailwind utilities;

/* -----------------------------------
   Global Reset & Typography
----------------------------------- */

html, body {
  padding: 0;
  margin: 0;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
    Roboto, Helvetica, Arial, sans-serif;
  background-color: #f3f4f6;
  color: #111827;
}

* {
  box-sizing: border-box;
}

/* Inputs */
input,
textarea,
select {
  outline: none;
  border: 1px solid #d1d5db;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

input:focus,
textarea:focus,
select:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
}

/* Buttons */
button {
  cursor: pointer;
  transition: background-color 0.15s ease, opacity 0.15s ease;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Resume Preview */
pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  font-size: 0.9rem;
  line-height: 1.4;
}

/* Scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fadeIn {
  animation: fadeIn 0.3s ease-out;
}
`;

let cachedCss = null;

async function getTailwindCss() {
  if (cachedCss) return cachedCss;

  const result = await postcss([
    tailwindcss({
      ...tailwindConfig,
    }),
  ]).process(GLOBALS_SOURCE, { from: undefined });

  cachedCss = result.css;
  return cachedCss;
}

module.exports = { getTailwindCss };
