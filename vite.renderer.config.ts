import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config
export default defineConfig({
  assetsInclude: ["**/*.ham"],
  base: "/harmonia/",
  plugins: [tsconfigPaths()],
  resolve: {},
});
