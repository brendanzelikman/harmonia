const flowbite = require("flowbite/plugin");
const forms = require("@tailwindcss/forms");
const aspectRatio = require("@tailwindcss/aspect-ratio");
const animate = require("tailwindcss-animate");
const nav = 60;

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "node_modules/flowbite-react/**/*.{js,jsx,ts,tsx}",
  ],
  mode: "jit",
  theme: {
    extend: {
      colors: {
        scale: "#0ea5e9", // sky-500
        pattern: "#34d399", // emerald-400
        pose: "#f472b6", // pink-400
        instrument: "#fb923c", // orange-400
        "scale-track": "#818cf8", // indigo-400
        "pattern-track": "#34d399", // green-400
        "pattern-clip": "#14b8a6", // teal-500
        "pose-clip": "#d946ef", // fuchsia-500
      },
      fontFamily: {
        base: ["Open Sans", "sans-serif"],
        nunito: ["Nunito", "sans-serif"],
        atari: ["Atari", "sans-serif"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
      cursor: {
        paintbrush: "url(/cursors/paintbrush.cur), pointer",
        scissors: "url(/cursors/scissors.cur), pointer",
        wand: "url(/cursors/wand.cur), pointer",
        eyedropper: "url(/cursors/eyedropper.cur), pointer",
      },
      height: { nav },
      margin: { nav },
      padding: { nav },
      transformOrigin: { 0: "0%" },
      borderWidth: { 0.5: "0.5px" },
    },
  },
  corePlugins: {
    aspectRatio: false,
  },
  plugins: [flowbite, forms, aspectRatio, animate],
};
