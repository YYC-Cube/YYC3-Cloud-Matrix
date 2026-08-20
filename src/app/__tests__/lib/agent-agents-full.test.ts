/**
 * @file: agent-agents-full.test.ts
 * @description: agent-agents-full.test.ts description
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-30
 * @updated: 2026-04-30
 * @status: active
 * @tags: [tag1],[tag2],[tag3]
 */

import { beforeEach, describe, expect, it } from "vitest";
import type { AgentTask } from "../../lib/agent/agent-types";
import { BoleroAgent } from "../../lib/agent/agents/bolero-agent";
import { CreativeAgent } from "../../lib/agent/agents/creative-agent";
import { MasterAgent } from "../../lib/agent/agents/master-agent";
import { MetaOracleAgent } from "../../lib/agent/agents/meta-oracle-agent";
import { NavigatorAgent } from "../../lib/agent/agents/navigator-agent";
import { ProphetAgent } from "../../lib/agent/agents/prophet-agent";
import { SentinelAgent } from "../../lib/agent/agents/sentinel-agent";
import { ThinkerAgent } from "../../lib/agent/agents/thinker-agent";
import { resetMCPServer } from "../../lib/mcp/mcp-server";
import { registerBuiltinAgents } from "../../lib/mcp/mcp-tools-builtin";

function createTask(desc: string): AgentTask {
  return {
    id: `t-${Date.now()}`,
    description: desc,
    priority: "normal",
    status: "pending",
    assigneeId: null,
    steps: [],
    dependencies: [],
    createdAt: Date.now(),
  };
}

