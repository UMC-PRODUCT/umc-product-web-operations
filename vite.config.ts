import tailwindcss from "@tailwindcss/vite"
import { TanStackRouterVite } from "@tanstack/router-plugin/vite"
import react from "@vitejs/plugin-react"
import path from "node:path"
import { defineConfig, loadEnv } from "vite"
import svgr from "vite-plugin-svgr"

const DEFAULT_DEV_API_PROXY_TARGET = "https://api-dev.university.neordinary.com"

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "")
  const apiProxyTarget =
    env.VITE_DEV_API_PROXY_TARGET || DEFAULT_DEV_API_PROXY_TARGET
  const proxyUsesHttps = apiProxyTarget.startsWith("https://")

  return {
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
          target: apiProxyTarget,
          changeOrigin: true,
          secure: proxyUsesHttps,
        },
      },
    },
  }
})
