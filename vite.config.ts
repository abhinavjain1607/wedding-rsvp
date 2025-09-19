import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-runtime-error-modal").then((m) =>
            m.default()
          ),
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer()
          ),
          await import("@replit/vite-plugin-dev-banner").then((m) =>
            m.devBanner()
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    rollupOptions: {
      // Force Rollup to use JS fallback instead of native binaries
      output: {
        format: "es",
      },
      // Disable native binary usage
      onwarn: (warning, warn) => {
        if (warning.code === 'MISSING_GLOBAL_NAME') return;
        warn(warning);
      },
    },
    // Increase memory limit for build
    chunkSizeWarningLimit: 1000,
  },
  define: {
    // Disable native binaries completely
    "process.env.ROLLUP_NO_NATIVE": JSON.stringify("true"),
    "global.ROLLUP_NO_NATIVE": JSON.stringify("true"),
  },
  optimizeDeps: {
    // Force pre-bundling to avoid runtime issues
    include: ['react', 'react-dom'],
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
