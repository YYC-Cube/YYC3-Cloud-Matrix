/**
 * @file: LayoutContext.test.tsx
 * @description: IDE 布局核心 Context 单元测试 · LayoutProvider / useLayoutContext
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-08-19
 * @updated: 2026-08-19
 * @status: active
 * @tags: [test],[ide],[layout],[context],[react-context]
 *
 * @vitest-environment jsdom
 *
 * @brief: 针对 LayoutContext（623 行 IDE 布局核心 Context）的全面单元测试
 *
 * @details:
 *  - 使用真实 React Context 模式：包装 LayoutProvider 后渲染子组件消费 context value
 *  - 严格按 LayoutContextType 暴露的实际方法写断言，不臆测 API
 *  - 涉及拖拽 / 尺寸调整时使用 fireEvent 模拟 MouseEvent，不触发 ResizeObserver
 *  - 断言 state 变化通过 act + renderHook 组合验证重新渲染
 *
 * 测试范围（10 个用例）：
 *  1. LayoutProvider 正常挂载并暴露默认 state
 *  2. useLayoutContext 在 Provider 内调用不抛错，Provider 外抛错
 *  3. 默认面板布局：3 个预置面板 + grid 布局 + 正确选中项
 *  4. addPanel：添加新面板，panels 数量 +1，zIndex 自动递增
 *  5. removePanel：移除面板，panels 数量 -1；保留最后 1 个面板不删
 *  6. selectPanel / updatePanel：切换选中 + 最小化/最大化（打开/关闭面板）
 *  7. updateLayoutConfig：切换布局 preset（grid → split → tabs → custom）
 *  8. startResize → onResize → endResize：调整面板尺寸（se 方向）
 *  9. startDrag → onDrag → endDrag：拖拽面板调整位置（snapToGrid 生效）
 *  10. resetLayout：清空 panels，layout 重置为 split
 */

import * as React from 'react';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, renderHook, act, cleanup } from '@testing-library/react';
import { LayoutProvider, useLayoutContext } from '../modules/dev/ide/LayoutContext';
import { useIDESettingsSlice } from '../store/slices/ide-settings-slice';
import type { Panel, LayoutConfig } from '../modules/dev/ide/ide-layout-types';

// ============================================================
// Mock 依赖：useIDESettingsSlice
// ============================================================

vi.mock('../store/slices/ide-settings-slice', () => ({
  useIDESettingsSlice: {
    getState: vi.fn(() => ({
      layoutConfig: null,
      setLayoutConfig: vi.fn(),
    })),
    setState: vi.fn(),
    subscribe: vi.fn(),
  },
}));

// ============================================================
// 辅助组件：消费 Context 并把 value 挂到 ref 上方便断言
// ============================================================

type ContextValue = ReturnType<typeof useLayoutContext>;

interface ContextCaptureHandle {
  captureRef: { current: ContextValue | null };
}

function ContextCapture({ captureRef }: ContextCaptureHandle) {
  const ctx = useLayoutContext();
  captureRef.current = ctx;
  return <div data-testid="ctx-mounted">ok</div>;
}

// ============================================================
// 工具函数：构造一个 MouseEvent（兼容 jsdom）
// ============================================================

function makeMouseEvent(clientX = 0, clientY = 0): MouseEvent {
  return { clientX, clientY } as unknown as MouseEvent;
}

// ============================================================
// 测试集
// ============================================================

