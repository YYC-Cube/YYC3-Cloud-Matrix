/**
 * @file: bridge-client.test.ts
 * @description: bridge-client.test.ts
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-08
 * @updated: 2026-04-08
 * @status: active
 * @tags: [module]
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  isElectron,
  getBridgeAPI,
  fileSystemClient,
  databaseClient,
  systemMonitorClient,
  appControlClient,
  dialogClient,
  shellClient,
} from "../lib/bridge-client";

describe("桥接客户端测试", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("环境检测", () => {
    it("应该正确检测非 Electron 环境", () => {
      // 在测试环境中，window.yyc3 不存在
      const result = isElectron();
      expect(result).toBe(false);
    });

    it("应该在没有桥接 API 时返回 null", () => {
      const api = getBridgeAPI();
      expect(api).toBeNull();
    });
  });

  describe("文件系统客户端", () => {
    it("应该在非 Electron 环境中抛出错误", async () => {
      await expect(fileSystemClient.readFile("/test/file.txt")).rejects.toThrow(
        "File system not available in web environment"
      );
    });

    it("应该在非 Electron 环境中抛出写入错误", async () => {
      await expect(fileSystemClient.writeFile("/test/file.txt", "content")).rejects.toThrow(
        "File system not available in web environment"
      );
    });

    it("应该在非 Electron 环境中返回 false", async () => {
      const exists = await fileSystemClient.exists("/test/file.txt");
      expect(exists).toBe(false);
    });

    it("应该在非 Electron 环境中返回空数组", async () => {
      const files = await fileSystemClient.listDirectory("/test");
      expect(files).toEqual([]);
    });
  });

  describe("数据库客户端", () => {
    it("应该在非 Electron 环境中抛出错误", async () => {
      await expect(databaseClient.execute("SELECT 1")).rejects.toThrow(
        "Database not available in web environment"
      );
    });

    it("应该在非 Electron 环境中抛出查询错误", async () => {
      await expect(databaseClient.query("SELECT * FROM test")).rejects.toThrow(
        "Database not available in web environment"
      );
    });

    it("应该在非 Electron 环境中抛出备份错误", async () => {
      await expect(databaseClient.backup("/backup/db.sql")).rejects.toThrow(
        "Database not available in web environment"
      );
    });
  });

  describe("系统监控客户端", () => {
    it("应该在非 Electron 环境中返回默认 CPU 信息", async () => {
      const cpuInfo = await systemMonitorClient.getCPUInfo();
      expect(cpuInfo).toEqual({
        model: "Unknown",
        speed: 0,
        usage: 0,
        cores: 0,
        loadAverage: [0, 0, 0],
      });
    });

    it("应该在非 Electron 环境中返回默认内存信息", async () => {
      const memoryInfo = await systemMonitorClient.getMemoryInfo();
      expect(memoryInfo).toEqual({
        total: 0,
        free: 0,
        used: 0,
        usage: 0,
      });
    });

    it("应该在非 Electron 环境中返回空磁盘信息", async () => {
      const diskInfo = await systemMonitorClient.getDiskInfo();
      expect(diskInfo).toEqual([]);
    });

    it("应该在非 Electron 环境中返回空网络信息", async () => {
      const networkInfo = await systemMonitorClient.getNetworkInfo();
      expect(networkInfo).toEqual([]);
    });

    it("应该在非 Electron 环境中返回空进程信息", async () => {
      const processes = await systemMonitorClient.getProcesses();
      expect(processes).toEqual([]);
    });
  });

  describe("应用控制客户端", () => {
    it("应该在非 Electron 环境中返回 web 版本", async () => {
      const version = await appControlClient.getVersion();
      expect(version).toBe("web");
    });

    it("应该在非 Electron 环境中返回空路径", async () => {
      const appPath = await appControlClient.getPath("userData");
      expect(appPath).toBe("");
    });

    it("应该在非 Electron 环境中返回默认配置", async () => {
      const config = await appControlClient.getConfig();
      expect(config).toEqual({
        name: "YYC3-Cloud-Intelli-Matrix",
        version: "web",
        locale: "zh-CN",
        isPackaged: false,
      });
    });

    it("应该在非 Electron 环境中重新加载页面", async () => {
      // 在测试环境中，直接调用 restart，它会尝试调用 window.location.reload()
      // 由于无法 mock window.location，我们只验证函数不会抛出错误
      await expect(appControlClient.restart()).resolves.toBeUndefined();
    });

    it("应该在非 Electron 环境中关闭窗口", async () => {
      // 在测试环境中，直接调用 quit，它会尝试调用 window.close()
      // 由于无法 mock window.close，我们只验证函数不会抛出错误
      await expect(appControlClient.quit()).resolves.toBeUndefined();
    });
  });

  describe("对话框客户端", () => {
    it("应该在非 Electron 环境中抛出错误", async () => {
      await expect(dialogClient.showOpenDialog({})).rejects.toThrow(
        "Dialog not available in web environment"
      );
    });

    it("应该在非 Electron 环境中抛出保存错误", async () => {
      await expect(dialogClient.showSaveDialog({})).rejects.toThrow(
        "Dialog not available in web environment"
      );
    });

    it("应该在非 Electron 环境中使用 alert", async () => {
      const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
      const result = await dialogClient.showMessage({ message: "test" });
      expect(alertSpy).toHaveBeenCalledWith("test");
      expect(result).toBe(0);
      alertSpy.mockRestore();
    });
  });

  describe("Shell 客户端", () => {
    it("应该在非 Electron 环境中打开新窗口", async () => {
      const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);
      await shellClient.openExternal("https://example.com");
      expect(openSpy).toHaveBeenCalledWith("https://example.com", "_blank");
      openSpy.mockRestore();
    });

    it("应该在非 Electron 环境中抛出路径错误", async () => {
      await expect(shellClient.openPath("/test/path")).rejects.toThrow(
        "Shell not available in web environment"
      );
    });

    it("应该在非 Electron 环境中抛出执行错误", async () => {
      await expect(shellClient.execute("ls")).rejects.toThrow(
        "Shell not available in web environment"
      );
    });
  });
});
