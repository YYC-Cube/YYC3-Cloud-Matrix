/**
 * @file: FadeIn.tsx
 * @description: FadeIn.tsx
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-08
 * @updated: 2026-04-08
 * @status: active
 * @tags: [component]
 */

import React, { useState, useEffect } from "react";

interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
  onClick?: (e: React.MouseEvent) => void;
  direction?: "up" | "down" | "left" | "right" | "none";
  key?: React.Key;
}

export function FadeIn({
  children,
  delay = 0,
  className = "",
  style,
  onClick,
  direction = "up",
}: Omit<FadeInProps, "key">) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), Math.min(delay * 1000, 1200));
    return () => clearTimeout(t);
  }, [delay]);

  const transforms: Record<string, string> = {
    up: "translateY(12px)",
    down: "translateY(-12px)",
    left: "translateX(12px)",
    right: "translateX(-12px)",
    none: "none",
  };

  return (
    <div
      className={className}
      onClick={onClick}
      style={{
        ...style,
        opacity: show ? 1 : 0,
        transform: show ? "none" : transforms[direction],
        transition: "opacity 0.5s ease, transform 0.5s ease",
      }}
    >
      {children}
    </div>
  );
}
