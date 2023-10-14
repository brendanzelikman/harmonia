const flowbite = require("flowbite/plugin");
const forms = require("@tailwindcss/forms");
const aspectRatio = require("@tailwindcss/aspect-ratio");

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
      fontFamily: {
        base: ["Open Sans", "sans-serif"],
        nunito: ["Nunito", "sans-serif"],
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
      transformOrigin: {
        0: "0%",
      },
      borderWidth: {
        0.5: "0.5px",
      },
    },
  },
  corePlugins: {
    aspectRatio: false,
  },
  plugins: [flowbite, forms, aspectRatio],
};
