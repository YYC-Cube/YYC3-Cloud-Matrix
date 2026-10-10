/**
 * @file useDraggable.ts
 * @description 可拖拽浮窗 Hook
 * @author YanYuCloudCube Team
 * @version v1.0.0
 */

import { useState, useCallback, useRef, useEffect } from "react";

export interface Position {
  x: number;
  y: number;
}

export interface UseDraggableOptions {
  initialPosition?: Position;
  bounds?: {
    left?: number;
    top?: number;
    right?: number;
    bottom?: number;
  };
  onPositionChange?: (position: Position) => void;
}

export interface UseDraggableReturn {
  position: Position;
  isDragging: boolean;
  handleMouseDown: (e: React.MouseEvent) => void;
  handleTouchStart: (e: React.TouchEvent) => void;
  draggableRef: React.RefObject<HTMLDivElement | null>;
  resetPosition: () => void;
}

export function useDraggable(options: UseDraggableOptions = {}): UseDraggableReturn {
  const { initialPosition = { x: 0, y: 0 }, bounds, onPositionChange } = options;

  const [position, setPosition] = useState<Position>(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const draggableRef = useRef<HTMLDivElement | null>(null);
  const dragStartRef = useRef<{ x: number; y: number; posX: number; posY: number } | null>(null);

  const clampPosition = useCallback(
    (pos: Position): Position => {
      if (!bounds) {return pos;}

      const element = draggableRef.current;
      if (!element) {return pos;}

      const rect = element.getBoundingClientRect();
      let { x, y } = pos;

      if (bounds.left !== undefined) {x = Math.max(bounds.left, x);}
      if (bounds.top !== undefined) {y = Math.max(bounds.top, y);}
      if (bounds.right !== undefined) {x = Math.min(bounds.right - rect.width, x);}
      if (bounds.bottom !== undefined) {y = Math.min(bounds.bottom - rect.height, y);}

      return { x, y };
    },
    [bounds]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!dragStartRef.current) {return;}

      const deltaX = e.clientX - dragStartRef.current.x;
      const deltaY = e.clientY - dragStartRef.current.y;

      const newPosition = clampPosition({
        x: dragStartRef.current.posX + deltaX,
        y: dragStartRef.current.posY + deltaY,
      });

      setPosition(newPosition);
      onPositionChange?.(newPosition);
    },
    [clampPosition, onPositionChange]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!dragStartRef.current) {return;}

      const touch = e.touches[0];
      const deltaX = touch.clientX - dragStartRef.current.x;
      const deltaY = touch.clientY - dragStartRef.current.y;

      const newPosition = clampPosition({
        x: dragStartRef.current.posX + deltaX,
        y: dragStartRef.current.posY + deltaY,
      });

      setPosition(newPosition);
      onPositionChange?.(newPosition);
    },
    [clampPosition, onPositionChange]
  );

  const handleEnd = useCallback(() => {
    setIsDragging(false);
    dragStartRef.current = null;
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      posX: position.x,
      posY: position.y,
    };
  }, [position]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    setIsDragging(true);
    dragStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      posX: position.x,
      posY: position.y,
    };
  }, [position]);

  const resetPosition = useCallback(() => {
    setPosition(initialPosition);
    onPositionChange?.(initialPosition);
  }, [initialPosition, onPositionChange]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleEnd);
      window.addEventListener("touchmove", handleTouchMove);
      window.addEventListener("touchend", handleEnd);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleEnd);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleEnd);
    };
  }, [isDragging, handleMouseMove, handleTouchMove, handleEnd]);

  return {
    position,
    isDragging,
    handleMouseDown,
    handleTouchStart,
    draggableRef,
    resetPosition,
  };
}
