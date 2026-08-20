/**
 * @file: useValidation.test.tsx
 * @description: useValidation.test.tsx description
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-03-31
 * @updated: 2026-03-31
 * @status: active
 * @tags: [component]
 */

// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useValidation } from "../hooks/useValidation";

describe("useValidation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should validate required fields", () => {
    const { result } = renderHook(() => useValidation());

    let isValid: boolean;
    act(() => {
      isValid = result.current.validateField("testField", "Test Field", "test value", [
        { type: "required" },
      ]);
    });

    expect(isValid!).toBe(true);
  });

  it("should fail validation for empty required fields", () => {
    const { result } = renderHook(() => useValidation());

    let isValid: boolean;
    act(() => {
      isValid = result.current.validateField("testField", "Test Field", "", [
        { type: "required" },
      ]);
    });

    expect(isValid!).toBe(false);
    expect(result.current.errors.testField).toBeDefined();
  });

  it("should validate URL format", () => {
    const { result } = renderHook(() => useValidation());

    act(() => {
      result.current.validateField("url", "URL", "https://example.com", [{ type: "url" }]);
    });
    expect(result.current.errors.url).toBeUndefined();

    act(() => {
      result.current.validateField("url", "URL", "not-a-url", [{ type: "url" }]);
    });
    expect(result.current.errors.url).toBeDefined();
  });

  it("should validate minimum length", () => {
    const { result } = renderHook(() => useValidation());

    act(() => {
      result.current.validateField("name", "Name", "test", [{ type: "minLength", min: 2 }]);
    });
    expect(result.current.errors.name).toBeUndefined();

    act(() => {
      result.current.validateField("name", "Name", "a", [{ type: "minLength", min: 2 }]);
    });
    expect(result.current.errors.name).toBeDefined();
  });

  it("should validate maximum length", () => {
    const { result } = renderHook(() => useValidation());

    act(() => {
      result.current.validateField("name", "Name", "test", [{ type: "maxLength", max: 10 }]);
    });
    expect(result.current.errors.name).toBeUndefined();

    act(() => {
      result.current.validateField("name", "Name", "very long string", [{ type: "maxLength", max: 5 }]);
    });
    expect(result.current.errors.name).toBeDefined();
  });

  it("should validate range", () => {
    const { result } = renderHook(() => useValidation());

    act(() => {
      result.current.validateField("age", "Age", "50", [{ type: "range", min: 0, max: 100 }]);
    });
    expect(result.current.errors.age).toBeUndefined();

    act(() => {
      result.current.validateField("age", "Age", "150", [{ type: "range", min: 0, max: 100 }]);
    });
    expect(result.current.errors.age).toBeDefined();
  });

  it("should validate API key format", () => {
    const { result } = renderHook(() => useValidation());

    act(() => {
      result.current.validateField("apiKey", "API Key", "sk-test123456789", [{ type: "apiKey" }]);
    });
    expect(result.current.errors.apiKey).toBeUndefined();

    act(() => {
      result.current.validateField("apiKey", "API Key", "short", [{ type: "apiKey" }]);
    });
    expect(result.current.errors.apiKey).toBeDefined();
  });

  it("should validate port number", () => {
    const { result } = renderHook(() => useValidation());

    act(() => {
      result.current.validateField("port", "Port", "8080", [{ type: "port" }]);
    });
    expect(result.current.errors.port).toBeUndefined();

    act(() => {
      result.current.validateField("port", "Port", "70000", [{ type: "port" }]);
    });
    expect(result.current.errors.port).toBeDefined();
  });

  it("should validate IP address", () => {
    const { result } = renderHook(() => useValidation());

    act(() => {
      result.current.validateField("ip", "IP Address", "192.168.1.1", [{ type: "ip" }]);
    });
    expect(result.current.errors.ip).toBeUndefined();

    act(() => {
      result.current.validateField("ip", "IP Address", "256.256.256.256", [{ type: "ip" }]);
    });
    expect(result.current.errors.ip).toBeDefined();
  });

  it("should validate pattern matching", () => {
    const { result } = renderHook(() => useValidation());

    act(() => {
      result.current.validateField("code", "Code", "ABC123", [{ type: "pattern", regex: /^[A-Z]{3}\d{3}$/ }]);
    });
    expect(result.current.errors.code).toBeUndefined();

    act(() => {
      result.current.validateField("code", "Code", "abc123", [{ type: "pattern", regex: /^[A-Z]{3}\d{3}$/ }]);
    });
    expect(result.current.errors.code).toBeDefined();
  });

  it("should validate model name", () => {
    const { result } = renderHook(() => useValidation());

    act(() => {
      result.current.validateField("model", "Model", "gpt-4", [{ type: "modelName" }]);
    });
    expect(result.current.errors.model).toBeUndefined();

    act(() => {
      result.current.validateField("model", "Model", "model<invalid>", [{ type: "modelName" }]);
    });
    expect(result.current.errors.model).toBeDefined();
  });

  it("should validate custom rules", () => {
    const { result } = renderHook(() => useValidation());

    act(() => {
      result.current.validateField("custom", "Custom", "valid", [
        { type: "custom", validate: (val: string) => val === "valid" ? null : "Must be 'valid'" },
      ]);
    });
    expect(result.current.errors.custom).toBeUndefined();

    act(() => {
      result.current.validateField("custom", "Custom", "invalid", [
        { type: "custom", validate: (val: string) => val === "valid" ? null : "Must be 'valid'" },
      ]);
    });
    expect(result.current.errors.custom).toBeDefined();
  });

  it("should validate multiple rules at once", () => {
    const { result } = renderHook(() => useValidation());

    act(() => {
      result.current.validateField("password", "Password", "Test123", [
        { type: "required" },
        { type: "minLength", min: 6 },
      ]);
    });

    expect(result.current.errors.password).toBeUndefined();
  });

  it("should fail on first invalid rule", () => {
    const { result } = renderHook(() => useValidation());

    act(() => {
      result.current.validateField("field", "Field", "", [
        { type: "required" },
        { type: "minLength", min: 5 },
      ]);
    });

    expect(result.current.errors.field).toBeDefined();
  });

  it("should validate all fields at once", () => {
    const { result } = renderHook(() => useValidation());

    const rules = [
      { field: "url", label: "URL", value: "https://example.com", rules: [{ type: "required" } as const, { type: "url" } as const] },
      { field: "name", label: "Name", value: "Test User", rules: [{ type: "required" } as const] },
    ];

    act(() => {
      result.current.validateAll(rules);
    });

    expect(result.current.hasErrors).toBe(false);
  });

  it("should return errors for invalid fields", () => {
    const { result } = renderHook(() => useValidation());

    const rules = [
      { field: "url", label: "URL", value: "invalid-url", rules: [{ type: "required" } as const, { type: "url" } as const] },
      { field: "name", label: "Name", value: "", rules: [{ type: "required" } as const] },
    ];

    act(() => {
      result.current.validateAll(rules);
    });

    expect(result.current.hasErrors).toBe(true);
    expect(result.current.errors.url).toBeDefined();
    expect(result.current.errors.name).toBeDefined();
  });

  it("should clear validation errors for a specific field", () => {
    const { result } = renderHook(() => useValidation());

    act(() => {
      result.current.validateField("field1", "Field 1", "", [{ type: "required" }]);
    });

    expect(result.current.errors.field1).toBeDefined();

    act(() => {
      result.current.clearError("field1");
    });

    expect(result.current.errors.field1).toBeUndefined();
  });

  it("should clear all errors", () => {
    const { result } = renderHook(() => useValidation());

    act(() => {
      result.current.validateField("field1", "Field 1", "", [{ type: "required" }]);
      result.current.validateField("field2", "Field 2", "", [{ type: "required" }]);
    });

    expect(result.current.errors.field1).toBeDefined();
    expect(result.current.errors.field2).toBeDefined();

    act(() => {
      result.current.clearAll();
    });

    expect(result.current.errors).toEqual({});
  });

  it("should check if has errors", () => {
    const { result } = renderHook(() => useValidation());

    expect(result.current.hasErrors).toBe(false);

    act(() => {
      result.current.validateField("field", "Field", "", [{ type: "required" }]);
    });

    expect(result.current.hasErrors).toBe(true);
  });
});
