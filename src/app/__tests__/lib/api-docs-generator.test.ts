/**
 * @file: api-docs-generator.test.ts
 * @description: api-docs-generator.test.ts
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-08
 * @updated: 2026-04-08
 * @status: active
 * @tags: [lib]
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  APIDocsGenerator,
  createYYC3APIDocs,
  type APIEndpoint,
} from "../../lib/api-docs-generator";

describe("APIDocsGenerator", () => {
  let generator: APIDocsGenerator;

  beforeEach(() => {
    generator = new APIDocsGenerator({
      version: "1.0.0",
      title: "Test API",
      description: "Test API Description",
      baseUrl: "http://localhost:3000/api",
    });
  });

  describe("constructor", () => {
    it("should create generator with config", () => {
      expect(generator).toBeDefined();
    });
  });

  describe("addEndpoint", () => {
    it("should add single endpoint", () => {
      const endpoint: APIEndpoint = {
        path: "/test",
        method: "GET",
        description: "Test endpoint",
        responses: [{ statusCode: 200, description: "Success" }],
      };

      generator.addEndpoint(endpoint);
      const doc = generator.generateDocumentation();

      expect(doc.endpoints).toHaveLength(1);
      expect(doc.endpoints[0].path).toBe("/test");
    });
  });

  describe("addEndpoints", () => {
    it("should add multiple endpoints", () => {
      const endpoints: APIEndpoint[] = [
        {
          path: "/test1",
          method: "GET",
          description: "Test endpoint 1",
          responses: [{ statusCode: 200, description: "Success" }],
        },
        {
          path: "/test2",
          method: "POST",
          description: "Test endpoint 2",
          responses: [{ statusCode: 201, description: "Created" }],
        },
      ];

      generator.addEndpoints(endpoints);
      const doc = generator.generateDocumentation();

      expect(doc.endpoints).toHaveLength(2);
    });
  });

  describe("generateDocumentation", () => {
    it("should generate documentation object", () => {
      generator.addEndpoint({
        path: "/test",
        method: "GET",
        description: "Test endpoint",
        responses: [{ statusCode: 200, description: "Success" }],
      });

      const doc = generator.generateDocumentation();

      expect(doc.version).toBe("1.0.0");
      expect(doc.title).toBe("Test API");
      expect(doc.description).toBe("Test API Description");
      expect(doc.baseUrl).toBe("http://localhost:3000/api");
      expect(doc.generatedAt).toBeDefined();
      expect(doc.endpoints).toHaveLength(1);
    });
  });

  describe("generateMarkdown", () => {
    it("should generate markdown documentation", () => {
      generator.addEndpoint({
        path: "/test",
        method: "GET",
        description: "Test endpoint",
        responses: [{ statusCode: 200, description: "Success" }],
      });

      const markdown = generator.generateMarkdown();

      expect(markdown).toContain("# Test API");
      expect(markdown).toContain("**版本**: 1.0.0");
      expect(markdown).toContain("### GET /test");
      expect(markdown).toContain("Test endpoint");
    });

    it("should include parameters in markdown", () => {
      generator.addEndpoint({
        path: "/test/{id}",
        method: "GET",
        description: "Test endpoint with params",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            type: "string",
            description: "Test ID",
            example: "test-001",
          },
        ],
        responses: [{ statusCode: 200, description: "Success" }],
      });

      const markdown = generator.generateMarkdown();

      expect(markdown).toContain("#### 参数");
      expect(markdown).toContain("id");
      expect(markdown).toContain("path");
    });

    it("should include request body in markdown", () => {
      generator.addEndpoint({
        path: "/test",
        method: "POST",
        description: "Test endpoint with body",
        requestBody: {
          required: true,
          contentType: "application/json",
          schema: { type: "object" },
          example: { name: "test" },
        },
        responses: [{ statusCode: 201, description: "Created" }],
      });

      const markdown = generator.generateMarkdown();

      expect(markdown).toContain("#### 请求体");
      expect(markdown).toContain("application/json");
    });

    it("should include deprecated warning", () => {
      generator.addEndpoint({
        path: "/test",
        method: "GET",
        description: "Deprecated endpoint",
        deprecated: true,
        responses: [{ statusCode: 200, description: "Success" }],
      });

      const markdown = generator.generateMarkdown();

      expect(markdown).toContain("已废弃");
    });

    it("should group by tags", () => {
      generator.addEndpoints([
        {
          path: "/nodes",
          method: "GET",
          description: "Get nodes",
          tags: ["节点管理"],
          responses: [{ statusCode: 200, description: "Success" }],
        },
        {
          path: "/models",
          method: "GET",
          description: "Get models",
          tags: ["模型管理"],
          responses: [{ statusCode: 200, description: "Success" }],
        },
      ]);

      const markdown = generator.generateMarkdown();

      expect(markdown).toContain("## 节点管理");
      expect(markdown).toContain("## 模型管理");
    });
  });

  describe("generateOpenAPI", () => {
    it("should generate OpenAPI specification", () => {
      generator.addEndpoint({
        path: "/test",
        method: "GET",
        description: "Test endpoint",
        responses: [{ statusCode: 200, description: "Success" }],
      });

      const openapi = generator.generateOpenAPI() as Record<string, unknown>;

      expect(openapi.openapi).toBe("3.0.0");
      expect((openapi.info as Record<string, unknown>).title).toBe("Test API");
      expect(openapi.paths).toBeDefined();
    });

    it("should include parameters in OpenAPI", () => {
      generator.addEndpoint({
        path: "/test/{id}",
        method: "GET",
        description: "Test endpoint",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            type: "string",
            description: "Test ID",
          },
        ],
        responses: [{ statusCode: 200, description: "Success" }],
      });

      const openapi = generator.generateOpenAPI() as Record<string, unknown>;
      const paths = openapi.paths as Record<string, Record<string, unknown>>;
      const getMethod = paths["/test/{id}"].get as Record<string, unknown>;

      expect(getMethod.parameters).toBeDefined();
      expect(Array.isArray(getMethod.parameters)).toBe(true);
    });

    it("should include request body in OpenAPI", () => {
      generator.addEndpoint({
        path: "/test",
        method: "POST",
        description: "Test endpoint",
        requestBody: {
          required: true,
          contentType: "application/json",
          schema: { type: "object" },
        },
        responses: [{ statusCode: 201, description: "Created" }],
      });

      const openapi = generator.generateOpenAPI() as Record<string, unknown>;
      const paths = openapi.paths as Record<string, Record<string, unknown>>;
      const postMethod = paths["/test"].post as Record<string, unknown>;

      expect(postMethod.requestBody).toBeDefined();
    });
  });

  describe("clear", () => {
    it("should clear all endpoints", () => {
      generator.addEndpoint({
        path: "/test",
        method: "GET",
        description: "Test endpoint",
        responses: [{ statusCode: 200, description: "Success" }],
      });

      generator.clear();
      const doc = generator.generateDocumentation();

      expect(doc.endpoints).toHaveLength(0);
    });
  });
});

describe("createYYC3APIDocs", () => {
  it("should create YYC3 API documentation", () => {
    const generator = createYYC3APIDocs();
    const doc = generator.generateDocumentation();

    expect(doc.title).toBe("YYC³ Cloud Intelli-Matrix API");
    expect(doc.endpoints.length).toBeGreaterThan(0);
  });

  it("should include node endpoints", () => {
    const generator = createYYC3APIDocs();
    const doc = generator.generateDocumentation();

    const nodeEndpoints = doc.endpoints.filter((e: APIEndpoint) =>
      e.tags?.includes("节点管理")
    );
    expect(nodeEndpoints.length).toBeGreaterThan(0);
  });

  it("should include model endpoints", () => {
    const generator = createYYC3APIDocs();
    const doc = generator.generateDocumentation();

    const modelEndpoints = doc.endpoints.filter((e: APIEndpoint) =>
      e.tags?.includes("模型管理")
    );
    expect(modelEndpoints.length).toBeGreaterThan(0);
  });

  it("should generate valid markdown", () => {
    const generator = createYYC3APIDocs();
    const markdown = generator.generateMarkdown();

    expect(markdown).toContain("YYC³ Cloud Intelli-Matrix API");
    expect(markdown).toContain("节点管理");
    expect(markdown).toContain("模型管理");
  });

  it("should generate valid OpenAPI spec", () => {
    const generator = createYYC3APIDocs();
    const openapi = generator.generateOpenAPI() as Record<string, unknown>;

    expect(openapi.openapi).toBe("3.0.0");
    expect((openapi.info as Record<string, unknown>).title).toBe(
      "YYC³ Cloud Intelli-Matrix API"
    );
    expect(openapi.paths).toBeDefined();
  });
});
