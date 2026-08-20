/**
 * @file: penetration-tester.test.ts
 * @description: penetration-tester.test.ts
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-08
 * @updated: 2026-04-08
 * @status: active
 * @tags: [lib]
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  PenetrationTester,
  createPenetrationTester,
} from "../../lib/penetration-tester";

describe("PenetrationTester", () => {
  let tester: PenetrationTester;

  beforeEach(() => {
    tester = createPenetrationTester();
  });

  describe("constructor", () => {
    it("should initialize with empty vulnerabilities", () => {
      const vulnerabilities = tester.getVulnerabilities();
      expect(vulnerabilities).toHaveLength(0);
    });
  });

  describe("runInjectionTests", () => {
    it("should run injection tests and return suite", async () => {
      const suite = await tester.runInjectionTests();

      expect(suite.id).toBeDefined();
      expect(suite.name).toBe("Injection Tests");
      expect(suite.category).toBe("injection");
      expect(suite.duration).toBeGreaterThanOrEqual(0);
      expect(suite.executedAt).toBeDefined();
    });

    it("should add suite to suites list", async () => {
      await tester.runInjectionTests();
      const suites = tester.getSuites();

      expect(suites.length).toBe(1);
    });
  });

  describe("runXSSTests", () => {
    it("should run XSS tests and return suite", async () => {
      const suite = await tester.runXSSTests();

      expect(suite.id).toBeDefined();
      expect(suite.name).toBe("XSS Tests");
      expect(suite.category).toBe("xss");
    });
  });

  describe("runCSRFTests", () => {
    it("should run CSRF tests and return suite", async () => {
      const suite = await tester.runCSRFTests();

      expect(suite.id).toBeDefined();
      expect(suite.name).toBe("CSRF Tests");
      expect(suite.category).toBe("csrf");
    });
  });

  describe("runAuthTests", () => {
    it("should run authentication tests and return suite", async () => {
      const suite = await tester.runAuthTests();

      expect(suite.id).toBeDefined();
      expect(suite.name).toBe("Authentication Tests");
      expect(suite.category).toBe("auth");
    });
  });

  describe("runDataExposureTests", () => {
    it("should run data exposure tests and return suite", async () => {
      const suite = await tester.runDataExposureTests();

      expect(suite.id).toBeDefined();
      expect(suite.name).toBe("Data Exposure Tests");
      expect(suite.category).toBe("data-exposure");
    });
  });

  describe("runMisconfigurationTests", () => {
    it("should run misconfiguration tests and return suite", async () => {
      const suite = await tester.runMisconfigurationTests();

      expect(suite.id).toBeDefined();
      expect(suite.name).toBe("Misconfiguration Tests");
      expect(suite.category).toBe("misconfiguration");
    });
  });

  describe("runDependencyTests", () => {
    it("should run dependency tests and return suite", async () => {
      const suite = await tester.runDependencyTests();

      expect(suite.id).toBeDefined();
      expect(suite.name).toBe("Dependency Tests");
      expect(suite.category).toBe("dependencies");
    });
  });

  describe("runCryptoTests", () => {
    it("should run cryptography tests and return suite", async () => {
      const suite = await tester.runCryptoTests();

      expect(suite.id).toBeDefined();
      expect(suite.name).toBe("Cryptography Tests");
      expect(suite.category).toBe("crypto");
    });
  });

  describe("runAllTests", () => {
    it("should run all tests and return report", async () => {
      const report = await tester.runAllTests();

      expect(report.suites.length).toBe(8);
      expect(report.summary.total).toBeDefined();
      expect(report.generatedAt).toBeDefined();
    });

    it("should calculate correct summary", async () => {
      const report = await tester.runAllTests();

      expect(report.summary.total).toBe(
        report.summary.critical +
          report.summary.high +
          report.summary.medium +
          report.summary.low
      );
      expect(report.summary.riskScore).toBeGreaterThanOrEqual(0);
    });

    it("should include compliance status", async () => {
      const report = await tester.runAllTests();

      expect(report.compliance).toBeDefined();
      expect(typeof report.compliance.owasp).toBe("boolean");
      expect(typeof report.compliance.cwe).toBe("boolean");
    });

    it("should generate recommendations", async () => {
      const report = await tester.runAllTests();

      expect(report.recommendations).toBeDefined();
      expect(Array.isArray(report.recommendations)).toBe(true);
    });
  });

  describe("generateReport", () => {
    it("should generate report from existing suites", async () => {
      await tester.runInjectionTests();
      await tester.runXSSTests();

      const report = tester.generateReport();

      expect(report.suites.length).toBe(2);
      expect(report.summary.total).toBeDefined();
    });
  });

  describe("getVulnerabilities", () => {
    it("should return all vulnerabilities", async () => {
      await tester.runAllTests();
      const vulnerabilities = tester.getVulnerabilities();

      expect(Array.isArray(vulnerabilities)).toBe(true);
    });
  });

  describe("getSuites", () => {
    it("should return all suites", async () => {
      await tester.runInjectionTests();
      const suites = tester.getSuites();

      expect(suites.length).toBe(1);
    });
  });

  describe("clear", () => {
    it("should clear all vulnerabilities and suites", async () => {
      await tester.runAllTests();
      tester.clear();

      expect(tester.getVulnerabilities()).toHaveLength(0);
      expect(tester.getSuites()).toHaveLength(0);
    });
  });
});

describe("createPenetrationTester", () => {
  it("should create new tester instance", () => {
    const tester = createPenetrationTester();
    expect(tester).toBeInstanceOf(PenetrationTester);
  });
});
