/**
 * @file: useValidation.test.ts
 * @description: useValidation Hook单元测试
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-05
 * @updated: 2026-04-08
 * @status: active
 * @tags: [module]
 */

// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import {
  useValidation,
  validateUrl,
  validateApiKey,
  validatePort,
  validateIp,
  validateModelName,
  validateRange,
  validateFields,
  type ValidationRule,
} from "../hooks/useValidation";

describe("validateUrl", () => {
  it("should return null for valid http URL", () => {
    expect(validateUrl("http://example.com")).toBeNull();
  });

  it("should return null for valid https URL", () => {
    expect(validateUrl("https://example.com")).toBeNull();
  });

  it("should return null for valid ws URL", () => {
    expect(validateUrl("ws://example.com")).toBeNull();
  });

  it("should return null for valid wss URL", () => {
    expect(validateUrl("wss://example.com")).toBeNull();
  });

  it("should return null for empty value", () => {
    expect(validateUrl("")).toBeNull();
  });

  it("should return error for invalid URL", () => {
    expect(validateUrl("not-a-url")).toBe("URL 格式无效");
  });

  it("should return error for unsupported protocol", () => {
    expect(validateUrl("ftp://example.com")).toBe("URL 协议必须为 http/https/ws/wss");
  });
});

describe("validateApiKey", () => {
  it("should return null for valid API key", () => {
    expect(validateApiKey("sk-12345678")).toBeNull();
  });

  it("should return null for empty value", () => {
    expect(validateApiKey("")).toBeNull();
  });

  it("should return error for short API key", () => {
    expect(validateApiKey("short")).toBe("API Key 长度不足 (最少 8 位)");
  });

  it("should return error for API key with spaces", () => {
    expect(validateApiKey("sk-1234 5678")).toBe("API Key 不应包含空格");
  });
});

describe("validatePort", () => {
  it("should return null for valid port", () => {
    expect(validatePort(8080)).toBeNull();
  });

  it("should return null for valid port string", () => {
    expect(validatePort("3000")).toBeNull();
  });

  it("should return error for port below range", () => {
    expect(validatePort(0)).toBe("端口号范围 1-65535");
  });

  it("should return error for port above range", () => {
    expect(validatePort(70000)).toBe("端口号范围 1-65535");
  });

  it("should return error for non-numeric string", () => {
    expect(validatePort("abc")).toBe("端口号必须为数字");
  });
});

describe("validateIp", () => {
  it("should return null for valid IPv4", () => {
    expect(validateIp("192.168.1.1")).toBeNull();
  });

  it("should return null for valid CIDR", () => {
    expect(validateIp("192.168.1.0/24")).toBeNull();
  });

  it("should return null for empty value", () => {
    expect(validateIp("")).toBeNull();
  });

  it("should return error for invalid IP", () => {
    expect(validateIp("999.999.999.999")).toContain("IP 段超出范围");
  });

  it("should return error for invalid format", () => {
    expect(validateIp("not-an-ip")).toContain("无效 IP/CIDR");
  });

  it("should validate multiple IPs", () => {
    expect(validateIp("192.168.1.1\n10.0.0.1")).toBeNull();
  });
});

describe("validateModelName", () => {
  it("should return null for valid model name", () => {
    expect(validateModelName("gpt-4")).toBeNull();
  });

  it("should return null for empty value", () => {
    expect(validateModelName("")).toBeNull();
  });

  it("should return error for too long name", () => {
    const longName = "a".repeat(129);
    expect(validateModelName(longName)).toBe("模型名称过长 (最多 128 字符)");
  });

  it("should return error for name with invalid characters", () => {
    expect(validateModelName("model<name>")).toBe("模型名称包含非法字符");
  });
});

