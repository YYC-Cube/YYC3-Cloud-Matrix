/**
 * @file: authContext.ts
 * @description: authContext.ts
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-08
 * @updated: 2026-04-08
 * @status: active
 * @tags: [lib]
 */

import { createContext } from "react";
import type { AuthContextValue } from "../types";

/** 认证上下文 - 提供登出功能和当前用户信息 */
export const AuthContext = createContext<AuthContextValue>({
  logout: () => {},
  userEmail: "",
  userRole: "",
  isGhost: false,
});
