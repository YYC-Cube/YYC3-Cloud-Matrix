/**
 * @file: security-audit.ts
 * @description: security-audit.ts
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

export type SecuritySeverity = "low" | "medium" | "high" | "critical";

export type SecurityCategory =
  | "xss"
  | "injection"
  | "sensitive-data"
  | "authentication"
  | "authorization"
  | "csp"
  | "dependency"
  | "configuration";

export interface SecurityIssue {
  id: string;
  category: SecurityCategory;
  severity: SecuritySeverity;
  title: string;
  description: string;
  location?: string;
  recommendation: string;
  references: string[];
  timestamp: number;
  resolved: boolean;
}

export interface SecurityAuditResult {
  timestamp: number;
  score: number;
  issues: SecurityIssue[];
  summary: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    resolved: number;
  };
  recommendations: string[];
}

export interface SecurityConfig {
  checkXSS: boolean;
  checkSensitiveData: boolean;
  checkCSP: boolean;
  checkDependencies: boolean;
  checkAuthentication: boolean;
  maxIssues: number;
}

// ============================================================
// Constants
// ============================================================

const DEFAULT_CONFIG: SecurityConfig = {
  checkXSS: true,
  checkSensitiveData: true,
  checkCSP: true,
  checkDependencies: true,
  checkAuthentication: true,
  maxIssues: 100,
};

const SENSITIVE_PATTERNS = [
  { pattern: /password\s*[=:]\s*['"][^'"]+['"]/gi, name: "Hardcoded Password" },
  { pattern: /api[_-]?key\s*[=:]\s*['"][^'"]+['"]/gi, name: "Hardcoded API Key" },
  { pattern: /secret[_-]?key\s*[=:]\s*['"][^'"]+['"]/gi, name: "Hardcoded Secret Key" },
  { pattern: /token\s*[=:]\s*['"][^'"]+['"]/gi, name: "Hardcoded Token" },
  { pattern: /private[_-]?key\s*[=:]\s*['"][^'"]+['"]/gi, name: "Hardcoded Private Key" },
  { pattern: /mongodb(\+srv)?:\/\/[^:]+:[^@]+@/gi, name: "MongoDB Connection String" },
  { pattern: /mysql:\/\/[^:]+:[^@]+@/gi, name: "MySQL Connection String" },
  { pattern: /postgres(ql)?:\/\/[^:]+:[^@]+@/gi, name: "PostgreSQL Connection String" },
  { pattern: /redis:\/\/[^:]*:[^@]+@/gi, name: "Redis Connection String" },
];

const XSS_PATTERNS = [
  { pattern: /innerHTML\s*=/gi, name: "innerHTML Assignment" },
  { pattern: /outerHTML\s*=/gi, name: "outerHTML Assignment" },
  { pattern: /document\.write\s*\(/gi, name: "document.write" },
  { pattern: /eval\s*\(/gi, name: "eval() Usage" },
  { pattern: /new\s+Function\s*\(/gi, name: "new Function()" },
  { pattern: /setTimeout\s*\(\s*['"`]/gi, name: "setTimeout with String" },
  { pattern: /setInterval\s*\(\s*['"`]/gi, name: "setInterval with String" },
];

const STORAGE_KEY = "yyc3_security_audit";

// ============================================================
// Security Auditor Class
// ============================================================

export class SecurityAuditor {
  private config: SecurityConfig;
  private issues: SecurityIssue[] = [];

  constructor(config: Partial<SecurityConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.loadFromStorage();
  }

  // ========== Public API ==========

  /**
   * 运行完整安全审计
   */
  async runFullAudit(): Promise<SecurityAuditResult> {
    this.issues = [];

    if (this.config.checkXSS) {
      await this.checkXSSVulnerabilities();
    }

    if (this.config.checkSensitiveData) {
      await this.checkSensitiveDataExposure();
    }

    if (this.config.checkCSP) {
      await this.checkCSPConfiguration();
    }

    if (this.config.checkAuthentication) {
      await this.checkAuthenticationIssues();
    }

    if (this.config.checkDependencies) {
      await this.checkDependencyVulnerabilities();
    }

    const result = this.generateResult();
    this.saveToStorage();
    return result;
  }

  /**
   * 检查 XSS 漏洞
   */
  async checkXSSVulnerabilities(): Promise<SecurityIssue[]> {
    const issues: SecurityIssue[] = [];

    // Check DOM for potential XSS sinks
    const scripts = document.querySelectorAll("script");
    scripts.forEach((script, index) => {
      const content = script.textContent || "";
      for (const { pattern, name } of XSS_PATTERNS) {
        if (pattern.test(content)) {
          issues.push(this.createIssue({
            category: "xss",
            severity: "high",
            title: `Potential XSS: ${name}`,
            description: `Found potentially dangerous pattern: ${name} in script tag ${index + 1}`,
            recommendation: "Use textContent instead of innerHTML, or sanitize user input before rendering",
            references: ["https://owasp.org/www-community/xss-filter-evasion-cheatsheet"],
          }));
        }
      }
    });

    this.addIssues(issues);
    return issues;
  }

  /**
   * 检查敏感数据泄露
   */
  async checkSensitiveDataExposure(): Promise<SecurityIssue[]> {
    const issues: SecurityIssue[] = [];

    // Check localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) {continue;}

      const value = localStorage.getItem(key) || "";

      for (const { pattern, name } of SENSITIVE_PATTERNS) {
        if (pattern.test(value)) {
          issues.push(this.createIssue({
            category: "sensitive-data",
            severity: "high",
            title: `Sensitive Data in localStorage: ${name}`,
            description: `Found ${name} pattern in localStorage key: ${key}`,
            recommendation: "Remove sensitive data from localStorage and use secure storage mechanisms",
            references: ["https://owasp.org/www-community/vulnerabilities/Information_exposure_through_query_strings_in_GET_request"],
          }));
        }
      }
    }

    // Check sessionStorage
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (!key) {continue;}

      const value = sessionStorage.getItem(key) || "";

      for (const { pattern, name } of SENSITIVE_PATTERNS) {
        if (pattern.test(value)) {
          issues.push(this.createIssue({
            category: "sensitive-data",
            severity: "medium",
            title: `Sensitive Data in sessionStorage: ${name}`,
            description: `Found ${name} pattern in sessionStorage key: ${key}`,
            recommendation: "Avoid storing sensitive data in sessionStorage",
            references: ["https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API"],
          }));
        }
      }
    }

    // Check cookies
    const cookies = document.cookie.split(";");
    for (const cookie of cookies) {
      for (const { pattern, name } of SENSITIVE_PATTERNS) {
        if (pattern.test(cookie)) {
          issues.push(this.createIssue({
            category: "sensitive-data",
            severity: "high",
            title: `Sensitive Data in Cookies: ${name}`,
            description: `Found ${name} pattern in cookies`,
            recommendation: "Use HttpOnly, Secure, and SameSite flags for sensitive cookies",
            references: ["https://owasp.org/www-community/controls/SecureCookie"],
          }));
        }
      }
    }

    this.addIssues(issues);
    return issues;
  }

  /**
   * 检查 CSP 配置
   */
  async checkCSPConfiguration(): Promise<SecurityIssue[]> {
    const issues: SecurityIssue[] = [];

    // Check for CSP meta tag
    const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    if (!cspMeta) {
      issues.push(this.createIssue({
        category: "csp",
        severity: "medium",
        title: "Missing Content Security Policy",
        description: "No Content-Security-Policy meta tag found",
        recommendation: "Add a CSP meta tag or configure CSP headers on the server",
        references: ["https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP"],
      }));
    } else {
      const cspContent = cspMeta.getAttribute("content") || "";

      // Check for unsafe-inline
      if (cspContent.includes("'unsafe-inline'")) {
        issues.push(this.createIssue({
          category: "csp",
          severity: "medium",
          title: "CSP Allows unsafe-inline",
          description: "Content Security Policy allows 'unsafe-inline' scripts",
          recommendation: "Remove 'unsafe-inline' and use nonces or hashes instead",
          references: ["https://content-security-policy.com/unsafe-inline/"],
        }));
      }

      // Check for unsafe-eval
      if (cspContent.includes("'unsafe-eval'")) {
        issues.push(this.createIssue({
          category: "csp",
          severity: "medium",
          title: "CSP Allows unsafe-eval",
          description: "Content Security Policy allows 'unsafe-eval'",
          recommendation: "Remove 'unsafe-eval' and refactor code to avoid eval()",
          references: ["https://content-security-policy.com/unsafe-eval/"],
        }));
      }
    }

    this.addIssues(issues);
    return issues;
  }

  /**
   * 检查认证问题
   */
  async checkAuthenticationIssues(): Promise<SecurityIssue[]> {
    const issues: SecurityIssue[] = [];

    // Check for insecure password inputs
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    passwordInputs.forEach((input, index) => {
      const form = input.closest("form");
      if (form) {
        const action = form.getAttribute("action") || "";
        if (action.startsWith("http://")) {
          issues.push(this.createIssue({
            category: "authentication",
            severity: "high",
            title: "Insecure Password Form",
            description: `Password form ${index + 1} submits over HTTP`,
            recommendation: "Use HTTPS for all password forms",
            references: ["https://owasp.org/www-community/vulnerabilities/Insufficient_Transport_Layer_Protection"],
          }));
        }
      }
    });

    // Check for autocomplete on password fields
    passwordInputs.forEach((input, index) => {
      const autocomplete = input.getAttribute("autocomplete");
      if (autocomplete === "on") {
        issues.push(this.createIssue({
          category: "authentication",
          severity: "low",
          title: "Password Autocomplete Enabled",
          description: `Password input ${index + 1} has autocomplete enabled`,
          recommendation: "Consider setting autocomplete='new-password' for new password fields",
          references: ["https://developer.mozilla.org/en-US/docs/Web/Security/Securing_your_site/Turning_off_form_autocompletion"],
        }));
      }
    });

    this.addIssues(issues);
    return issues;
  }

  /**
   * 检查依赖漏洞
   */
  async checkDependencyVulnerabilities(): Promise<SecurityIssue[]> {
    const issues: SecurityIssue[] = [];

    // Check for known vulnerable libraries in window object
    const knownVulnerableLibraries = [
      { name: "jQuery", checkVersion: (v: string) => v < "3.5.0" },
      { name: "lodash", checkVersion: (v: string) => v < "4.17.21" },
    ];

    for (const lib of knownVulnerableLibraries) {
      const globalLib = (window as unknown as Record<string, unknown>)[lib.name];
      if (globalLib && typeof globalLib === "object") {
        const version = (globalLib as Record<string, unknown>).VERSION as string;
        if (version && lib.checkVersion(version)) {
          issues.push(this.createIssue({
            category: "dependency",
            severity: "high",
            title: `Vulnerable Library: ${lib.name}`,
            description: `${lib.name} version ${version} has known vulnerabilities`,
            recommendation: `Update ${lib.name} to the latest version`,
            references: ["https://snyk.io/vuln/"],
          }));
        }
      }
    }

    this.addIssues(issues);
    return issues;
  }

  /**
   * 获取所有问题
   */
  getIssues(): SecurityIssue[] {
    return [...this.issues];
  }

  /**
   * 标记问题为已解决
   */
  resolveIssue(issueId: string): boolean {
    const issue = this.issues.find((i) => i.id === issueId);
    if (issue) {
      issue.resolved = true;
      this.saveToStorage();
      return true;
    }
    return false;
  }

  /**
   * 清除所有问题
   */
  clearIssues(): void {
    this.issues = [];
    this.saveToStorage();
  }

  /**
   * 获取安全评分
   */
  getScore(): number {
    const result = this.generateResult();
    return result.score;
  }

  // ========== Private Methods ==========

  private createIssue(partial: Partial<SecurityIssue>): SecurityIssue {
    return {
      id: `issue-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      category: partial.category || "configuration",
      severity: partial.severity || "medium",
      title: partial.title || "Security Issue",
      description: partial.description || "",
      location: partial.location,
      recommendation: partial.recommendation || "",
      references: partial.references || [],
      timestamp: Date.now(),
      resolved: false,
    };
  }

  private addIssues(issues: SecurityIssue[]): void {
    for (const issue of issues) {
      if (this.issues.length >= this.config.maxIssues) {
        break;
      }
      this.issues.push(issue);
    }
  }

  private generateResult(): SecurityAuditResult {
    const summary = {
      total: this.issues.length,
      critical: this.issues.filter((i) => i.severity === "critical" && !i.resolved).length,
      high: this.issues.filter((i) => i.severity === "high" && !i.resolved).length,
      medium: this.issues.filter((i) => i.severity === "medium" && !i.resolved).length,
      low: this.issues.filter((i) => i.severity === "low" && !i.resolved).length,
      resolved: this.issues.filter((i) => i.resolved).length,
    };

    const score = this.calculateScore(summary);
    const recommendations = this.generateRecommendations();

    return {
      timestamp: Date.now(),
      score,
      issues: this.issues,
      summary,
      recommendations,
    };
  }

  private calculateScore(summary: { total: number; critical: number; high: number; medium: number; low: number; resolved: number }): number {
    let score = 100;

    score -= summary.critical * 25;
    score -= summary.high * 15;
    score -= summary.medium * 5;
    score -= summary.low * 2;

    return Math.max(0, Math.min(100, score));
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    const unresolvedIssues = this.issues.filter((i) => !i.resolved);

    if (unresolvedIssues.some((i) => i.category === "xss")) {
      recommendations.push("实施严格的输入验证和输出编码以防止 XSS 攻击");
    }

    if (unresolvedIssues.some((i) => i.category === "sensitive-data")) {
      recommendations.push("审查并移除存储在客户端的敏感数据");
    }

    if (unresolvedIssues.some((i) => i.category === "csp")) {
      recommendations.push("配置严格的 Content Security Policy");
    }

    if (unresolvedIssues.some((i) => i.category === "authentication")) {
      recommendations.push("加强认证机制，确保所有敏感操作使用 HTTPS");
    }

    if (unresolvedIssues.some((i) => i.category === "dependency")) {
      recommendations.push("定期更新依赖包，使用 npm audit 检查漏洞");
    }

    return recommendations;
  }

  private loadFromStorage(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        if (data.issues) {
          this.issues = data.issues;
        }
      }
    } catch { /* ignore */ }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        issues: this.issues.slice(-this.config.maxIssues),
        lastAudit: Date.now(),
      }));
    } catch { /* ignore */ }
  }
}

// ============================================================
// Factory Function
// ============================================================

let instance: SecurityAuditor | null = null;

export function getSecurityAuditor(config?: Partial<SecurityConfig>): SecurityAuditor {
  if (!instance) {
    instance = new SecurityAuditor(config);
  }
  return instance;
}

export function createSecurityAuditor(config?: Partial<SecurityConfig>): SecurityAuditor {
  return new SecurityAuditor(config);
}