describe('LayoutContext（IDE 布局核心 Context）', () => {
  beforeEach(() => {
    // 清空 zustand mock，避免跨用例污染
    (useIDESettingsSlice.getState as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      layoutConfig: null,
      setLayoutConfig: vi.fn(),
    });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  // ----------------------------------------------------------
  // 用例 1：LayoutProvider 正常挂载并暴露默认 state
  // ----------------------------------------------------------
  it('1. LayoutProvider 正常挂载并提供默认 state / context value', () => {
    const captureRef = { current: null as ReturnType<typeof useLayoutContext> | null };

    const { getByTestId } = render(
      <LayoutProvider>
        <ContextCapture captureRef={captureRef} />
      </LayoutProvider>
    );

    expect(getByTestId('ctx-mounted').textContent).toBe('ok');
    expect(captureRef.current).not.toBeNull();

    const ctx = captureRef.current!;
    // value 顶层字段必须与 LayoutContextType 一致
    expect(ctx).toHaveProperty('state');
    expect(ctx).toHaveProperty('dispatch');
    expect(ctx).toHaveProperty('panels');
    expect(ctx).toHaveProperty('activePanelId');
    expect(ctx).toHaveProperty('layoutConfig');
    // 方法：不臆测签名，只校验存在且为函数
    const methods: (keyof typeof ctx)[] = [
      'addPanel', 'removePanel', 'updatePanel', 'selectPanel',
      'startDrag', 'onDrag', 'endDrag',
      'startResize', 'onResize', 'endResize',
      'addTab', 'removeTab', 'switchTab', 'updateTab',
      'updateLayoutConfig', 'saveLayout', 'loadLayout', 'resetLayout',
    ];
    methods.forEach((m) => expect(typeof ctx[m], `method ${m} should be function`).toBe('function'));
  });

  // ----------------------------------------------------------
  // 用例 2：useLayoutContext 在 Provider 内 / 外行为
  // ----------------------------------------------------------
  it('2. useLayoutContext 在 Provider 内不抛错，不在 Provider 内抛错', () => {
    // 不在 Provider 内 → 直接调用 renderHook 时抛错（hook 在 render 阶段抛 Error）
    expect(() => renderHook(() => useLayoutContext())).toThrow(
      /useLayoutContext must be used within a LayoutProvider/
    );

    // 在 Provider 内 → 正常返回 value，不抛错
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <LayoutProvider>{children}</LayoutProvider>
    );
    const { result } = renderHook(() => useLayoutContext(), { wrapper });
    expect(result.current).not.toBeNull();
    expect(result.current).toHaveProperty('panels');
    expect(Array.isArray(result.current.panels)).toBe(true);
  });

  // ----------------------------------------------------------
  // 用例 3：默认面板布局（3 个预置面板 + grid 布局）
  // ----------------------------------------------------------
  it('3. 默认面板布局：3 个预置面板 + layout=grid + selectedPanelId=code-editor', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <LayoutProvider>{children}</LayoutProvider>
    );
    const { result } = renderHook(() => useLayoutContext(), { wrapper });

    const { panels, activePanelId, layoutConfig } = result.current;

    expect(Array.isArray(panels)).toBe(true);
    expect(panels.length).toBe(3);

    // 3 个预置面板的 id
    const ids = panels.map((p) => p.id).sort();
    expect(ids).toEqual(['panel-ai-chat', 'panel-code-editor', 'panel-terminal'].sort());

    // code-editor 应是默认选中
    expect(activePanelId).toBe('panel-code-editor');

    // layoutConfig 默认值
    expect(layoutConfig.layout).toBe('grid');
    expect(layoutConfig.theme).toBe('dark');
    expect(layoutConfig.showGridLines).toBe(true);
    expect(layoutConfig.snapToGrid).toBe(true);
    expect(layoutConfig.gridSize).toBe(20);

    // 每个面板都具备基础字段
    panels.forEach((p) => {
      expect(p).toHaveProperty('type');
      expect(p).toHaveProperty('position');
      expect(p).toHaveProperty('size');
      expect(p).toHaveProperty('zIndex');
      expect(typeof p.isLocked).toBe('boolean');
      expect(typeof p.isMinimized).toBe('boolean');
      expect(typeof p.isMaximized).toBe('boolean');
      expect(Array.isArray(p.tabs)).toBe(true);
    });
  });

  // ----------------------------------------------------------
  // 用例 4：addPanel 正常添加面板
  // ----------------------------------------------------------
  it('4. addPanel：添加新面板后 panels 数量 +1，zIndex 自动递增，默认字段补齐', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <LayoutProvider>{children}</LayoutProvider>
    );
    const { result } = renderHook(() => useLayoutContext(), { wrapper });

    const beforeLen = result.current.panels.length;
    const beforeMaxZ = Math.max(...result.current.panels.map((p) => p.zIndex));

    const panelInput: Omit<Panel, 'id' | 'zIndex' | 'tabs' | 'activeTabId'> = {
      type: 'file-browser',
      title: 'File Browser',
      position: { x: 100, y: 100, w: 3, h: 4 },
      size: { width: 260, height: 320 },
      minSize: { width: 180, height: 120 },
      maxSize: { width: 600, height: 700 },
      isLocked: false,
      isMinimized: false,
      isMaximized: false,
      isClosable: true,
      isResizable: true,
    };

    act(() => {
      result.current.addPanel(panelInput);
    });

    expect(result.current.panels.length).toBe(beforeLen + 1);

    const added = result.current.panels.find((p) => p.title === 'File Browser')!;
    expect(added).toBeDefined();
    expect(added.type).toBe('file-browser');
    // 自动补齐字段
    expect(added.id).toMatch(/^panel-\d+$/);
    expect(added.zIndex).toBe(beforeMaxZ + 1);
    expect(Array.isArray(added.tabs)).toBe(true);
    expect(added.tabs.length).toBe(0);
    expect(added.activeTabId).toBe('');
    expect(added.isLocked).toBe(false);
    expect(added.isMinimized).toBe(false);
    expect(added.isMaximized).toBe(false);
    expect(added.isClosable).toBe(true);
    expect(added.isResizable).toBe(true);
  });

  // ----------------------------------------------------------
  // 用例 5：removePanel 移除面板 + 至少保留 1 个
  // ----------------------------------------------------------
  it('5. removePanel：移除指定面板；只剩 1 个面板时拒绝删除', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <LayoutProvider>{children}</LayoutProvider>
    );
    const { result } = renderHook(() => useLayoutContext(), { wrapper });

    // 初始 3 个，删 1 个剩 2 个
    act(() => {
      result.current.removePanel('panel-terminal');
    });
    expect(result.current.panels.map((p) => p.id)).not.toContain('panel-terminal');
    expect(result.current.panels.length).toBe(2);

    // 再删 ai-chat → 剩 1 个
    act(() => {
      result.current.removePanel('panel-ai-chat');
    });
    expect(result.current.panels.length).toBe(1);
    expect(result.current.panels[0].id).toBe('panel-code-editor');

    // 如果选中项被删，selectedPanelId 应为 null（提前验证）
    act(() => {
      result.current.selectPanel('panel-code-editor');
    });

    // 只剩 1 个再删 → 不应删除
    act(() => {
      result.current.removePanel('panel-code-editor');
    });
    expect(result.current.panels.length).toBe(1);
    expect(result.current.panels[0].id).toBe('panel-code-editor');
  });

  // ----------------------------------------------------------
  // 用例 6：selectPanel / updatePanel：选中 + 最小化/最大化（打开/关闭）
  // ----------------------------------------------------------
  it('6. selectPanel + updatePanel：切换选中项；最小化/最大化模拟"打开面板/关闭面板"', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <LayoutProvider>{children}</LayoutProvider>
    );
    const { result } = renderHook(() => useLayoutContext(), { wrapper });

    // selectPanel：切到 ai-chat
    act(() => {
      result.current.selectPanel('panel-ai-chat');
    });
    expect(result.current.activePanelId).toBe('panel-ai-chat');

    // selectPanel(null) 清空选中
    act(() => {
      result.current.selectPanel(null);
    });
    expect(result.current.activePanelId).toBeNull();

    // updatePanel：把 terminal 最小化（"关闭面板"样式）
    act(() => {
      result.current.updatePanel('panel-terminal', { isMinimized: true });
    });
    let terminal = result.current.panels.find((p) => p.id === 'panel-terminal')!;
    expect(terminal.isMinimized).toBe(true);

    // updatePanel：取消最小化（"打开面板"）+ 最大化
    act(() => {
      result.current.updatePanel('panel-terminal', { isMinimized: false, isMaximized: true });
    });
    terminal = result.current.panels.find((p) => p.id === 'panel-terminal')!;
    expect(terminal.isMinimized).toBe(false);
    expect(terminal.isMaximized).toBe(true);
  });

  // ----------------------------------------------------------
  // 用例 7：updateLayoutConfig → 切换布局 preset / theme / gridSize
  // ----------------------------------------------------------
  it('7. updateLayoutConfig：切换布局 preset（grid→split→tabs→custom）+ theme + snapToGrid', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <LayoutProvider>{children}</LayoutProvider>
    );
    const { result } = renderHook(() => useLayoutContext(), { wrapper });

    const presets: LayoutConfig['layout'][] = ['split', 'tabs', 'custom', 'grid'];

    presets.forEach((layout) => {
      act(() => {
        result.current.updateLayoutConfig({ layout, theme: 'light', snapToGrid: false, gridSize: 30 });
      });
      expect(result.current.layoutConfig.layout).toBe(layout);
      expect(result.current.layoutConfig.theme).toBe('light');
      expect(result.current.layoutConfig.snapToGrid).toBe(false);
      expect(result.current.layoutConfig.gridSize).toBe(30);
    });
  });

  // ----------------------------------------------------------
  // 用例 8：startResize → onResize → endResize：se 方向放大尺寸
  // ----------------------------------------------------------
  it('8. startResize→onResize→endResize：se 方向调整面板尺寸，minSize 保护生效', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <LayoutProvider>{children}</LayoutProvider>
    );
    const { result } = renderHook(() => useLayoutContext(), { wrapper });

    const panelId = 'panel-code-editor';
    const panelBefore = result.current.panels.find((p) => p.id === panelId)!;
    const { width: w0, height: h0 } = panelBefore.size;
    const { x: x0, y: y0 } = panelBefore.position;

    // 起点
    const startEvt = makeMouseEvent(200, 200);

    act(() => {
      result.current.startResize(panelId, 'se', startEvt);
    });
    expect(result.current.state.resizing.panelId).toBe(panelId);
    expect(result.current.state.resizing.direction).toBe('se');
    expect(result.current.state.resizing.startX).toBe(200);
    expect(result.current.state.resizing.startY).toBe(200);

    // 右下拖拽 +120 +100（gridSize=20，会被对齐）
    act(() => {
      result.current.onResize(makeMouseEvent(200 + 123, 200 + 107));
    });
    const panelAfter = result.current.panels.find((p) => p.id === panelId)!;
    // se 方向：宽度/高度变化，位置不变
    expect(panelAfter.size.width).toBeGreaterThan(w0);
    expect(panelAfter.size.height).toBeGreaterThan(h0);
    expect(panelAfter.position.x).toBe(x0);
    expect(panelAfter.position.y).toBe(y0);
    // snapToGrid=true，尺寸应为 20 的倍数
    expect(panelAfter.size.width % 20).toBe(0);
    expect(panelAfter.size.height % 20).toBe(0);

    // onResize 极大负数 → minSize 生效（minWidth=200, minHeight=150）
    // 注意：源码先 Math.max(minSize) → 再 Math.round/snapToGrid（gridSize=20）。
    //   minHeight=150 → 150/20=7.5 → Math.round=8 → 160（即 snapToGrid 后 minHeight=160）
    act(() => {
      result.current.onResize(makeMouseEvent(200 - 9999, 200 - 9999));
    });
    const panelMin = result.current.panels.find((p) => p.id === panelId)!;
    expect(panelMin.size.width).toBe(200);
    expect(panelMin.size.height).toBe(160);

    // endResize 清空 resizing 状态
    act(() => {
      result.current.endResize();
    });
    expect(result.current.state.resizing.panelId).toBeNull();
    expect(result.current.state.resizing.direction).toBeNull();
  });

  // ----------------------------------------------------------
  // 用例 9：startDrag → onDrag → endDrag：拖拽（snapToGrid 生效）
  // ----------------------------------------------------------
  it('9. startDrag→onDrag→endDrag：拖拽面板，snapToGrid 按 gridSize=20 对齐，x/y≥0', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <LayoutProvider>{children}</LayoutProvider>
    );
    const { result } = renderHook(() => useLayoutContext(), { wrapper });

    const panelId = 'panel-ai-chat';
    const panelBefore = result.current.panels.find((p) => p.id === panelId)!;

    // 鼠标按下点：clientX/Y = 面板位置 + 50/30（offsetX/Y = 50/30）
    const { x: pxBefore, y: pyBefore } = panelBefore.position;
    const startEvt = makeMouseEvent(pxBefore + 50, pyBefore + 30);

    act(() => {
      result.current.startDrag(panelId, startEvt);
    });
    expect(result.current.state.dragging.panelId).toBe(panelId);
    expect(result.current.state.dragging.offsetX).toBe(50);
    expect(result.current.state.dragging.offsetY).toBe(30);

    // 把鼠标向右下拖动一大段（增量 +137 +219，非 20 倍数 → snap 对齐）
    act(() => {
      result.current.onDrag(makeMouseEvent(pxBefore + 50 + 137, pyBefore + 30 + 219));
    });
    const panelAfter = result.current.panels.find((p) => p.id === panelId)!;
    // 新位置：client - offset = (pxBefore + 137, pyBefore + 219)
    // snapToGrid=true，gridSize=20 → round/20*20
    const expectedX = Math.round((pxBefore + 137) / 20) * 20;
    const expectedY = Math.round((pyBefore + 219) / 20) * 20;
    expect(panelAfter.position.x).toBe(expectedX);
    expect(panelAfter.position.y).toBe(expectedY);

    // 拖到负坐标 → 被夹到 0
    act(() => {
      result.current.onDrag(makeMouseEvent(-9999, -9999));
    });
    const panelClamp = result.current.panels.find((p) => p.id === panelId)!;
    expect(panelClamp.position.x).toBe(0);
    expect(panelClamp.position.y).toBe(0);

    // endDrag 清空 dragging
    act(() => {
      result.current.endDrag();
    });
    expect(result.current.state.dragging.panelId).toBeNull();
    expect(result.current.state.dragging.offsetX).toBe(0);
    expect(result.current.state.dragging.offsetY).toBe(0);
  });

  // ----------------------------------------------------------
  // 用例 10：resetLayout 清空 panels + layout 重置为 split
  // ----------------------------------------------------------
  it('10. resetLayout：清空 panels，layout 重置为 split，selectedPanelId=null', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <LayoutProvider>{children}</LayoutProvider>
    );
    const { result } = renderHook(() => useLayoutContext(), { wrapper });

    // 先确认初始不为空
    expect(result.current.panels.length).toBeGreaterThan(0);

    act(() => {
      result.current.resetLayout();
    });

    expect(result.current.panels.length).toBe(0);
    expect(result.current.layoutConfig.layout).toBe('split');
    expect(result.current.layoutConfig.theme).toBe('dark');
    expect(result.current.layoutConfig.showGridLines).toBe(true);
    expect(result.current.layoutConfig.snapToGrid).toBe(true);
    expect(result.current.layoutConfig.gridSize).toBe(20);
    expect(result.current.activePanelId).toBeNull();
  });
});