describe("lib/agent/agents - All 8 Agent Implementations", () => {
  beforeEach(() => {
    resetMCPServer();
    registerBuiltinAgents();
  });

  describe("NavigatorAgent", () => {
    it("should have correct config", () => {
      const agent = new NavigatorAgent();
      expect(agent.agentId).toBe("navigator");
      expect(agent.displayName).toBe("言启·千行");
    });

    it("should execute with intent parsing and routing steps", async () => {
      const agent = new NavigatorAgent();
      const result = await agent.execute(createTask("分析用户数据"));
      expect(result.steps).toHaveLength(2);
      expect(result.steps[0].toolName).toBe("intent_parse");
      expect(result.steps[1].toolName).toBe("route_query");
      expect(result.result).toBeDefined();
    });
  });

  describe("ProphetAgent", () => {
    it("should have correct config", () => {
      const agent = new ProphetAgent();
      expect(agent.agentId).toBe("prophet");
      expect(agent.displayName).toBe("预见·先知");
    });

    it("should execute with prediction and anomaly steps", async () => {
      const agent = new ProphetAgent();
      const result = await agent.execute(createTask("预测GPU利用率"));
      expect(result.steps).toHaveLength(2);
      expect(result.steps[0].toolName).toBe("trend_predict");
      expect(result.steps[1].toolName).toBe("anomaly_detect");
    });
  });

  describe("BoleroAgent", () => {
    it("should have correct config", () => {
      const agent = new BoleroAgent();
      expect(agent.agentId).toBe("bolero");
      expect(agent.displayName).toBe("千里·伯乐");
    });

    it("should execute with recommendation step", async () => {
      const agent = new BoleroAgent();
      const result = await agent.execute(createTask("推荐最佳模型"));
      expect(result.steps).toHaveLength(1);
      expect(result.steps[0].toolName).toBe("recommend");
    });
  });

  describe("CreativeAgent", () => {
    it("should have correct config", () => {
      const agent = new CreativeAgent();
      expect(agent.agentId).toBe("creative");
      expect(agent.displayName).toBe("创想·灵韵");
    });

    it("should plan design step for UI tasks", async () => {
      const agent = new CreativeAgent();
      const result = await agent.execute(createTask("设计新的UI界面配色方案"));
      expect(result.steps).toHaveLength(1);
      expect(result.steps[0].toolName).toBe("design_suggest");
    });

    it("should plan creative step for content tasks", async () => {
      const agent = new CreativeAgent();
      const result = await agent.execute(createTask("生成技术文档内容"));
      expect(result.steps).toHaveLength(1);
      expect(result.steps[0].toolName).toBe("creative_generate");
    });
  });

  describe("MasterAgent", () => {
    it("should have correct config", () => {
      const agent = new MasterAgent();
      expect(agent.agentId).toBe("master");
      expect(agent.displayName).toBe("格物·宗师");
    });

    it("should plan architecture step for arch tasks", async () => {
      const agent = new MasterAgent();
      const result = await agent.execute(createTask("分析系统架构可扩展性"));
      expect(result.steps).toHaveLength(1);
      expect(result.steps[0].toolName).toBe("architecture_analyze");
    });

    it("should plan code review step for code tasks", async () => {
      const agent = new MasterAgent();
      const result = await agent.execute(createTask("审查这段TypeScript代码"));
      expect(result.steps).toHaveLength(1);
      expect(result.steps[0].toolName).toBe("code_review");
    });
  });

  describe("SentinelAgent", () => {
    it("should have correct config", () => {
      const agent = new SentinelAgent();
      expect(agent.agentId).toBe("sentinel");
      expect(agent.displayName).toBe("智云·守护");
    });

    it("should execute with security scan and threat detect steps", async () => {
      const agent = new SentinelAgent();
      const result = await agent.execute(createTask("扫描系统安全漏洞"));
      expect(result.steps).toHaveLength(2);
      expect(result.steps[0].toolName).toBe("security_scan");
      expect(result.steps[1].toolName).toBe("threat_detect");
    });
  });

  describe("MetaOracleAgent", () => {
    it("should have correct config", () => {
      const agent = new MetaOracleAgent();
      expect(agent.agentId).toBe("meta-oracle");
      expect(agent.displayName).toBe("元启·天枢");
    });

    it("should execute with orchestrate and schedule steps", async () => {
      const agent = new MetaOracleAgent();
      const result = await agent.execute(createTask("全局编排任务调度"));
      expect(result.steps).toHaveLength(2);
      expect(result.steps[0].toolName).toBe("orchestrate");
      expect(result.steps[1].toolName).toBe("resource_schedule");
    });
  });

  describe("ThinkerAgent", () => {
    it("should have correct config", () => {
      const agent = new ThinkerAgent();
      expect(agent.agentId).toBe("thinker");
      expect(agent.displayName).toBe("语枢·万物");
    });

    it("should execute with analysis and insight steps", async () => {
      const agent = new ThinkerAgent();
      const result = await agent.execute(createTask("分析节点性能数据"));
      expect(result.steps).toHaveLength(2);
      expect(result.steps[0].toolName).toBe("data_analyze");
      expect(result.steps[1].toolName).toBe("insight_generate");
    });
  });

  describe("All agents execution lifecycle", () => {
    const agentClasses = [
      { Cls: NavigatorAgent, id: "navigator" },
      { Cls: ProphetAgent, id: "prophet" },
      { Cls: BoleroAgent, id: "bolero" },
      { Cls: CreativeAgent, id: "creative" },
      { Cls: MasterAgent, id: "master" },
      { Cls: SentinelAgent, id: "sentinel" },
      { Cls: MetaOracleAgent, id: "meta-oracle" },
      { Cls: ThinkerAgent, id: "thinker" },
    ];

    it("should all complete execution successfully", async () => {
      for (const { Cls, id } of agentClasses) {
        const agent = new Cls();
        const result = await agent.execute(createTask(`test task for ${id}`));
        expect(result.steps.length).toBeGreaterThan(0);
        for (const step of result.steps) {
          expect(step.status).toBe("done");
        }
      }
    });

    it("should all return defined report results", async () => {
      for (const { Cls, id } of agentClasses) {
        const agent = new Cls();
        const result = await agent.execute(createTask(`test ${id}`));
        expect(result.result).toBeDefined();
      }
    });
  });
});
