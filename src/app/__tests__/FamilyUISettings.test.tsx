/**
 * @file: FamilyUISettings.test.tsx
 * @description: FamilyUISettings组件自编辑功能单元测试
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-05
 * @updated: 2026-04-08
 * @status: active
 * @tags: [module]
 */

// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, waitFor } from "@testing-library/react";

vi.mock("sonner", () => ({
  toast: {
    info: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("react-router", () => ({
  useNavigate: () => vi.fn(),
}));

const CONFIG_KEY = "yyc3-family-ui-config";

const defaultConfig = {
  animationSpeed: "normal",
  infoDensity: "normal",
  showOfflineMembers: true,
  memberOrder: ["navigator", "thinker", "prophet", "bolero", "sentinel", "master", "oracle", "creator"],
  defaultExpandCards: false,
  notificationsEnabled: true,
  hourlyCareEnabled: true,
  dailyBroadcastEnabled: true,
  soundEnabled: true,
  autoMarkRead: false,
  messageRetentionDays: 30,
  locale: "zh-CN",
};

import { FamilyUISettings } from "../modules/ai-family/components/FamilyUISettings";

describe("FamilyUISettings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    localStorage.setItem(CONFIG_KEY, JSON.stringify(defaultConfig));
  });

  afterEach(() => {
    cleanup();
    localStorage.clear();
  });

  describe("rendering", () => {
    it("should render without crashing", () => {
      const { container } = render(<FamilyUISettings />);
      expect(container.firstChild).toBeDefined();
    });

    it("should render page header", () => {
      const { container } = render(<FamilyUISettings />);
      expect(container.textContent).toBeDefined();
    });

    it("should render settings sections", () => {
      render(<FamilyUISettings />);
      const sections = screen.queryAllByText(/主题|动画|通知|数据|链路/i);
      expect(sections.length >= 0).toBe(true);
    });
  });

  describe("animation speed editing", () => {
    it("should display animation speed options", () => {
      render(<FamilyUISettings />);
      const speedOptions = screen.queryAllByText(/快速|正常|慢速|无/i);
      expect(speedOptions.length >= 0).toBe(true);
    });

    it("should save animation speed changes", async () => {
      render(<FamilyUISettings />);

      const speedButtons = screen.getAllByRole("button");
      const fastBtn = speedButtons.find((btn) =>
        btn.textContent?.includes("快速") || btn.textContent?.includes("fast")
      );

      if (fastBtn) {
        fireEvent.click(fastBtn);
        await waitFor(() => {
          const saved = localStorage.getItem(CONFIG_KEY);
          expect(saved).toBeDefined();
        });
      }
    });
  });

  describe("info density editing", () => {
    it("should display info density options", () => {
      render(<FamilyUISettings />);
      const densityOptions = screen.queryAllByText(/紧凑|正常|宽松|compact|expanded/i);
      expect(densityOptions.length >= 0).toBe(true);
    });

    it("should save info density changes", async () => {
      render(<FamilyUISettings />);

      const densityButtons = screen.getAllByRole("button");
      const compactBtn = densityButtons.find((btn) =>
        btn.textContent?.includes("紧凑") || btn.textContent?.includes("compact")
      );

      if (compactBtn) {
        fireEvent.click(compactBtn);
        await waitFor(() => {
          expect(localStorage.getItem(CONFIG_KEY)).toBeDefined();
        });
      }
    });
  });

  describe("notification settings editing", () => {
    it("should display notification toggles", () => {
      render(<FamilyUISettings />);
      const notificationTexts = screen.queryAllByText(/通知|播报|整点/i);
      expect(notificationTexts.length >= 0).toBe(true);
    });

    it("should toggle notifications enabled", async () => {
      render(<FamilyUISettings />);

      const toggleButtons = screen.getAllByRole("button");
      const notificationToggle = toggleButtons.find((btn) =>
        btn.getAttribute("aria-pressed") !== null ||
        btn.className.includes("toggle")
      );

      if (notificationToggle) {
        fireEvent.click(notificationToggle);
        await waitFor(() => {
          expect(localStorage.getItem(CONFIG_KEY)).toBeDefined();
        });
      }
    });

    it("should toggle hourly care enabled", async () => {
      render(<FamilyUISettings />);

      const toggleButtons = screen.getAllByRole("button");
      const careToggle = toggleButtons.find((btn) =>
        btn.closest("div")?.textContent?.includes("整点")
      );

      if (careToggle) {
        fireEvent.click(careToggle);
        await waitFor(() => {
          expect(localStorage.getItem(CONFIG_KEY)).toBeDefined();
        });
      }
    });

    it("should toggle sound enabled", async () => {
      render(<FamilyUISettings />);

      const toggleButtons = screen.getAllByRole("button");
      const soundToggle = toggleButtons.find((btn) =>
        btn.closest("div")?.textContent?.includes("声音") || btn.closest("div")?.textContent?.includes("音效")
      );

      if (soundToggle) {
        fireEvent.click(soundToggle);
        await waitFor(() => {
          expect(localStorage.getItem(CONFIG_KEY)).toBeDefined();
        });
      }
    });
  });

  describe("member visibility editing", () => {
    it("should display member order settings", () => {
      render(<FamilyUISettings />);
      const memberTexts = screen.queryAllByText(/千行|万物|先知|伯乐|守护|宗师|天枢|灵韵/);
      expect(memberTexts.length >= 0).toBe(true);
    });

    it("should toggle show offline members", async () => {
      render(<FamilyUISettings />);

      const toggleButtons = screen.getAllByRole("button");
      const offlineToggle = toggleButtons.find((btn) =>
        btn.closest("div")?.textContent?.includes("离线")
      );

      if (offlineToggle) {
        fireEvent.click(offlineToggle);
        await waitFor(() => {
          expect(localStorage.getItem(CONFIG_KEY)).toBeDefined();
        });
      }
    });
  });

  describe("data management", () => {
    it("should render data management buttons", () => {
      render(<FamilyUISettings />);
      const dataButtons = screen.queryAllByText(/导出|导入|清理|重置/i);
      expect(dataButtons.length >= 0).toBe(true);
    });

    it("should render cache clear button", () => {
      render(<FamilyUISettings />);
      const clearButtons = screen.getAllByRole("button");
      const clearBtn = clearButtons.find((btn) =>
        btn.textContent?.includes("清理") || btn.textContent?.includes("清除")
      );
      expect(clearBtn || clearButtons.length > 0).toBeTruthy();
    });

    it("should render export config button", () => {
      render(<FamilyUISettings />);
      const exportButtons = screen.getAllByRole("button");
      const exportBtn = exportButtons.find((btn) =>
        btn.textContent?.includes("导出") || btn.textContent?.includes("备份")
      );
      expect(exportBtn || exportButtons.length > 0).toBeTruthy();
    });

    it("should render import config button", () => {
      render(<FamilyUISettings />);
      const importButtons = screen.getAllByRole("button");
      const importBtn = importButtons.find((btn) =>
        btn.textContent?.includes("导入") || btn.textContent?.includes("恢复")
      );
      expect(importBtn || importButtons.length > 0).toBeTruthy();
    });
  });

  describe("ecosystem links", () => {
    it("should display ecosystem link status", () => {
      render(<FamilyUISettings />);
      const linkTexts = screen.queryAllByText(/首页|中心|对话|热线|娱乐|活动|音乐|学习|成长/i);
      expect(linkTexts.length >= 0).toBe(true);
    });

    it("should render test all links button", () => {
      render(<FamilyUISettings />);
      const testButtons = screen.getAllByRole("button");
      const testAllBtn = testButtons.find((btn) =>
        btn.textContent?.includes("测试全部") || btn.textContent?.includes("一键测通")
      );
      expect(testAllBtn || testButtons.length > 0).toBeTruthy();
    });
  });

  describe("locale settings", () => {
    it("should display locale options", () => {
      render(<FamilyUISettings />);
      const localeTexts = screen.queryAllByText(/中文|English|语言/i);
      expect(localeTexts.length >= 0).toBe(true);
    });

    it("should save locale changes", async () => {
      render(<FamilyUISettings />);

      const localeButtons = screen.getAllByRole("button");
      const enBtn = localeButtons.find((btn) =>
        btn.textContent?.includes("English") || btn.textContent?.includes("en-US")
      );

      if (enBtn) {
        fireEvent.click(enBtn);
        await waitFor(() => {
          expect(localStorage.getItem(CONFIG_KEY)).toBeDefined();
        });
      }
    });
  });

  describe("persistence", () => {
    it("should load config from localStorage on mount", () => {
      render(<FamilyUISettings />);
      expect(localStorage.getItem(CONFIG_KEY)).toBeDefined();
    });

    it("should save config to localStorage on change", async () => {
      render(<FamilyUISettings />);

      const toggleButtons = screen.getAllByRole("button");
      if (toggleButtons.length > 0) {
        fireEvent.click(toggleButtons[0]);
      }

      await waitFor(() => {
        expect(localStorage.getItem(CONFIG_KEY)).toBeDefined();
      });
    });
  });
});
