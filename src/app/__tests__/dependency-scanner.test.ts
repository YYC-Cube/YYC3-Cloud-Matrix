/**
 * @file: dependency-scanner.test.ts
 * @description: dependency-scanner.test.ts
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-08
 * @updated: 2026-04-08
 * @status: active
 * @tags: [module]
 */

// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { DependencyScanner, createDependencyScanner, getDependencyScanner } from "../lib/dependency-scanner";

describe("DependencyScanner", () => {
  let scanner: DependencyScanner;

  beforeEach(() => {
    localStorage.clear();
    scanner = createDependencyScanner();
  });

  afterEach(() => {
    scanner = createDependencyScanner();
  });

  describe("scan", () => {
    it("should return scan result", async () => {
      const result = await scanner.scan();

      expect(result.timestamp).toBeDefined();
      expect(result.packages).toBeDefined();
      expect(result.vulnerabilities).toBeDefined();
      expect(result.summary).toBeDefined();
      expect(result.recommendations).toBeDefined();
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });

    it("should scan provided package.json", async () => {
      const packageJson = {
        dependencies: {
          lodash: "4.17.20",
          axios: "0.21.0",
        },
        devDependencies: {
          typescript: "5.0.0",
        },
      };

      const result = await scanner.scan(packageJson);

      expect(result.packages.length).toBe(3);
      expect(result.summary.totalPackages).toBe(3);
    });

    it("should detect outdated packages", async () => {
      const packageJson = {
        dependencies: {
          lodash: "4.17.20",
        },
      };

      const result = await scanner.scan(packageJson);

      expect(result.summary.outdatedPackages).toBeGreaterThan(0);
    });

    it("should detect vulnerabilities", async () => {
      const packageJson = {
        dependencies: {
          lodash: "4.17.20",
          axios: "0.20.0",
        },
      };

      const result = await scanner.scan(packageJson);

      expect(result.vulnerabilities.length).toBeGreaterThan(0);
    });
  });

  describe("checkPackage", () => {
    it("should check single package", () => {
      const pkg = scanner.checkPackage("lodash", "4.17.20");

      expect(pkg).toBeDefined();
      expect(pkg?.name).toBe("lodash");
      expect(pkg?.currentVersion).toBe("4.17.20");
    });

    it("should detect outdated package", () => {
      const pkg = scanner.checkPackage("lodash", "4.17.15");

      expect(pkg?.outdated).toBe(true);
    });
  });

  describe("update recommendations", () => {
    it("should generate update recommendations", () => {
      const packages = [
        { name: "lodash", currentVersion: "4.17.20", latestVersion: "4.17.21", type: "dependencies" as const, outdated: true, deprecated: false },
        { name: "axios", currentVersion: "0.20.0", latestVersion: "1.6.0", type: "dependencies" as const, outdated: true, deprecated: false },
      ];

      const recommendations = scanner.getUpdateRecommendations(packages);

      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations[0]).toContain("过时");
    });

    it("should generate update commands", () => {
      const packages = [
        { name: "lodash", currentVersion: "4.17.20", latestVersion: "4.17.21", type: "dependencies" as const, outdated: true, deprecated: false },
      ];

      const commands = scanner.generateUpdateCommands(packages);

      expect(commands.length).toBeGreaterThan(0);
      expect(commands.some((c) => c.includes("pnpm update"))).toBe(true);
    });
  });

  describe("audit commands", () => {
    it("should generate audit commands", () => {
      const commands = scanner.generateAuditCommands();

      expect(commands.length).toBeGreaterThan(0);
      expect(commands.some((c) => c.includes("pnpm audit"))).toBe(true);
    });
  });

  describe("summary", () => {
    it("should generate correct summary", async () => {
      const packageJson = {
        dependencies: {
          lodash: "4.17.20",
          axios: "0.20.0",
        },
      };

      const result = await scanner.scan(packageJson);

      expect(result.summary.totalPackages).toBe(2);
      expect(result.summary.totalVulnerabilities).toBeGreaterThanOrEqual(0);
    });
  });

  describe("score calculation", () => {
    it("should calculate score", async () => {
      const result = await scanner.scan();

      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });

    it("should reduce score for vulnerabilities", async () => {
      const packageJson = {
        dependencies: {
          lodash: "4.17.15",
          axios: "0.19.0",
        },
      };

      const result = await scanner.scan(packageJson);

      expect(result.score).toBeLessThan(100);
    });
  });

  describe("persistence", () => {
    it("should persist scan result", async () => {
      await scanner.scan();

      const stored = localStorage.getItem("yyc3_dependency_scan");
      expect(stored).toBeDefined();
    });

    it("should load last scan result", () => {
      localStorage.setItem("yyc3_dependency_scan", JSON.stringify({
        lastScanResult: {
          timestamp: Date.now(),
          packages: [],
          vulnerabilities: [],
          summary: {
            totalPackages: 0,
            outdatedPackages: 0,
            deprecatedPackages: 0,
            totalVulnerabilities: 0,
            criticalVulnerabilities: 0,
            highVulnerabilities: 0,
            moderateVulnerabilities: 0,
            lowVulnerabilities: 0,
          },
          recommendations: [],
          score: 100,
        },
      }));

      const newScanner = createDependencyScanner();
      const result = newScanner.getLastScanResult();

      expect(result).toBeDefined();
      expect(result?.score).toBe(100);
    });
  });

  describe("getLastScanResult", () => {
    it("should return null if no scan performed", () => {
      const newScanner = createDependencyScanner();
      const result = newScanner.getLastScanResult();

      expect(result).toBeNull();
    });

    it("should return last scan result", async () => {
      await scanner.scan();
      const result = scanner.getLastScanResult();

      expect(result).toBeDefined();
    });
  });
});

describe("getDependencyScanner", () => {
  it("should return singleton instance", () => {
    const instance1 = getDependencyScanner();
    const instance2 = getDependencyScanner();

    expect(instance1).toBe(instance2);
  });
});

describe("createDependencyScanner", () => {
  it("should create new instance", () => {
    const scanner1 = createDependencyScanner();
    const scanner2 = createDependencyScanner();

    expect(scanner1).not.toBe(scanner2);
  });
});
