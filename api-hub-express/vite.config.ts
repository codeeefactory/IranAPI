import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const proxyTarget = env.VITE_DEV_PROXY_TARGET || "http://127.0.0.1:8000";

  return {
    server: {
      host: "::",
      port: 5173,
      proxy: {
        "/api/v1": {
          target: proxyTarget,
          changeOrigin: true,
        },
        "/api/auth": {
          target: proxyTarget,
          changeOrigin: true,
        },
        "/api/health": {
          target: proxyTarget,
          changeOrigin: true,
        },
        "/api/usage": {
          target: proxyTarget,
          changeOrigin: true,
        },
        "/api/profile": {
          target: proxyTarget,
          changeOrigin: true,
        },
        "/api/categories": {
          target: proxyTarget,
          changeOrigin: true,
        },
        "/api/apis": {
          target: proxyTarget,
          changeOrigin: true,
        },
        "/api/pricing-plans": {
          target: proxyTarget,
          changeOrigin: true,
        },
        "/api/documentations": {
          target: proxyTarget,
          changeOrigin: true,
        },
        "/api-auth": {
          target: proxyTarget,
          changeOrigin: true,
        },
        "/admin": {
          target: proxyTarget,
          changeOrigin: true,
        },
        "/media": {
          target: proxyTarget,
          changeOrigin: true,
        },
        "/static": {
          target: proxyTarget,
          changeOrigin: true,
        },
      },
    },
  },
}));
