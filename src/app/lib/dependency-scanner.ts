/**
 * @file: dependency-scanner.ts
 * @description: dependency-scanner.ts
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-08
 * @updated: 2026-04-08
 * @status: active
 * @tags: [lib]
 */

// ============================================================
// Types
// ============================================================

export type DependencyType = "dependencies" | "devDependencies" | "peerDependencies" | "optionalDependencies";

export type VulnerabilitySeverity = "low" | "moderate" | "high" | "critical";

export interface PackageInfo {
  name: string;
  currentVersion: string;
  latestVersion: string;
  type: DependencyType;
  outdated: boolean;
  deprecated: boolean;
}

export interface VulnerabilityInfo {
  id: string;
  packageName: string;
  severity: VulnerabilitySeverity;
  title: string;
  description: string;
  patchedVersions: string;
  vulnerableVersions: string;
  references: string[];
  cwe?: string;
  cvss?: {
    score: number;
    vectorString: string;
  };
}

export interface DependencyScanResult {
  timestamp: number;
  packages: PackageInfo[];
  vulnerabilities: VulnerabilityInfo[];
  summary: {
    totalPackages: number;
    outdatedPackages: number;
    deprecatedPackages: number;
    totalVulnerabilities: number;
    criticalVulnerabilities: number;
    highVulnerabilities: number;
    moderateVulnerabilities: number;
    lowVulnerabilities: number;
  };
  recommendations: string[];
  score: number;
}

export interface DependencyConfig {
  checkOutdated: boolean;
  checkVulnerabilities: boolean;
  checkDeprecated: boolean;
  maxPackages: number;
}

// ============================================================
// Constants
// ============================================================

const DEFAULT_CONFIG: DependencyConfig = {
  checkOutdated: true,
  checkVulnerabilities: true,
  checkDeprecated: true,
  maxPackages: 500,
};

const STORAGE_KEY = "yyc3_dependency_scan";

// 已知漏洞数据库 (示例数据)
const KNOWN_VULNERABILITIES: Partial<VulnerabilityInfo>[] = [
  {
    packageName: "lodash",
    title: "Prototype Pollution",
    severity: "high",
    vulnerableVersions: "<4.17.21",
    patchedVersions: ">=4.17.21",
    description: "Lodash versions prior to 4.17.21 are vulnerable to Prototype Pollution",
    references: ["https://nvd.nist.gov/vuln/detail/CVE-2021-23337"],
  },
  {
    packageName: "axios",
    title: "SSRF",
    severity: "high",
    vulnerableVersions: "<0.21.1",
    patchedVersions: ">=0.21.1",
    description: "Axios is vulnerable to Server-Side Request Forgery",
    references: ["https://nvd.nist.gov/vuln/detail/CVE-2020-28168"],
  },
  {
    packageName: "node-fetch",
    title: "Information Exposure",
    severity: "high",
    vulnerableVersions: "<2.6.7",
    patchedVersions: ">=2.6.7",
    description: "node-fetch is vulnerable to information exposure",
    references: ["https://nvd.nist.gov/vuln/detail/CVE-2022-0235"],
  },
];

// ============================================================
// Dependency Scanner Class
// ============================================================

export class DependencyScanner {
  private config: DependencyConfig;
  private lastScanResult: DependencyScanResult | null = null;

  constructor(config: Partial<DependencyConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.loadFromStorage();
  }

  // ========== Public API ==========

  /**
   * 扫描依赖
   */
  async scan(packageJson?: Record<string, unknown>): Promise<DependencyScanResult> {
    const packages = await this.scanPackages(packageJson);
    const vulnerabilities = this.checkVulnerabilities(packages);
    const summary = this.generateSummary(packages, vulnerabilities);
    const recommendations = this.generateRecommendations(packages, vulnerabilities);
    const score = this.calculateScore(summary);

    const result: DependencyScanResult = {
      timestamp: Date.now(),
      packages,
      vulnerabilities,
      summary,
      recommendations,
      score,
    };

    this.lastScanResult = result;
    this.saveToStorage();

    return result;
  }

  /**
   * 获取上次扫描结果
   */
  getLastScanResult(): DependencyScanResult | null {
    return this.lastScanResult;
  }

