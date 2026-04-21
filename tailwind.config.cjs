/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./components/templates/**/*.{js,ts,jsx,tsx}",
    "./components/templates/Standard/**/*.{js,ts,jsx,tsx}",
    "./components/templates/premium/**/*.{js,ts,jsx,tsx}",
  ],

  corePlugins: {
    preflight: false,
  },

  safelist: [
    { pattern: /bg-blue-(50|100|200|300|400|500|600|700|800|900)/ },
    { pattern: /text-blue-(50|100|200|300|400|500|600|700|800|900)/ },
    { pattern: /border-blue-(50|100|200|300|400|500|600|700|800|900)/ },

    { pattern: /bg-sky-(50|100|200|300|400|500|600|700|800|900)/ },
    { pattern: /text-sky-(50|100|200|300|400|500|600|700|800|900)/ },
    { pattern: /border-sky-(50|100|200|300|400|500|600|700|800|900)/ },

    { pattern: /bg-slate-(50|100|200|300|400|500|600|700|800|900)/ },
    { pattern: /text-slate-(50|100|200|300|400|500|600|700|800|900)/ },
    { pattern: /border-slate-(50|100|200|300|400|500|600|700|800|900)/ },

    { pattern: /bg-gray-(50|100|200|300|400|500|600|700|800|900)/ },
    { pattern: /text-gray-(50|100|200|300|400|500|600|700|800|900)/ },
    { pattern: /border-gray-(50|100|200|300|400|500|600|700|800|900)/ },

    { pattern: /bg-indigo-(50|100|200|300|400|500|600|700|800|900)/ },
    { pattern: /text-indigo-(50|100|200|300|400|500|600|700|800|900)/ },
    { pattern: /border-indigo-(50|100|200|300|400|500|600|700|800|900)/ },

    { pattern: /bg-emerald-(50|100|200|300|400|500|600|700|800|900)/ },
    { pattern: /text-emerald-(50|100|200|300|400|500|600|700|800|900)/ },
    { pattern: /border-emerald-(50|100|200|300|400|500|600|700|800|900)/ },

    { pattern: /bg-rose-(50|100|200|300|400|500|600|700|800|900)/ },
    { pattern: /text-rose-(50|100|200|300|400|500|600|700|800|900)/ },
    { pattern: /border-rose-(50|100|200|300|400|500|600|700|800|900)/ },

    { pattern: /bg-amber-(50|100|200|300|400|500|600|700|800|900)/ },
    { pattern: /text-amber-(50|100|200|300|400|500|600|700|800|900)/ },
    { pattern: /border-amber-(50|100|200|300|400|500|600|700|800|900)/ },

    { pattern: /bg-yellow-(50|100|200|300|400|500|600|700|800|900)/ },
    { pattern: /text-yellow-(50|100|200|300|400|500|600|700|800|900)/ },
    { pattern: /border-yellow-(50|100|200|300|400|500|600|700|800|900)/ },
  ],

  theme: {
    extend: {},
  },

  // ⭐ IMPORTANT: REMOVE ALL PLUGINS
  plugins: [],
};
