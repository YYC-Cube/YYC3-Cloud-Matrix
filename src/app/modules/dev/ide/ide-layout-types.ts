/**
 * @file: ide-layout-types.ts
 * @description: IDE 布局系统类型定义
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-03-23
 * @updated: 2026-03-23
 * @status: active
 * @tags: [ide],[layout],[types]
 */

export type PanelType =
  | 'code-editor'
  | 'file-browser'
  | 'preview'
  | 'terminal'
  | 'debug'
  | 'output'
  | 'search'
  | 'ai-chat'
  | 'database'
  | 'version-control';

export interface Panel {
  id: string;
  type: PanelType;
  title: string;
  content?: React.ReactNode;
  position: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  size: {
    width: number;
    height: number;
  };
  minSize?: {
    width: number;
    height: number;
  };
  maxSize?: {
    width: number;
    height: number;
  };
  isLocked: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  isClosable: boolean;
  isResizable: boolean;
  zIndex: number;
  tabs: Tab[];
  activeTabId: string;
}

export interface Tab {
  id: string;
  panelId: string;
  title: string;
  content?: React.ReactNode;
  isPinned: boolean;
  isModified: boolean;
  isUnsaved: boolean;
  hasError: boolean;
  isActive: boolean;
  icon?: string;
}

export interface LayoutConfig {
  panels: Panel[];
  layout: 'grid' | 'split' | 'tabs' | 'custom';
  theme: 'light' | 'dark' | 'auto';
  showGridLines: boolean;
  snapToGrid: boolean;
  gridSize: number;
}

export interface DraggingState {
  panelId: string | null;
  startX: number;
  startY: number;
  offsetX: number;
  offsetY: number;
}

export interface ResizingState {
  panelId: string | null;
  direction: 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw' | null;
  startX: number;
  startY: number;
  startWidth: number;
  startHeight: number;
  startLeft: number;
  startTop: number;
}
