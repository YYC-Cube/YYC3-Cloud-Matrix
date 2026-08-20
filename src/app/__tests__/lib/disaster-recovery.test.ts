/**
 * @file: disaster-recovery.test.ts
 * @description: disaster-recovery.test.ts
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-08
 * @updated: 2026-04-08
 * @status: active
 * @tags: [lib]
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  DisasterRecovery,
  createDisasterRecovery,
  type DisasterScenario,
} from "../../lib/disaster-recovery";

describe("DisasterRecovery", () => {
  let dr: DisasterRecovery;

  beforeEach(() => {
    dr = createDisasterRecovery();
  });

  describe("constructor", () => {
    it("should initialize with default scenarios", () => {
      const scenarios = dr.getAllScenarios();
      expect(scenarios.length).toBeGreaterThan(0);
    });
  });

  describe("getAllScenarios", () => {
    it("should return all scenarios", () => {
      const scenarios = dr.getAllScenarios();
      expect(scenarios.length).toBeGreaterThan(0);
    });

    it("should include server-failure scenario", () => {
      const scenarios = dr.getAllScenarios();
      const serverFailure = scenarios.find((s) => s.type === "server-failure");
      expect(serverFailure).toBeDefined();
    });

    it("should include database-failure scenario", () => {
      const scenarios = dr.getAllScenarios();
      const dbFailure = scenarios.find((s) => s.type === "database-failure");
      expect(dbFailure).toBeDefined();
    });

    it("should include network-outage scenario", () => {
      const scenarios = dr.getAllScenarios();
      const networkOutage = scenarios.find((s) => s.type === "network-outage");
      expect(networkOutage).toBeDefined();
    });
  });

  describe("getScenario", () => {
    it("should return scenario by id", () => {
      const scenarios = dr.getAllScenarios();
      const scenario = dr.getScenario(scenarios[0].id);
      expect(scenario).toBeDefined();
    });

    it("should return undefined for non-existent id", () => {
      const scenario = dr.getScenario("non-existent");
      expect(scenario).toBeUndefined();
    });
  });

  describe("addScenario", () => {
    it("should add new scenario", () => {
      const newScenario = dr.addScenario({
        type: "natural-disaster",
        name: "自然灾害",
        description: "数据中心遭受自然灾害",
        severity: "critical",
        affectedComponents: ["datacenter"],
        recoverySteps: [],
        estimatedRTO: 240,
        estimatedRPO: 60,
        status: "pending",
      });

      expect(newScenario.id).toBeDefined();
      expect(newScenario.name).toBe("自然灾害");
    });
  });

  describe("runDrill", () => {
    it("should run drill and return result", async () => {
      const scenarios = dr.getAllScenarios();
      const result = await dr.runDrill(scenarios[0].id);

      expect(result.scenarioId).toBeDefined();
      expect(result.scenarioName).toBeDefined();
      expect(result.actualRTO).toBeGreaterThanOrEqual(0);
      expect(result.targetRTO).toBeDefined();
      expect(result.stepsTotal).toBeGreaterThan(0);
    });

    it("should update scenario status", async () => {
      const scenarios = dr.getAllScenarios();
      await dr.runDrill(scenarios[0].id);
      const updated = dr.getScenario(scenarios[0].id);

      expect(updated?.status).toBeDefined();
      expect(["completed", "failed"]).toContain(updated?.status);
    });

    it("should record execution time", async () => {
      const scenarios = dr.getAllScenarios();
      await dr.runDrill(scenarios[0].id);
      const updated = dr.getScenario(scenarios[0].id);

      expect(updated?.startedAt).toBeDefined();
      expect(updated?.completedAt).toBeDefined();
    });

    it("should handle completed steps", async () => {
      const newScenario = dr.addScenario({
        type: "data-corruption",
        name: "测试完成",
        description: "测试场景",
        severity: "high",
        affectedComponents: ["test"],
        recoverySteps: [
          {
            id: "complete-step",
            name: "完成步骤",
            description: "This will complete",
            order: 1,
            status: "pending",
            automated: true,
          },
        ],
        estimatedRTO: 10,
        estimatedRPO: 5,
        status: "pending",
      });

      const result = await dr.runDrill(newScenario.id);
      expect(result.stepsCompleted).toBe(1);
      expect(result.stepsTotal).toBe(1);
    });
  });

  describe("generateReport", () => {
    it("should generate report after drills", async () => {
      const scenarios = dr.getAllScenarios();
      await dr.runDrill(scenarios[0].id);

      const report = dr.generateReport();

      expect(report.results.length).toBe(1);
      expect(report.summary.total).toBe(1);
      expect(report.generatedAt).toBeDefined();
    });

    it("should calculate summary statistics", async () => {
      const scenarios = dr.getAllScenarios();
      await dr.runDrill(scenarios[0].id);

      const report = dr.generateReport();

      expect(report.summary.passed + report.summary.failed).toBe(report.summary.total);
      expect(report.summary.averageRTO).toBeGreaterThanOrEqual(0);
      expect(report.summary.rtoComplianceRate).toBeGreaterThanOrEqual(0);
    });

    it("should calculate automation rate", async () => {
      const scenarios = dr.getAllScenarios();
      await dr.runDrill(scenarios[0].id);

      const report = dr.generateReport();

      expect(report.summary.automationRate).toBeGreaterThanOrEqual(0);
      expect(report.summary.automationRate).toBeLessThanOrEqual(100);
    });

    it("should generate recommendations", async () => {
      const scenarios = dr.getAllScenarios();
      await dr.runDrill(scenarios[0].id);

      const report = dr.generateReport();

      expect(report.recommendations).toBeDefined();
      expect(Array.isArray(report.recommendations)).toBe(true);
    });
  });

  describe("runAllDrills", () => {
    it("should run all drills and generate report", async () => {
      const report = await dr.runAllDrills();

      expect(report.results.length).toBeGreaterThan(0);
      expect(report.summary.total).toBeGreaterThan(0);
    });
  });

  describe("getResults", () => {
    it("should return all results", async () => {
      const scenarios = dr.getAllScenarios();
      await dr.runDrill(scenarios[0].id);

      const results = dr.getResults();
      expect(results.length).toBe(1);
    });
  });

  describe("clearResults", () => {
    it("should clear all results", async () => {
      const scenarios = dr.getAllScenarios();
      await dr.runDrill(scenarios[0].id);
      dr.clearResults();

      const results = dr.getResults();
      expect(results).toHaveLength(0);
    });

    it("should reset scenario status", async () => {
      const scenarios = dr.getAllScenarios();
      await dr.runDrill(scenarios[0].id);
      dr.clearResults();

      const updated = dr.getScenario(scenarios[0].id);
      expect(updated?.status).toBe("pending");
    });
  });
});

describe("createDisasterRecovery", () => {
  it("should create new instance", () => {
    const dr = createDisasterRecovery();
    expect(dr).toBeInstanceOf(DisasterRecovery);
  });
});
