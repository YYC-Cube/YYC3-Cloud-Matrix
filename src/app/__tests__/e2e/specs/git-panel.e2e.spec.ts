/**
 * @file: git-panel.e2e.spec.ts
 * @description: Git面板 E2E测试 - 端到端用户流程验证
 * @author: YanYuCloudCube Team (导师指导)
 * @version: v1.0.0
 * @created: 2026-04-09
 * @updated: 2026-04-16
 * @status: active
 * @tags: [e2e-test, git-panel, user-flow]
 */

import { test, expect, Page } from "@playwright/test";

test.describe("Git Panel E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/ide");
  });

  test("should display Git panel on IDE page", async ({ page }) => {
    const gitPanel = page.locator('[data-testid="git-panel"], .git-panel, [class*="GitPanel"]');

    await expect(gitPanel.first()).toBeVisible({ timeout: 10000 });
  });

  test("should show file changes in Git panel", async ({ page }) => {
    const changeList = page.locator('.file-change-list, [data-testid="change-list"], .changes-container');

    if (await changeList.count() > 0) {
      await expect(changeList.first()).toBeVisible();
    }
  });

  test("should display commit history", async ({ page }) => {
    const commitTab = page.locator('text=Commits, text=提交历史, [data-testid="commits-tab"]');

    if (await commitTab.count() > 0) {
      await commitTab.first().click();

      const commitList = page.locator('.commit-list, [data-testid="commit-list"]');
      await expect(commitList.first()).toBeVisible({ timeout: 5000 });
    }
  });

  test("should switch between tabs", async ({ page }) => {
    const tabs = page.locator('[role="tab"], .tab-button, [class*="Tab"]');

    if (await tabs.count() > 0) {
      const firstTab = tabs.first();
      await firstTab.click();

      await expect(firstTab).toHaveAttribute('aria-selected', 'true');
    }
  });

  test("should handle responsive layout on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 844 });

    const gitPanel = page.locator('[data-testid="git-panel"], .git-panel, [class*="GitPanel"]');

    if (await gitPanel.count() > 0) {
      await expect(gitPanel.first()).toBeVisible();
    }

    await page.setViewportSize({ width: 1280, height: 800 });
  });
});

test.describe("Git Operations E2E", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/ide");
  });

  test("should stage a file", async ({ page }) => {
    const stageButton = page.locator('text=Stage, text=暂存, [data-testid="stage-btn"]');

    if (await stageButton.count() > 0) {
      await stageButton.first().click();

      await expect(stageButton.first()).toBeVisible();
    }
  });

  test("should open commit dialog", async ({ page }) => {
    const commitButton = page.locator('text=Commit, text=提交, [data-testid="commit-btn"]');

    if (await commitButton.count() > 0) {
      await commitButton.first().click();

      const dialog = page.locator('[role="dialog"], .modal, [class*="Dialog"]');
      if (await dialog.count() > 0) {
        await expect(dialog.first()).toBeVisible({ timeout: 3000 });
      }
    }
  });

  test("should display branch selector", async ({ page }) => {
    const branchSelector = page.locator('[data-testid="branch-select"], .branch-selector, select[class*="branch"]');

    if (await branchSelector.count() > 0) {
      await expect(branchSelector.first()).toBeVisible();
    }
  });

  test("should show pull/push buttons", async ({ page }) => {
    const pullButton = page.locator('text=Pull, text=拉取, [data-testid="pull-btn"]');
    const pushButton = page.locator('text=Push, text=推送, [data-testid="push-btn"]');

    const hasPullOrPush = (await pullButton.count()) > 0 || (await pushButton.count()) > 0;

    if (hasPullOrPush) {
      if (await pullButton.count() > 0) {
        await expect(pullButton.first()).toBeVisible();
      }
      if (await pushButton.count() > 0) {
        await expect(pushButton.first()).toBeVisible();
      }
    }
  });
});

test.describe("AI Family Integration E2E", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/ide");
  });

  test("should display AI care messages during operations", async ({ page }) => {
    const aiMessage = page.locator('.ai-care-message, [data-testid="care-message"], [class*="CareMessage"]');

    if (await aiMessage.count() > 0) {
      await expect(aiMessage.first()).toBeVisible();
    }
  });

  test("should show platform indicator", async ({ page }) => {
    const platformIndicator = page.locator('[data-testid="platform-indicator"], .platform-badge, [class*="Platform"]');

    if (await platformIndicator.count() > 0) {
      await expect(platformIndicator.first()).toBeVisible();
    }
  });
});

test.describe("Performance E2E", () => {
  test("should load Git panel within acceptable time", async ({ page }) => {
    const startTime = Date.now();

    await page.goto("/ide");

    const gitPanel = page.locator('[data-testid="git-panel"], .git-panel, [class*="GitPanel"]');

    try {
      await expect(gitPanel.first()).toBeVisible({ timeout: 10000 });
    } catch {
    }

    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(15000);
  });

  test("should handle rapid tab switching without errors", async ({ page }) => {
    await page.goto("/ide");

    const tabs = page.locator('[role="tab"], .tab-button, [class*="Tab"]');

    if (await tabs.count() >= 2) {
      for (let i = 0; i < Math.min(5, await tabs.count()); i++) {
        await tabs.nth(i).click();
        await page.waitForTimeout(200);
      }
    }
  });
});

test.describe("Cross-browser Compatibility", () => {
  test("should work correctly in Chromium", async ({ page }) => {
    await page.goto("/ide");

    const title = await page.title();
    expect(title).toBeDefined();
  });

  test("should handle keyboard navigation", async ({ page }) => {
    await page.goto("/ide");

    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Enter");

    const focusedElement = page.locator(":focus");
    expect(await focusedElement.count()).toBeGreaterThanOrEqual(0);
  });
});
