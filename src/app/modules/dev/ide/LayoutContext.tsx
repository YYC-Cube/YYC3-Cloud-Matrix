/**
 * @file: LayoutContext.tsx
 * @description: IDE 布局状态管理（React Context + useReducer）
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-03-23
 * @updated: 2026-03-23
 * @status: active
 * @tags: [ide],[layout],[context]
 */

import * as React from 'react';
import { createContext, useContext, useReducer, useCallback, useEffect, type ReactNode } from 'react';
import { useIDESettingsSlice } from '../../../store/slices/ide-settings-slice';
import type {
  Panel,
  LayoutConfig,
  Tab,
  DraggingState,
  ResizingState,
} from './ide-layout-types';

interface LayoutState {
  layout: LayoutConfig;
  selectedPanelId: string | null;
  dragging: DraggingState;
  resizing: ResizingState;
}

type LayoutAction =
  | { type: 'ADD_PANEL'; payload: Omit<Panel, 'id' | 'zIndex' | 'tabs' | 'activeTabId'> }
  | { type: 'REMOVE_PANEL'; payload: string }
  | { type: 'UPDATE_PANEL'; payload: { panelId: string; updates: Partial<Panel> } }
  | { type: 'SELECT_PANEL'; payload: string | null }
  | { type: 'START_DRAG'; payload: { panelId: string; e: MouseEvent } }
  | { type: 'ON_DRAG'; payload: MouseEvent }
  | { type: 'END_DRAG' }
  | { type: 'START_RESIZE'; payload: { panelId: string; direction: ResizingState['direction']; e: MouseEvent } }
  | { type: 'ON_RESIZE'; payload: MouseEvent }
  | { type: 'END_RESIZE' }
  | { type: 'ADD_TAB'; payload: { panelId: string; tab: Omit<Tab, 'id' | 'isActive'> } }
  | { type: 'REMOVE_TAB'; payload: { panelId: string; tabId: string } }
  | { type: 'SWITCH_TAB'; payload: { panelId: string; tabId: string } }
  | { type: 'UPDATE_TAB'; payload: { panelId: string; tabId: string; updates: Partial<Tab> } }
  | { type: 'UPDATE_LAYOUT_CONFIG'; payload: Partial<LayoutConfig> }
  | { type: 'RESET_LAYOUT' }
  | { type: 'LOAD_LAYOUT'; payload: LayoutConfig };

const initialState: LayoutState = {
  layout: {
    panels: [
      // 默认添加几个面板，方便用户立即开始使用
      {
        id: 'panel-code-editor',
        type: 'code-editor',
        title: 'Code Editor',
        position: { x: 20, y: 20, w: 5, h: 6 },
        size: { width: 350, height: 300 },
        minSize: { width: 200, height: 150 },
        maxSize: { width: 800, height: 600 },
        isLocked: false,
        isMinimized: false,
        isMaximized: false,
        isClosable: true,
        isResizable: true,
        zIndex: 1,
        tabs: [],
        activeTabId: '',
      },
      {
        id: 'panel-ai-chat',
        type: 'ai-chat',
        title: 'AI Chat',
        position: { x: 390, y: 20, w: 5, h: 5 },
        size: { width: 350, height: 300 },
        minSize: { width: 200, height: 150 },
        maxSize: { width: 800, height: 600 },
        isLocked: false,
        isMinimized: false,
        isMaximized: false,
        isClosable: true,
        isResizable: true,
        zIndex: 2,
        tabs: [],
        activeTabId: '',
      },
      {
        id: 'panel-terminal',
        type: 'terminal',
        title: 'Terminal',
        position: { x: 760, y: 20, w: 5, h: 4 },
        size: { width: 300, height: 250 },
        minSize: { width: 200, height: 150 },
        maxSize: { width: 800, height: 600 },
        isLocked: false,
        isMinimized: false,
        isMaximized: false,
        isClosable: true,
        isResizable: true,
        zIndex: 3,
        tabs: [],
        activeTabId: '',
      },
    ],
    layout: 'grid',
    theme: 'dark',
    showGridLines: true,
    snapToGrid: true,
    gridSize: 20,
  },
  selectedPanelId: 'panel-code-editor',
  dragging: {
    panelId: null,
    startX: 0,
    startY: 0,
    offsetX: 0,
    offsetY: 0,
  },
  resizing: {
    panelId: null,
    direction: null,
    startX: 0,
    startY: 0,
    startWidth: 0,
    startHeight: 0,
    startLeft: 0,
    startTop: 0,
  },
};

