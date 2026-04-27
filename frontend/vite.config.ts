import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: "autoUpdate",
        manifest: {
          name: "Naute",
          short_name: "Naute",
          description: "A markdown note-taking app",
          theme_color: "#4d699b",
          background_color: "#1f1f28",
          display: "standalone",
          icons: [
            {
              src: "/pwa-192x192.png",
              sizes: "192x192",
              type: "image/png",
            },
            {
              src: "/pwa-512x512.png",
              sizes: "512x512",
              type: "image/png",
            },
            {
              src: "/pwa-512x512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "maskable",
            },
          ],
        },
        workbox: {
          globPatterns: ["**/*.{js,css,html,woff2,png,svg}"],
        },
      }),
    ],
    server: env.API_PROXY_TARGET
      ? {
          proxy: {
            "/api": {
              target: env.API_PROXY_TARGET,
              changeOrigin: true,
              rewrite: (path: string) => path.replace(/^\/api/, ""),
            },
          },
        }
      : undefined,
  };
});
