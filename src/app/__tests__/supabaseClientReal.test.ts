/**
 * @file: supabaseClientReal.test.ts
 * @description: supabaseClientReal.test.ts
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-08
 * @updated: 2026-04-08
 * @status: active
 * @tags: [module]
 */

// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  toAppUser,
  toAppSession,
  toSupabaseMetadata,
  ghostSignIn,
  isGhostMode,
  isMockMode,
  getAuthMode,
} from "../lib/supabaseClientReal";
import type { AppUser, AppSession } from "../types";

describe("supabaseClientReal", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe("toAppUser", () => {
    it("should convert Supabase user to AppUser with all fields", () => {
      const supabaseUser = {
        id: "user-123",
        email: "test@example.com",
        user_metadata: {
          role: "admin",
          name: "Test User",
        },
      };

      const result = toAppUser(supabaseUser);

      expect(result).toEqual({
        id: "user-123",
        email: "test@example.com",
        role: "admin",
        name: "Test User",
      });
    });

    it("should use default role when not provided", () => {
      const supabaseUser = {
        id: "user-456",
        email: "dev@example.com",
      };

      const result = toAppUser(supabaseUser);

      expect(result.role).toBe("developer");
    });

    it("should extract name from email when not provided", () => {
      const supabaseUser = {
        id: "user-789",
        email: "john.doe@example.com",
      };

      const result = toAppUser(supabaseUser);

      expect(result.name).toBe("john.doe");
    });

    it("should use 'User' as fallback name", () => {
      const supabaseUser = {
        id: "user-000",
      };

      const result = toAppUser(supabaseUser);

      expect(result.name).toBe("User");
      expect(result.email).toBe("");
    });
  });

  describe("toAppSession", () => {
    it("should convert Supabase session to AppSession", () => {
      const supabaseSession = {
        user: {
          id: "user-123",
          email: "test@example.com",
          user_metadata: {
            role: "admin",
            name: "Test User",
          },
        },
        access_token: "token-abc123",
        expires_at: 1735689600,
      };

      const result = toAppSession(supabaseSession);

      expect(result.user).toEqual({
        id: "user-123",
        email: "test@example.com",
        role: "admin",
        name: "Test User",
      });
      expect(result.token).toBe("token-abc123");
      expect(result.expiresAt).toBe(1735689600000);
    });

    it("should use current time when expires_at is not provided", () => {
      const beforeTime = Date.now();
      const supabaseSession = {
        user: {
          id: "user-456",
          email: "test@example.com",
        },
        access_token: "token-xyz",
      };

      const result = toAppSession(supabaseSession);
      const afterTime = Date.now();

      expect(result.expiresAt).toBeGreaterThanOrEqual(beforeTime);
      expect(result.expiresAt).toBeLessThanOrEqual(afterTime);
    });
  });

  describe("toSupabaseMetadata", () => {
    it("should convert AppUser to Supabase metadata", () => {
      const user: Partial<AppUser> = {
        role: "admin",
        name: "Admin User",
      };

      const result = toSupabaseMetadata(user);

      expect(result).toEqual({
        role: "admin",
        name: "Admin User",
      });
    });

    it("should use default values when not provided", () => {
      const user: Partial<AppUser> = {};

      const result = toSupabaseMetadata(user);

      expect(result).toEqual({
        role: "developer",
        name: "",
      });
    });
  });

  describe("ghostSignIn", () => {
    it("should create ghost session", () => {
      const session = ghostSignIn();
      expect(session).not.toBeNull();
      if (!session) { return; }

      expect(session.user.id).toBe("ghost-000");
      expect(session.user.email).toBe("ghost@yyc3.local");
      expect(session.user.role).toBe("admin");
      expect(session.user.name).toBe("Ghost Operator");
      expect(session.token).toContain("ghost_");
      expect(session.expiresAt).toBeGreaterThan(Date.now());
    });

    it("should store session in localStorage", () => {
      ghostSignIn();

      const stored = localStorage.getItem("yyc3_session");
      expect(stored).not.toBeNull();

      const session = JSON.parse(stored!);
      expect(session.user.id).toBe("ghost-000");
    });

    it("should set ghost mode flag", () => {
      ghostSignIn();

      expect(localStorage.getItem("yyc3_ghost")).toBe("1");
    });
  });

  describe("isGhostMode", () => {
    it("should return true when ghost mode is active", () => {
      localStorage.setItem("yyc3_ghost", "1");

      expect(isGhostMode()).toBe(true);
    });

    it("should return false when ghost mode is not active", () => {
      expect(isGhostMode()).toBe(false);
    });
  });

  describe("isMockMode", () => {
    it("should return boolean indicating mock mode", () => {
      const result = isMockMode();
      expect(typeof result).toBe("boolean");
    });
  });

  describe("getAuthMode", () => {
    it("should return 'mock' or 'real'", () => {
      const mode = getAuthMode();
      expect(["mock", "real"]).toContain(mode);
    });
  });
});
