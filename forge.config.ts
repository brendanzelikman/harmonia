import type { ForgeConfig } from "@electron-forge/shared-types";
import { MakerDMG } from "@electron-forge/maker-dmg";
import { MakerSquirrel } from "@electron-forge/maker-squirrel";
import { VitePlugin } from "@electron-forge/plugin-vite";

const config: ForgeConfig = {
  packagerConfig: {
    icon: "./public/logo",
    protocols: [{ name: "Harmonia", schemes: ["harmonia"] }],
  },
  rebuildConfig: {},
  makers: [
    new MakerSquirrel({ name: "Harmonia", setupIcon: "./public/logo.ico" }),
    new MakerDMG({ icon: "./public/logo.icns" }),
  ],
  plugins: [
    new VitePlugin({
      build: [
        { entry: "src/main.ts", config: "vite.main.config.ts" },
        { entry: "src/preload.ts", config: "vite.preload.config.ts" },
      ],
      renderer: [{ name: "main_window", config: "vite.renderer.config.ts" }],
    }),
  ],
};

export default config;