  /**
   * 检查单个包
   */
  checkPackage(name: string, currentVersion: string): PackageInfo | null {
    const knownVuln = KNOWN_VULNERABILITIES.find((v) => v.packageName === name);

    return {
      name,
      currentVersion,
      latestVersion: knownVuln?.patchedVersions?.replace(">=", "") || currentVersion,
      type: "dependencies",
      outdated: knownVuln ? this.isVulnerable(currentVersion, knownVuln.vulnerableVersions || "") : false,
      deprecated: false,
    };
  }

  /**
   * 获取更新建议
   */
  getUpdateRecommendations(packages: PackageInfo[]): string[] {
    const recommendations: string[] = [];

    const outdated = packages.filter((p) => p.outdated);
    if (outdated.length > 0) {
      recommendations.push(`发现 ${outdated.length} 个过时的依赖包，建议运行 pnpm update 更新`);
    }

    const deprecated = packages.filter((p) => p.deprecated);
    if (deprecated.length > 0) {
      recommendations.push(`发现 ${deprecated.length} 个已废弃的依赖包，建议寻找替代方案`);
    }

    return recommendations;
  }

  /**
   * 生成更新命令
   */
  generateUpdateCommands(packages: PackageInfo[]): string[] {
    const commands: string[] = [];
    const outdated = packages.filter((p) => p.outdated);

    if (outdated.length > 0) {
      commands.push("# 更新所有过时的依赖");
      commands.push("pnpm update");

      for (const pkg of outdated) {
        commands.push(`# 更新 ${pkg.name}: ${pkg.currentVersion} -> ${pkg.latestVersion}`);
        commands.push(`pnpm update ${pkg.name}`);
      }
    }

    return commands;
  }

  /**
   * 生成安全审计命令
   */
  generateAuditCommands(): string[] {
    return [
      "# 运行安全审计",
      "pnpm audit",
      "",
      "# 自动修复可修复的漏洞",
      "pnpm audit --fix",
      "",
      "# 查看详细的漏洞报告",
      "pnpm audit --json",
    ];
  }

  // ========== Private Methods ==========

  private async scanPackages(packageJson?: Record<string, unknown>): Promise<PackageInfo[]> {
    const packages: PackageInfo[] = [];

    // 如果提供了 packageJson，使用它；否则返回空数组
    // 在浏览器环境中，我们无法直接读取 package.json
    if (!packageJson) {
      return packages;
    }

    const depTypes: DependencyType[] = ["dependencies", "devDependencies", "peerDependencies", "optionalDependencies"];

    for (const depType of depTypes) {
      const deps = packageJson[depType] as Record<string, string> | undefined;
      if (!deps) {continue;}

      for (const [name, version] of Object.entries(deps)) {
        if (packages.length >= this.config.maxPackages) {
          break;
        }

        const cleanVersion = this.cleanVersion(version);
        const knownVuln = KNOWN_VULNERABILITIES.find((v) => v.packageName === name);

        packages.push({
          name,
          currentVersion: cleanVersion,
          latestVersion: knownVuln?.patchedVersions?.replace(">=", "") || cleanVersion,
          type: depType,
          outdated: knownVuln ? this.isVulnerable(cleanVersion, knownVuln.vulnerableVersions || "") : false,
          deprecated: false,
        });
      }
    }

    return packages;
  }

  private checkVulnerabilities(packages: PackageInfo[]): VulnerabilityInfo[] {
    const vulnerabilities: VulnerabilityInfo[] = [];

    for (const pkg of packages) {
      const knownVulns = KNOWN_VULNERABILITIES.filter((v) => v.packageName === pkg.name);

      for (const vuln of knownVulns) {
        if (this.isVulnerable(pkg.currentVersion, vuln.vulnerableVersions || "")) {
          vulnerabilities.push({
            id: `VULN-${pkg.name}-${Date.now()}`,
            packageName: pkg.name,
            severity: vuln.severity || "moderate",
            title: vuln.title || "Unknown Vulnerability",
            description: vuln.description || "",
            patchedVersions: vuln.patchedVersions || "",
            vulnerableVersions: vuln.vulnerableVersions || "",
            references: vuln.references || [],
          });
        }
      }
    }

    return vulnerabilities;
  }

