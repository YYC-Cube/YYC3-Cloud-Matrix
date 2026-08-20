/**
 * @file: PanelContent.tsx
 * @description: 面板内容组件 - 根据面板类型渲染不同内容
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-03-24
 * @updated: 2026-03-24
 * @status: active
 * @tags: [ide],[layout],[panel]
 */

import * as React from 'react';
import type { Panel } from './ide-layout-types';
import { useLayoutContext } from './LayoutContext';

interface PanelContentProps {
  panel: Panel;
}

export function PanelContent({ panel }: PanelContentProps) {
  const { activePanelId: _activePanelId } = useLayoutContext();

  const renderContent = () => {
    switch (panel.type) {
      case 'code-editor':
        return (
          <div className="panel-code-content h-full overflow-auto p-4">
            <div className="text-[rgba(0,212,255,0.3)] text-sm text-center py-8">
              Code Editor
            </div>
          </div>
        );

      case 'preview':
        return (
          <div className="panel-preview-content h-full overflow-auto p-4">
            <div className="text-[rgba(0,212,255,0.3)] text-sm text-center py-8">
              Preview Panel
            </div>
          </div>
        );

      case 'terminal':
        return (
          <div className="panel-terminal-content h-full overflow-auto p-4">
            <div className="text-[rgba(0,212,255,0.3)] text-sm text-center py-8">
              Terminal
            </div>
          </div>
        );

      case 'file-browser':
        return (
          <div className="panel-explorer-content h-full overflow-auto p-4">
            <div className="text-[rgba(0,212,255,0.3)] text-sm text-center py-8">
              File Explorer
            </div>
          </div>
        );

      case 'ai-chat':
        return (
          <div className="panel-ai-chat-content h-full overflow-auto p-4">
            <div className="text-[rgba(0,212,255,0.3)] text-sm text-center py-8">
              AI Chat
            </div>
          </div>
        );

      case 'database':
        return (
          <div className="panel-database-content h-full overflow-auto p-4">
            <div className="text-[rgba(0,212,255,0.3)] text-sm text-center py-8">
              Database
            </div>
          </div>
        );

      case 'version-control':
        return (
          <div className="panel-git-content h-full overflow-auto p-4">
            <div className="text-[rgba(0,212,255,0.3)] text-sm text-center py-8">
              Version Control
            </div>
          </div>
        );

      default:
        return (
          <div className="panel-default-content h-full overflow-auto p-4">
            <div className="text-[rgba(0,212,255,0.3)] text-sm text-center py-8">
              Unknown Panel Type
            </div>
          </div>
        );
    }
  };

  return (
    <div
      className="panel-content"
      style={{
        height: 'calc(100% - 36px)',
        background: 'rgba(4, 10, 22, 0.5)',
        overflow: 'hidden',
      }}
    >
      {renderContent()}
    </div>
  );
}
