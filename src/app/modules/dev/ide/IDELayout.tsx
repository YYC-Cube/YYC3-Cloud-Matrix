/**
 * @file: IDELayout.tsx
 * @description: IDELayout.tsx
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-08
 * @updated: 2026-04-08
 * @status: active
 * @tags: [component]
 */

import * as React from "react";
import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { useI18n } from "../../../hooks/useI18n";
import { useIDESettingsSlice } from "../../../store/slices/ide-settings-slice";
import { IDETopBar } from "./IDETopBar";
import { IDEViewSwitcher } from "./IDEViewSwitcher";
import { AIChatPanel } from "./AIChatPanel";
import { FileExplorer } from "./FileExplorer";
import { CodePreviewPanel } from "./CodePreviewPanel";
import { IDETerminal } from "./IDETerminal";
import { IDEStatusBar } from "./IDEStatusBar";
import { MOCK_FILE_CONTENTS, MOCK_NOTIFICATIONS } from "./ide-mock-data";
import { AI_MODELS } from "./ide-mock-data";
import type { IDEViewMode, OpenTab } from "./ide-types";
import { LayoutProvider } from "./LayoutContext";
import { Workspace } from "./Workspace";
import type { PanelType } from "./ide-layout-types";

// ─── 自定义可分割容器 (替代 react-resizable-panels) ───────────────
//
// 基于 /Volumes/Knowledge/ide/PanelManager.tsx 的 SplitContainer 实现
// 使用直接的 mouse 事件处理拖拽调整，不依赖第三方库

interface SplitContainerProps {
  direction: "horizontal" | "vertical";
  children: React.ReactNode;
  defaultSizes?: number[];
  minSizes?: number[];
  className?: string;
}

/**
 * SplitContainer — 可拖拽分割容器
 *
 * 支持水平/垂直方向分割，子元素之间插入可拖拽的分隔条。
 * 拖拽时通过 mousedown → mousemove → mouseup 事件链实时调整子元素大小。
 */
