// Builds the homepage preview with sample data (no server):
//   pnpm exec vite build --config tools/preview/home-preview.config.ts   →  dist-all-preview/
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vite";

const root = path.resolve(import.meta.dirname, "../..");

export default defineConfig({
  base: "./",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: [
      { find: "@/lib/trpc", replacement: path.join(import.meta.dirname, "mockTrpc.ts") },
      { find: "@", replacement: path.join(root, "client/src") },
    ],
  },
  root: import.meta.dirname,
  publicDir: path.join(root, "client/public"),
  build: { outDir: path.join(root, "dist-all-preview"), emptyOutDir: true, rollupOptions: { input: path.join(import.meta.dirname, "all.html") } },
});
