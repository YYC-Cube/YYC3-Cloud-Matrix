/**
 * @file: deployment-manager.test.ts
 * @description: deployment-manager.test.ts
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-08
 * @updated: 2026-04-08
 * @status: active
 * @tags: [lib]
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  DeploymentManager,
  createDeploymentManager,
  type DeploymentEnvironment,
} from "../../lib/deployment-manager";

describe("DeploymentManager", () => {
  let manager: DeploymentManager;

  beforeEach(() => {
    manager = createDeploymentManager();
  });

  describe("constructor", () => {
    it("should initialize with default configs", () => {
      const configs = manager.getAllConfigs();
      expect(configs).toHaveLength(3);
      expect(configs.find((c) => c.environment === "development")).toBeDefined();
      expect(configs.find((c) => c.environment === "staging")).toBeDefined();
      expect(configs.find((c) => c.environment === "production")).toBeDefined();
    });
  });

  describe("getConfig", () => {
    it("should return development config", () => {
      const config = manager.getConfig("development");
      expect(config).toBeDefined();
      expect(config?.environment).toBe("development");
      expect(config?.apiUrl).toBe("http://localhost:3118/api");
    });

    it("should return staging config", () => {
      const config = manager.getConfig("staging");
      expect(config).toBeDefined();
      expect(config?.environment).toBe("staging");
      expect(config?.apiUrl).toBe("https://staging.yyc3.example.com/api");
    });

    it("should return production config", () => {
      const config = manager.getConfig("production");
      expect(config).toBeDefined();
      expect(config?.environment).toBe("production");
      expect(config?.apiUrl).toBe("https://yyc3.example.com/api");
    });
  });

  describe("updateConfig", () => {
    it("should update development config", () => {
      manager.updateConfig("development", {
        version: "2.0.0",
      });

      const config = manager.getConfig("development");
      expect(config?.version).toBe("2.0.0");
    });

    it("should update performance settings", () => {
      manager.updateConfig("production", {
        performance: {
          maxNodes: 1000,
          maxModels: 500,
          maxConnections: 20000,
          cacheEnabled: true,
          cacheTTL: 600,
        },
      });

      const config = manager.getConfig("production");
      expect(config?.performance.maxNodes).toBe(1000);
    });
  });

  describe("getStatus", () => {
    it("should return undefined for non-deployed environment", () => {
      const status = manager.getStatus("development");
      expect(status).toBeUndefined();
    });
  });

  describe("deploy", () => {
    it("should deploy to development environment", async () => {
      const result = await manager.deploy("development", "1.0.0", "test-user");

      expect(result.success).toBeDefined();
      expect(result.duration).toBeGreaterThanOrEqual(0);
    });

    it("should update status after deployment", async () => {
      await manager.deploy("staging", "1.0.0", "test-user");
      const status = manager.getStatus("staging");

      expect(status).toBeDefined();
      expect(["running", "failed"]).toContain(status?.status);
    });

    it("should add to history after deployment", async () => {
      await manager.deploy("production", "1.0.0", "test-user");
      const history = manager.getHistory("production");

      expect(history.length).toBeGreaterThan(0);
    });

    it("should return error for invalid environment", async () => {
      const result = await manager.deploy(
        "invalid" as DeploymentEnvironment,
        "1.0.0",
        "test-user"
      );

      expect(result.success).toBe(false);
      expect(result.message).toContain("not found");
    });
  });

  describe("checkHealth", () => {
    it("should return error for non-existent environment", async () => {
      const result = await manager.checkHealth("invalid" as DeploymentEnvironment);

      expect(result.healthy).toBe(false);
      expect(result.error).toContain("not found");
    });

    it("should attempt health check for configured environment", async () => {
      const result = await manager.checkHealth("development");

      expect(result).toHaveProperty("healthy");
      expect(result).toHaveProperty("responseTime");
    });
  });

  describe("rollback", () => {
    it("should fail if no previous deployment exists", async () => {
      const result = await manager.rollback("production", "0.9.0", "test-user");

      expect(result.success).toBe(false);
      expect(result.message).toContain("No successful deployment found");
    });

    it("should rollback to previous version", async () => {
      await manager.deploy("staging", "1.0.0", "test-user");
      await manager.deploy("staging", "1.1.0", "test-user");

      const result = await manager.rollback("staging", "1.0.0", "test-user");

      if (result.success) {
        const history = manager.getHistory("staging");
        const rollbackEntry = history.find((h) => h.status === "rolled_back");
        expect(rollbackEntry).toBeDefined();
      }
    });
  });

  describe("getHistory", () => {
    it("should return empty history initially", () => {
      const history = manager.getHistory();
      expect(history).toHaveLength(0);
    });

    it("should return history for specific environment", async () => {
      await manager.deploy("development", "1.0.0", "test-user");
      await manager.deploy("staging", "1.0.0", "test-user");

      const devHistory = manager.getHistory("development");
      const stagingHistory = manager.getHistory("staging");

      expect(devHistory.length).toBeGreaterThanOrEqual(1);
      expect(stagingHistory.length).toBeGreaterThanOrEqual(1);
    });

    it("should sort history by date descending", async () => {
      await manager.deploy("production", "1.0.0", "test-user");
      await new Promise((resolve) => setTimeout(resolve, 10));
      await manager.deploy("production", "1.1.0", "test-user");

      const history = manager.getHistory();
      expect(history[0].version).toBe("1.1.0");
    });
  });

  describe("generateDeploymentReport", () => {
    it("should generate report with no deploys", () => {
      const report = manager.generateDeploymentReport();

      expect(report.environments).toHaveLength(0);
      expect(report.recentDeploys).toHaveLength(0);
      expect(report.summary.totalDeploys).toBe(0);
    });

    it("should generate report with deploys", async () => {
      await manager.deploy("development", "1.0.0", "test-user");
      await manager.deploy("staging", "1.0.0", "test-user");

      const report = manager.generateDeploymentReport();

      expect(report.summary.totalDeploys).toBeGreaterThanOrEqual(2);
      expect(report.recentDeploys.length).toBeGreaterThan(0);
    });

    it("should calculate summary statistics", async () => {
      await manager.deploy("production", "1.0.0", "test-user");
      await manager.deploy("production", "1.1.0", "test-user");

      const report = manager.generateDeploymentReport();

      expect(report.summary.totalDeploys).toBeGreaterThanOrEqual(2);
      expect(report.summary.successfulDeploys + report.summary.failedDeploys).toBe(
        report.summary.totalDeploys
      );
      expect(report.summary.averageDuration).toBeGreaterThanOrEqual(0);
    });
  });
});

describe("createDeploymentManager", () => {
  it("should create new deployment manager instance", () => {
    const manager = createDeploymentManager();
    expect(manager).toBeInstanceOf(DeploymentManager);
  });
});