function layoutReducer(state: LayoutState, action: LayoutAction): LayoutState {
  switch (action.type) {
    case 'ADD_PANEL': {
      const newPanel: Panel = {
        ...action.payload,
        id: `panel-${Date.now()}`,
        zIndex: state.layout.panels.length + 1,
        tabs: [],
        activeTabId: '',
        isLocked: false,
        isMinimized: false,
        isMaximized: false,
        isClosable: true,
        isResizable: true,
      };
      return {
        ...state,
        layout: {
          ...state.layout,
          panels: [...state.layout.panels, newPanel],
        },
      };
    }

    case 'REMOVE_PANEL': {
      if (state.layout.panels.length <= 1) {
        return state;
      }
      return {
        ...state,
        layout: {
          ...state.layout,
          panels: state.layout.panels.filter((p) => p.id !== action.payload),
        },
        selectedPanelId: state.selectedPanelId === action.payload ? null : state.selectedPanelId,
      };
    }

    case 'UPDATE_PANEL': {
      return {
        ...state,
        layout: {
          ...state.layout,
          panels: state.layout.panels.map((p) =>
            p.id === action.payload.panelId ? { ...p, ...action.payload.updates } : p
          ),
        },
      };
    }

    case 'SELECT_PANEL': {
      return { ...state, selectedPanelId: action.payload };
    }

    case 'START_DRAG': {
      const panel = state.layout.panels.find((p) => p.id === action.payload.panelId);
      if (!panel) {return state;}

      return {
        ...state,
        dragging: {
          panelId: action.payload.panelId,
          startX: action.payload.e.clientX,
          startY: action.payload.e.clientY,
          offsetX: action.payload.e.clientX - panel.position.x,
          offsetY: action.payload.e.clientY - panel.position.y,
        },
      };
    }

    case 'ON_DRAG': {
      const { dragging, layout } = state;
      if (!dragging.panelId) {return state;}

      let newX = action.payload.clientX - dragging.offsetX;
      let newY = action.payload.clientY - dragging.offsetY;

      if (layout.snapToGrid) {
        newX = Math.round(newX / layout.gridSize) * layout.gridSize;
        newY = Math.round(newY / layout.gridSize) * layout.gridSize;
      }

      newX = Math.max(0, newX);
      newY = Math.max(0, newY);

      return {
        ...state,
        layout: {
          ...state.layout,
          panels: state.layout.panels.map((p) =>
            p.id === dragging.panelId
              ? { ...p, position: { ...p.position, x: newX, y: newY } }
              : p
          ),
        },
      };
    }

    case 'END_DRAG': {
      return {
        ...state,
        dragging: {
          panelId: null,
          startX: 0,
          startY: 0,
          offsetX: 0,
          offsetY: 0,
        },
      };
    }

    case 'START_RESIZE': {
      const panel = state.layout.panels.find((p) => p.id === action.payload.panelId);
      if (!panel) {return state;}

      return {
        ...state,
        resizing: {
          panelId: action.payload.panelId,
          direction: action.payload.direction,
          startX: action.payload.e.clientX,
          startY: action.payload.e.clientY,
          startWidth: panel.size.width,
          startHeight: panel.size.height,
          startLeft: panel.position.x,
          startTop: panel.position.y,
        },
      };
    }

    case 'ON_RESIZE': {
      const { resizing, layout } = state;
      if (!resizing.panelId) {return state;}

      const deltaX = action.payload.clientX - resizing.startX;
      const deltaY = action.payload.clientY - resizing.startY;

      let newWidth = resizing.startWidth;
      let newHeight = resizing.startHeight;
      let newLeft = resizing.startLeft;
      let newTop = resizing.startTop;

      if (resizing.direction?.includes('e')) {
        newWidth = resizing.startWidth + deltaX;
      }
      if (resizing.direction?.includes('w')) {
        newWidth = resizing.startWidth - deltaX;
        newLeft = resizing.startLeft + deltaX;
      }
      if (resizing.direction?.includes('s')) {
        newHeight = resizing.startHeight + deltaY;
      }
      if (resizing.direction?.includes('n')) {
        newHeight = resizing.startHeight - deltaY;
        newTop = resizing.startTop + deltaY;
      }

      const panel = layout.panels.find((p) => p.id === resizing.panelId);
      if (panel?.minSize) {
        newWidth = Math.max(newWidth, panel.minSize.width);
        newHeight = Math.max(newHeight, panel.minSize.height);
      }
      if (panel?.maxSize) {
        newWidth = Math.min(newWidth, panel.maxSize.width);
        newHeight = Math.min(newHeight, panel.maxSize.height);
      }

      if (layout.snapToGrid) {
        newWidth = Math.round(newWidth / layout.gridSize) * layout.gridSize;
        newHeight = Math.round(newHeight / layout.gridSize) * layout.gridSize;
        newLeft = Math.round(newLeft / layout.gridSize) * layout.gridSize;
        newTop = Math.round(newTop / layout.gridSize) * layout.gridSize;
      }

      return {
        ...state,
        layout: {
          ...state.layout,
          panels: state.layout.panels.map((p) =>
            p.id === resizing.panelId
              ? {
                  ...p,
                  size: { width: newWidth, height: newHeight },
                  position: { ...p.position, x: newLeft, y: newTop },
                }
              : p
          ),
        },
      };
    }

    case 'END_RESIZE': {
      return {
        ...state,
        resizing: {
          panelId: null,
          direction: null,
          startX: 0,
          startY: 0,
          startWidth: 0,
          startHeight: 0,
          startLeft: 0,
          startTop: 0,
        },
      };
    }

    case 'ADD_TAB': {
      const { panelId, tab } = action.payload;
      const newTab: Tab = {
        ...tab,
        id: `tab-${Date.now()}`,
        isActive: true,
      };

      return {
        ...state,
        layout: {
          ...state.layout,
          panels: state.layout.panels.map((p) => {
            if (p.id === panelId) {
              return {
                ...p,
                tabs: [...p.tabs.map((t) => ({ ...t, isActive: false })), newTab],
                activeTabId: newTab.id,
              };
            }
            return p;
          }),
        },
      };
    }

    case 'REMOVE_TAB': {
      const { panelId, tabId } = action.payload;

      return {
        ...state,
        layout: {
          ...state.layout,
          panels: state.layout.panels.map((p) => {
            if (p.id === panelId) {
              const newTabs = p.tabs.filter((t) => t.id !== tabId);
              const newActiveTabId = newTabs.length > 0 ? newTabs[0].id : '';
              return {
                ...p,
                tabs: newTabs,
                activeTabId: newActiveTabId,
              };
            }
            return p;
          }),
        },
      };
    }

    case 'SWITCH_TAB': {
      const { panelId, tabId } = action.payload;

      return {
        ...state,
        layout: {
          ...state.layout,
          panels: state.layout.panels.map((p) => {
            if (p.id === panelId) {
              return {
                ...p,
                tabs: p.tabs.map((t) => ({
                  ...t,
                  isActive: t.id === tabId,
                })),
                activeTabId: tabId,
              };
            }
            return p;
          }),
        },
      };
    }

    case 'UPDATE_TAB': {
      const { panelId, tabId, updates } = action.payload;

      return {
        ...state,
        layout: {
          ...state.layout,
          panels: state.layout.panels.map((p) => {
            if (p.id === panelId) {
              return {
                ...p,
                tabs: p.tabs.map((t) =>
                  t.id === tabId ? { ...t, ...updates } : t
                ),
              };
            }
            return p;
          }),
        },
      };
    }

    case 'UPDATE_LAYOUT_CONFIG': {
      return {
        ...state,
        layout: {
          ...state.layout,
          ...action.payload,
        },
      };
    }

    case 'RESET_LAYOUT': {
      return {
        ...state,
        layout: {
          panels: [],
          layout: 'split',
          theme: 'dark',
          showGridLines: true,
          snapToGrid: true,
          gridSize: 20,
        },
        selectedPanelId: null,
      };
    }

    case 'LOAD_LAYOUT': {
      return {
        ...state,
        layout: action.payload,
      };
    }

    default:
      return state;
  }
}

