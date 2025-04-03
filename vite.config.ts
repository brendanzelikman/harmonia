import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config/
export default defineConfig({
  server: { port: 3000 },
  base: "/harmonia/",
  build: {
    chunkSizeWarningLimit: 5000,
    outDir: "build",
    rollupOptions: {
      onwarn(warning, warn) {
        if (warning.code === "MODULE_LEVEL_DIRECTIVE") {
          return;
        }
        warn(warning);
      },
    },
  },
  plugins: [react(), tsconfigPaths()],
  resolve: {
    mainFields: ["module", "jsnext:main", "jsnext"],
  },
});
