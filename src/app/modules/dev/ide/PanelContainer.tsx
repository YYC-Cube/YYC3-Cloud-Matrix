/**
 * @file: PanelContainer.tsx
 * @description: 面板容器组件 - 支持拖拽、调整大小、最小化、最大化
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-03-24
 * @updated: 2026-03-24
 * @status: active
 * @tags: [ide],[layout],[panel]
 */

import * as React from "react";
import { useRef, useEffect, useCallback } from "react";
import { useLayoutContext } from './LayoutContext';
import { PanelContent } from './PanelContent';
import { PanelHeader } from './PanelHeader';
import { PanelResizeHandle } from './PanelResizeHandle';
import type { Panel } from './ide-layout-types';

interface PanelContainerProps {
  panel: Panel;
  isActive: boolean;
}

export function PanelContainer({ panel, isActive }: PanelContainerProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const {
    selectPanel,
    startDrag,
    onDrag,
    endDrag,
    startResize,
    onResize: _onResize,
    endResize: _endResize,
    updatePanel,
    removePanel,
  } = useLayoutContext();

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault(); // 防止文本选择
    selectPanel(panel.id);
    startDrag(panel.id, e.nativeEvent);
  }, [panel.id, selectPanel, startDrag]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    // 不依赖isActive状态，直接调用onDrag
    // 拖拽状态由LayoutContext的dragging状态控制
    onDrag(e);
  }, [onDrag]);

  const handleMouseUp = useCallback(() => {
    // 不依赖isActive状态，直接调用endDrag
    endDrag();
  }, [endDrag]);

  // 全局监听鼠标移动和释放事件，不依赖isActive状态
  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const handleMinimize = useCallback(() => {
    updatePanel(panel.id, { isMinimized: !panel.isMinimized });
  }, [panel.id, panel.isMinimized, updatePanel]);

  const handleMaximize = useCallback(() => {
    updatePanel(panel.id, { isMaximized: !panel.isMaximized });
  }, [panel.id, panel.isMaximized, updatePanel]);

  const handleClose = useCallback(() => {
    if (panel.isClosable) {
      removePanel(panel.id);
    }
  }, [panel.id, panel.isClosable, removePanel]);

  const handleResizeStart = useCallback((direction: string, e: React.MouseEvent) => {
    e.stopPropagation();
    startResize(panel.id, direction as "n" | "s" | "e" | "w", e.nativeEvent);
  }, [panel.id, startResize]);

  if (panel.isMinimized) {
    return null;
  }

  const panelStyle = panel.isMaximized
    ? {
        position: 'fixed' as const,
        top: 0,
        left: 0,
        width: '100vw',
        height: 'calc(100vh - 60px)',
        zIndex: 9999,
      }
    : {
        position: 'absolute' as const,
        top: `${panel.position.y}px`,
        left: `${panel.position.x}px`,
        width: `${panel.size.width}px`,
        height: `${panel.size.height}px`,
        zIndex: panel.zIndex,
      };

  return (
    <div
      ref={panelRef}
      className="panel-container"
      style={{
        ...panelStyle,
        background: 'rgba(6, 14, 31, 0.95)',
        border: isActive ? '1px solid rgba(0, 212, 255, 0.3)' : '1px solid rgba(0, 180, 255, 0.15)',
        borderRadius: '8px',
        boxShadow: isActive
          ? '0 8px 32px rgba(0, 212, 255, 0.15)'
          : '0 4px 16px rgba(0, 180, 255, 0.08)',
        overflow: 'hidden',
        backdropFilter: 'blur(12px)',
      }}
    >
      <PanelHeader
        panel={panel}
        isActive={isActive}
        onMouseDown={handleMouseDown}
        onMinimize={handleMinimize}
        onMaximize={handleMaximize}
        onClose={handleClose}
      />
      <PanelContent panel={panel} />
      {panel.isResizable && !panel.isMaximized && (
        <>
          <PanelResizeHandle
            direction="e"
            onMouseDown={(e) => handleResizeStart('e', e)}
          />
          <PanelResizeHandle
            direction="s"
            onMouseDown={(e) => handleResizeStart('s', e)}
          />
          <PanelResizeHandle
            direction="se"
            onMouseDown={(e) => handleResizeStart('se', e)}
          />
        </>
      )}
    </div>
  );
}