describe("validateRange", () => {
  it("should return null for value in range", () => {
    expect(validateRange(5, 0, 10)).toBeNull();
  });

  it("should return error for value below min", () => {
    expect(validateRange(-1, 0, 10)).toBe("不能小于 0");
  });

  it("should return error for value above max", () => {
    expect(validateRange(15, 0, 10)).toBe("不能大于 10");
  });

  it("should return error for non-numeric string", () => {
    expect(validateRange("abc")).toBe("必须为数字");
  });

  it("should work with only min", () => {
    expect(validateRange(5, 0)).toBeNull();
    expect(validateRange(-1, 0)).toBe("不能小于 0");
  });

  it("should work with only max", () => {
    expect(validateRange(5, undefined, 10)).toBeNull();
    expect(validateRange(15, undefined, 10)).toBe("不能大于 10");
  });
});

describe("validateFields", () => {
  it("should return valid result for empty rules", () => {
    const result = validateFields([]);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("should validate required field", () => {
    const rules: ValidationRule[] = [
      {
        field: "name",
        label: "名称",
        value: "",
        rules: [{ type: "required" }],
      },
    ];
    const result = validateFields(rules);
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].message).toBe("名称 不能为空");
  });

  it("should validate url field", () => {
    const rules: ValidationRule[] = [
      {
        field: "url",
        label: "URL",
        value: "not-a-url",
        rules: [{ type: "url" }],
      },
    ];
    const result = validateFields(rules);
    expect(result.valid).toBe(false);
    expect(result.errors[0].message).toBe("URL 格式无效");
  });

  it("should validate apiKey field", () => {
    const rules: ValidationRule[] = [
      {
        field: "apiKey",
        label: "API Key",
        value: "short",
        rules: [{ type: "apiKey" }],
      },
    ];
    const result = validateFields(rules);
    expect(result.valid).toBe(false);
    expect(result.errors[0].message).toBe("API Key 长度不足 (最少 8 位)");
  });

  it("should validate port field", () => {
    const rules: ValidationRule[] = [
      {
        field: "port",
        label: "端口",
        value: "70000",
        rules: [{ type: "port" }],
      },
    ];
    const result = validateFields(rules);
    expect(result.valid).toBe(false);
    expect(result.errors[0].message).toBe("端口号范围 1-65535");
  });

  it("should validate ip field", () => {
    const rules: ValidationRule[] = [
      {
        field: "ip",
        label: "IP",
        value: "not-an-ip",
        rules: [{ type: "ip" }],
      },
    ];
    const result = validateFields(rules);
    expect(result.valid).toBe(false);
  });

  it("should validate modelName field", () => {
    const rules: ValidationRule[] = [
      {
        field: "model",
        label: "模型",
        value: "model<name>",
        rules: [{ type: "modelName" }],
      },
    ];
    const result = validateFields(rules);
    expect(result.valid).toBe(false);
  });

  it("should validate range field", () => {
    const rules: ValidationRule[] = [
      {
        field: "count",
        label: "数量",
        value: 15,
        rules: [{ type: "range", min: 0, max: 10 }],
      },
    ];
    const result = validateFields(rules);
    expect(result.valid).toBe(false);
    expect(result.errors[0].message).toBe("不能大于 10");
  });

  it("should validate minLength field", () => {
    const rules: ValidationRule[] = [
      {
        field: "password",
        label: "密码",
        value: "abc",
        rules: [{ type: "minLength", min: 6 }],
      },
    ];
    const result = validateFields(rules);
    expect(result.valid).toBe(false);
    expect(result.errors[0].message).toBe("密码 最少 6 字符");
  });

  it("should validate maxLength field", () => {
    const rules: ValidationRule[] = [
      {
        field: "username",
        label: "用户名",
        value: "verylongusername",
        rules: [{ type: "maxLength", max: 10 }],
      },
    ];
    const result = validateFields(rules);
    expect(result.valid).toBe(false);
    expect(result.errors[0].message).toBe("用户名 最多 10 字符");
  });

  it("should validate pattern field", () => {
    const rules: ValidationRule[] = [
      {
        field: "email",
        label: "邮箱",
        value: "not-an-email",
        rules: [{ type: "pattern", regex: /^[\w.-]+@[\w.-]+\.\w+$/ }],
      },
    ];
    const result = validateFields(rules);
    expect(result.valid).toBe(false);
    expect(result.errors[0].message).toBe("邮箱 格式不正确");
  });

  it("should validate custom field", () => {
    const rules: ValidationRule[] = [
      {
        field: "custom",
        label: "自定义",
        value: "invalid",
        rules: [
          {
            type: "custom",
            validate: (val) => (val === "valid" ? null : "必须是 valid"),
          },
        ],
      },
    ];
    const result = validateFields(rules);
    expect(result.valid).toBe(false);
    expect(result.errors[0].message).toBe("必须是 valid");
  });

  it("should return errorMap", () => {
    const rules: ValidationRule[] = [
      {
        field: "name",
        label: "名称",
        value: "",
        rules: [{ type: "required" }],
      },
    ];
    const result = validateFields(rules);
    expect(result.errorMap.name).toBe("名称 不能为空");
  });

  it("should only report first error per field", () => {
    const rules: ValidationRule[] = [
      {
        field: "value",
        label: "值",
        value: "",
        rules: [{ type: "required" }, { type: "minLength", min: 5 }],
      },
    ];
    const result = validateFields(rules);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].message).toBe("值 不能为空");
  });
});

