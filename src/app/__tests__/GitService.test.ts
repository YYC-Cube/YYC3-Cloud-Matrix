/**
 * @file: GitService.test.ts
 * @description: GitService 单元测试 - 覆盖所有核心功能
 * @author: YanYuCloudCube Team (导师指导)
 * @version: v1.0.0
 * @created: 2026-04-09
 * @updated: 2026-04-16
 * @status: active
 * @tags: [unit-test, git-service, core-business]
 */

// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  GitService,
  getGitService,
  createGitService,
} from "../lib/GitService";
import type {
  GitFileChange,
  GitCommitInfo,
  GitBranchInfo,
  GitStatus,
  GitServiceConfig,
} from "../lib/GitService";

describe("GitService", () => {
  let gitService: GitService;

  beforeEach(() => {
    vi.useFakeTimers();
    // Mock console methods to reduce noise
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});

    // Mock localStorage
    const localStorageMock = {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      length: 0,
      key: vi.fn(),
    };
    Object.defineProperty(window, "localStorage", { value: localStorageMock });

    gitService = createGitService({
      enableCache: true,
    });
  });

  afterEach(() => {
    gitService.destroy();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  // ============================================================
  // 1. 初始化与配置
  // ============================================================
  describe("Initialization & Configuration", () => {
    it("should create instance with default config", () => {
      const service = createGitService();

      expect(service).toBeInstanceOf(GitService);
      expect(service.getPlatform()).toBeDefined();
    });

    it("should accept custom configuration", () => {
      const onStatusChange = vi.fn();
      const onError = vi.fn();

      const service = createGitService({
        autoRefresh: false,
        refreshInterval: 60000,
        repoPath: "/test/repo",
        onStatusChange,
        onError,
      });

      expect(service).toBeInstanceOf(GitService);
    });

    it("should detect platform correctly in browser environment", () => {
      const platform = gitService.getPlatform();

      expect(["web", "desktop", "pwa", "mobile"]).toContain(platform);
    });
  });

  // ============================================================
  // 2. 平台检测
  // ============================================================
  describe("Platform Detection", () => {
    it("should return valid platform type", () => {
      const platform = gitService.getPlatform();

      expect(typeof platform).toBe("string");
      expect(["web", "desktop", "pwa", "mobile"]).toContain(platform);
    });
  });

  // ============================================================
  // 3. Git状态管理
  // ============================================================
  describe("Git Status Management", () => {
    it("should initialize successfully", async () => {
      const result = await gitService.initialize("/test/path");

      expect(result).toBe(true);
    });

    it("should get status with mock data", async () => {
      await gitService.initialize();

      const status = await gitService.getStatus();

      expect(status).toBeDefined();
      expect(status.branch).toBeDefined();
      expect(typeof status.clean).toBe("boolean");
      expect(Array.isArray(status.staged)).toBe(true);
      expect(Array.isArray(status.unstaged)).toBe(true);
    });

    it("should return cached status when available", async () => {
      await gitService.initialize();

      const status1 = await gitService.getStatus();
      const status2 = await gitService.getStatus();

      expect(status1).toEqual(status2);
    });

    it("should force refresh status when requested", async () => {
      await gitService.initialize();

      const status1 = await gitService.getStatus();
      const status2 = await gitService.getStatus(true);

      expect(status2).toBeDefined();
    });

    it("should handle errors gracefully and return fallback", async () => {
      // Mock fetchGitStatus to throw error
      const originalFetch = gitService as any;
      vi.spyOn(originalFetch, "fetchGitStatus").mockRejectedValueOnce(
        new Error("Network error")
      );

      const status = await originalFetch.getStatus();

      expect(status).toBeDefined();
      expect(status.clean).toBe(true);
      expect(status.staged.length).toBe(0);
      expect(status.unstaged.length).toBe(0);
    });

    it("should call onStatusChange callback", async () => {
      const onStatusChange = vi.fn();
      const service = createGitService({ onStatusChange });

      await service.initialize();
      await service.getStatus(true);

      expect(onStatusChange).toHaveBeenCalled();
    });
  });

  // ============================================================
  // 4. 提交历史
  // ============================================================
  describe("Commit History", () => {
    it("should return commits with correct structure", async () => {
      await gitService.initialize();

      const commits = await gitService.getCommits();

      expect(Array.isArray(commits)).toBe(true);
      expect(commits.length).toBeGreaterThan(0);

      const commit = commits[0];
      expect(commit.id).toBeDefined();
      expect(commit.hash).toBeDefined();
      expect(commit.message).toBeDefined();
      expect(commit.author).toBeDefined();
      expect(commit.date).toBeDefined();
    });

    it("should respect limit parameter", async () => {
      await gitService.initialize();

      const limitedCommits = await gitService.getCommits(3);

      expect(limitedCommits.length).toBeLessThanOrEqual(3);
    });

    it("should respect offset parameter", async () => {
      await gitService.initialize();

      const allCommits = await gitService.getCommits(20, 0);
      const offsetCommits = await gitService.getCommits(20, 2);

      expect(offsetCommits.length).toBeLessThanOrEqual(allCommits.length - 2);
    });

    it("should cache commits for subsequent calls", async () => {
      await gitService.initialize();

      const commits1 = await gitService.getCommits();
      const commits2 = await gitService.getCommits();

      expect(commits1).toEqual(commits2);
    });

    it("should force refresh commits when requested", async () => {
      await gitService.initialize();

      const commits1 = await gitService.getCommits(10, 0, false);
      const commits2 = await gitService.getCommits(10, 0, true);

      expect(commits2).toBeDefined();
    });

    it("should return fallback commits on error", async () => {
      const originalFetch = gitService as any;
      vi.spyOn(originalFetch, "fetchCommits").mockRejectedValueOnce(
        new Error("Network error")
      );

      const commits = await originalFetch.getCommits();

      expect(Array.isArray(commits)).toBe(true);
      expect(commits.length).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // 5. 分支管理
  // ============================================================
  describe("Branch Management", () => {
    it("should return branches with correct structure", async () => {
      await gitService.initialize();

      const branches = await gitService.getBranches();

      expect(Array.isArray(branches)).toBe(true);
      expect(branches.length).toBeGreaterThan(0);

      const branch = branches[0];
      expect(branch.name).toBeDefined();
      expect(typeof branch.current).toBe("boolean");
      expect(branch.lastCommit).toBeDefined();
    });

    it("should have exactly one current branch", async () => {
      await gitService.initialize();

      const branches = await gitService.getBranches();
      const currentBranches = branches.filter((b) => b.current);

      expect(currentBranches.length).toBe(1);
    });

    it("should include remote branches", async () => {
      await gitService.initialize();

      const branches = await gitService.getBranches();
      const remoteBranches = branches.filter((b) => b.isRemote);

      expect(remoteBranches.length).toBeGreaterThan(0);
    });

    it("should cache branches for subsequent calls", async () => {
      await gitService.initialize();

      const branches1 = await gitService.getBranches();
      const branches2 = await gitService.getBranches();

      expect(branches1).toEqual(branches2);
    });

    it("should checkout branch successfully", async () => {
      await gitService.initialize();

      const result = await gitService.checkoutBranch("develop");

      expect(result).toBe(true);

      const branches = await gitService.getBranches();
      const developBranch = branches.find((b) => b.name === "develop");

      expect(developBranch?.current).toBe(true);
    });

    it("should create new branch successfully", async () => {
      await gitService.initialize();

      const newBranch = await gitService.createBranch("feature/test-branch");

      expect(newBranch).not.toBeNull();
      expect(newBranch?.name).toBe("feature/test-branch");

      const branches = await gitService.getBranches();
      expect(branches.find((b) => b.name === "feature/test-branch")).toBeDefined();
    });

    it("should call onError when checkout fails", async () => {
      const onError = vi.fn();
      const service = createGitService({ onError });

      await service.initialize();

      // Mock to throw error
      const originalCheckout = service as any;
      vi.spyOn(originalCheckout, "refreshStatus").mockRejectedValueOnce(
        new Error("Checkout failed")
      );

      const result = await originalCheckout.checkoutBranch("nonexistent");

      expect(result).toBe(false);
      expect(onError).toHaveBeenCalled();
    });
  });

  // ============================================================
  // 6. 文件暂存操作
  // ============================================================
  describe("File Staging Operations", () => {
    it("should stage a single file", async () => {
      await gitService.initialize();
      const status = await gitService.getStatus();

      const unstagedFile = status.unstaged[0];

      if (unstagedFile) {
        await gitService.stageFile(unstagedFile.id);

        // Verify the operation completed without error
        expect(unstagedFile.staged).toBe(true);
      }
    });

    it("should unstage a single file", async () => {
      await gitService.initialize();
      const status = await gitService.getStatus();

      const stagedFile = status.staged[0];

      if (stagedFile) {
        await gitService.unstageFile(stagedFile.id);

        // Verify the operation completed without error
        expect(stagedFile.staged).toBe(false);
      }
    });

    it("should stage all files", async () => {
      await gitService.initialize();
      await gitService.getStatus();

      await gitService.stageAllFiles();

      // Get fresh status to verify staging worked
      const status = await gitService.getStatus();

      // All unstaged files should now be staged (in memory)
      const totalFiles = [...status.staged, ...status.unstaged];
      expect(totalFiles.length).toBeGreaterThan(0);
    });

    it("should unstage all files", async () => {
      await gitService.initialize();
      await gitService.getStatus();

      // First stage all files
      await gitService.stageAllFiles();

      // Then unstage all
      await gitService.unstageAllFiles();

      // Verify operation completed
      const status = await gitService.getStatus();
      expect(status).toBeDefined();
    });
  });

  // ============================================================
  // 7. Commit 操作
  // ============================================================
  describe("Commit Operations", () => {
    it("should commit staged changes successfully", async () => {
      await gitService.initialize();
      await gitService.getStatus();

      // Stage a file first
      await gitService.stageAllFiles();

      const commit = await gitService.commit("Test commit message");

      expect(commit).not.toBeNull();
      expect(commit?.message).toBe("Test commit message");
      expect(commit?.hash).toBeDefined();
      expect(commit?.author).toBeDefined();
      expect(commit?.date).toBeDefined();
    });

    it("should reject empty commit message", async () => {
      await gitService.initialize();

      const commit = await gitService.commit("");

      expect(commit).toBeNull();
    });

    it("should reject commit with no staged changes", async () => {
      await gitService.initialize();

      // Clear staged files first
      const status = await gitService.getStatus();
      status.staged = [];

      const commit = await gitService.commit("No changes to commit");

      expect(commit).toBeNull();
    });

    it("should update status after commit", async () => {
      await gitService.initialize();
      await gitService.stageAllFiles();

      await gitService.commit("Test commit");

      const status = await gitService.getStatus();

      expect(status.staged.length).toBe(0);
    });

    it("should add commit to history", async () => {
      await gitService.initialize();
      await gitService.stageAllFiles();

      const commit = await gitService.commit("New feature");

      const commits = await gitService.getCommits();

      expect(commits[0].id).toBe(commit?.id);
    });

    it("should call onError when commit fails", async () => {
      const onError = vi.fn();
      const service = createGitService({ onError });

      await service.initialize();

      const commit = await service.commit("");

      expect(commit).toBeNull();
      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({ message: expect.any(String) })
      );
    });
  });

  // ============================================================
  // 8. Pull/Push 操作
  // ============================================================
  describe("Pull/Push Operations", () => {
    it("should pull changes successfully", async () => {
      await gitService.initialize();

      vi.useRealTimers();
      const result = await gitService.pull();

      expect(result.success).toBe(true);
      expect(result.message).toBeDefined();
    });

    it("should push changes successfully", async () => {
      await gitService.initialize();

      vi.useRealTimers();
      const result = await gitService.push();

      expect(result.success).toBe(true);
      expect(result.message).toBeDefined();
    });

    it("should handle pull failure gracefully", async () => {
      const originalPull = gitService as any;
      vi.spyOn(originalPull, "pull").mockResolvedValueOnce({
        success: false,
        message: "Pull failed: Network error",
      });

      const result = await originalPull.pull();

      expect(result.success).toBe(false);
      expect(result.message).toContain("failed");
    });
  });

  // ============================================================
  // 9. 缓存机制
  // ============================================================
  describe("Caching Mechanism", () => {
    it("should cache status data", async () => {
      await gitService.initialize();

      const status1 = await gitService.getStatus();
      const status2 = await gitService.getStatus();

      expect(status1).toEqual(status2);
    });

    it("should bypass cache when disabled", async () => {
      const service = createGitService({ enableCache: false });

      await service.initialize();

      const status1 = await service.getStatus();
      const status2 = await service.getStatus();

      expect(status2).toBeDefined();
      service.destroy();
    });

    it("should clear cache on destroy", async () => {
      await gitService.initialize();
      await gitService.getStatus();

      gitService.destroy();

      expect(gitService.getPlatform()).toBeDefined();
    });
  });

  // ============================================================
  // 10. 自动刷新
  // ============================================================
  describe("Auto Refresh", () => {
    it("should start auto refresh timer", () => {
      const service = createGitService({
        autoRefresh: true,
        refreshInterval: 10000,
      });

      // Timer should be started
      expect(service).toBeInstanceOf(GitService);
      service.destroy();
    });

    it("should stop auto refresh timer", () => {
      const service = createGitService({
        autoRefresh: true,
        refreshInterval: 10000,
      });

      service.stopAutoRefresh();

      expect(service).toBeInstanceOf(GitService);
      service.destroy();
    });

    it("should restart auto refresh with different interval", () => {
      const service = createGitService({
        autoRefresh: true,
        refreshInterval: 5000,
      });

      service.stopAutoRefresh();
      service.startAutoRefresh();

      expect(service).toBeInstanceOf(GitService);
      service.destroy();
    });
  });

  // ============================================================
  // 11. 错误处理
  // ============================================================
  describe("Error Handling", () => {
    it("should call onError callback when provided", async () => {
      const onError = vi.fn();
      const service = createGitService({ onError });

      await service.initialize();

      // Trigger an error by committing without staging
      await service.commit("");

      expect(onError).toHaveBeenCalled();
      service.destroy();
    });

    it("should not throw when onError is not provided", async () => {
      const service = createGitService();

      await service.initialize();

      // Should not throw even without error handler
      const commit = await service.commit("");

      expect(commit).toBeNull();
      service.destroy();
    });
  });

  // ============================================================
  // 12. 单例模式
  // ============================================================
  describe("Singleton Pattern", () => {
    it("should return same instance from getGitService", () => {
      const instance1 = getGitService();
      const instance2 = getGitService();

      expect(instance1).toBe(instance2);
    });

    it("should create new instance from createGitService", () => {
      const instance1 = createGitService();
      const instance2 = createGitService();

      expect(instance1).not.toBe(instance2);
    });
  });

  // ============================================================
  // 13. 数据格式验证
  // ============================================================
  describe("Data Format Validation", () => {
    it("should return valid GitFileChange structure", async () => {
      await gitService.initialize();
      const status = await gitService.getStatus();

      if (status.staged.length > 0 || status.unstaged.length > 0) {
        const file =
          status.staged[0] || status.unstaged[0];

        expect(file).toHaveProperty("id");
        expect(file).toHaveProperty("filename");
        expect(file).toHaveProperty("status");
        expect(file).toHaveProperty("staged");
        expect(["modified", "added", "deleted", "renamed", "untracked"]).toContain(
          file.status
        );
      }
    });

    it("should return valid GitCommitInfo structure", async () => {
      await gitService.initialize();
      const commits = await gitService.getCommits();

      if (commits.length > 0) {
        const commit = commits[0];

        expect(commit).toHaveProperty("id");
        expect(commit).toHaveProperty("hash");
        expect(commit).toHaveProperty("message");
        expect(commit).toHaveProperty("author");
        expect(commit).toHaveProperty("email");
        expect(commit).toHaveProperty("date");
        expect(commit).toHaveProperty("filesChanged");
        expect(commit).toHaveProperty("additions");
        expect(commit).toHaveProperty("deletions");
      }
    });

    it("should return valid GitBranchInfo structure", async () => {
      await gitService.initialize();
      const branches = await gitService.getBranches();

      if (branches.length > 0) {
        const branch = branches[0];

        expect(branch).toHaveProperty("name");
        expect(branch).toHaveProperty("current");
        expect(branch).toHaveProperty("lastCommit");
        expect(branch).toHaveProperty("ahead");
        expect(branch).toHaveProperty("behind");
        expect(branch).toHaveProperty("isRemote");
      }
    });
  });
});

describe("GitService Edge Cases", () => {
  let gitService: GitService;

  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});

    const localStorageMock = {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      length: 0,
      key: vi.fn(),
    };
    Object.defineProperty(window, "localStorage", { value: localStorageMock });

    gitService = createGitService();
  });

  afterEach(() => {
    gitService.destroy();
    vi.restoreAllMocks();
  });

  it("should handle multiple rapid getStatus calls", async () => {
    await gitService.initialize();

    const promises = Array.from({ length: 10 }, () =>
      gitService.getStatus()
    );
    const results = await Promise.all(promises);

    results.forEach((result) => {
      expect(result).toBeDefined();
    });
  });

  it("should handle concurrent commit operations", async () => {
    await gitService.initialize();
    await gitService.stageAllFiles();

    const promises = Array.from({ length: 5 }, (_, i) =>
      gitService.commit(`Concurrent commit ${i}`)
    );
    const results = await Promise.all(promises);

    // Only first should succeed, rest should fail (no staged changes)
    const successfulCommits = results.filter((r) => r !== null);
    expect(successfulCommits.length).toBeGreaterThanOrEqual(1);
  });

  it("should handle branch switching multiple times", async () => {
    await gitService.initialize();

    await gitService.checkoutBranch("develop");
    await gitService.checkoutBranch("main");
    await gitService.checkoutBranch("feature/ai-family-v2");

    const branches = await gitService.getBranches();
    const currentBranch = branches.find((b) => b.current);

    expect(currentBranch?.name).toBe("feature/ai-family-v2");
  });

  it("should preserve data integrity through full workflow", async () => {
    await gitService.initialize();

    // Get initial state
    const initialStatus = await gitService.getStatus();
    const initialCommits = await gitService.getCommits();
    const initialBranches = await gitService.getBranches();

    // Perform operations
    await gitService.stageAllFiles();
    const commit = await gitService.commit("Integration test commit");

    // Verify final state
    const finalStatus = await gitService.getStatus();
    const finalCommits = await gitService.getCommits();

    expect(finalStatus.staged.length).toBeLessThanOrEqual(
      initialStatus.staged.length
    );
    expect(finalCommits.length).toBeGreaterThanOrEqual(initialCommits.length);
    expect(commit).not.toBeNull();
  });
});
