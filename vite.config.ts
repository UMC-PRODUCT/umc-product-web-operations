import tailwindcss from "@tailwindcss/vite"
import { TanStackRouterVite } from "@tanstack/router-plugin/vite"
import react from "@vitejs/plugin-react"
import path from "node:path"
import { defineConfig } from "vite"
import svgr from "vite-plugin-svgr"

export default defineConfig({
  plugins: [
    TanStackRouterVite({
      routesDirectory: "./src/routes",
      generatedRouteTree: "./src/routeTree.gen.ts",
      autoCodeSplitting: true,
    }),
    react(),
    svgr(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      onwarn(warning, warn) {
        if (warning.code === "MODULE_LEVEL_DIRECTIVE") return
        warn(warning)
      },
    },
  },
  server: {
    proxy: {
      "/api": {
        // TODO: 백오피스 API 베이스 URL로 교체
        target: "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
})
