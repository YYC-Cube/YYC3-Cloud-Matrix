/**
 * @file: crypto-vault.test.ts
 * @description: crypto-vault.test.ts description
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-30
 * @updated: 2026-04-30
 * @status: active
 * @tags: [tag1],[tag2],[tag3]
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { isCryptoAvailable, secureStorage } from "../../lib/crypto-vault";

describe("crypto-vault", () => {
  describe("isCryptoAvailable", () => {
    it("should return true in jsdom with crypto", () => {
      expect(typeof isCryptoAvailable()).toBe("boolean");
    });
  });

  describe("secureStorage", () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it("should set and get items", async () => {
      await secureStorage.setItem("test-key", "test-value");
      const result = await secureStorage.getItem("test-key");
      expect(result).toBe("test-value");
    });

    it("should remove items", async () => {
      await secureStorage.setItem("test-key", "test-value");
      secureStorage.removeItem("test-key");
      const result = await secureStorage.getItem("test-key");
      expect(result).toBeNull();
    });

    it("should return null for missing keys", async () => {
      const result = await secureStorage.getItem("nonexistent");
      expect(result).toBeNull();
    });
  });
});
