/**
 * @file: yyc3-core-mcp.test.ts
 * @description: yyc3-core-mcp.test.ts description
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-30
 * @updated: 2026-04-30
 * @status: active
 * @tags: [tag1],[tag2],[tag3]
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { MCPClient } from "../../lib/yyc3-core/mcp/client";
import { StdioTransport, HTTPTransport } from "../../lib/yyc3-core/mcp/transport";
import type { MCPMessage, MCPTransport } from "../../lib/yyc3-core/mcp/types";

function createMockTransport(responses: Map<string, unknown> = new Map()): MCPTransport {
  let msgHandler: ((msg: MCPMessage) => void) | null = null;
  let isConnected = false;

  return {
    get connected() { return isConnected; },
    async connect() { isConnected = true; },
    async send(message: MCPMessage) {
      if (!isConnected) { throw new Error("Transport not connected"); }
      if (message.id !== undefined && message.method) {
        const result = responses.get(message.method) ?? { capabilities: { tools: true, resources: true } };
        setTimeout(() => {
          msgHandler?.({ jsonrpc: "2.0", id: message.id, result });
        }, 0);
      }
    },
    onMessage(handler: (msg: MCPMessage) => void) { msgHandler = handler; },
    async close() { isConnected = false; },
  } as MCPTransport;
}

describe("MCPClient", () => {
  let transport: MCPTransport;

  beforeEach(() => {
    const responses = new Map<string, unknown>([
      ["initialize", { capabilities: { tools: true, resources: true } }],
      ["tools/list", { tools: [{ name: "test_tool", description: "Test", inputSchema: { type: "object", properties: {} } }] }],
      ["resources/list", { resources: [{ uri: "test://res", name: "Test Resource" }] }],
      ["tools/call", { content: [{ type: "text", text: "tool result" }] }],
      ["resources/read", { contents: [{ uri: "test://res", text: "resource data" }] }],
    ]);
    transport = createMockTransport(responses);
  });

  it("should create client with config", () => {
    const client = new MCPClient({
      name: "test-client",
      version: "1.0.0",
      transport,
    });
    expect(client.connected).toBe(false);
    expect(client.tools).toEqual([]);
    expect(client.resources).toEqual([]);
  });

  it("should connect and initialize", async () => {
    const client = new MCPClient({
      name: "test-client",
      version: "1.0.0",
      transport,
    });
    await client.connect();
    expect(client.connected).toBe(true);
    expect(client.capabilities).toBeDefined();
  });

  it("should fetch tools on connect", async () => {
    const client = new MCPClient({ name: "test", version: "1.0", transport });
    await client.connect();
    expect(client.tools.length).toBeGreaterThan(0);
    expect(client.tools[0].name).toBe("test_tool");
  });

  it("should fetch resources on connect", async () => {
    const client = new MCPClient({ name: "test", version: "1.0", transport });
    await client.connect();
    expect(client.resources.length).toBeGreaterThan(0);
  });

  it("should call tools", async () => {
    const client = new MCPClient({ name: "test", version: "1.0", transport });
    await client.connect();
    const result = await client.callTool("test_tool", { input: "hello" });
    expect(result).toBeDefined();
    expect(result.content[0].text).toBe("tool result");
  });

  it("should read resources", async () => {
    const client = new MCPClient({ name: "test", version: "1.0", transport });
    await client.connect();
    const result = await client.readResource("test://res");
    expect(result).toBeDefined();
  });

  it("should refresh tools", async () => {
    const client = new MCPClient({ name: "test", version: "1.0", transport });
    await client.connect();
    const tools = await client.refreshTools();
    expect(tools.length).toBeGreaterThan(0);
  });

  it("should refresh resources", async () => {
    const client = new MCPClient({ name: "test", version: "1.0", transport });
    await client.connect();
    const resources = await client.refreshResources();
    expect(resources.length).toBeGreaterThan(0);
  });

  it("should emit connected event", async () => {
    const client = new MCPClient({ name: "test", version: "1.0", transport });
    const handler = vi.fn();
    client.on("connected", handler);
    await client.connect();
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("should emit disconnected on close", async () => {
    const client = new MCPClient({ name: "test", version: "1.0", transport });
    const handler = vi.fn();
    client.on("disconnected", handler);
    await client.connect();
    await client.close();
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("should handle toolListChanged event", async () => {
    const client = new MCPClient({ name: "test", version: "1.0", transport });
    const handler = vi.fn();
    client.on("toolListChanged", handler);
    await client.connect();
    expect(handler).toHaveBeenCalled();
  });
});

describe("StdioTransport", () => {
  it("should not be connected initially", () => {
    const transport = new StdioTransport({ command: "echo" });
    expect(transport.connected).toBe(false);
  });

  it("should throw in browser environment", async () => {
    const transport = new StdioTransport({ command: "echo" });
    await expect(transport.connect()).rejects.toThrow("Node.js");
  });

  it("should close cleanly", async () => {
    const transport = new StdioTransport({ command: "echo" });
    await transport.close();
    expect(transport.connected).toBe(false);
  });

  it("should throw when sending while disconnected", async () => {
    const transport = new StdioTransport({ command: "echo" });
    await expect(transport.send({ jsonrpc: "2.0", method: "test" })).rejects.toThrow();
  });
});

describe("HTTPTransport", () => {
  it("should not be connected initially", () => {
    const transport = new HTTPTransport({ url: "http://localhost:8080/mcp" });
    expect(transport.connected).toBe(false);
  });

  it("should set message handler", () => {
    const transport = new HTTPTransport({ url: "http://localhost:8080/mcp" });
    const handler = vi.fn();
    transport.onMessage(handler);
  });

  it("should close cleanly", async () => {
    const transport = new HTTPTransport({ url: "http://localhost:8080/mcp" });
    await transport.close();
    expect(transport.connected).toBe(false);
  });

  it("should throw when sending while disconnected", async () => {
    const transport = new HTTPTransport({ url: "http://localhost:8080/mcp" });
    await expect(transport.send({ jsonrpc: "2.0", method: "test" })).rejects.toThrow("未连接");
  });
});
