/**
 * @file: PanelToolbar.tsx
 * @description: 面板工具栏 - 提供添加面板、布局控制等功能
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-03-24
 * @updated: 2026-03-24
 * @status: active
 * @tags: [ide],[layout],[toolbar]
 */

import {
  Eye,
  Grid,
  Layers,
  Plus,
  RotateCcw,
  Save,
  Settings2
} from 'lucide-react';
import * as React from "react";
import { useEffect, useState } from "react";
import { useI18n } from '../../../hooks/useI18n';
import type { PanelType } from './ide-layout-types';
import { useLayoutContext } from './LayoutContext';

export function PanelToolbar() {
  const { t } = useI18n();
  const {
    layoutConfig,
    updateLayoutConfig,
    addPanel,
    saveLayout,
    resetLayout,
    panels,
  } = useLayoutContext();
  const [showPanelMenu, setShowPanelMenu] = useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowPanelMenu(false);
      }
    };
    if (showPanelMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showPanelMenu]);

  const panelTypes: { type: PanelType; label: string; icon: React.ElementType }[] = [
    { type: 'code-editor', label: t('ide.panels.code'), icon: Plus },
    { type: 'preview', label: t('ide.panels.preview'), icon: Eye },
    { type: 'terminal', label: t('ide.panels.terminal'), icon: Grid },
    { type: 'file-browser', label: t('ide.panels.explorer'), icon: Layers },
    { type: 'ai-chat', label: t('ide.panels.aiChat'), icon: Plus },
  ];

  const handleAddPanel = (type: PanelType) => {
    const panelType = panelTypes.find((p) => p.type === type);
    if (!panelType) { return; }
    addPanel({
      type,
      title: panelType.label,
      position: { x: 100 + panels.length * 20, y: 100 + panels.length * 20, w: 400, h: 300 },
      size: { width: 400, height: 300 },
      minSize: { width: 200, height: 150 },
      maxSize: { width: 800, height: 600 },
      isLocked: false,
      isMinimized: false,
      isMaximized: false,
      isClosable: true,
      isResizable: true,
    });
    setShowPanelMenu(false);
  };

  const handleToggleGridLines = () => {
    updateLayoutConfig({ showGridLines: !layoutConfig.showGridLines });
  };

  const handleToggleSnapToGrid = () => {
    updateLayoutConfig({ snapToGrid: !layoutConfig.snapToGrid });
  };

  const handleSave = () => {
    saveLayout();
  };

  const handleReset = () => {
    if (window.confirm(t('ide.confirmReset'))) { resetLayout(); }
  };

  return (
    <div
      className="panel-toolbar"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 12px',
        background: 'rgba(6, 14, 31, 0.95)',
        borderBottom: '1px solid rgba(0, 180, 255, 0.1)',
      }}
    >
      {/* 添加面板按钮 */}
      <div className="relative">
        <button
          onClick={() => setShowPanelMenu((prev) => !prev)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md text-[#e0f0ff] text-xs font-medium transition-all hover:bg-[rgba(0,212,255,0.1)]"
          style={{ border: '1px solid rgba(0, 180, 255, 0.2)' }}
        >
          <Plus size={14} />
          {t('ide.addPanel')}
        </button>
        {showPanelMenu && (
          <div
            ref={menuRef}
            className="absolute top-full left-0 mt-1 bg-[rgba(6, 14, 31, 0.98)] rounded-md shadow-xl border border-[rgba(0, 180, 255, 0.2)] z-50"
            style={{ padding: '4px', minWidth: '160px' }}
          >
            {panelTypes.map((panelType) => {
              const Icon = panelType.icon;
              return (
                <button
                  key={panelType.type}
                  onClick={() => handleAddPanel(panelType.type)}
                  className="flex items-center gap-2 w-full px-3 py-2 rounded text-left text-[#e0f0ff] text-xs hover:bg-[rgba(0,212,255,0.1)] transition-all"
                >
                  <Icon size={14} />
                  {panelType.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 分隔符 */}
      <div style={{ width: '1px', height: '20px', background: 'rgba(0, 180, 255, 0.1)' }} />

      {/* 布局控制按钮 */}
      <button
        onClick={handleToggleGridLines}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
          layoutConfig.showGridLines ? 'text-[#00d4ff]' : 'text-[rgba(224,240,255,0.7)]'
        } hover:bg-[rgba(0,212,255,0.1)]`}
        title={t('ide.toggleGridLines')}
      >
        <Grid size={14} />
        {t('ide.gridLines')}
      </button>

      <button
        onClick={handleToggleSnapToGrid}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
          layoutConfig.snapToGrid ? 'text-[#00d4ff]' : 'text-[rgba(224,240,255,0.7)]'
        } hover:bg-[rgba(0,212,255,0.1)]`}
        title={t('ide.toggleSnapToGrid')}
      >
        <Layers size={14} />
        {t('ide.snapToGrid')}
      </button>

      {/* 分隔符 */}
      <div style={{ width: '1px', height: '20px', background: 'rgba(0, 180, 255, 0.1)' }} />

      {/* 保存/重置按钮 */}
      <button
        onClick={handleSave}
        className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all text-[#e0f0ff] hover:bg-[rgba(0,212,255,0.1)]"
        title={t('ide.saveLayout')}
      >
        <Save size={14} />
        {t('common.save')}
      </button>

      <button
        onClick={handleReset}
        className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all text-[rgba(224,240,255,0.7)] hover:bg-[rgba(0,212,255,0.1)] hover:text-[#e0f0ff]"
        title={t('ide.resetLayout')}
      >
        <RotateCcw size={14} />
        {t('ide.reset')}
      </button>

      {/* 分隔符 */}
      <div style={{ width: '1px', height: '20px', background: 'rgba(0, 180, 255, 0.1)' }} />

      {/* 布局设置按钮 */}
      <button
        className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all text-[rgba(224,240,255,0.7)] hover:bg-[rgba(0,212,255,0.1)] hover:text-[#e0f0ff]"
        title={t('ide.layoutSettings')}
      >
        <Settings2 size={14} />
        {t('common.settings')}
      </button>

      {/* 面板计数 */}
      <div
        className="ml-auto text-xs text-[rgba(0,212,255,0.5)]"
        style={{ paddingRight: '8px' }}
      >
        {panels.length} {panels.length === 1 ? t('ide.panel') : t('ide.panels.count')}
      </div>
    </div>
  );
}
