import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: (() => {
    const configured = process.env.VITE_BASE_PATH;
    if (configured) return configured.endsWith("/") ? configured : `${configured}/`;
    return mode === "production" ? "/megahats/" : "/";
  })(),
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
