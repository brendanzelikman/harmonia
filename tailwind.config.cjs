const flowbite = require("flowbite/plugin");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "node_modules/flowbite-react/**/*.{js,jsx,ts,tsx}",
  ],
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
        brush: "url(/cursors/brush.cur), pointer",
        scissors: "url(/cursors/scissors.cur), pointer",
        wand: "url(/cursors/wand.cur), pointer",
      },
      transformOrigin: {
        0: "0%",
      },
      borderWidth: {
        0.5: "0.5px",
      },
    },
  },
  plugins: [flowbite],
};