  private cleanVersion(version: string): string {
    // Remove ^, ~, >=, etc.
    return version.replace(/^[\^~>=<]+/, "").split(" ")[0];
  }

  private isVulnerable(currentVersion: string, vulnerableRange: string): boolean {
    if (!vulnerableRange) {return false;}

    // Simple version comparison (for demonstration)
    // In production, use semver library
    const cleanCurrent = this.cleanVersion(currentVersion);
    const cleanVulnerable = this.cleanVersion(vulnerableRange.replace("<", ""));

    // Very basic comparison - should use semver in production
    const currentParts = cleanCurrent.split(".").map(Number);
    const vulnerableParts = cleanVulnerable.split(".").map(Number);

    for (let i = 0; i < Math.max(currentParts.length, vulnerableParts.length); i++) {
      const current = currentParts[i] || 0;
      const vulnerable = vulnerableParts[i] || 0;

      if (current < vulnerable) {
        return true;
      }
      if (current > vulnerable) {
        return false;
      }
    }

    return false;
  }

  private generateSummary(
    packages: PackageInfo[],
    vulnerabilities: VulnerabilityInfo[]
  ): DependencyScanResult["summary"] {
    return {
      totalPackages: packages.length,
      outdatedPackages: packages.filter((p) => p.outdated).length,
      deprecatedPackages: packages.filter((p) => p.deprecated).length,
      totalVulnerabilities: vulnerabilities.length,
      criticalVulnerabilities: vulnerabilities.filter((v) => v.severity === "critical").length,
      highVulnerabilities: vulnerabilities.filter((v) => v.severity === "high").length,
      moderateVulnerabilities: vulnerabilities.filter((v) => v.severity === "moderate").length,
      lowVulnerabilities: vulnerabilities.filter((v) => v.severity === "low").length,
    };
  }

  private generateRecommendations(
    packages: PackageInfo[],
    vulnerabilities: VulnerabilityInfo[]
  ): string[] {
    const recommendations: string[] = [];

    const criticalVulns = vulnerabilities.filter((v) => v.severity === "critical");
    if (criticalVulns.length > 0) {
      recommendations.push(`[紧急] 发现 ${criticalVulns.length} 个严重安全漏洞，请立即更新相关依赖`);
    }

    const highVulns = vulnerabilities.filter((v) => v.severity === "high");
    if (highVulns.length > 0) {
      recommendations.push(`[警告] 发现 ${highVulns.length} 个高危安全漏洞，建议尽快更新`);
    }

    const outdated = packages.filter((p) => p.outdated);
    if (outdated.length > 0) {
      recommendations.push(`发现 ${outdated.length} 个过时的依赖包，建议运行 pnpm update`);
    }

    const deprecated = packages.filter((p) => p.deprecated);
    if (deprecated.length > 0) {
      recommendations.push(`发现 ${deprecated.length} 个已废弃的依赖包，建议寻找替代方案`);
    }

    if (recommendations.length === 0) {
      recommendations.push("依赖状态良好，无需要立即处理的问题");
    }

    return recommendations;
  }

  private calculateScore(summary: DependencyScanResult["summary"]): number {
    let score = 100;

    score -= summary.criticalVulnerabilities * 25;
    score -= summary.highVulnerabilities * 15;
    score -= summary.moderateVulnerabilities * 5;
    score -= summary.lowVulnerabilities * 2;
    score -= summary.outdatedPackages * 1;
    score -= summary.deprecatedPackages * 3;

    return Math.max(0, Math.min(100, score));
  }

  private loadFromStorage(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        if (data.lastScanResult) {
          this.lastScanResult = data.lastScanResult;
        }
      }
    } catch { /* ignore */ }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        lastScanResult: this.lastScanResult,
        lastScan: Date.now(),
      }));
    } catch { /* ignore */ }
  }
}

// ============================================================
// Factory Function
// ============================================================

let instance: DependencyScanner | null = null;

export function getDependencyScanner(config?: Partial<DependencyConfig>): DependencyScanner {
  if (!instance) {
    instance = new DependencyScanner(config);
  }
  return instance;
}

export function createDependencyScanner(config?: Partial<DependencyConfig>): DependencyScanner {
  return new DependencyScanner(config);
}
