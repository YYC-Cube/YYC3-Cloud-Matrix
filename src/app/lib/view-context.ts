/**
 * @file: view-context.ts
 * @description: view-context.ts
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-08
 * @updated: 2026-04-08
 * @status: active
 * @tags: [lib]
 */

import * as React from "react";
import type { WebSocketDataState, ViewState } from "../types";

/**
 * WebSocket 上下文
 * 通过 React Context 将 WebSocket 数据传递到所有子页面
 */
export const WebSocketContext = React.createContext<WebSocketDataState | null>(null);

/**
 * 视口/响应式布局上下文
 */
export const ViewContext = React.createContext<ViewState | null>(null);
