/**
 * @file: error-handler.test.ts
 * @description: error-handler 单元测试
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-05
 * @updated: 2026-04-08
 * @status: active
 * @tags: [module]
 */

// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  getErrorLog,
  clearErrorLog,
  getErrorStats,
  captureError,
  captureValidationError,
  captureNetworkError,
  captureWSError,
  captureAuthError,
  captureParseError,
  trySafe,
  trySafeSync,
  formatErrorForUser,
  getErrorIcon,
  getCategoryLabel,
  installGlobalErrorListeners,
  detectErrorCode,
  ERROR_RECOVERY_SUGGESTIONS,
  type ValidationErrorDetail,
} from "../lib/error-handler";

vi.mock("./yyc3-storage", () => ({
  idbPut: vi.fn(),
  idbGetAll: vi.fn(() => Promise.resolve([])),
  idbClear: vi.fn(),
}));

vi.mock("./figma-error-filter", () => ({
  isFigmaPlatformError: vi.fn(() => false),
}));

describe("ERROR_RECOVERY_SUGGESTIONS", () => {
  it("should have suggestions for all error codes", () => {
    expect(ERROR_RECOVERY_SUGGESTIONS.NETWORK_TIMEOUT).toBeDefined();
    expect(ERROR_RECOVERY_SUGGESTIONS.AUTH_EXPIRED).toBeDefined();
    expect(ERROR_RECOVERY_SUGGESTIONS.UNKNOWN).toBeDefined();
  });
});

describe("getErrorLog", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("should return empty array when no errors", () => {
    const log = getErrorLog();
    expect(Array.isArray(log)).toBe(true);
  });

  it("should return stored errors", () => {
    const error = {
      id: "test-1",
      category: "RUNTIME" as const,
      severity: "error" as const,
      message: "Test error",
      timestamp: Date.now(),
      resolved: false,
    };
    localStorage.setItem("yyc3_error_log", JSON.stringify([error]));

    const log = getErrorLog();
    expect(log.length).toBeGreaterThan(0);
    expect(log[0].message).toBe("Test error");
  });

  it("should handle invalid JSON", () => {
    localStorage.setItem("yyc3_error_log", "invalid json");

    const log = getErrorLog();
    expect(Array.isArray(log)).toBe(true);
  });
});

describe("clearErrorLog", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("should clear error log", () => {
    localStorage.setItem("yyc3_error_log", JSON.stringify([{ id: "test" }]));

    clearErrorLog();

    expect(localStorage.getItem("yyc3_error_log")).toBeNull();
  });
});

describe("getErrorStats", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("should return stats for empty log", () => {
    const stats = getErrorStats();

    expect(stats.total).toBe(0);
    expect(stats.unresolvedCount).toBe(0);
    expect(stats.byCategory).toBeDefined();
    expect(stats.bySeverity).toBeDefined();
  });

  it("should calculate stats correctly", () => {
    const errors = [
      {
        id: "1",
        category: "NETWORK" as const,
        severity: "error" as const,
        message: "Network error",
        timestamp: Date.now(),
        resolved: false,
      },
      {
        id: "2",
        category: "AUTH" as const,
        severity: "critical" as const,
        message: "Auth error",
        timestamp: Date.now(),
        resolved: true,
      },
    ];
    localStorage.setItem("yyc3_error_log", JSON.stringify(errors));

    const stats = getErrorStats();

    expect(stats.total).toBe(2);
    expect(stats.byCategory.NETWORK).toBe(1);
    expect(stats.byCategory.AUTH).toBe(1);
    expect(stats.bySeverity.error).toBe(1);
    expect(stats.bySeverity.critical).toBe(1);
    expect(stats.unresolvedCount).toBe(1);
  });
});

describe("captureError", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("should capture Error instance", () => {
    const error = new Error("Test error message");
    const appError = captureError(error);

    expect(appError.message).toBe("Test error message");
    expect(appError.category).toBeDefined();
    expect(appError.severity).toBeDefined();
    expect(appError.timestamp).toBeDefined();
    expect(appError.resolved).toBe(false);
  });

  it("should capture string error", () => {
    const appError = captureError("String error");

    expect(appError.message).toBe("String error");
  });

  it("should capture object with message", () => {
    const appError = captureError({ message: "Object error" });

    expect(appError.message).toBe("Object error");
  });

  it("should use provided category and severity", () => {
    const appError = captureError(new Error("Test"), {
      category: "AUTH",
      severity: "critical",
    });

    expect(appError.category).toBe("AUTH");
    expect(appError.severity).toBe("critical");
  });

  it("should include source when provided", () => {
    const appError = captureError(new Error("Test"), {
      source: "TestComponent",
    });

    expect(appError.source).toBe("TestComponent");
  });

  it("should include detail when provided", () => {
    const appError = captureError(new Error("Test"), {
      detail: "Additional details",
    });

    expect(appError.detail).toBe("Additional details");
  });
});

describe("captureValidationError", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("should capture validation errors", () => {
    const errors: ValidationErrorDetail[] = [
      { field: "email", message: "Invalid email", code: "INVALID_FORMAT" },
      { field: "name", message: "Required", code: "REQUIRED" },
    ];

    const appError = captureValidationError(errors, "TestForm");

    expect(appError.category).toBe("VALIDATION");
    expect(appError.message).toContain("email");
    expect(appError.message).toContain("name");
    expect(appError.source).toBe("TestForm");
  });
});

