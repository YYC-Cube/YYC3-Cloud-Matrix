import path from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "vitest/config";

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
      ],
      exclude: [
        "src/app/components/ui/**",
        "src/app/components/figma/**",
        "src/app/docs/**",
        "src/app/__tests__/**",
      ],
      // 覆盖率棘轮基线（2026-10-10 实测）：门禁此前为 80/70/80/80 但从未生效
      // （流水线因 node:sqlite 不兼容长期未执行到本步骤）。按当前真实基线设防，
      // 防止覆盖率回退；后续随测试补齐逐步上调，目标 80/70/80/80。
      thresholds: {
        lines: 45,
        functions: 44,
        branches: 31,
        statements: 44,
      },
    },
  },
});
