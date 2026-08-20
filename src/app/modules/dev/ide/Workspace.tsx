/**
 * @file: Workspace.tsx
 * @description: 工作区组件 - 12x12 网格布局系统
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-03-23
 * @updated: 2026-03-23
 * @status: active
 * @tags: [ide],[layout],[workspace]
 */

import { useLayoutContext } from './LayoutContext';
import { PanelContainer } from './PanelContainer';
import { PanelToolbar } from './PanelToolbar';

export function Workspace() {
  const { panels, activePanelId, layoutConfig } = useLayoutContext();

  return (
    <div className="workspace" style={{ position: 'relative', height: '100%', width: '100%', overflow: 'hidden' }}>
      <PanelToolbar />
      <div
        className="workspace-content"
        style={{
          position: 'relative',
          width: '100%',
          height: 'calc(100% - 48px)', // 减去toolbar高度
          backgroundColor: layoutConfig.showGridLines ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
        }}
      >
        {/* 网格背景层 */}
        {layoutConfig.showGridLines && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: `
                linear-gradient(rgba(0, 180, 255, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0, 180, 255, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: `${layoutConfig.gridSize}px ${layoutConfig.gridSize}px`,
              pointerEvents: 'none',
              zIndex: 0,
            }}
          />
        )}

        {/* 面板层 */}
        {panels.map((panel) => (
          <PanelContainer
            key={panel.id}
            panel={panel}
            isActive={panel.id === activePanelId}
          />
        ))}
      </div>
    </div>
  );
}
