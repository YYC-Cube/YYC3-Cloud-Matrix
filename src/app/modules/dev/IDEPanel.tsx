/**
 * @file: IDEPanel.tsx
 * @description: IDEPanel.tsx
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-08
 * @updated: 2026-04-08
 * @status: active
 * @tags: [component]
 */

import React from "react";
import { IDELayout } from "./ide/IDELayout";

export function IDEPanel() {
  return (
    <div
      className="w-full"
      style={{
        height: "calc(100% + 2rem)",
        margin: "-1rem",
        width: "calc(100% + 2rem)",
      }}
    >
      <IDELayout />
    </div>
  );
}