import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";

// Official challenge sample data (bank statement CSV), used by the mock backend.
const SAMPLES = process.env.SAMPLES_DIR ?? fileURLToPath(new URL("../data/samples", import.meta.url));

const BACKEND = process.env.BACKEND_URL ?? "http://localhost:8000";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@samples": SAMPLES } },
  server: {
    port: 5173,
    host: true,
    // Mock mode imports the sample bank statement from ../data/samples.
    fs: { allow: [".", SAMPLES] },
    // Same as nginx in production: /api/... → backend without the /api prefix
    proxy: {
      "/api": { target: BACKEND, changeOrigin: true, rewrite: (p) => p.replace(/^\/api/, "") },
    },
  },
});
