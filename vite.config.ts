import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ command, mode }) => {
  if (command === "build") {
    const env = loadEnv(mode, process.cwd(), "");
    const requiredFirebaseConfig = [
      "VITE_FIREBASE_API_KEY",
      "VITE_FIREBASE_AUTH_DOMAIN",
      "VITE_FIREBASE_PROJECT_ID",
      "VITE_FIREBASE_STORAGE_BUCKET",
      "VITE_FIREBASE_MESSAGING_SENDER_ID",
      "VITE_FIREBASE_APP_ID",
    ];
    const missingConfig = requiredFirebaseConfig.filter((key) => !env[key]);

    const recaptchaProvider = env.VITE_RECAPTCHA_PROVIDER || "v3";
    if (recaptchaProvider !== "enterprise" && recaptchaProvider !== "v3") {
      throw new Error(
        "VITE_RECAPTCHA_PROVIDER must be either enterprise or v3.",
      );
    }

    const recaptchaSiteKey =
      recaptchaProvider === "enterprise"
        ? "VITE_RECAPTCHA_ENTERPRISE_SITE_KEY"
        : "VITE_RECAPTCHA_V3_SITE_KEY";
    if (!env[recaptchaSiteKey]) {
      missingConfig.push(recaptchaSiteKey);
    }

    if (missingConfig.length > 0) {
      throw new Error(
        `Missing required Firebase configuration: ${missingConfig.join(", ")}`,
      );
    }
  }

  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: "autoUpdate",
        includeAssets: ["favicon.ico", "apple-touch-icon.png", "icon.svg"],
        manifest: {
          id: "/",
          name: "منصة جمع البيانات الميدانية | Field Data Collection Hub",
          short_name: "جمع البيانات",
          description:
            "تطبيق جمع البيانات الميدانية واستطلاع السجلات والجهات المستهدفة وتعبئة النماذج",
          theme_color: "#3b0764",
          background_color: "#f8fafc",
          display: "standalone",
          orientation: "portrait",
          start_url: "/",
          scope: "/",
          lang: "ar",
          dir: "rtl",
          categories: ["business", "productivity"],
          icons: [
            {
              src: "/pwa-192x192.png",
              sizes: "192x192",
              type: "image/png",
              purpose: "any",
            },
            {
              src: "/pwa-512x512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "any",
            },
            {
              src: "/pwa-maskable-512x512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "maskable",
            },
          ],
        },
        workbox: {
          globPatterns: ["**/*.{js,css,html,ico,png,svg,woff,woff2}"],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: "CacheFirst",
              options: {
                cacheName: "google-fonts-cache",
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: "CacheFirst",
              options: {
                cacheName: "gstatic-fonts-cache",
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
          ],
        },
        devOptions: {
          enabled: false,
          type: "module",
        },
      }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "."),
      },
    },
    build: {
      outDir: "firebase/public",
      emptyOutDir: true,
      modulePreload: false,
      chunkSizeWarningLimit: 550, // Accommodates Firestore SDK (~512KB minified) without suppressing warnings for large application chunks
      rollupOptions: {
        output: {
          manualChunks: {
            "vendor-react": ["react", "react-dom"],
            "vendor-firestore": ["firebase/firestore"],
            "vendor-firebase": [
              "firebase/app",
              "firebase/auth",
              "firebase/functions",
              "firebase/storage",
            ],
            "vendor-icons": ["lucide-react"],
            "vendor-utils": ["zustand", "@tanstack/react-query"],
          },
        },
      },
    },
  };
});
