/**
 * permission-manager.ts
 * =======================
 * 桥接层权限管理器
 * 控制 IPC 操作的访问权限
 */

import { app } from "electron";
import * as crypto from "crypto";

/**
 * 权限级别
 */
export enum PermissionLevel {
  READ_ONLY = "read_only",
  READ_WRITE = "read_write",
  FULL_ACCESS = "full_access",
  ADMIN = "admin",
}

/**
 * 权限配置
 */
export interface PermissionConfig {
  level: PermissionLevel;
  allowedChannels: string[];
  deniedChannels: string[];
  maxFileSize?: number;
  allowedPaths?: string[];
  deniedPaths?: string[];
}

/**
 * 用户会话
 */
export interface UserSession {
  id: string;
  userId: string;
  permissions: PermissionConfig;
  createdAt: number;
  expiresAt: number;
}

/**
 * 权限管理器
 */
export class PermissionManager {
  private static instance: PermissionManager;
  private sessions: Map<string, UserSession> = new Map();
  private defaultPermissions: PermissionConfig = {
    level: PermissionLevel.READ_WRITE,
    allowedChannels: [],
    deniedChannels: [],
    maxFileSize: 100 * 1024 * 1024, // 100MB
  };

  private constructor() {}

  public static getInstance(): PermissionManager {
    if (!PermissionManager.instance) {
      PermissionManager.instance = new PermissionManager();
    }
    return PermissionManager.instance;
  }

  /**
   * 创建用户会话
   */
  public createSession(userId: string, permissions?: Partial<PermissionConfig>): string {
    const sessionId = crypto.randomBytes(32).toString("hex");
    const now = Date.now();

    const session: UserSession = {
      id: sessionId,
      userId,
      permissions: {
        ...this.defaultPermissions,
        ...permissions,
      },
      createdAt: now,
      expiresAt: now + 24 * 60 * 60 * 1000, // 24小时后过期
    };

    this.sessions.set(sessionId, session);
    return sessionId;
  }

  /**
   * 获取用户会话
   */
  public getSession(sessionId: string): UserSession | null {
    const session = this.sessions.get(sessionId);

    if (!session) {
      return null;
    }

    // 检查会话是否过期
    if (Date.now() > session.expiresAt) {
      this.sessions.delete(sessionId);
      return null;
    }

    return session;
  }

  /**
   * 销毁用户会话
   */
  public destroySession(sessionId: string): void {
    this.sessions.delete(sessionId);
  }

  /**
   * 检查是否有权限访问指定通道
   */
  public hasChannelPermission(sessionId: string, channel: string): boolean {
    const session = this.getSession(sessionId);
    if (!session) {
      return false;
    }

    const { allowedChannels, deniedChannels } = session.permissions;

    // 如果通道在拒绝列表中，直接拒绝
    if (deniedChannels.includes(channel)) {
      return false;
    }

    // 如果允许列表为空，表示允许所有通道
    if (allowedChannels.length === 0) {
      return true;
    }

    // 检查通道是否在允许列表中
    return allowedChannels.includes(channel);
  }

  /**
   * 检查是否有权限访问指定路径
   */
  public hasPathPermission(sessionId: string, filePath: string): boolean {
    const session = this.getSession(sessionId);
    if (!session) {
      return false;
    }

    const { allowedPaths, deniedPaths } = session.permissions;

    // 如果路径在拒绝列表中，直接拒绝
    if (deniedPaths && deniedPaths.some(denied => filePath.startsWith(denied))) {
      return false;
    }

    // 如果允许列表为空，表示允许所有路径
    if (!allowedPaths || allowedPaths.length === 0) {
      return true;
    }

    // 检查路径是否在允许列表中
    return allowedPaths.some(allowed => filePath.startsWith(allowed));
  }

  /**
   * 检查文件大小是否超过限制
   */
  public isFileSizeAllowed(sessionId: string, fileSize: number): boolean {
    const session = this.getSession(sessionId);
    if (!session) {
      return false;
    }

    const { maxFileSize } = session.permissions;
    return !maxFileSize || fileSize <= maxFileSize;
  }

  /**
   * 获取权限级别
   */
  public getPermissionLevel(sessionId: string): PermissionLevel | null {
    const session = this.getSession(sessionId);
    if (!session) {
      return null;
    }

    return session.permissions.level;
  }

  /**
   * 更新权限配置
   */
  public updatePermissions(sessionId: string, permissions: Partial<PermissionConfig>): boolean {
    const session = this.getSession(sessionId);
    if (!session) {
      return false;
    }

    session.permissions = {
      ...session.permissions,
      ...permissions,
    };

    return true;
  }

  /**
   * 清理过期会话
   */
  public cleanExpiredSessions(): void {
    const now = Date.now();
    for (const [sessionId, session] of this.sessions.entries()) {
      if (now > session.expiresAt) {
        this.sessions.delete(sessionId);
      }
    }
  }

  /**
   * 获取活跃会话数量
   */
  public getActiveSessionCount(): number {
    this.cleanExpiredSessions();
    return this.sessions.size;
  }
}

/**
 * 导出单例实例
 */
export const permissionManager = PermissionManager.getInstance();
