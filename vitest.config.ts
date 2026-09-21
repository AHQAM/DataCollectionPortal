import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    include: ["src/__tests__/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      thresholds: {
        lines: 15,
        functions: 10,
        branches: 5,
        statements: 15,
      },
      include: ["src/**/*.ts", "src/**/*.tsx"],
      exclude: ["src/__tests__/**"],
    },
  },
});
