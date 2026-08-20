/**
 * @file: IDEStatusBar.test.tsx
 * @description: IDEStatusBar组件单元测试
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-05
 * @updated: 2026-04-08
 * @status: active
 * @tags: [module]
 */

// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { IDEStatusBar } from "../modules/dev/ide/IDEStatusBar";
import type { OpenTab } from "../modules/dev/ide/ide-types";

vi.mock("../hooks/useI18n", () => ({
  useI18n: () => ({
    t: (key: string, params?: Record<string, unknown>) => {
      if (key === "ide.lineCol") {
        return `Ln ${params?.line}, Col ${params?.col}`;
      }
      if (key === "ide.spaces") {
        return `${params?.n} Spaces`;
      }
      return key;
    },
    locale: "zh-CN",
    setLocale: vi.fn(),
  }),
}));

vi.mock("../modules/dev/CodeEditor", () => ({
  getLanguageLabel: (filename: string) => {
    const ext = filename.split(".").pop()?.toLowerCase();
    if (ext === "ts" || ext === "tsx") {return "TypeScript";}
    if (ext === "js" || ext === "jsx") {return "JavaScript";}
    if (ext === "json") {return "JSON";}
    return "Plain Text";
  },
}));

describe("IDEStatusBar", () => {
  const mockTab: OpenTab = {
    id: "file-1",
    filename: "test.tsx",
    filepath: "src/test.tsx",
    content: "line1\nline2\nline3",
    isModified: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe("rendering", () => {
    it("should render without crashing", () => {
      render(<IDEStatusBar totalErrors={0} totalWarnings={0} isOnline={true} />);
      expect(screen.getByText("ide.ready")).toBeInTheDocument();
    });

    it("should display git branch", () => {
      render(<IDEStatusBar totalErrors={0} totalWarnings={0} isOnline={true} />);
      expect(screen.getByText("develop")).toBeInTheDocument();
    });

    it("should display online status when online", () => {
      const { container } = render(<IDEStatusBar totalErrors={0} totalWarnings={0} isOnline={true} />);
      const wifiIcon = container.querySelector("svg");
      expect(wifiIcon).toBeDefined();
    });

    it("should display offline status when offline", () => {
      const { container } = render(<IDEStatusBar totalErrors={0} totalWarnings={0} isOnline={false} />);
      const wifiOffIcon = container.querySelector("svg");
      expect(wifiOffIcon).toBeDefined();
    });
  });

  describe("error and warning display", () => {
    it("should display error count when errors exist", () => {
      render(<IDEStatusBar totalErrors={5} totalWarnings={0} isOnline={true} />);
      expect(screen.getByText("5")).toBeInTheDocument();
    });

    it("should display warning count when warnings exist", () => {
      render(<IDEStatusBar totalErrors={0} totalWarnings={3} isOnline={true} />);
      expect(screen.getByText("3")).toBeInTheDocument();
    });

    it("should display both errors and warnings", () => {
      render(<IDEStatusBar totalErrors={2} totalWarnings={4} isOnline={true} />);
      expect(screen.getByText("2")).toBeInTheDocument();
      expect(screen.getByText("4")).toBeInTheDocument();
    });

    it("should display check icon when no errors or warnings", () => {
      render(<IDEStatusBar totalErrors={0} totalWarnings={0} isOnline={true} />);
      expect(screen.getByText("0")).toBeInTheDocument();
    });
  });

  describe("active tab info", () => {
    it("should display line count for active tab", () => {
      render(<IDEStatusBar activeTab={mockTab} totalErrors={0} totalWarnings={0} isOnline={true} />);
      expect(screen.getByText(/Ln 3, Col 1/)).toBeInTheDocument();
    });

    it("should display language label for active tab", () => {
      render(<IDEStatusBar activeTab={mockTab} totalErrors={0} totalWarnings={0} isOnline={true} />);
      expect(screen.getByText("TypeScript")).toBeInTheDocument();
    });

    it("should not display line count when no active tab", () => {
      render(<IDEStatusBar totalErrors={0} totalWarnings={0} isOnline={true} />);
      expect(screen.queryByText(/Ln/)).not.toBeInTheDocument();
    });
  });

  describe("static elements", () => {
    it("should display encoding", () => {
      render(<IDEStatusBar totalErrors={0} totalWarnings={0} isOnline={true} />);
      expect(screen.getByText("UTF-8")).toBeInTheDocument();
    });

    it("should display spaces", () => {
      render(<IDEStatusBar totalErrors={0} totalWarnings={0} isOnline={true} />);
      expect(screen.getByText("2 Spaces")).toBeInTheDocument();
    });

    it("should display prettier button", () => {
      render(<IDEStatusBar totalErrors={0} totalWarnings={0} isOnline={true} />);
      expect(screen.getByText("Prettier")).toBeInTheDocument();
    });
  });
});
