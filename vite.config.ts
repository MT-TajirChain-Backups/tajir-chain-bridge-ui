import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import checkerPlugin from "vite-plugin-checker";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import svgr from "vite-plugin-svgr";

// eslint-disable-next-line import/no-default-export
export default defineConfig({
  build: {
    sourcemap: true,
  },
  define: {
    bridgeVersion: JSON.stringify(process.env.npm_package_version),
  },
  plugins: [
    react(),
    svgr(),
    nodePolyfills(),
    checkerPlugin({
      eslint: { lintCommand: 'eslint "./src/**/*.{ts,tsx}"' },
      overlay: false,
      typescript: true,
    }),
  ],
  resolve: {
    alias: [{ find: "src", replacement: path.resolve(__dirname, "src") }],
  },
  server: {
    open: true,
    watch: {
      ignored: ["!**/*.tsx", "!**/*.ts", "**/*.json", "**/*.svg?react", "**/*.png", "**/*.jpg", "**/*.css"],
    },
  },
});
