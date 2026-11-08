import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Documentation site: imports the library from source so changes show instantly.
export default defineConfig({
  root: "site",
  publicDir: "../public",
  plugins: [react()],
  server: { port: 5175, strictPort: true },
  build: { outDir: "../site-dist", emptyOutDir: true },
});