interface LayoutContextType {
  state: LayoutState;
  dispatch: React.Dispatch<LayoutAction>;
  panels: Panel[];
  activePanelId: string | null;
  layoutConfig: LayoutConfig;
  addPanel: (panel: Omit<Panel, 'id' | 'zIndex' | 'tabs' | 'activeTabId'>) => void;
  removePanel: (panelId: string) => void;
  updatePanel: (panelId: string, updates: Partial<Panel>) => void;
  selectPanel: (panelId: string | null) => void;
  startDrag: (panelId: string, e: MouseEvent) => void;
  onDrag: (e: MouseEvent) => void;
  endDrag: () => void;
  startResize: (panelId: string, direction: ResizingState['direction'], e: MouseEvent) => void;
  onResize: (e: MouseEvent) => void;
  endResize: () => void;
  addTab: (panelId: string, tab: Omit<Tab, 'id' | 'isActive'>) => void;
  removeTab: (panelId: string, tabId: string) => void;
  switchTab: (panelId: string, tabId: string) => void;
  updateTab: (panelId: string, tabId: string, updates: Partial<Tab>) => void;
  updateLayoutConfig: (config: Partial<LayoutConfig>) => void;
  saveLayout: () => void;
  loadLayout: () => void;
  resetLayout: () => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export function LayoutProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(layoutReducer, initialState);