function SplitContainer({
  direction,
  children,
  defaultSizes: defaultSizesProp,
  minSizes: minSizesProp,
  className,
}: SplitContainerProps) {
  const childArray = React.Children.toArray(children);
  const count = childArray.length;
  const isHorizontal = direction === "horizontal";

  const [sizes, setSizes] = useState<number[]>(
    defaultSizesProp || Array(count).fill(100 / count),
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const dragInfo = useRef<{
    index: number;
    startPos: number;
    startSizes: number[];
  } | null>(null);

  // Sync sizes when children count changes
  useEffect(() => {
    setSizes(defaultSizesProp || Array(count).fill(100 / count));
  }, [count]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleResizeStart = useCallback(
    (index: number, e: React.MouseEvent) => {
      e.preventDefault();
      const startPos = isHorizontal ? e.clientX : e.clientY;
      dragInfo.current = { index, startPos, startSizes: [...sizes] };

      const handleMove = (ev: MouseEvent) => {
        if (!dragInfo.current || !containerRef.current) {return;}
        const containerRect = containerRef.current.getBoundingClientRect();
        const totalSize = isHorizontal
          ? containerRect.width
          : containerRect.height;
        const currentPos = isHorizontal ? ev.clientX : ev.clientY;
        const delta = currentPos - dragInfo.current.startPos;
        const deltaPct = (delta / totalSize) * 100;

        const newSizes = [...dragInfo.current.startSizes];
        const minSize = minSizesProp ? (minSizesProp[index] || 5) : 5;
        const minSizeNext = minSizesProp ? (minSizesProp[index + 1] || 5) : 5;

        newSizes[index] = Math.max(
          minSize,
          dragInfo.current.startSizes[index] + deltaPct,
        );
        newSizes[index + 1] = Math.max(
          minSizeNext,
          dragInfo.current.startSizes[index + 1] - deltaPct,
        );

        // Clamp: ensure neither panel goes below its minimum
        if (newSizes[index] < minSize) {
          newSizes[index + 1] += newSizes[index] - minSize;
          newSizes[index] = minSize;
        }
        if (newSizes[index + 1] < minSizeNext) {
          newSizes[index] += newSizes[index + 1] - minSizeNext;
          newSizes[index + 1] = minSizeNext;
        }

        setSizes(newSizes);
      };

      const handleUp = () => {
        dragInfo.current = null;
        window.removeEventListener("mousemove", handleMove);
        window.removeEventListener("mouseup", handleUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };

      document.body.style.cursor = isHorizontal ? "col-resize" : "row-resize";
      document.body.style.userSelect = "none";
      window.addEventListener("mousemove", handleMove);
      window.addEventListener("mouseup", handleUp);
    },
    [sizes, isHorizontal, minSizesProp],
  );

  const sizeProp = isHorizontal ? "width" : "height";
  const minSizeProp = isHorizontal ? "minWidth" : "minHeight";

  return (
    <div
      ref={containerRef}
      className={`size-full flex ${isHorizontal ? "flex-row" : "flex-col"} ${className || ""}`}
    >
      {childArray.map((child, i) => (
        <React.Fragment key={i}>
          <div
            style={{
              [sizeProp]: `${sizes[i] || 100 / count}%`,
              [minSizeProp]: "60px",
            }}
            className="relative overflow-hidden"
          >
            {child}
          </div>
          {i < count - 1 && (
            <div
              onMouseDown={(e) => handleResizeStart(i, e)}
              className={`flex-shrink-0 z-10 transition-colors ${
                isHorizontal
                  ? "w-[3px] cursor-col-resize hover:bg-[rgba(0,212,255,0.25)]"
                  : "h-[3px] cursor-row-resize hover:bg-[rgba(0,212,255,0.25)]"
              }`}
              style={{ background: "rgba(0,180,255,0.1)" }}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

export function IDELayout() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [viewMode, setViewMode] = useState<IDEViewMode>("default");
  const layoutMode = useIDESettingsSlice((s) => s.layoutMode);
  const setLayoutMode = useIDESettingsSlice((s) => s.setLayoutMode);
  const [selectedModel, setSelectedModel] = useState(AI_MODELS[0].id);
  const [openTabs, setOpenTabs] = useState<OpenTab[]>([]);
  const [activeTabId, setActiveTabId] = useState("");
  const [terminalCollapsed, setTerminalCollapsed] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [_showNotifications, setShowNotifications] = useState(false);
  const [_showSettings, setShowSettings] = useState(false);
  const [_showDeploy, setShowDeploy] = useState(false);
  const [_showShare, setShowShare] = useState(false);

  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const handleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => { /* 全屏退出失败时忽略 */ });
    } else {
      document.documentElement.requestFullscreen().catch(() => { /* 全屏请求失败时忽略 */ });
    }
  }, []);

  const handleFileSelect = useCallback((fileId: string, filename: string) => {
    const existing = openTabs.find((t) => t.id === fileId);
    if (existing) {
      setActiveTabId(fileId);
      return;
    }

    const content = MOCK_FILE_CONTENTS[fileId] || `// ${filename}\n// File content placeholder\n`;
    const newTab: OpenTab = {
      id: fileId,
      filename,
      filepath: `src/${filename}`,
      content,
      isModified: false,
    };
    setOpenTabs((prev) => [...prev, newTab]);
    setActiveTabId(fileId);
  }, [openTabs]);

  const handleTabSelect = useCallback((tabId: string) => {
    setActiveTabId(tabId);
  }, []);

  const handleTabClose = useCallback((tabId: string) => {
    setOpenTabs((prev) => {
      const next = prev.filter((t) => t.id !== tabId);
      if (activeTabId === tabId && next.length > 0) {
        setActiveTabId(next[next.length - 1].id);
      } else if (next.length === 0) {
        setActiveTabId("");
      }
      return next;
    });
  }, [activeTabId]);

  const handleContentChange = useCallback((tabId: string, content: string) => {
    setOpenTabs((prev) =>
      prev.map((t) => (t.id === tabId ? { ...t, content, isModified: true } : t))
    );
  }, []);

  const _handleAddPanel = useCallback((type: PanelType) => {
    console.info('Adding panel in layout mode:', layoutMode, 'type:', type);
  }, [layoutMode]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "1") {
        e.preventDefault();
        setViewMode((m) => (m === "preview" ? "default" : "preview"));
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "2") {
        e.preventDefault();
        setViewMode((m) => (m === "code" ? "default" : "code"));
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "F") {
        e.preventDefault();
        setShowSearch((s) => !s);
      }
      if (e.key === "Escape") {
        setShowSearch(false);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "`") {
        e.preventDefault();
        setTerminalCollapsed((c) => !c);
      }
      // Ctrl+3 to toggle layout mode
      if ((e.ctrlKey || e.metaKey) && e.key === "3") {
        e.preventDefault();
        setLayoutMode(
          layoutMode === "edit" ? "preview" : layoutMode === "preview" ? "free" : "edit"
        );
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [layoutMode, setLayoutMode, viewMode]);

  // Determine panel visibility based on view mode
  const showLeftPanel = viewMode !== "code";
  const showCenterPanel = viewMode !== "preview";

  // Terminal component (reused in both layouts)
  const terminalElement = (
    <IDETerminal
      isCollapsed={terminalCollapsed}
      onToggleCollapse={() => setTerminalCollapsed((c) => !c)}
    />
  );

  // Code editor component (reused)
  const codeEditorElement = (
    <CodePreviewPanel
      openTabs={openTabs}
      activeTabId={activeTabId}
      onTabSelect={handleTabSelect}
      onTabClose={handleTabClose}
      onContentChange={handleContentChange}
    />
  );

  /**
   * 编辑模式布局:
   * ┌──────────┬─────────────┬──────────────────┐
   * │ AI Chat  │ File Explorer│ Code Editor      │
   * │ (25%)    │ (45%)       │ (30%)            │
   * │          │             ├──────────────────┤
   * │          │             │ Terminal          │
   * └──────────┴─────────────┴──────────────────┘
   * 终端仅在右栏(代码编辑器下方)
   */
  const renderEditModeLayout = () => {
    const panels: React.ReactNode[] = [];
    const sizes: number[] = [];
    const mins: number[] = [];

    if (showLeftPanel) {
      panels.push(<AIChatPanel key="ai" />);
      sizes.push(25);
      mins.push(15);
    }
    if (showCenterPanel) {
      panels.push(
        <FileExplorer
          key="explorer"
          onFileSelect={handleFileSelect}
          activeFileId={activeTabId}
        />
      );
      sizes.push(showLeftPanel ? 45 : 55);
      mins.push(15);
    }

    // Right panel: code editor + terminal (vertical split)
    panels.push(
      <SplitContainer key="right" direction="vertical"
        defaultSizes={[terminalCollapsed ? 95 : 70, terminalCollapsed ? 5 : 30]}
        minSizes={[20, 3]}
      >
        {codeEditorElement}
        {terminalElement}
      </SplitContainer>
    );
    sizes.push(showLeftPanel && showCenterPanel ? 30 : showCenterPanel ? 45 : 75);
    mins.push(15);

    return (
      <SplitContainer direction="horizontal" defaultSizes={sizes} minSizes={mins} className="h-full">
        {panels}
      </SplitContainer>
    );
  };

  /**
   * 预览模式布局:
   * ┌──────────┬─────────────────────────────────┐
   * │ AI Chat  │ File Explorer │ Code Editor      │
   * │ (25%)    │ (45% of 75%) │ (55% of 75%)    │
   * │          ├──────────────┴──────────────────┤
   * │          │ Terminal (spans center+right)     │
   * └──────────┴──────────────────────────────────┘
   * 终端跨越中栏+右栏
   */
  const renderPreviewModeLayout = () => {
    // Build the top area panels (file explorer + code editor)
    const topPanels: React.ReactNode[] = [];
    const topSizes: number[] = [];
    const topMins: number[] = [];

    if (showCenterPanel) {
      topPanels.push(
        <FileExplorer
          key="explorer"
          onFileSelect={handleFileSelect}
          activeFileId={activeTabId}
        />
      );
      topSizes.push(40);
      topMins.push(15);
    }
    topPanels.push(<React.Fragment key="code">{codeEditorElement}</React.Fragment>);
    topSizes.push(showCenterPanel ? 60 : 100);
    topMins.push(20);

    // Main area: left AI chat + (top editors + bottom terminal)
    const mainContent = (
      <SplitContainer direction="vertical"
        defaultSizes={[terminalCollapsed ? 95 : 70, terminalCollapsed ? 5 : 30]}
        minSizes={[20, 3]}
      >
        <SplitContainer direction="horizontal" defaultSizes={topSizes} minSizes={topMins}>
          {topPanels}
        </SplitContainer>
        {terminalElement}
      </SplitContainer>
    );

    if (showLeftPanel) {
      return (
        <SplitContainer direction="horizontal" defaultSizes={[25, 75]} minSizes={[15, 30]} className="h-full">
          <AIChatPanel />
          {mainContent}
        </SplitContainer>
      );
    }

    return (
      <div className="h-full">
        {mainContent}
      </div>
    );
  };

  /**
   * 自由模式布局:
   * ┌─────────────────────────────────────────────┐
   * │ 可拖拽面板系统 - 完全自定义布局            │
   * │ 支持面板拖拽、调整大小、最小化、最大化等   │
   * └─────────────────────────────────────────────┘
   */
  const renderFreeModeLayout = () => (
    <LayoutProvider>
      <Workspace />
    </LayoutProvider>
  );

  return (
    <div
      className="flex flex-col w-full h-full"
      style={{
        background: "linear-gradient(180deg, rgba(4,10,22,0.98) 0%, rgba(6,14,31,0.95) 100%)",
        minHeight: 0,
      }}
    >
      {/* Top Bar */}
      <IDETopBar
        projectName="YYC-IDE"
        onBack={handleBack}
        selectedModel={selectedModel}
        onModelChange={setSelectedModel}
        onNotificationsClick={() => setShowNotifications((s) => !s)}
        onSettingsClick={() => setShowSettings((s) => !s)}
        onShareClick={() => setShowShare(true)}
        onDeployClick={() => setShowDeploy(true)}
        unreadCount={MOCK_NOTIFICATIONS.filter((n) => !n.read).length}
      />

      {/* View Switcher with layout mode */}
      <IDEViewSwitcher
        viewMode={viewMode}
        onViewChange={setViewMode}
        layoutMode={layoutMode}
        onLayoutModeChange={setLayoutMode}
        onSearch={() => setShowSearch((s) => !s)}
        onFullscreen={handleFullscreen}
      />

      {/* Search overlay */}
      {showSearch && (
        <div
          className="flex items-center px-3 py-1.5 shrink-0"
          style={{ background: "rgba(6,14,31,0.9)", borderBottom: "1px solid rgba(0,180,255,0.1)" }}
        >
          <input
            type="text"
            placeholder={`${t("ide.search")}... (Esc)`}
            className="flex-1 bg-[rgba(0,40,80,0.3)] text-[#e0f0ff] placeholder-[rgba(0,212,255,0.25)] px-3 py-1.5 rounded-md border border-[rgba(0,180,255,0.15)] outline-none focus:border-[#00d4ff] transition-all"
            style={{ fontSize: "0.72rem" }}
            autoFocus
            onKeyDown={(e) => e.key === "Escape" && setShowSearch(false)}
          />
        </div>
      )}

      {/* Layout mode indicator */}
      <div
        className="flex items-center justify-center shrink-0"
        style={{
          height: "18px",
          background: layoutMode === "edit"
            ? "linear-gradient(90deg, transparent 0%, rgba(0,212,255,0.05) 50%, transparent 100%)"
            : layoutMode === "preview"
            ? "linear-gradient(90deg, transparent 0%, rgba(0,255,136,0.05) 50%, transparent 100%)"
            : "linear-gradient(90deg, transparent 0%, rgba(255,193,7,0.05) 50%, transparent 100%)",
          borderBottom: "1px solid rgba(0,180,255,0.05)",
        }}
      >
        <span
          className="text-[rgba(0,212,255,0.3)]"
          style={{ fontSize: "0.5rem", letterSpacing: "1px" }}
        >
          {layoutMode === "edit" ? t("ide.editModeDesc") : layoutMode === "preview" ? t("ide.previewModeDesc") : t("ide.freeModeDesc")}
        </span>
      </div>

      {/* Main Content Area - conditional layout based on layoutMode */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {layoutMode === "free" ? renderFreeModeLayout() : layoutMode === "edit" ? renderEditModeLayout() : renderPreviewModeLayout()}
      </div>

      {/* Status Bar */}
      <IDEStatusBar
        activeTab={openTabs.find((t) => t.id === activeTabId)}
        totalErrors={0}
        totalWarnings={1}
        isOnline={true}
      />
    </div>
  );
}
