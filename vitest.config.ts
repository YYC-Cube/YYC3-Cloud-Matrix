import { defineConfig } from "vitest/config";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    globals: false,
    include: ["src/app/__tests__/**/*.test.{ts,tsx}"],
    testTimeout: 10000,

    environment: "jsdom",

    setupFiles: ["src/app/__tests__/setup.ts"],

    coverage: {
      provider: "v8",
      reporter: ["text", "text-summary", "lcov", "json-summary"],
      reportsDirectory: "./coverage",
      include: [
        "src/app/lib/**/*.ts",
        "src/app/hooks/**/*.ts",
        "src/app/components/**/*.tsx",
        "src/app/types/**/*.ts",
      ],
      exclude: [
        "src/app/components/ui/**",
        "src/app/components/figma/**",
        "src/app/docs/**",
        "src/app/__tests__/**",
      ],
      thresholds: {
        lines: 80,
        functions: 70,
        branches: 80,
        statements: 80,
      },
    },
  },
});