describe("captureNetworkError", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("should capture network error", () => {
    const appError = captureNetworkError(new Error("Network failed"), "/api/test");

    expect(appError.category).toBe("NETWORK");
    expect(appError.source).toBe("/api/test");
  });
});

describe("captureWSError", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("should capture WebSocket error", () => {
    const appError = captureWSError(new Error("WS failed"));

    expect(appError.category).toBe("NETWORK");
    expect(appError.source).toBe("WebSocket");
  });
});

describe("captureAuthError", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("should capture auth error", () => {
    const appError = captureAuthError(new Error("Auth failed"));

    expect(appError.category).toBe("AUTH");
  });
});

describe("captureParseError", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("should capture parse error", () => {
    const appError = captureParseError(new Error("Parse failed"), "JSONParser");

    expect(appError.category).toBe("PARSE");
    expect(appError.source).toBe("JSONParser");
  });
});

describe("trySafe", () => {
  it("should return result on success", async () => {
    const [result, error] = await trySafe(() => Promise.resolve("success"));

    expect(result).toBe("success");
    expect(error).toBeNull();
  });

  it("should return error on failure", async () => {
    const [result, error] = await trySafe(() => Promise.reject(new Error("Failed")));

    expect(result).toBeNull();
    expect(error).not.toBeNull();
    expect(error?.message).toBe("Failed");
  });
});

describe("trySafeSync", () => {
  it("should return result on success", () => {
    const [result, error] = trySafeSync(() => "success");

    expect(result).toBe("success");
    expect(error).toBeNull();
  });

  it("should return error on failure", () => {
    const [result, error] = trySafeSync(() => {
      throw new Error("Failed");
    });

    expect(result).toBeNull();
    expect(error).not.toBeNull();
    expect(error?.message).toBe("Failed");
  });
});

describe("formatErrorForUser", () => {
  it("should format error message", () => {
    const error = {
      id: "1",
      category: "NETWORK" as const,
      severity: "error" as const,
      message: "Connection failed",
      timestamp: Date.now(),
      resolved: false,
    };

    const formatted = formatErrorForUser(error);

    expect(formatted).toContain("Connection failed");
  });

  it("should include user action", () => {
    const error = {
      id: "1",
      category: "NETWORK" as const,
      severity: "error" as const,
      message: "Connection failed",
      userAction: "Check your network",
      timestamp: Date.now(),
      resolved: false,
    };

    const formatted = formatErrorForUser(error);

    expect(formatted).toContain("Check your network");
  });

  it("should include source", () => {
    const error = {
      id: "1",
      category: "NETWORK" as const,
      severity: "error" as const,
      message: "Connection failed",
      source: "API",
      timestamp: Date.now(),
      resolved: false,
    };

    const formatted = formatErrorForUser(error);

    expect(formatted).toContain("API");
  });
});

describe("getErrorIcon", () => {
  it("should return correct icons", () => {
    expect(getErrorIcon("critical")).toBe("🚨");
    expect(getErrorIcon("error")).toBe("❌");
    expect(getErrorIcon("warning")).toBe("⚠️");
    expect(getErrorIcon("info")).toBe("ℹ️");
  });
});

describe("getCategoryLabel", () => {
  it("should return correct labels", () => {
    expect(getCategoryLabel("NETWORK")).toBe("网络错误");
    expect(getCategoryLabel("AUTH")).toBe("认证错误");
    expect(getCategoryLabel("PARSE")).toBe("解析错误");
    expect(getCategoryLabel("RUNTIME")).toBe("运行时错误");
    expect(getCategoryLabel("VALIDATION")).toBe("验证错误");
    expect(getCategoryLabel("STORAGE")).toBe("存储错误");
    expect(getCategoryLabel("UNKNOWN")).toBe("未知错误");
  });
});

describe("detectErrorCode", () => {
  it("should detect network timeout", () => {
    const code = detectErrorCode(new Error("Request timeout"), "NETWORK");
    expect(code).toBe("NETWORK_TIMEOUT");
  });

  it("should detect network offline", () => {
    const code = detectErrorCode(new Error("Network offline"), "NETWORK");
    expect(code).toBe("NETWORK_OFFLINE");
  });

  it("should detect auth expired", () => {
    const code = detectErrorCode(new Error("Token expired"), "AUTH");
    expect(code).toBe("AUTH_EXPIRED");
  });

  it("should detect validation URL error", () => {
    const code = detectErrorCode(new Error("Invalid URL"), "VALIDATION");
    expect(code).toBe("VALIDATION_INVALID_URL");
  });

  it("should return UNKNOWN for unrecognized errors", () => {
    const code = detectErrorCode(new Error("Something weird"));
    expect(code).toBe("UNKNOWN");
  });
});

describe("installGlobalErrorListeners", () => {
  it("should install listeners only once", () => {
    const addEventListenerSpy = vi.spyOn(window, "addEventListener");

    installGlobalErrorListeners();
    installGlobalErrorListeners();

    expect(addEventListenerSpy).toHaveBeenCalledTimes(2);
    addEventListenerSpy.mockRestore();
  });
});
