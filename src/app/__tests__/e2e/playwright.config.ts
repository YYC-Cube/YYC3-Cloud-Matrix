/**
 * @file: playwright.config.ts
 * @description: playwright.config.ts
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-08
 * @updated: 2026-04-08
 * @status: active
 * @tags: [module]
 */

// import { defineConfig, devices } from "@playwright/test";

export const playwrightConfig = {
  testDir: "./specs",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ["html", { outputFolder: "../../reports/playwright" }],
    ["json", { outputFile: "../../reports/playwright/results.json" }],
  ],
  use: {
    baseURL: "http://192.168.3.45:3118",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { browserName: "chromium" as const },
    },
    {
      name: "firefox",
      use: { browserName: "firefox" as const },
    },
    {
      name: "webkit",
      use: { browserName: "webkit" as const },
    },
    {
      name: "Mobile Chrome",
      use: {
        browserName: "chromium" as const,
        viewport: { width: 390, height: 844 },
        isMobile: true,
      },
    },
  ],
  webServer: {
    command: "pnpm dev --port 3118",
    url: "http://192.168.3.45:3118",
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
};

export default playwrightConfig;
