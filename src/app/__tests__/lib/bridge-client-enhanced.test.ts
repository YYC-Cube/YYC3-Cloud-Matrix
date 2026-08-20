/**
 * @file: bridge-client-enhanced.test.ts
 * @description: bridge-client-enhanced.test.ts
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-08
 * @updated: 2026-04-08
 * @status: active
 * @tags: [lib]
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  isElectron,
  getBridgeAPI,
  fileSystemClient,
  databaseClient,
  systemMonitorClient,
  appControlClient,
  dialogClient,
  shellClient,
} from "../../lib/bridge-client";

vi.mock("../../lib/bridge-client", async () => {
  const actual = await vi.importActual("../../lib/bridge-client");
  return {
    ...actual,
  };
});

describe("Bridge Client", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("isElectron", () => {
    it("should return false in web environment", () => {
      expect(isElectron()).toBe(false);
    });
  });

  describe("getBridgeAPI", () => {
    it("should return null in web environment", () => {
      expect(getBridgeAPI()).toBe(null);
    });
  });

  describe("fileSystemClient", () => {
    describe("readFile", () => {
      it("should throw error when not in Electron", async () => {
        await expect(fileSystemClient.readFile("/test")).rejects.toThrow(
          "File system not available in web environment"
        );
      });
    });

    describe("writeFile", () => {
      it("should throw error when not in Electron", async () => {
        await expect(
          fileSystemClient.writeFile("/test", "content")
        ).rejects.toThrow("File system not available in web environment");
      });
    });

    describe("deleteFile", () => {
      it("should throw error when not in Electron", async () => {
        await expect(fileSystemClient.deleteFile("/test")).rejects.toThrow(
          "File system not available in web environment"
        );
      });
    });

    describe("exists", () => {
      it("should return false when not in Electron", async () => {
        const result = await fileSystemClient.exists("/test");
        expect(result).toBe(false);
      });
    });

    describe("listDirectory", () => {
      it("should return empty array when not in Electron", async () => {
        const result = await fileSystemClient.listDirectory("/test");
        expect(result).toEqual([]);
      });

      it("should support recursive option", async () => {
        const result = await fileSystemClient.listDirectory("/test", true);
        expect(result).toEqual([]);
      });
    });

    describe("getFileInfo", () => {
      it("should throw error when not in Electron", async () => {
        await expect(fileSystemClient.getFileInfo("/test")).rejects.toThrow(
          "File system not available in web environment"
        );
      });
    });

    describe("createDirectory", () => {
      it("should throw error when not in Electron", async () => {
        await expect(
          fileSystemClient.createDirectory("/test")
        ).rejects.toThrow("File system not available in web environment");
      });
    });

    describe("copyFile", () => {
      it("should throw error when not in Electron", async () => {
        await expect(
          fileSystemClient.copyFile("/source", "/dest")
        ).rejects.toThrow("File system not available in web environment");
      });
    });

    describe("moveFile", () => {
      it("should throw error when not in Electron", async () => {
        await expect(
          fileSystemClient.moveFile("/source", "/dest")
        ).rejects.toThrow("File system not available in web environment");
      });
    });
  });

  describe("databaseClient", () => {
    describe("execute", () => {
      it("should throw error when not in Electron", async () => {
        await expect(databaseClient.execute("SELECT 1")).rejects.toThrow(
          "Database not available in web environment"
        );
      });
    });

    describe("query", () => {
      it("should throw error when not in Electron", async () => {
        await expect(databaseClient.query("SELECT 1")).rejects.toThrow(
          "Database not available in web environment"
        );
      });

      it("should accept generic type parameter", async () => {
        await expect(
          databaseClient.query<{ id: number; name: string }>("SELECT * FROM test")
        ).rejects.toThrow("Database not available in web environment");
      });
    });

    describe("backup", () => {
      it("should throw error when not in Electron", async () => {
        await expect(databaseClient.backup("/backup.db")).rejects.toThrow(
          "Database not available in web environment"
        );
      });
    });

    describe("restore", () => {
      it("should throw error when not in Electron", async () => {
        await expect(databaseClient.restore("/backup.db")).rejects.toThrow(
          "Database not available in web environment"
        );
      });
    });

    describe("migrate", () => {
      it("should throw error when not in Electron", async () => {
        await expect(databaseClient.migrate()).rejects.toThrow(
          "Database not available in web environment"
        );
      });
    });
  });

  describe("systemMonitorClient", () => {
    describe("getCPUInfo", () => {
      it("should return default CPU info when not in Electron", async () => {
        const result = await systemMonitorClient.getCPUInfo();
        expect(result).toEqual({
          model: "Unknown",
          speed: 0,
          usage: 0,
          cores: 0,
          loadAverage: [0, 0, 0],
        });
      });
    });

    describe("getMemoryInfo", () => {
      it("should return default memory info when not in Electron", async () => {
        const result = await systemMonitorClient.getMemoryInfo();
        expect(result).toEqual({
          total: 0,
          free: 0,
          used: 0,
          usage: 0,
        });
      });
    });

    describe("getDiskInfo", () => {
      it("should return empty array when not in Electron", async () => {
        const result = await systemMonitorClient.getDiskInfo();
        expect(result).toEqual([]);
      });
    });

    describe("getNetworkInfo", () => {
      it("should return empty array when not in Electron", async () => {
        const result = await systemMonitorClient.getNetworkInfo();
        expect(result).toEqual([]);
      });
    });

    describe("getProcesses", () => {
      it("should return empty array when not in Electron", async () => {
        const result = await systemMonitorClient.getProcesses();
        expect(result).toEqual([]);
      });
    });
  });

  describe("appControlClient", () => {
    describe("getVersion", () => {
      it("should return web version when not in Electron", async () => {
        const result = await appControlClient.getVersion();
        expect(result).toBe("web");
      });
    });

    describe("getPath", () => {
      it("should return empty string when not in Electron", async () => {
        const result = await appControlClient.getPath("userData");
        expect(result).toBe("");
      });
    });

    describe("getConfig", () => {
      it("should return default config when not in Electron", async () => {
        const result = await appControlClient.getConfig();
        expect(result).toEqual({
          name: "YYC3-Cloud-Intelli-Matrix",
          version: "web",
          locale: "zh-CN",
          isPackaged: false,
        });
      });
    });

    describe("restart", () => {
      it("should reload page when not in Electron", async () => {
        const reloadMock = vi.fn();
        const originalLocation = window.location;
        
        Object.defineProperty(window, "location", {
          value: { reload: reloadMock },
          writable: true,
          configurable: true,
        });
        
        await appControlClient.restart();
        expect(reloadMock).toHaveBeenCalled();
        
        Object.defineProperty(window, "location", {
          value: originalLocation,
          writable: true,
          configurable: true,
        });
      });
    });

    describe("quit", () => {
      it("should try to close window when not in Electron", async () => {
        const closeSpy = vi.spyOn(window, "close");
        await appControlClient.quit();
        expect(closeSpy).toHaveBeenCalled();
      });
    });
  });

  describe("dialogClient", () => {
    describe("showOpenDialog", () => {
      it("should throw error when not in Electron", async () => {
        await expect(
          dialogClient.showOpenDialog({ title: "Open File" })
        ).rejects.toThrow("Dialog not available in web environment");
      });
    });

    describe("showSaveDialog", () => {
      it("should throw error when not in Electron", async () => {
        await expect(
          dialogClient.showSaveDialog({ title: "Save File" })
        ).rejects.toThrow("Dialog not available in web environment");
      });
    });

    describe("showMessage", () => {
      it("should use alert and return 0 when not in Electron", async () => {
        const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
        const result = await dialogClient.showMessage({
          type: "info",
          title: "Test",
          message: "Test message",
        });
        expect(alertSpy).toHaveBeenCalledWith("Test message");
        expect(result).toBe(0);
      });
    });
  });

  describe("shellClient", () => {
    describe("openExternal", () => {
      it("should use window.open when not in Electron", async () => {
        const openSpy = vi
          .spyOn(window, "open")
          .mockReturnValue(null as unknown as Window);
        await shellClient.openExternal("https://example.com");
        expect(openSpy).toHaveBeenCalledWith("https://example.com", "_blank");
      });
    });

    describe("openPath", () => {
      it("should throw error when not in Electron", async () => {
        await expect(shellClient.openPath("/path")).rejects.toThrow(
          "Shell not available in web environment"
        );
      });
    });

    describe("execute", () => {
      it("should throw error when not in Electron", async () => {
        await expect(shellClient.execute("ls")).rejects.toThrow(
          "Shell not available in web environment"
        );
      });
    });
  });
});
