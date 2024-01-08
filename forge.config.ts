import type { ForgeConfig } from "@electron-forge/shared-types";
import { MakerDMG } from "@electron-forge/maker-dmg";
import { MakerSquirrel } from "@electron-forge/maker-squirrel";
import { MakerZIP } from "@electron-forge/maker-zip";
import { MakerDeb } from "@electron-forge/maker-deb";
import { MakerRpm } from "@electron-forge/maker-rpm";
import { VitePlugin } from "@electron-forge/plugin-vite";

const config: ForgeConfig = {
  packagerConfig: {
    icon: "./public/logo",
    protocols: [
      {
        name: "Harmonia",
        schemes: ["harmonia"],
      },
    ],
  },
  rebuildConfig: {},
  makers: [
    new MakerSquirrel({ name: "Harmonia", setupIcon: "./public/logo.ico" }),
    new MakerZIP({}, ["darwin"]),
    new MakerDMG({
      icon: "./public/logo.icns",
    }),
    new MakerDeb({
      options: {
        icon: "./public/logo.png",
        productName: "Harmonia",
        mimeType: ["x-scheme-handler/harmonia"],
      },
    }),
    new MakerRpm({}),
  ],
  plugins: [
    new VitePlugin({
      build: [
        {
          entry: "src/main.ts",
          config: "vite.main.config.ts",
        },
        {
          entry: "src/preload.ts",
          config: "vite.preload.config.ts",
        },
      ],
      renderer: [
        {
          name: "main_window",
          config: "vite.renderer.config.ts",
        },
      ],
    }),
  ],
};

export default config;
