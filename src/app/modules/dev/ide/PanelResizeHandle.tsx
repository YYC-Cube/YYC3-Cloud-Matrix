/**
 * @file: PanelResizeHandle.tsx
 * @description: 面板调整大小手柄组件
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-03-24
 * @updated: 2026-03-24
 * @status: active
 * @tags: [ide],[layout],[panel]
 */

import * as React from "react";
import { useCallback, useRef, useEffect } from "react";

interface PanelResizeHandleProps {
  direction: "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";
  onMouseDown: (e: React.MouseEvent) => void;
}

export function PanelResizeHandle({ direction, onMouseDown }: PanelResizeHandleProps) {
  const isResizing = useRef(false);

  const handleGlobalMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing.current) {
      return;
    }
    e.preventDefault();
  }, []);

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      isResizing.current = false;
      window.removeEventListener("mousemove", handleGlobalMouseMove);
      window.removeEventListener("mouseup", handleGlobalMouseUp);
    };

    return () => {
      window.removeEventListener("mousemove", handleGlobalMouseMove);
      window.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [handleGlobalMouseMove]);

  const handleMouseDown = (e: React.MouseEvent) => {
    onMouseDown(e);
    isResizing.current = true;

    const handleGlobalMouseUp = () => {
      isResizing.current = false;
      window.removeEventListener("mousemove", handleGlobalMouseMove);
      window.removeEventListener("mouseup", handleGlobalMouseUp);
    };

    window.addEventListener("mousemove", handleGlobalMouseMove);
    window.addEventListener("mouseup", handleGlobalMouseUp);
  };

  const getStyle = () => {
    const baseStyle = {
      position: "absolute" as const,
      zIndex: 10,
      background: "transparent",
      transition: "background 0.2s",
    };

    switch (direction) {
      case "e":
        return {
          ...baseStyle,
          right: 0,
          top: 0,
          width: "4px",
          height: "100%",
          cursor: "ew-resize",
        };
      case "w":
        return {
          ...baseStyle,
          left: 0,
          top: 0,
          width: "4px",
          height: "100%",
          cursor: "ew-resize",
        };
      case "s":
        return {
          ...baseStyle,
          bottom: 0,
          left: 0,
          width: "100%",
          height: "4px",
          cursor: "ns-resize",
        };
      case "n":
        return {
          ...baseStyle,
          top: 0,
          left: 0,
          width: "100%",
          height: "4px",
          cursor: "ns-resize",
        };
      case "se":
        return {
          ...baseStyle,
          right: 0,
          bottom: 0,
          width: "8px",
          height: "8px",
          cursor: "nwse-resize",
        };
      case "sw":
        return {
          ...baseStyle,
          left: 0,
          bottom: 0,
          width: "8px",
          height: "8px",
          cursor: "nesw-resize",
        };
      case "ne":
        return {
          ...baseStyle,
          right: 0,
          top: 0,
          width: "8px",
          height: "8px",
          cursor: "nesw-resize",
        };
      case "nw":
        return {
          ...baseStyle,
          left: 0,
          top: 0,
          width: "8px",
          height: "8px",
          cursor: "nwse-resize",
        };
      default:
        return baseStyle;
    }
  };

  return (
    <div
      className="panel-resize-handle"
      style={getStyle()}
      onMouseDown={handleMouseDown}
    />
  );
}
