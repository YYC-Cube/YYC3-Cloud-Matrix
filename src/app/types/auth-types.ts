/**
 * @file: auth-types.ts
 * @description: 用户认证与角色类型
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-20
 * @updated: 2026-04-20
 * @status: active
 * @tags: [types],[auth]
 */

/** 系统角色 */
export type UserRole = "admin" | "developer";

/** 认证用户 */
export interface AppUser {
  id: string;
  email: string;
  role: UserRole;
  name: string;
}

/** 认证会话 */
export interface AppSession {
  user: AppUser;
  token: string;
  expiresAt: number;
}

/** 认证上下文数据 */
export interface AuthContextValue {
  logout: () => void;
  userEmail: string;
  userRole: UserRole | "";
  isGhost?: boolean;
}
