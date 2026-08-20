/**
 * @file: migrate-storage.test.ts
 * @description: migrate-storage.test.ts description
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-30
 * @updated: 2026-04-30
 * @status: active
 * @tags: [tag1],[tag2],[tag3]
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import { migrateKey, migrateKeyAsArray, migrateKeyWithMerge, migrateRawString } from "../../lib/migrate-storage";

describe("migrate-storage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("migrateKey", () => {
    it("should migrate valid JSON key", () => {
      localStorage.setItem("old-key", JSON.stringify({ name: "test" }));
      const setter = vi.fn();
      const result = migrateKey("old-key", setter);
      expect(result).toBe(true);
      expect(setter).toHaveBeenCalledWith({ name: "test" });
      expect(localStorage.getItem("old-key")).toBeNull();
    });

    it("should return false for missing key", () => {
      const setter = vi.fn();
      const result = migrateKey("missing", setter);
      expect(result).toBe(false);
      expect(setter).not.toHaveBeenCalled();
    });

    it("should return false for invalid JSON", () => {
      localStorage.setItem("bad-key", "not-json{");
      const setter = vi.fn();
      const result = migrateKey("bad-key", setter);
      expect(result).toBe(false);
    });
  });

  describe("migrateKeyWithMerge", () => {
    it("should merge with defaults", () => {
      localStorage.setItem("config", JSON.stringify({ a: 1 }));
      const setter = vi.fn();
      const result = migrateKeyWithMerge("config", { a: 0, b: 2 }, setter);
      expect(result).toBe(true);
      expect(setter).toHaveBeenCalledWith({ a: 1, b: 2 });
    });

    it("should return false for missing key", () => {
      const setter = vi.fn();
      expect(migrateKeyWithMerge("missing", {}, setter)).toBe(false);
    });
  });

  describe("migrateKeyAsArray", () => {
    it("should migrate valid array", () => {
      localStorage.setItem("items", JSON.stringify([1, 2, 3]));
      const setter = vi.fn();
      expect(migrateKeyAsArray("items", setter)).toBe(true);
      expect(setter).toHaveBeenCalledWith([1, 2, 3]);
    });

    it("should reject non-array data", () => {
      localStorage.setItem("items", JSON.stringify({ not: "array" }));
      const setter = vi.fn();
      expect(migrateKeyAsArray("items", setter)).toBe(false);
    });
  });

  describe("migrateRawString", () => {
    it("should migrate raw string without parsing", () => {
      localStorage.setItem("raw", "hello world");
      const setter = vi.fn();
      expect(migrateRawString("raw", setter)).toBe(true);
      expect(setter).toHaveBeenCalledWith("hello world");
    });

    it("should return false for missing key", () => {
      expect(migrateRawString("missing", vi.fn())).toBe(false);
    });
  });
});
