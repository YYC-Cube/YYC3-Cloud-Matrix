/**
 * @file: docs-generator.test.ts
 * @description: docs-generator.test.ts
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-08
 * @updated: 2026-04-08
 * @status: active
 * @tags: [lib]
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  DocsGenerator,
  createDocsGenerator,
} from "../../lib/docs-generator";

describe("DocsGenerator", () => {
  let generator: DocsGenerator;

  beforeEach(() => {
    generator = createDocsGenerator();
  });

  describe("generateAPIDocument", () => {
    it("should generate API document", () => {
      const doc = generator.generateAPIDocument({
        title: "YYC³ API",
        version: "1.0.0",
        description: "API Reference",
        endpoints: [
          {
            path: "/nodes",
            method: "GET",
            description: "Get all nodes",
          },
        ],
      });

      expect(doc.type).toBe("api");
      expect(doc.metadata.title).toBe("YYC³ API");
      expect(doc.metadata.version).toBe("1.0.0");
      expect(doc.sections.length).toBeGreaterThan(0);
    });

    it("should include overview section", () => {
      const doc = generator.generateAPIDocument({
        title: "Test API",
        version: "1.0.0",
        description: "Test Description",
        endpoints: [],
      });

      const overview = doc.sections.find((s) => s.id === "overview");
      expect(overview).toBeDefined();
    });
  });

  describe("generateUserGuide", () => {
    it("should generate user guide document", () => {
      const doc = generator.generateUserGuide({
        title: "User Guide",
        version: "1.0.0",
        features: [
          {
            name: "Feature 1",
            description: "Description 1",
          },
        ],
      });

      expect(doc.type).toBe("user-guide");
      expect(doc.metadata.title).toBe("User Guide");
      expect(doc.sections.length).toBeGreaterThan(0);
    });

    it("should include introduction section", () => {
      const doc = generator.generateUserGuide({
        title: "Test Guide",
        version: "1.0.0",
        features: [],
      });

      const intro = doc.sections.find((s) => s.id === "introduction");
      expect(intro).toBeDefined();
    });

    it("should include getting started section", () => {
      const doc = generator.generateUserGuide({
        title: "Test Guide",
        version: "1.0.0",
        features: [],
      });

      const start = doc.sections.find((s) => s.id === "getting-started");
      expect(start).toBeDefined();
    });
  });

  describe("generateDeveloperDocs", () => {
    it("should generate developer document", () => {
      const doc = generator.generateDeveloperDocs({
        title: "Developer Guide",
        version: "1.0.0",
        modules: [],
      });

      expect(doc.type).toBe("developer");
      expect(doc.metadata.title).toBe("Developer Guide");
    });

    it("should include architecture section", () => {
      const doc = generator.generateDeveloperDocs({
        title: "Test Docs",
        version: "1.0.0",
        modules: [],
      });

      const arch = doc.sections.find((s) => s.id === "architecture");
      expect(arch).toBeDefined();
    });

    it("should include conventions section", () => {
      const doc = generator.generateDeveloperDocs({
        title: "Test Docs",
        version: "1.0.0",
        modules: [],
      });

      const conv = doc.sections.find((s) => s.id === "conventions");
      expect(conv).toBeDefined();
    });
  });

  describe("generateArchitectureDocs", () => {
    it("should generate architecture document", () => {
      const doc = generator.generateArchitectureDocs({
        title: "Architecture",
        version: "1.0.0",
        components: [],
      });

      expect(doc.type).toBe("architecture");
      expect(doc.metadata.title).toBe("Architecture");
    });

    it("should include system overview", () => {
      const doc = generator.generateArchitectureDocs({
        title: "Test Architecture",
        version: "1.0.0",
        components: [],
      });

      const overview = doc.sections.find((s) => s.id === "overview");
      expect(overview).toBeDefined();
    });
  });

  describe("generateDeploymentDocs", () => {
    it("should generate deployment document", () => {
      const doc = generator.generateDeploymentDocs({
        title: "Deployment Guide",
        version: "1.0.0",
        environments: [],
      });

      expect(doc.type).toBe("deployment");
      expect(doc.metadata.title).toBe("Deployment Guide");
    });

    it("should include prerequisites section", () => {
      const doc = generator.generateDeploymentDocs({
        title: "Test Deployment",
        version: "1.0.0",
        environments: [],
      });

      const prereq = doc.sections.find((s) => s.id === "prerequisites");
      expect(prereq).toBeDefined();
    });
  });

  describe("toMarkdown", () => {
    it("should convert document to markdown", () => {
      const doc = generator.generateAPIDocument({
        title: "Test API",
        version: "1.0.0",
        description: "Test Description",
        endpoints: [],
      });

      const markdown = generator.toMarkdown(doc);

      expect(markdown).toContain("# Test API");
      expect(markdown).toContain("版本:");
      expect(markdown).toContain("## 目录");
    });

    it("should include sections in markdown", () => {
      const doc = generator.generateUserGuide({
        title: "Test Guide",
        version: "1.0.0",
        features: [
          {
            name: "Feature 1",
            description: "Description 1",
          },
        ],
      });

      const markdown = generator.toMarkdown(doc);

      expect(markdown).toContain("## 简介");
      expect(markdown).toContain("## 快速开始");
      expect(markdown).toContain("## Feature 1");
    });
  });

  describe("toHTML", () => {
    it("should convert document to HTML", () => {
      const doc = generator.generateAPIDocument({
        title: "Test API",
        version: "1.0.0",
        description: "Test Description",
        endpoints: [],
      });

      const html = generator.toHTML(doc);

      expect(html).toContain("<!DOCTYPE html>");
      expect(html).toContain("<title>Test API</title>");
      expect(html).toContain("<h2>");
    });

    it("should include DOCTYPE and head", () => {
      const doc = generator.generateAPIDocument({
        title: "HTML Test",
        version: "1.0.0",
        description: "Test",
        endpoints: [],
      });

      const html = generator.toHTML(doc);

      expect(html).toContain("<meta charset=\"UTF-8\">");
      expect(html).toContain("<meta name=\"viewport\"");
    });
  });

  describe("getDocuments", () => {
    it("should return all generated documents", () => {
      generator.generateAPIDocument({
        title: "API 1",
        version: "1.0.0",
        description: "API 1",
        endpoints: [],
      });

      generator.generateUserGuide({
        title: "Guide 1",
        version: "1.0.0",
        features: [],
      });

      const docs = generator.getDocuments();
      expect(docs.length).toBe(2);
    });
  });

  describe("clear", () => {
    it("should clear all documents", () => {
      generator.generateAPIDocument({
        title: "Test",
        version: "1.0.0",
        description: "Test",
        endpoints: [],
      });

      generator.clear();

      const docs = generator.getDocuments();
      expect(docs.length).toBe(0);
    });
  });
});

describe("createDocsGenerator", () => {
  it("should create new generator instance", () => {
    const generator = createDocsGenerator();
    expect(generator).toBeInstanceOf(DocsGenerator);
  });
});
