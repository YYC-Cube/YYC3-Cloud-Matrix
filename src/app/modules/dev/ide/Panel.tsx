/**
 * @file: Panel.tsx
 * @description: 面板组件 - 分离的UI结构
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-03-23
 * @updated: 2026-03-23
 * @status: active
 * @tags: [ide],[layout],[panel]
 */

import * as React from 'react';
import type { Panel as PanelType } from './ide-layout-types';
import { PanelHeader } from './PanelHeader';
import { PanelContent } from './PanelContent';
import { TabBar } from './TabBar';
import './layout.css';

interface PanelProps {
  panel: PanelType;
  isActive: boolean;
  onMouseDown?: (e: React.MouseEvent) => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  onClose?: () => void;
}

export function Panel({ panel, isActive, onMouseDown, onMinimize, onMaximize, onClose }: PanelProps) {
  const handleMouseDown = (e: React.MouseEvent) => {
    if (onMouseDown) {
      onMouseDown(e);
    }
  };

  const handleMinimize = () => {
    if (onMinimize) {
      onMinimize();
    }
  };

  const handleMaximize = () => {
    if (onMaximize) {
      onMaximize();
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <div
      className={`panel ${panel.isMaximized ? 'maximized' : ''}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: 'rgba(30, 41, 59, 0.8)',
        border: isActive ? '2px solid #6366f1' : '1px solid #334155',
        borderRadius: '8px',
        overflow: 'hidden',
        backdropFilter: 'blur(10px)',
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
      {panel.tabs.length > 0 && <TabBar panel={panel} />}
      <PanelContent panel={panel} />
    </div>
  );
}
