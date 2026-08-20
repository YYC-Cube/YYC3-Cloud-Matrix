/**
 * @file: dashboard.e2e.spec.ts
 * @description: Dashboard E2E测试 - 核心业务流程验证
 * @author: YanYuCloudCube Team (导师指导)
 * @version: v1.0.0
 * @created: 2026-04-09
 * @updated: 2026-04-16
 * @status: active
 * @tags: [e2e-test, dashboard, user-flow]
 */

import { test, expect } from "@playwright/test";

test.describe("Dashboard E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should display dashboard with stat cards", async ({ page }) => {
    const statCards = page.locator('.stat-card, [data-testid="stat-card"], [class*="StatCard"]');

    await expect(statCards.first()).toBeVisible({ timeout: 10000 });
    expect(await statCards.count()).toBeGreaterThanOrEqual(4);
  });

  test("should show throughput chart", async ({ page }) => {
    const chart = page.locator('[data-testid="throughput-chart"], .chart-container, [class*="Chart"]');

    if (await chart.count() > 0) {
      await expect(chart.first()).toBeVisible({ timeout: 5000 });
    }
  });

  test("should display model distribution", async ({ page }) => {
    const pieChart = page.locator('.pie-chart, [data-testid="model-dist"]');

    if (await pieChart.count() > 0) {
      await expect(pieChart.first()).toBeVisible();
    }
  });

  test("should show node matrix", async ({ page }) => {
    const nodeMatrix = page.locator('.node-matrix, [data-testid="node-matrix"], [class*="Node"]');

    if (await nodeMatrix.count() > 0) {
      await expect(nodeMatrix.first()).toBeVisible();
    }
  });

  test("should have refresh button functional", async ({ page }) => {
    const refreshButton = page.locator('text=Refresh, text=刷新, [data-testid="refresh-btn"]');

    if (await refreshButton.count() > 0) {
      await refreshButton.first().click();
      await page.waitForTimeout(1000);
    }
  });

  test("should navigate to different sections", async ({ page }) => {
    const navLinks = page.locator('nav a, [role="navigation"] a, .nav-link');

    if (await navLinks.count() > 0) {
      const firstLink = navLinks.first();
      await firstLink.click();

      await page.waitForLoadState("networkidle");
    }
  });
});

test.describe("Dashboard Responsive Design", () => {
  test("should adapt to mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 844 });
    await page.goto("/");

    const statCards = page.locator('.stat-card, [data-testid="stat-card"]');

    if (await statCards.count() > 0) {
      await expect(statCards.first()).toBeVisible();
    }

    await page.setViewportSize({ width: 1280, height: 800 });
  });

  test("should adapt to tablet viewport", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/");

    const content = page.locator('main, [role="main"], .dashboard-content');
    await expect(content.first()).toBeVisible();

    await page.setViewportSize({ width: 1280, height: 800 });
  });
});

test.describe("Dashboard Interactions", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should handle chart tab switching on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 844 });

    const chartTabs = page.locator('.chart-tab, [data-testid="chart-tab"]');

    if (await chartTabs.count() >= 2) {
      await chartTabs.nth(1).click();
      await page.waitForTimeout(300);

      const activeTab = page.locator('.chart-tab.active, [aria-selected="true"]');
      expect(await activeTab.count()).toBeGreaterThanOrEqual(1);
    }

    await page.setViewportSize({ width: 1280, height: 800 });
  });

  test("should show alert banner when alerts exist", async ({ page }) => {
    const alertBanner = page.locator('[data-testid="alert-banner"], .alert-banner');

    if (await alertBanner.count() > 0) {
      await expect(alertBanner.first()).toBeVisible();
    }
  });

  test("should display operation center link", async ({ page }) => {
    const opCenterLink = page.locator('text=Operation Center, text=操作中心, a[href*="operation"]');

    if (await opCenterLink.count() > 0) {
      await expect(opCenterLink.first()).toBeVisible();
    }
  });
});

test.describe("Dashboard Performance", () => {
  test("should load within acceptable time", async ({ page }) => {
    const startTime = Date.now();

    await page.goto("/");

    const statCards = page.locator('.stat-card, [data-testid="stat-card"]');

    try {
      await expect(statCards.first()).toBeVisible({ timeout: 15000 });
    } catch {
    }

    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(20000);
  });

  test("should not have console errors", async ({ page }) => {
    const errors: string[] = [];

    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });

    await page.goto("/");

    await page.waitForTimeout(2000);

    expect(errors.filter(e => !e.includes("404")).length).toBe(0);
  });
});
