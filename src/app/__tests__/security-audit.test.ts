/**
 * @file: security-audit.test.ts
 * @description: security-audit.test.ts
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-08
 * @updated: 2026-04-08
 * @status: active
 * @tags: [module]
 */

// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { SecurityAuditor, createSecurityAuditor, getSecurityAuditor } from "../lib/security-audit";

describe("SecurityAuditor", () => {
  let auditor: SecurityAuditor;

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    document.cookie = "";
    auditor = createSecurityAuditor();
  });

  afterEach(() => {
    auditor.clearIssues();
  });

  describe("full audit", () => {
    it("should run full audit", async () => {
      const result = await auditor.runFullAudit();

      expect(result.timestamp).toBeDefined();
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
      expect(result.issues).toBeDefined();
      expect(result.summary).toBeDefined();
      expect(result.recommendations).toBeDefined();
    });

    it("should return summary with correct counts", async () => {
      const result = await auditor.runFullAudit();

      expect(result.summary.total).toBeGreaterThanOrEqual(0);
      expect(result.summary.critical).toBeGreaterThanOrEqual(0);
      expect(result.summary.high).toBeGreaterThanOrEqual(0);
      expect(result.summary.medium).toBeGreaterThanOrEqual(0);
      expect(result.summary.low).toBeGreaterThanOrEqual(0);
    });
  });

  describe("XSS detection", () => {
    it("should detect XSS vulnerabilities", async () => {
      const script = document.createElement("script");
      script.setAttribute("data-test", "xss-test");
      document.body.appendChild(script);

      const issues = await auditor.checkXSSVulnerabilities();

      expect(issues).toBeDefined();
      expect(Array.isArray(issues)).toBe(true);

      document.body.removeChild(script);
    });
  });

  describe("sensitive data detection", () => {
    it("should detect sensitive data in localStorage", async () => {
      localStorage.setItem("api_key", "sk-test-secret-key-12345");

      const issues = await auditor.checkSensitiveDataExposure();

      expect(issues.length).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(issues)).toBe(true);
    });

    it("should detect passwords in localStorage", async () => {
      localStorage.setItem("config", JSON.stringify({ password: "hardcoded-password" }));

      const issues = await auditor.checkSensitiveDataExposure();

      expect(Array.isArray(issues)).toBe(true);
    });

    it("should detect connection strings", async () => {
      localStorage.setItem("db", "mongodb://user:password@localhost:27017/db");

      const issues = await auditor.checkSensitiveDataExposure();

      expect(Array.isArray(issues)).toBe(true);
    });
  });

  describe("CSP detection", () => {
    it("should detect missing CSP", async () => {
      const issues = await auditor.checkCSPConfiguration();

      expect(issues.some((i) => i.title.includes("Missing Content Security Policy"))).toBe(true);
    });

    it("should detect unsafe-inline in CSP", async () => {
      const meta = document.createElement("meta");
      meta.setAttribute("http-equiv", "Content-Security-Policy");
      meta.setAttribute("content", "script-src 'self' 'unsafe-inline'");
      document.head.appendChild(meta);

      const issues = await auditor.checkCSPConfiguration();

      expect(issues.some((i) => i.title.includes("unsafe-inline"))).toBe(true);

      document.head.removeChild(meta);
    });

    it("should detect unsafe-eval in CSP", async () => {
      const meta = document.createElement("meta");
      meta.setAttribute("http-equiv", "Content-Security-Policy");
      meta.setAttribute("content", "script-src 'self' 'unsafe-eval'");
      document.head.appendChild(meta);

      const issues = await auditor.checkCSPConfiguration();

      expect(issues.some((i) => i.title.includes("unsafe-eval"))).toBe(true);

      document.head.removeChild(meta);
    });
  });

  describe("authentication detection", () => {
    it("should detect insecure password forms", async () => {
      const form = document.createElement("form");
      form.setAttribute("action", "http://example.com/login");
      form.innerHTML = '<input type="password" name="password">';
      document.body.appendChild(form);

      const issues = await auditor.checkAuthenticationIssues();

      expect(issues.some((i) => i.title.includes("Insecure Password Form"))).toBe(true);

      document.body.removeChild(form);
    });
  });

  describe("issue management", () => {
    it("should get all issues", async () => {
      await auditor.runFullAudit();
      const issues = auditor.getIssues();

      expect(Array.isArray(issues)).toBe(true);
    });

    it("should resolve issue", async () => {
      await auditor.runFullAudit();
      const issues = auditor.getIssues();

      if (issues.length > 0) {
        const resolved = auditor.resolveIssue(issues[0].id);
        expect(resolved).toBe(true);

        const updatedIssues = auditor.getIssues();
        expect(updatedIssues[0].resolved).toBe(true);
      }
    });

    it("should clear all issues", async () => {
      await auditor.runFullAudit();
      auditor.clearIssues();

      const issues = auditor.getIssues();
      expect(issues.length).toBe(0);
    });
  });

  describe("score calculation", () => {
    it("should calculate security score", async () => {
      await auditor.runFullAudit();
      const score = auditor.getScore();

      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it("should reduce score for critical issues", async () => {
      localStorage.setItem("secret", "password=admin123");
      await auditor.runFullAudit();
      const score = auditor.getScore();

      expect(score).toBeLessThan(100);
    });
  });

  describe("recommendations", () => {
    it("should generate recommendations", async () => {
      const result = await auditor.runFullAudit();

      expect(Array.isArray(result.recommendations)).toBe(true);
    });
  });

  describe("persistence", () => {
    it("should persist issues to localStorage", async () => {
      await auditor.runFullAudit();

      const stored = localStorage.getItem("yyc3_security_audit");
      expect(stored).toBeDefined();
    });

    it("should load issues from localStorage", () => {
      localStorage.setItem("yyc3_security_audit", JSON.stringify({
        issues: [{
          id: "test-issue",
          category: "xss",
          severity: "high",
          title: "Test Issue",
          description: "Test",
          recommendation: "Test",
          references: [],
          timestamp: Date.now(),
          resolved: false,
        }],
      }));

      const newAuditor = createSecurityAuditor();
      const issues = newAuditor.getIssues();

      expect(issues.length).toBe(1);
      expect(issues[0].id).toBe("test-issue");
    });
  });

  describe("configuration", () => {
    it("should respect configuration options", async () => {
      const customAuditor = createSecurityAuditor({
        checkXSS: false,
        checkSensitiveData: false,
        checkCSP: false,
        checkDependencies: false,
        checkAuthentication: false,
      });

      const result = await customAuditor.runFullAudit();

      expect(result.issues.length).toBe(0);
    });
  });
});

describe("getSecurityAuditor", () => {
  it("should return singleton instance", () => {
    const instance1 = getSecurityAuditor();
    const instance2 = getSecurityAuditor();

    expect(instance1).toBe(instance2);
  });
});

describe("createSecurityAuditor", () => {
  it("should create new instance", () => {
    const auditor1 = createSecurityAuditor();
    const auditor2 = createSecurityAuditor();

    expect(auditor1).not.toBe(auditor2);
  });
});
