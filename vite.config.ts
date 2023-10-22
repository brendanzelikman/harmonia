import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 3000,
  },
  base: "/harmonia/",
  build: {
    chunkSizeWarningLimit: 5000,
    outDir: "build",
  },
  assetsInclude: ["**/*.ham"],
  plugins: [react(), tsconfigPaths()],
  resolve: {
    mainFields: [],
  },
});
