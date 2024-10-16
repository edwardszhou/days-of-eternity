import { resolve } from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  publicDir: resolve(__dirname, "public"),
  build: {
    outDir: resolve(__dirname, "dist")
  },
  plugins: [react()]
});
