/**
 * @file: TabBar.tsx
 * @description: 标签栏组件 - 管理面板的标签页
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-03-24
 * @updated: 2026-03-24
 * @status: active
 * @tags: [ide],[layout],[panel]
 */

import * as React from 'react';
import type { Panel as PanelType } from './ide-layout-types';
import { useLayoutContext } from './LayoutContext';
import { X } from 'lucide-react';

interface TabBarProps {
  panel: PanelType;
}

export function TabBar({ panel }: TabBarProps) {
  const { switchTab, removeTab } = useLayoutContext();

  const handleTabClick = (tabId: string) => {
    if (tabId !== panel.activeTabId) {
      switchTab(panel.id, tabId);
    }
  };

  const handleTabClose = (e: React.MouseEvent, tabId: string) => {
    e.stopPropagation();
    removeTab(panel.id, tabId);
  };

  return (
    <div
      className="tab-bar"
      style={{
        display: 'flex',
        alignItems: 'center',
        height: '32px',
        background: 'rgba(6, 14, 31, 0.6)',
        borderBottom: '1px solid rgba(0, 180, 255, 0.1)',
        overflowX: 'auto',
        overflowY: 'hidden',
      }}
    >
      {panel.tabs.map((tab) => (
        <div
          key={tab.id}
          className={`tab ${tab.isActive ? 'active' : ''}`}
          onClick={() => handleTabClick(tab.id)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '0 12px',
            height: '100%',
            background: tab.isActive
              ? 'rgba(0, 212, 255, 0.1)'
              : 'transparent',
            borderBottom: tab.isActive
              ? '2px solid #00d4ff'
              : '2px solid transparent',
            cursor: 'pointer',
            transition: 'all 0.2s',
            whiteSpace: 'nowrap',
          }}
        >
          {tab.icon && (
            <span style={{ fontSize: '12px', opacity: 0.8 }}>{tab.icon}</span>
          )}
          <span
            className="tab-title"
            style={{
              fontSize: '12px',
              color: tab.isActive ? '#e0f0ff' : 'rgba(224, 240, 255, 0.7)',
              fontWeight: tab.isModified ? '600' : '400',
            }}
          >
            {tab.title}
            {tab.isModified && (
              <span style={{ marginLeft: '4px', color: '#ff9500' }}>●</span>
            )}
            {tab.isUnsaved && (
              <span style={{ marginLeft: '4px', color: '#ff6b6b' }}>●</span>
            )}
          </span>
          <button
            className="tab-close"
            onClick={(e) => handleTabClose(e, tab.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '16px',
              height: '16px',
              borderRadius: '4px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              opacity: 0.6,
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '1';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '0.6';
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <X size={10} />
          </button>
        </div>
      ))}
    </div>
  );
}
