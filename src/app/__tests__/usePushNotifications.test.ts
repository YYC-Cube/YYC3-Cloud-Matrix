/**
 * @file: usePushNotifications.test.ts
 * @description: usePushNotifications Hook 测试套件
 * @author: YanYuCloudCube Team
 * @version: v2.0.0
 * @created: 2026-03-31
 * @updated: 2026-04-30
 * @status: active
 * @tags: [hook],[test]
 */

// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockShow = vi.fn().mockResolvedValue("sent");
const mockGetPermission = vi.fn().mockResolvedValue("granted");
const mockRequestPermission = vi.fn().mockResolvedValue("granted");
let mockIsElectron = false;

vi.mock("../lib/bridge-client", () => ({
  notificationClient: {
    show: (...args: any[]) => mockShow(...args),
    getPermission: (...args: any[]) => mockGetPermission(...args),
    requestPermission: (...args: any[]) => mockRequestPermission(...args),
  },
  isElectron: () => mockIsElectron,
}));

import { usePushNotifications } from "../hooks/usePushNotifications";

describe("usePushNotifications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsElectron = false;
    mockShow.mockResolvedValue("sent");
    mockGetPermission.mockResolvedValue("granted");
    mockRequestPermission.mockResolvedValue("granted");

    const ctor = vi.fn(function (this: any) {}) as any;
    ctor.permission = "granted" as NotificationPermission;
    ctor.requestPermission = vi.fn().mockResolvedValue("granted");
    global.Notification = ctor;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("initial state", () => {
    it("should initialize with supported=true when Notification API exists", () => {
      const { result } = renderHook(() => usePushNotifications());
      expect(result.current.supported).toBe(true);
    });

    it("should initialize with granted permission in Electron", () => {
      mockIsElectron = true;
      const { result } = renderHook(() => usePushNotifications());
      expect(result.current.permission).toBe("granted");
    });

    it("should initialize as not supported when Notification API unavailable", () => {
      delete (global as any).Notification;
      const { result } = renderHook(() => usePushNotifications());
      expect(result.current.supported).toBe(false);
    });
  });

  describe("requestPermission", () => {
    it("should request permission and update state", async () => {
      mockRequestPermission.mockResolvedValue("granted");
      const { result } = renderHook(() => usePushNotifications());

      const permission = await act(async () => {
        return await result.current.requestPermission();
      });

      expect(permission).toBe("granted");
    });

    it("should handle denied permission", async () => {
      mockRequestPermission.mockResolvedValue("denied");
      const { result } = renderHook(() => usePushNotifications());

      const permission = await act(async () => {
        return await result.current.requestPermission();
      });

      expect(permission).toBe("denied");
    });
  });

  describe("showNotification", () => {
    it("should call notificationClient.show with correct options", async () => {
      mockShow.mockResolvedValue("sent");
      const { result } = renderHook(() => usePushNotifications());

      await act(async () => {
        await result.current.showNotification("Test Title", { body: "Test Body" });
      });

      expect(mockShow).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Test Title",
          body: "Test Body",
        }),
      );
    });

    it("should use default icon when not provided", async () => {
      mockShow.mockResolvedValue("sent");
      const { result } = renderHook(() => usePushNotifications());

      await act(async () => {
        await result.current.showNotification("Test");
      });

      expect(mockShow).toHaveBeenCalledWith(
        expect.objectContaining({
          icon: "/yyc3-icons/Web App/android-chrome-192.png",
        }),
      );
    });

    it("should return null when notification fails", async () => {
      mockShow.mockResolvedValue("failed");
      const { result } = renderHook(() => usePushNotifications());

      const notification = await act(async () => {
        return await result.current.showNotification("Test");
      });

      expect(notification).toBeNull();
    });
  });

  describe("sendAlert", () => {
    it("should send info alert", async () => {
      mockShow.mockResolvedValue("sent");
      const { result } = renderHook(() => usePushNotifications());

      await act(async () => {
        await result.current.sendAlert("info", "Test Message", "Test Detail");
      });

      expect(mockShow).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "CP-IM 信息",
          body: "Test Message\nTest Detail",
          tag: "cpim-alert-info",
        }),
      );
    });

    it("should send error alert with requireInteraction", async () => {
      mockShow.mockResolvedValue("sent");
      const { result } = renderHook(() => usePushNotifications());

      await act(async () => {
        await result.current.sendAlert("error", "Test Error", "Detail");
      });

      expect(mockShow).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "CP-IM 错误",
          requireInteraction: true,
        }),
      );
    });

    it("should send critical alert with requireInteraction", async () => {
      mockShow.mockResolvedValue("sent");
      const { result } = renderHook(() => usePushNotifications());

      await act(async () => {
        await result.current.sendAlert("critical", "Critical Alert");
      });

      expect(mockShow).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "CP-IM 严重告警",
          requireInteraction: true,
        }),
      );
    });

    it("should handle alert without detail", async () => {
      mockShow.mockResolvedValue("sent");
      const { result } = renderHook(() => usePushNotifications());

      await act(async () => {
        await result.current.sendAlert("warning", "Test Warning");
      });

      expect(mockShow).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "CP-IM 告警",
          body: "Test Warning",
        }),
      );
    });
  });

  describe("Electron mode", () => {
    it("should always report supported in Electron", () => {
      mockIsElectron = true;
      delete (global as any).Notification;

      const { result } = renderHook(() => usePushNotifications());
      expect(result.current.supported).toBe(true);
    });

    it("should auto-grant permission in Electron", () => {
      mockIsElectron = true;
      const { result } = renderHook(() => usePushNotifications());
      expect(result.current.permission).toBe("granted");
    });
  });
});
