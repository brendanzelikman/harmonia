import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig({
  server: { port: 3000 },
  build: {
    chunkSizeWarningLimit: 5000,
    outDir: "dist",
    rollupOptions: {
      onwarn(warning, warn) {
        if (warning.code === "MODULE_LEVEL_DIRECTIVE") {
          return;
        }
        warn(warning);
      },
    },
  },
  plugins: [react(), tsconfigPaths(), tailwindcss()],
  resolve: {
    mainFields: ["browser", "module", "main", "jsnext"],
  },
});
