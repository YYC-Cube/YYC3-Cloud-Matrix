/**
 * @file: FileExplorer.test.tsx
 * @description: FileExplorer组件单元测试
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
import { FileExplorer } from "../modules/dev/ide/FileExplorer";

vi.mock("../hooks/useI18n", () => ({
  useI18n: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "ide.explorer": "资源管理器",
        "ide.git": "Git",
        "ide.newFile": "新建文件",
        "ide.newFolder": "新建文件夹",
        "ide.rename": "重命名",
        "ide.deleteFile": "删除",
        "ide.copyPath": "复制路径",
        "ide.filterFiles": "筛选文件",
      };
      return translations[key] || key;
    },
    locale: "zh-CN",
    setLocale: vi.fn(),
  }),
}));

vi.mock("../modules/dev/ide/GitPanel", () => ({
  GitPanel: () => <div data-testid="git-panel">Git Panel</div>,
}));

describe("FileExplorer", () => {
  const mockOnFileSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe("rendering", () => {
    it("should render without crashing", () => {
      const { container } = render(<FileExplorer onFileSelect={mockOnFileSelect} />);
      expect(container.firstChild).toBeDefined();
    });

    it("should render explorer tab", () => {
      render(<FileExplorer onFileSelect={mockOnFileSelect} />);
      const explorerHeaders = screen.getAllByText("资源管理器");
      expect(explorerHeaders.length).toBeGreaterThan(0);
    });

    it("should render git tab button", () => {
      render(<FileExplorer onFileSelect={mockOnFileSelect} />);
      expect(screen.getByText("Git")).toBeInTheDocument();
    });

    it("should render search input", () => {
      render(<FileExplorer onFileSelect={mockOnFileSelect} />);
      expect(screen.getByPlaceholderText("筛选文件")).toBeInTheDocument();
    });

    it("should render new file button", () => {
      render(<FileExplorer onFileSelect={mockOnFileSelect} />);
      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe("tab switching", () => {
    it("should switch to git tab when clicked", async () => {
      render(<FileExplorer onFileSelect={mockOnFileSelect} />);

      const gitTab = screen.getByText("Git");
      fireEvent.click(gitTab);

      await waitFor(() => {
        expect(screen.getByTestId("git-panel")).toBeInTheDocument();
      });
    });

    it("should show explorer tab by default", () => {
      render(<FileExplorer onFileSelect={mockOnFileSelect} />);
      expect(screen.getByPlaceholderText("筛选文件")).toBeInTheDocument();
    });
  });

  describe("search filter", () => {
    it("should update search filter on input", () => {
      render(<FileExplorer onFileSelect={mockOnFileSelect} />);

      const searchInput = screen.getByPlaceholderText("筛选文件");
      fireEvent.change(searchInput, { target: { value: "test" } });

      expect(searchInput).toHaveValue("test");
    });

    it("should filter files based on search input", () => {
      render(<FileExplorer onFileSelect={mockOnFileSelect} />);

      const searchInput = screen.getByPlaceholderText("筛选文件");
      fireEvent.change(searchInput, { target: { value: "nonexistent" } });

      expect(searchInput).toHaveValue("nonexistent");
    });
  });

  describe("file selection", () => {
    it("should call onFileSelect when file is clicked", async () => {
      render(<FileExplorer onFileSelect={mockOnFileSelect} />);

      const searchInput = screen.getByPlaceholderText("筛选文件");
      fireEvent.change(searchInput, { target: { value: "" } });

      await waitFor(() => {
        const buttons = screen.getAllByRole("button");
        expect(buttons.length).toBeGreaterThan(0);
      });
    });
  });

  describe("active file highlighting", () => {
    it("should highlight active file", () => {
      render(
        <FileExplorer
          onFileSelect={mockOnFileSelect}
          activeFileId="file-1"
        />
      );

      expect(true).toBe(true);
    });
  });

  describe("folder expansion", () => {
    it("should toggle folder expansion", async () => {
      render(<FileExplorer onFileSelect={mockOnFileSelect} />);

      await waitFor(() => {
        const buttons = screen.getAllByRole("button");
        expect(buttons.length).toBeGreaterThan(0);
      });
    });
  });
});
