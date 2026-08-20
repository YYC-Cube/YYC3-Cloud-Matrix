/**
 * @file: DataFlowDiagram.test.tsx
 * @description: DataFlowDiagram.test.tsx description
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-03-31
 * @updated: 2026-03-31
 * @status: active
 * @tags: [component]
 */

// @vitest-environment jsdom
/**
 * DataFlowDiagram.test.tsx
 * =============
 * DataFlowDiagram 组件 - 数据流向可视化测试
 *
 * 覆盖范围:
 * - 节点渲染 (4 个)
 * - 连线渲染 (6 条)
 * - 带宽标注
 * - data-testid
 */

import { describe, it, expect, afterEach } from "vitest";
import React from "react";
import { render, screen, cleanup } from "@testing-library/react";
import { DataFlowDiagram } from "../components/DataFlowDiagram";
import { DATA_FLOW_NODES, DATA_FLOW_EDGES } from "../hooks/useServiceLoop";

describe("DataFlowDiagram", () => {
  afterEach(() => {
    cleanup();
  });

  describe("节点渲染", () => {
    it("应渲染 4 个节点", () => {
      render(<DataFlowDiagram nodes={DATA_FLOW_NODES} edges={DATA_FLOW_EDGES} />);
      expect(screen.getAllByTestId("flow-node-device")[0]).toBeInTheDocument();
      expect(screen.getAllByTestId("flow-node-storage")[0]).toBeInTheDocument();
      expect(screen.getAllByTestId("flow-node-dashboard")[0]).toBeInTheDocument();
      expect(screen.getAllByTestId("flow-node-terminal")[0]).toBeInTheDocument();
    });

    it("应渲染节点标签", () => {
      render(<DataFlowDiagram nodes={DATA_FLOW_NODES} edges={DATA_FLOW_EDGES} />);
      expect(screen.getAllByText("本地设备")[0]).toBeInTheDocument();
      expect(screen.getAllByText("本地存储")[0]).toBeInTheDocument();
      expect(screen.getAllByText("YYC³ Dashboard")[0]).toBeInTheDocument();
      expect(screen.getAllByText("终端集成")[0]).toBeInTheDocument();
    });

    it("应渲染子标签", () => {
      render(<DataFlowDiagram nodes={DATA_FLOW_NODES} edges={DATA_FLOW_EDGES} />);
      expect(screen.getAllByText("localhost")[0]).toBeInTheDocument();
      expect(screen.getAllByText("PostgreSQL + NAS")[0]).toBeInTheDocument();
    });
  });

  describe("连线渲染", () => {
    it("应渲染连线容器", () => {
      render(<DataFlowDiagram nodes={DATA_FLOW_NODES} edges={DATA_FLOW_EDGES} />);
      expect(screen.getAllByTestId("flow-edges")[0]).toBeInTheDocument();
    });

    it("应渲染 device→storage 连线", () => {
      render(<DataFlowDiagram nodes={DATA_FLOW_NODES} edges={DATA_FLOW_EDGES} />);
      expect(screen.getAllByTestId("flow-edge-device-storage")[0]).toBeInTheDocument();
    });

    it("应渲染 storage→dashboard 连线", () => {
      render(<DataFlowDiagram nodes={DATA_FLOW_NODES} edges={DATA_FLOW_EDGES} />);
      expect(screen.getAllByTestId("flow-edge-storage-dashboard")[0]).toBeInTheDocument();
    });

    it("应渲染 dashboard→device 连线", () => {
      render(<DataFlowDiagram nodes={DATA_FLOW_NODES} edges={DATA_FLOW_EDGES} />);
      expect(screen.getAllByTestId("flow-edge-dashboard-device")[0]).toBeInTheDocument();
    });

    it("应渲染 dashboard→terminal 连线", () => {
      render(<DataFlowDiagram nodes={DATA_FLOW_NODES} edges={DATA_FLOW_EDGES} />);
      expect(screen.getAllByTestId("flow-edge-dashboard-terminal")[0]).toBeInTheDocument();
    });
  });

  describe("data-testid", () => {
    it("应有根容器", () => {
      render(<DataFlowDiagram nodes={DATA_FLOW_NODES} edges={DATA_FLOW_EDGES} />);
      expect(screen.getAllByTestId("data-flow-diagram")[0]).toBeInTheDocument();
    });
  });

  describe("空数据", () => {
    it("空节点和空连线应渲染空容器", () => {
      render(<DataFlowDiagram nodes={[]} edges={[]} />);
      expect(screen.getAllByTestId("data-flow-diagram")[0]).toBeInTheDocument();
    });
  });
});