describe("useValidation hook", () => {
  it("should initialize with empty errors", () => {
    const { result } = renderHook(() => useValidation());
    expect(result.current.errors).toEqual({});
    expect(result.current.hasErrors).toBe(false);
  });

  it("should validate single field", () => {
    const { result } = renderHook(() => useValidation());

    act(() => {
      const isValid = result.current.validateField(
        "name",
        "名称",
        "",
        [{ type: "required" }]
      );
      expect(isValid).toBe(false);
    });

    expect(result.current.errors.name).toBe("名称 不能为空");
    expect(result.current.hasErrors).toBe(true);
  });

  it("should validate all fields", () => {
    const { result } = renderHook(() => useValidation());

    act(() => {
      const isValid = result.current.validateAll([
        {
          field: "name",
          label: "名称",
          value: "",
          rules: [{ type: "required" }],
        },
        {
          field: "email",
          label: "邮箱",
          value: "",
          rules: [{ type: "required" }],
        },
      ]);
      expect(isValid).toBe(false);
    });

    expect(result.current.errors.name).toBe("名称 不能为空");
    expect(result.current.errors.email).toBe("邮箱 不能为空");
  });

  it("should clear single error", () => {
    const { result } = renderHook(() => useValidation());

    act(() => {
      result.current.validateField("name", "名称", "", [{ type: "required" }]);
    });

    expect(result.current.errors.name).toBeDefined();

    act(() => {
      result.current.clearError("name");
    });

    expect(result.current.errors.name).toBeUndefined();
  });

  it("should clear all errors", () => {
    const { result } = renderHook(() => useValidation());

    act(() => {
      result.current.validateAll([
        {
          field: "name",
          label: "名称",
          value: "",
          rules: [{ type: "required" }],
        },
        {
          field: "email",
          label: "邮箱",
          value: "",
          rules: [{ type: "required" }],
        },
      ]);
    });

    expect(result.current.hasErrors).toBe(true);

    act(() => {
      result.current.clearAll();
    });

    expect(result.current.errors).toEqual({});
    expect(result.current.hasErrors).toBe(false);
  });

  it("should remove error when field becomes valid", () => {
    const { result } = renderHook(() => useValidation());

    act(() => {
      result.current.validateField("name", "名称", "", [{ type: "required" }]);
    });

    expect(result.current.errors.name).toBeDefined();

    act(() => {
      result.current.validateField("name", "名称", "valid", [{ type: "required" }]);
    });

    expect(result.current.errors.name).toBeUndefined();
  });
});
