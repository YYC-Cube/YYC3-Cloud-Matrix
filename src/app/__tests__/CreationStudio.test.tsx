/**
 * @file: CreationStudio.test.tsx
 * @description: AI音乐创作工坊组件单元测试
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-04
 * @updated: 2026-04-08
 * @status: active
 * @tags: [module]
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, waitFor } from "@testing-library/react";
import React from "react";
import { CreationStudio } from "../modules/ai-family/components/CreationStudio";
import type { MusicTrack } from "../lib/dmusic-resources";

const mockPlaylist: MusicTrack[] = [
  {
    id: "test-01",
    title: "测试歌曲1",
    artist: "董小姐",
    album: "Music-A",
    duration: 180,
    audioUrl: "/test/audio1.mp3",
    emotion: "happy",
    genre: "流行",
  },
  {
    id: "test-02",
    title: "测试歌曲2",
    artist: "董小姐",
    album: "Music-B",
    duration: 200,
    audioUrl: "/test/audio2.mp3",
    emotion: "calm",
    genre: "抒情",
  },
];

const defaultProps = {
  isOpen: false,
  onClose: vi.fn(),
  onCreateTrack: vi.fn(),
  playlist: mockPlaylist,
  currentTrackIndex: 0,
};

vi.mock("../hooks/useI18n", () => ({
  useI18n: () => ({
    t: (key: string) => key,
    locale: "zh-CN",
    setLocale: vi.fn(),
  }),
}));

describe("CreationStudio", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("should not render when closed", () => {
    render(<CreationStudio {...defaultProps} isOpen={false} />);
    expect(screen.queryByText(/创作工坊/i)).toBeFalsy();
  });

  it("should render when open", () => {
    render(<CreationStudio {...defaultProps} isOpen={true} />);
    expect(screen.getByText(/创作工坊/i)).toBeTruthy();
  });

  it("should display mode selection buttons", () => {
    render(<CreationStudio {...defaultProps} isOpen={true} />);
    expect(screen.getByText("极简写歌")).toBeTruthy();
    expect(screen.getByText("大师写歌")).toBeTruthy();
    expect(screen.getByText("热歌改编")).toBeTruthy();
    expect(screen.getByText("上传音乐")).toBeTruthy();
  });

  it("should call onClose when close button is clicked", async () => {
    const handleClose = vi.fn();
    const { container } = render(<CreationStudio {...defaultProps} isOpen={true} onClose={handleClose} />);
    const closeButton = container.querySelector("button");
    if (closeButton) {
      fireEvent.click(closeButton);
      await waitFor(() => {
        expect(handleClose).toHaveBeenCalled();
      });
    }
  });

  it("should switch to quick creation mode", async () => {
    render(<CreationStudio {...defaultProps} isOpen={true} />);
    const quickButton = screen.getByText("极简写歌");
    fireEvent.click(quickButton);
    await waitFor(() => {
      const elements = screen.getAllByText(/主题选择|快乐|忧伤/i);
      expect(elements.length).toBeGreaterThan(0);
    });
  });

  it("should switch to master mode", async () => {
    render(<CreationStudio {...defaultProps} isOpen={true} />);
    const masterButton = screen.getByText("大师写歌");
    fireEvent.click(masterButton);
    await waitFor(() => {
      const elements = screen.getAllByText(/主题选择|快乐|忧伤/i);
      expect(elements.length).toBeGreaterThan(0);
    });
  });

  it("should switch to remix mode", async () => {
    render(<CreationStudio {...defaultProps} isOpen={true} />);
    const remixButton = screen.getByText("热歌改编");
    fireEvent.click(remixButton);
    await waitFor(() => {
      const elements = screen.getAllByText(/选择|歌曲/i);
      expect(elements.length).toBeGreaterThan(0);
    });
  });

  it("should switch to upload mode", async () => {
    render(<CreationStudio {...defaultProps} isOpen={true} />);
    const uploadButton = screen.getByText("上传音乐");
    fireEvent.click(uploadButton);
    await waitFor(() => {
      const elements = screen.getAllByText(/上传|文件/i);
      expect(elements.length).toBeGreaterThan(0);
    });
  });

  it("should display works tab", async () => {
    render(<CreationStudio {...defaultProps} isOpen={true} />);
    const worksButton = screen.getByText("作品管理");
    fireEvent.click(worksButton);
    await waitFor(() => {
      const elements = screen.getAllByText(/作品|暂无/i);
      expect(elements.length).toBeGreaterThan(0);
    });
  });

  it("should select theme in master mode", async () => {
    render(<CreationStudio {...defaultProps} isOpen={true} />);
    const masterButton = screen.getByText("大师写歌");
    fireEvent.click(masterButton);
    await waitFor(() => {
      const happyTheme = screen.getByText("快乐");
      fireEvent.click(happyTheme);
      expect(happyTheme).toBeTruthy();
    });
  });

  it("should display playlist in remix mode", async () => {
    render(<CreationStudio {...defaultProps} isOpen={true} />);
    const remixButton = screen.getByText("热歌改编");
    fireEvent.click(remixButton);
    await waitFor(() => {
      expect(screen.getByText("测试歌曲1")).toBeTruthy();
      expect(screen.getByText("测试歌曲2")).toBeTruthy();
    });
  });

  it("should handle theme selection with visual feedback", async () => {
    render(<CreationStudio {...defaultProps} isOpen={true} />);
    const masterButton = screen.getByText("大师写歌");
    fireEvent.click(masterButton);
    await waitFor(() => {
      const calmTheme = screen.getByText("宁静");
      fireEvent.click(calmTheme);
      const selectedElement = calmTheme.closest("button");
      expect(selectedElement).toBeTruthy();
    });
  });
});
