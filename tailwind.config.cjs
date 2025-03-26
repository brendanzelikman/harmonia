import forms from "@tailwindcss/forms";
import aspectRatio from "@tailwindcss/aspect-ratio";
import animate from "tailwindcss-animate";
import typography from "@tailwindcss/typography";
import plugin from "tailwindcss/plugin";

const nav = 60;

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx,cur}"],
  mode: "jit",
  plugins: [
    typography,
    forms,
    aspectRatio,
    animate,
    plugin(({ addUtilities }) => {
      addUtilities({
        ".total-center": {
          display: "flex",
          "justify-content": "center",
          "align-items": "center",
        },
        ".total-center-col": {
          display: "flex",
          "flex-direction": "column",
          "justify-content": "center",
          "align-items": "center",
        },
        ".text-shadow": {
          "text-shadow": "0 0 8px rgba(0, 0, 0, 0.8)",
        },
        ".text-shadow-sm": {
          "text-shadow": "0 0 5px rgba(0, 0, 0, 0.5)",
        },
        ".text-shadow-lg": {
          "text-shadow": "0 0 10px rgba(0, 0, 0)",
        },
        ".rotate-disc": {
          transform: "rotateX(75deg)",
        },
      });
    }),
  ],
  theme: {
    extend: {
      keyframes: {
        pulseSlow: {
          "0%, 100%": { opacity: 1 },
          "50%": { opacity: 0.5 },
        },
        scaleSlow: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(10)" },
        },
      },
      animation: {
        "landing-background": "scaleSlow 30s ease-in-out infinite",
        "pulse-slow": "pulseSlow 4s ease-in-out infinite",
      },
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
        inter: ["Inter", "sans-serif"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
      cursor: {
        paintbrush: "url(/cursors/paintbrush.cur), pointer",
        scissors: "url(/cursors/scissors.cur), pointer",
        wand: "url(/cursors/wand.cur), pointer",
        portalguno: "url(/cursors/portalguno.cur), pointer",
        portalgunb: "url(/cursors/portalgunb.cur), pointer",
        gethsemane: "url(/cursors/wand2.cur), pointer",
        saber: "url(/cursors/lightsaber.cur), pointer",
        eyedropper: "url(/cursors/eyedropper.cur), pointer",
        neonpurple: "url(/cursors/neonpurple.cur), pointer",
      },
      height: { nav },
      margin: { nav },
      padding: { nav },
      transformOrigin: { 0: "0%" },
      transitionDuration: {
        10000: "10s",
        20000: "20s",
        30000: "30s",
      },
      transitionDelay: {
        1500: "1500ms",
        2000: "2000ms",
        2500: "2500ms",
        3000: "3000ms",
        4000: "4000ms",
      },
      borderWidth: { 0.5: "0.5px" },
    },
  },
};