  const addPanel = useCallback((panel: Omit<Panel, 'id' | 'zIndex' | 'tabs' | 'activeTabId'>) => {
    dispatch({ type: 'ADD_PANEL', payload: panel });
  }, []);

  const removePanel = useCallback((panelId: string) => {
    dispatch({ type: 'REMOVE_PANEL', payload: panelId });
  }, []);

  const updatePanel = useCallback((panelId: string, updates: Partial<Panel>) => {
    dispatch({ type: 'UPDATE_PANEL', payload: { panelId, updates } });
  }, []);

  const selectPanel = useCallback((panelId: string | null) => {
    dispatch({ type: 'SELECT_PANEL', payload: panelId });
  }, []);

  const startDrag = useCallback((panelId: string, e: MouseEvent) => {
    dispatch({ type: 'START_DRAG', payload: { panelId, e } });
  }, []);

  const onDrag = useCallback((e: MouseEvent) => {
    dispatch({ type: 'ON_DRAG', payload: e });
  }, []);

  const endDrag = useCallback(() => {
    dispatch({ type: 'END_DRAG' });
  }, []);

  const startResize = useCallback((panelId: string, direction: ResizingState['direction'], e: MouseEvent) => {
    dispatch({ type: 'START_RESIZE', payload: { panelId, direction, e } });
  }, []);

  const onResize = useCallback((e: MouseEvent) => {
    dispatch({ type: 'ON_RESIZE', payload: e });
  }, []);

  const endResize = useCallback(() => {
    dispatch({ type: 'END_RESIZE' });
  }, []);

  const addTab = useCallback((panelId: string, tab: Omit<Tab, 'id' | 'isActive'>) => {
    dispatch({ type: 'ADD_TAB', payload: { panelId, tab } });
  }, []);

  const removeTab = useCallback((panelId: string, tabId: string) => {
    dispatch({ type: 'REMOVE_TAB', payload: { panelId, tabId } });
  }, []);

  const switchTab = useCallback((panelId: string, tabId: string) => {
    dispatch({ type: 'SWITCH_TAB', payload: { panelId, tabId } });
  }, []);

  const updateTab = useCallback((panelId: string, tabId: string, updates: Partial<Tab>) => {
    dispatch({ type: 'UPDATE_TAB', payload: { panelId, tabId, updates } });
  }, []);

  const updateLayoutConfig = useCallback((config: Partial<LayoutConfig>) => {
    dispatch({ type: 'UPDATE_LAYOUT_CONFIG', payload: config });
  }, []);

  const saveLayout = useCallback(() => {
    try {
      useIDESettingsSlice.getState().setLayoutConfig(state.layout);
    } catch (error) {
      console.error('Failed to save layout:', error);
    }
  }, [state.layout]);

  const loadLayout = useCallback(() => {
    try {
      const saved = useIDESettingsSlice.getState().layoutConfig;
      if (saved) {
        dispatch({ type: 'LOAD_LAYOUT', payload: saved });
      }
    } catch (error) {
      console.error('Failed to load layout:', error);
    }
  }, []);

  const resetLayout = useCallback(() => {
    dispatch({ type: 'RESET_LAYOUT' });
  }, []);

  useEffect(() => {
    loadLayout();
  }, [loadLayout]);

  const value: LayoutContextType = {
    state,
    dispatch,
    panels: state.layout.panels,
    activePanelId: state.selectedPanelId,
    layoutConfig: state.layout,
    addPanel,
    removePanel,
    updatePanel,
    selectPanel,
    startDrag,
    onDrag,
    endDrag,
    startResize,
    onResize,
    endResize,
    addTab,
    removeTab,
    switchTab,
    updateTab,
    updateLayoutConfig,
    saveLayout,
    loadLayout,
    resetLayout,
  };

  return <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>;
}

export function useLayoutContext() {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayoutContext must be used within a LayoutProvider');
  }
  return context;
}
