/**
 * @file: db-queries.test.ts
 * @description: db-queries.test.ts description
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-03-31
 * @updated: 2026-03-31
 * @status: active
 * @tags: [type]
 */

// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as dbQueries from "../lib/db-queries";
import type { Model, Agent, NodeStatusRecord } from "../types";

describe("db-queries", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    // Reset module-level caches to prevent state pollution across tests
    dbQueries.resetDbModels();
    dbQueries.resetDbAgents();
    dbQueries.resetDbNodes();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe("Models CRUD", () => {
    it("should add a new model", () => {
      const newModel = {
        name: "Test Model",
        provider: "Test Provider",
        tier: "primary" as const,
        avg_latency_ms: 100,
        throughput: 1000,
        created_at: new Date().toISOString(),
      };

      const added = dbQueries.addDbModel(newModel);

      expect(added).toBeDefined();
      expect(added.name).toBe(newModel.name);
      expect(added.id).toMatch(/^m-\d+$/);
    });

    it("should update an existing model", () => {
      const newModel = {
        name: "Original Name",
        provider: "Provider",
        tier: "primary" as const,
        avg_latency_ms: 100,
        throughput: 1000,
        created_at: new Date().toISOString(),
      };

      const added = dbQueries.addDbModel(newModel);
      const updated = dbQueries.updateDbModel(added.id, { name: "Updated Name" });

      expect(updated).toBeDefined();
      expect(updated?.name).toBe("Updated Name");
    });

    it("should return null when updating non-existent model", () => {
      const updated = dbQueries.updateDbModel("non-existent", { name: "Updated" });
      expect(updated).toBeNull();
    });

    it("should delete a model", () => {
      const newModel = {
        name: "To Delete",
        provider: "Provider",
        tier: "primary" as const,
        avg_latency_ms: 100,
        throughput: 1000,
        created_at: new Date().toISOString(),
      };

      const added = dbQueries.addDbModel(newModel);
      const deleted = dbQueries.deleteDbModel(added.id);

      expect(deleted).toBe(true);
    });

    it("should return false when deleting non-existent model", () => {
      const deleted = dbQueries.deleteDbModel("non-existent");
      expect(deleted).toBe(false);
    });

    it("should reset models to defaults", () => {
      const newModel = {
        name: "Custom Model",
        provider: "Custom",
        tier: "primary" as const,
        avg_latency_ms: 100,
        throughput: 1000,
        created_at: new Date().toISOString(),
      };

      dbQueries.addDbModel(newModel);
      const reset = dbQueries.resetDbModels();

      expect(reset.length).toBeGreaterThan(0);
      expect(reset.every((m) => m.name !== "Custom Model")).toBe(true);
    });
  });

  describe("Agents CRUD", () => {
    it("should add a new agent", () => {
      const newAgent = {
        name: "Test Agent",
        name_cn: "测试代理",
        role: "coding" as const,
        description: "Test description",
        is_active: true,
      };

      const added = dbQueries.addDbAgent(newAgent);

      expect(added).toBeDefined();
      expect(added.name).toBe(newAgent.name);
      expect(added.id).toMatch(/^a-\d+$/);
    });

    it("should update an existing agent", () => {
      const newAgent = {
        name: "Original Agent",
        name_cn: "原始代理",
        role: "coding" as const,
        description: "Original description",
        is_active: true,
      };

      const added = dbQueries.addDbAgent(newAgent);
      const updated = dbQueries.updateDbAgent(added.id, { name: "Updated Agent" });

      expect(updated).toBeDefined();
      expect(updated?.name).toBe("Updated Agent");
    });

    it("should return null when updating non-existent agent", () => {
      const updated = dbQueries.updateDbAgent("non-existent", { name: "Updated" });
      expect(updated).toBeNull();
    });

    it("should delete an agent", () => {
      const newAgent = {
        name: "To Delete",
        name_cn: "删除",
        role: "coding" as const,
        description: "Test",
        is_active: true,
      };

      const added = dbQueries.addDbAgent(newAgent);
      const deleted = dbQueries.deleteDbAgent(added.id);

      expect(deleted).toBe(true);
    });

    it("should return false when deleting non-existent agent", () => {
      const deleted = dbQueries.deleteDbAgent("non-existent");
      expect(deleted).toBe(false);
    });

    it("should reset agents to defaults", () => {
      const newAgent = {
        name: "Custom Agent",
        name_cn: "自定义代理",
        role: "coding" as const,
        description: "Custom",
        is_active: true,
      };

      dbQueries.addDbAgent(newAgent);
      const reset = dbQueries.resetDbAgents();

      expect(reset.length).toBeGreaterThan(0);
      expect(reset.every((a) => a.name !== "Custom Agent")).toBe(true);
    });
  });

  describe("Nodes CRUD", () => {
    it("should add a new node", () => {
      const newNode = {
        hostname: "Test-Node",
        gpu_util: 50,
        mem_util: 50,
        temp_celsius: 60,
        model_deployed: "Test Model",
        active_tasks: 5,
        status: "active" as const,
      };

      const added = dbQueries.addDbNode(newNode);

      expect(added).toBeDefined();
      expect(added.hostname).toBe(newNode.hostname);
      expect(added.id).toMatch(/^n-\d+$/);
    });

    it("should update an existing node", () => {
      const newNode = {
        hostname: "Original Node",
        gpu_util: 50,
        mem_util: 50,
        temp_celsius: 60,
        model_deployed: "Test Model",
        active_tasks: 5,
        status: "active" as const,
      };

      const added = dbQueries.addDbNode(newNode);
      const updated = dbQueries.updateDbNode(added.id, { gpu_util: 80 });

      expect(updated).toBeDefined();
      expect(updated?.gpu_util).toBe(80);
    });

    it("should return null when updating non-existent node", () => {
      const updated = dbQueries.updateDbNode("non-existent", { gpu_util: 80 });
      expect(updated).toBeNull();
    });

    it("should delete a node", () => {
      const newNode = {
        hostname: "To Delete",
        gpu_util: 50,
        mem_util: 50,
        temp_celsius: 60,
        model_deployed: "Test Model",
        active_tasks: 5,
        status: "active" as const,
      };

      const added = dbQueries.addDbNode(newNode);
      const deleted = dbQueries.deleteDbNode(added.id);

      expect(deleted).toBe(true);
    });

    it("should return false when deleting non-existent node", () => {
      const deleted = dbQueries.deleteDbNode("non-existent");
      expect(deleted).toBe(false);
    });

    it("should reset nodes to defaults", () => {
      const newNode = {
        hostname: "Custom Node",
        gpu_util: 50,
        mem_util: 50,
        temp_celsius: 60,
        model_deployed: "Test Model",
        active_tasks: 5,
        status: "active" as const,
      };

      dbQueries.addDbNode(newNode);
      const reset = dbQueries.resetDbNodes();

      expect(reset.length).toBeGreaterThan(0);
      expect(reset.every((n) => n.hostname !== "Custom Node")).toBe(true);
    });
  });

  describe("Query Functions", () => {
    it("should get active models", async () => {
      const result = await dbQueries.getActiveModels();

      expect(result.data).toBeDefined();
      expect(result.error).toBeNull();
      expect(result.data.length).toBeGreaterThan(0);
    });

    it("should get recent logs", async () => {
      const result = await dbQueries.getRecentLogs(10);

      expect(result.data).toBeDefined();
      expect(result.error).toBeNull();
      expect(result.data.length).toBe(10);
    });

    it("should get model stats", async () => {
      const models = await dbQueries.getActiveModels();
      const modelId = models.data[0].id;

      const result = await dbQueries.getModelStats(modelId);

      expect(result.data).toBeDefined();
      expect(result.error).toBeNull();
      expect(result.data?.avgLatency).toBeGreaterThan(0);
    });

    it("should return null stats for non-existent model", async () => {
      const result = await dbQueries.getModelStats("non-existent");

      expect(result.data).toBeNull();
      expect(result.error).toBeNull();
    });

    it("should get nodes status", async () => {
      const result = await dbQueries.getNodesStatus();

      expect(result.data).toBeDefined();
      expect(result.error).toBeNull();
      expect(result.data.length).toBeGreaterThan(0);
    });

    it("should get active agents", async () => {
      const result = await dbQueries.getActiveAgents();

      expect(result.data).toBeDefined();
      expect(result.error).toBeNull();
      expect(result.data.every((a) => a.is_active)).toBe(true);
    });

    it("should get all agents", async () => {
      const result = await dbQueries.getAllAgents();

      expect(result.data).toBeDefined();
      expect(result.error).toBeNull();
      expect(result.data.length).toBeGreaterThan(0);
    });

    it("should get model by id", async () => {
      const models = await dbQueries.getActiveModels();
      const modelId = models.data[0].id;

      const result = await dbQueries.getModelById(modelId);

      expect(result.data).toBeDefined();
      expect(result.data?.id).toBe(modelId);
    });

    it("should return null for non-existent model", async () => {
      const result = await dbQueries.getModelById("non-existent");

      expect(result.data).toBeNull();
      expect(result.error).toBeNull();
    });

    it("should get node by id", async () => {
      const nodes = await dbQueries.getNodesStatus();
      const nodeId = nodes.data[0].id;

      const result = await dbQueries.getNodeById(nodeId);

      expect(result.data).toBeDefined();
      expect(result.data?.id).toBe(nodeId);
    });

    it("should return null for non-existent node", async () => {
      const result = await dbQueries.getNodeById("non-existent");

      expect(result.data).toBeNull();
      expect(result.error).toBeNull();
    });
  });

  describe("Import/Export", () => {
    it("should export database data", () => {
      const exported = dbQueries.exportDbData();

      expect(typeof exported).toBe("string");
      const data = JSON.parse(exported);
      expect(data.version).toBe(1);
      expect(data.exportedAt).toBeDefined();
      expect(data.models).toBeDefined();
      expect(data.agents).toBeDefined();
      expect(data.nodes).toBeDefined();
    });

    it("should import database data", () => {
      const exported = dbQueries.exportDbData();
      const imported = dbQueries.importDbData(exported);

      expect(imported).toBe(true);
    });

    it("should return false for invalid import data", () => {
      const imported = dbQueries.importDbData("invalid json");
      expect(imported).toBe(false);
    });

    it("should handle partial import data", () => {
      const partialData = JSON.stringify({
        version: 1,
        exportedAt: Date.now(),
        models: [
          { id: "m1", name: "Imported Model", provider: "Test", tier: "primary" as const, avg_latency_ms: 100, throughput: 1000, created_at: new Date().toISOString() },
        ],
      });

      const imported = dbQueries.importDbData(partialData);

      expect(imported).toBe(true);
    });
  });

  describe("localStorage Persistence", () => {
    it("should persist models to localStorage", () => {
      const newModel = {
        name: "Persistent Model",
        provider: "Test",
        tier: "primary" as const,
        avg_latency_ms: 100,
        throughput: 1000,
        created_at: new Date().toISOString(),
      };

      dbQueries.addDbModel(newModel);

      const stored = localStorage.getItem("yyc3_db_models");
      expect(stored).toBeDefined();

      const data = JSON.parse(stored!);
      expect(data.some((m: Model) => m.name === "Persistent Model")).toBe(true);
    });

    it("should handle localStorage write failure gracefully", () => {
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = vi.fn(() => {
        throw new Error("Storage quota exceeded");
      });

      const newModel = {
        name: "Failed Model",
        provider: "Test",
        tier: "primary" as const,
        avg_latency_ms: 100,
        throughput: 1000,
        created_at: new Date().toISOString(),
      };

      const result = dbQueries.addDbModel(newModel);
      expect(result).toBeDefined();

      localStorage.setItem = originalSetItem;
    });

    it("should persist agents to localStorage", () => {
      const newAgent = {
        name: "Persistent Agent",
        name_cn: "持久化代理",
        role: "coding" as const,
        description: "Test",
        is_active: true,
      };

      dbQueries.addDbAgent(newAgent);

      const stored = localStorage.getItem("yyc3_db_agents");
      expect(stored).toBeDefined();

      const data = JSON.parse(stored!);
      expect(data.some((a: Agent) => a.name === "Persistent Agent")).toBe(true);
    });

    it("should persist nodes to localStorage", () => {
      const newNode = {
        hostname: "Persistent Node",
        gpu_util: 50,
        mem_util: 50,
        temp_celsius: 60,
        model_deployed: "Test Model",
        active_tasks: 5,
        status: "active" as const,
      };

      dbQueries.addDbNode(newNode);

      const stored = localStorage.getItem("yyc3_db_nodes");
      expect(stored).toBeDefined();

      const data = JSON.parse(stored!);
      expect(data.some((n: NodeStatusRecord) => n.hostname === "Persistent Node")).toBe(true);
    });
  });

  describe("Integration", () => {
    it("should handle complete CRUD workflow", async () => {
      // Add
      const newModel = {
        name: "Workflow Model",
        provider: "Workflow",
        tier: "primary" as const,
        avg_latency_ms: 100,
        throughput: 1000,
        created_at: new Date().toISOString(),
      };

      const added = dbQueries.addDbModel(newModel);
      expect(added).toBeDefined();

      // Read
      const models = await dbQueries.getActiveModels();
      expect(models.data.some((m) => m.id === added.id)).toBe(true);

      // Update
      const updated = dbQueries.updateDbModel(added.id, { name: "Updated Workflow Model" });
      expect(updated?.name).toBe("Updated Workflow Model");

      // Delete
      const deleted = dbQueries.deleteDbModel(added.id);
      expect(deleted).toBe(true);

      // Verify deletion
      const modelsAfterDelete = await dbQueries.getActiveModels();
      expect(modelsAfterDelete.data.some((m) => m.id === added.id)).toBe(false);
    });
  });
});
