/**
 * @file: PanelHeader.tsx
 * @description: 面板标题栏组件 - 支持拖拽、最小化、最大化、关闭
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-03-24
 * @updated: 2026-03-24
 * @status: active
 * @tags: [ide],[layout],[panel]
 */

import * as React from 'react';
import type { Panel } from './ide-layout-types';
import { Minus, Maximize2, X } from 'lucide-react';

interface PanelHeaderProps {
  panel: Panel;
  isActive: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onClose: () => void;
}

export function PanelHeader({
  panel,
  isActive,
  onMouseDown,
  onMinimize,
  onMaximize,
  onClose,
}: PanelHeaderProps) {
  return (
    <div
      className="panel-header flex items-center justify-between px-3 py-2 cursor-move"
      style={{
        background: isActive
          ? 'linear-gradient(90deg, rgba(0,212,255,0.1) 0%, rgba(0,212,255,0.05) 100%)'
          : 'rgba(6, 14, 31, 0.8)',
        borderBottom: '1px solid rgba(0, 180, 255, 0.1)',
      }}
      onMouseDown={onMouseDown}
    >
      <div className="flex items-center gap-2">
        <div
          className="w-2 h-2 rounded-full"
          style={{
            background: isActive
              ? 'rgba(0, 212, 255, 0.8)'
              : 'rgba(0, 180, 255, 0.4)',
          }}
        />
        <span
          className="text-xs font-medium"
          style={{
            color: isActive ? '#e0f0ff' : 'rgba(224, 240, 255, 0.7)',
          }}
        >
          {panel.title}
        </span>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMinimize();
          }}
          className="p-1 rounded hover:bg-[rgba(0,212,255,0.1)] transition-all text-[rgba(224,240,255,0.5)] hover:text-[#e0f0ff]"
          title="Minimize"
        >
          <Minus size={12} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMaximize();
          }}
          className="p-1 rounded hover:bg-[rgba(0,212,255,0.1)] transition-all text-[rgba(224,240,255,0.5)] hover:text-[#e0f0ff]"
          title="Maximize"
        >
          <Maximize2 size={12} />
        </button>
        {panel.isClosable && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="p-1 rounded hover:bg-[rgba(255,0,0,0.2)] transition-all text-[rgba(224,240,255,0.5)] hover:text-[#ff4444]"
            title="Close"
          >
            <X size={12} />
          </button>
        )}
      </div>
    </div>
  );
}
