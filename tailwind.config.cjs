import forms from "@tailwindcss/forms";
import aspectRatio from "@tailwindcss/aspect-ratio";
import animate from "tailwindcss-animate";
import typography from "@tailwindcss/typography";

const nav = 60;

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx,cur}"],
  mode: "jit",
  theme: {
    extend: {
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      colors: {
        prodigy: "#818cf8", // indigo-400
        maestro: "#c084fc", // fuchsia-400
        virtuoso: "#38bdf8", // sky-400
        "prodigy-dark": "#3730a3", // indigo-800
        "maestro-dark": "#c026d3", // fuchsia-600
        "virtuoso-dark": "#0284c7", // sky-600
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
        inter: ["Inter", "sans-serif"],
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
      spacing: {
        18: "4.5rem",
        76: "19rem",
      },
      transformOrigin: { 0: "0%" },
      transitionDuration: {
        10000: "10s",
        20000: "20s",
        30000: "30s",
      },
      borderWidth: { 0.5: "0.5px" },
    },
  },
  corePlugins: {
    aspectRatio: false,
  },
  plugins: [typography, forms, aspectRatio, animate],
};
