/**
 * @file: ide-mock-data.test.ts
 * @description: IDE Mock数据单元测试
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-05
 * @updated: 2026-04-08
 * @status: active
 * @tags: [module]
 */

import { describe, it, expect } from "vitest";
import {
  MOCK_FILE_TREE,
  MOCK_FILE_CONTENTS,
  MOCK_CHAT_HISTORY,
  MOCK_RECENT_PROJECTS,
  AI_MODELS,
  MOCK_GIT_BRANCHES,
  MOCK_GIT_CHANGES,
  MOCK_GIT_COMMITS,
  MOCK_NOTIFICATIONS,
} from "../modules/dev/ide/ide-mock-data";

describe("ide-mock-data", () => {
  describe("MOCK_FILE_TREE", () => {
    it("should be an array of files", () => {
      expect(Array.isArray(MOCK_FILE_TREE)).toBe(true);
      expect(MOCK_FILE_TREE.length).toBeGreaterThan(0);
    });

    it("should have src folder", () => {
      const srcFolder = MOCK_FILE_TREE.find((f) => f.id === "src");
      expect(srcFolder).toBeDefined();
      expect(srcFolder?.type).toBe("folder");
      expect(srcFolder?.children).toBeDefined();
    });

    it("should have package.json file", () => {
      const pkgJson = MOCK_FILE_TREE.find((f) => f.id === "pkg-json");
      expect(pkgJson).toBeDefined();
      expect(pkgJson?.name).toBe("package.json");
      expect(pkgJson?.type).toBe("file");
    });

    it("should have nested folder structure", () => {
      const srcFolder = MOCK_FILE_TREE.find((f) => f.id === "src");
      const appFolder = srcFolder?.children?.find((c) => c.id === "src-app");
      expect(appFolder).toBeDefined();
      expect(appFolder?.name).toBe("app");
    });

    it("should have files with language property", () => {
      const pkgJson = MOCK_FILE_TREE.find((f) => f.id === "pkg-json");
      expect(pkgJson?.language).toBe("JSON");
    });

    it("should have files with size property", () => {
      const pkgJson = MOCK_FILE_TREE.find((f) => f.id === "pkg-json");
      expect(pkgJson?.size).toBeDefined();
    });

    it("should have files with modified property", () => {
      const pkgJson = MOCK_FILE_TREE.find((f) => f.id === "pkg-json");
      expect(pkgJson?.modified).toBeDefined();
    });
  });

  describe("MOCK_FILE_CONTENTS", () => {
    it("should be an object with file contents", () => {
      expect(typeof MOCK_FILE_CONTENTS).toBe("object");
      expect(Object.keys(MOCK_FILE_CONTENTS).length).toBeGreaterThan(0);
    });

    it("should have app-tsx content", () => {
      expect(MOCK_FILE_CONTENTS["app-tsx"]).toBeDefined();
      expect(MOCK_FILE_CONTENTS["app-tsx"]).toContain("React");
    });

    it("should have routes-ts content", () => {
      expect(MOCK_FILE_CONTENTS["routes-ts"]).toBeDefined();
      expect(MOCK_FILE_CONTENTS["routes-ts"]).toContain("createBrowserRouter");
    });

    it("should have pkg-json content", () => {
      expect(MOCK_FILE_CONTENTS["pkg-json"]).toBeDefined();
      expect(MOCK_FILE_CONTENTS["pkg-json"]).toContain("name");
    });

    it("should have tsconfig content", () => {
      expect(MOCK_FILE_CONTENTS["tsconfig"]).toBeDefined();
      expect(MOCK_FILE_CONTENTS["tsconfig"]).toContain("compilerOptions");
    });

    it("should have vite-config content", () => {
      expect(MOCK_FILE_CONTENTS["vite-config"]).toBeDefined();
      expect(MOCK_FILE_CONTENTS["vite-config"]).toContain("defineConfig");
    });

    it("should have readme-md content", () => {
      expect(MOCK_FILE_CONTENTS["readme-md"]).toBeDefined();
      expect(MOCK_FILE_CONTENTS["readme-md"]).toContain("YYC");
    });

    it("should have valid TypeScript code in use-i18n", () => {
      expect(MOCK_FILE_CONTENTS["use-i18n"]).toBeDefined();
      expect(MOCK_FILE_CONTENTS["use-i18n"]).toContain("useState");
    });

    it("should have valid TSX code in layout-tsx", () => {
      expect(MOCK_FILE_CONTENTS["layout-tsx"]).toBeDefined();
      expect(MOCK_FILE_CONTENTS["layout-tsx"]).toContain("Outlet");
    });
  });

  describe("MOCK_CHAT_HISTORY", () => {
    it("should be an array of chat messages", () => {
      expect(Array.isArray(MOCK_CHAT_HISTORY)).toBe(true);
      expect(MOCK_CHAT_HISTORY.length).toBeGreaterThan(0);
    });

    it("should have system message", () => {
      const systemMsg = MOCK_CHAT_HISTORY.find((m) => m.role === "system");
      expect(systemMsg).toBeDefined();
    });

    it("should have user message", () => {
      const userMsg = MOCK_CHAT_HISTORY.find((m) => m.role === "user");
      expect(userMsg).toBeDefined();
    });

    it("should have assistant message", () => {
      const assistantMsg = MOCK_CHAT_HISTORY.find((m) => m.role === "assistant");
      expect(assistantMsg).toBeDefined();
    });

    it("should have messages with timestamps", () => {
      MOCK_CHAT_HISTORY.forEach((msg) => {
        expect(msg.timestamp).toBeDefined();
      });
    });

    it("should have messages with content", () => {
      MOCK_CHAT_HISTORY.forEach((msg) => {
        expect(msg.content).toBeDefined();
        expect(typeof msg.content).toBe("string");
      });
    });
  });

  describe("MOCK_RECENT_PROJECTS", () => {
    it("should be an array of projects", () => {
      expect(Array.isArray(MOCK_RECENT_PROJECTS)).toBe(true);
      expect(MOCK_RECENT_PROJECTS.length).toBeGreaterThan(0);
    });

    it("should have projects with required properties", () => {
      MOCK_RECENT_PROJECTS.forEach((project) => {
        expect(project.id).toBeDefined();
        expect(project.name).toBeDefined();
        expect(project.description).toBeDefined();
        expect(project.updatedAt).toBeDefined();
        expect(project.status).toBeDefined();
      });
    });

    it("should have active projects", () => {
      const activeProjects = MOCK_RECENT_PROJECTS.filter((p) => p.status === "active");
      expect(activeProjects.length).toBeGreaterThan(0);
    });

    it("should have archived projects", () => {
      const archivedProjects = MOCK_RECENT_PROJECTS.filter((p) => p.status === "archived");
      expect(archivedProjects.length).toBeGreaterThan(0);
    });
  });

  describe("AI_MODELS", () => {
    it("should be an array of AI models", () => {
      expect(Array.isArray(AI_MODELS)).toBe(true);
      expect(AI_MODELS.length).toBeGreaterThan(0);
    });

    it("should have models with required properties", () => {
      AI_MODELS.forEach((model) => {
        expect(model.id).toBeDefined();
        expect(model.name).toBeDefined();
        expect(model.provider).toBeDefined();
        expect(model.status).toBeDefined();
      });
    });

    it("should have online models", () => {
      const onlineModels = AI_MODELS.filter((m) => m.status === "online");
      expect(onlineModels.length).toBeGreaterThan(0);
    });

    it("should have GLM-4 Flash model", () => {
      const glmModel = AI_MODELS.find((m) => m.id === "glm-4-flash");
      expect(glmModel).toBeDefined();
      expect(glmModel?.provider).toBe("Z.ai");
    });

    it("should have GPT-4o model", () => {
      const gptModel = AI_MODELS.find((m) => m.id === "gpt-4o");
      expect(gptModel).toBeDefined();
      expect(gptModel?.provider).toBe("OpenAI");
    });
  });

  describe("MOCK_GIT_BRANCHES", () => {
    it("should be an array of branches", () => {
      expect(Array.isArray(MOCK_GIT_BRANCHES)).toBe(true);
      expect(MOCK_GIT_BRANCHES.length).toBeGreaterThan(0);
    });

    it("should have branches with required properties", () => {
      MOCK_GIT_BRANCHES.forEach((branch) => {
        expect(branch.name).toBeDefined();
        expect(typeof branch.current).toBe("boolean");
        expect(branch.lastCommit).toBeDefined();
      });
    });

    it("should have one current branch", () => {
      const currentBranches = MOCK_GIT_BRANCHES.filter((b) => b.current);
      expect(currentBranches.length).toBe(1);
    });

    it("should have main branch", () => {
      const mainBranch = MOCK_GIT_BRANCHES.find((b) => b.name === "main");
      expect(mainBranch).toBeDefined();
    });

    it("should have develop branch", () => {
      const developBranch = MOCK_GIT_BRANCHES.find((b) => b.name === "develop");
      expect(developBranch).toBeDefined();
      expect(developBranch?.current).toBe(true);
    });
  });

  describe("MOCK_GIT_CHANGES", () => {
    it("should be an array of changes", () => {
      expect(Array.isArray(MOCK_GIT_CHANGES)).toBe(true);
      expect(MOCK_GIT_CHANGES.length).toBeGreaterThan(0);
    });

    it("should have changes with required properties", () => {
      MOCK_GIT_CHANGES.forEach((change) => {
        expect(change.id).toBeDefined();
        expect(change.filename).toBeDefined();
        expect(change.filepath).toBeDefined();
        expect(change.status).toBeDefined();
        expect(typeof change.staged).toBe("boolean");
      });
    });

    it("should have modified files", () => {
      const modifiedFiles = MOCK_GIT_CHANGES.filter((c) => c.status === "modified");
      expect(modifiedFiles.length).toBeGreaterThan(0);
    });

    it("should have added files", () => {
      const addedFiles = MOCK_GIT_CHANGES.filter((c) => c.status === "added");
      expect(addedFiles.length).toBeGreaterThan(0);
    });

    it("should have deleted files", () => {
      const deletedFiles = MOCK_GIT_CHANGES.filter((c) => c.status === "deleted");
      expect(deletedFiles.length).toBeGreaterThan(0);
    });

    it("should have staged and unstaged changes", () => {
      const stagedChanges = MOCK_GIT_CHANGES.filter((c) => c.staged);
      const unstagedChanges = MOCK_GIT_CHANGES.filter((c) => !c.staged);
      expect(stagedChanges.length).toBeGreaterThan(0);
      expect(unstagedChanges.length).toBeGreaterThan(0);
    });
  });

  describe("MOCK_GIT_COMMITS", () => {
    it("should be an array of commits", () => {
      expect(Array.isArray(MOCK_GIT_COMMITS)).toBe(true);
      expect(MOCK_GIT_COMMITS.length).toBeGreaterThan(0);
    });

    it("should have commits with required properties", () => {
      MOCK_GIT_COMMITS.forEach((commit) => {
        expect(commit.id).toBeDefined();
        expect(commit.hash).toBeDefined();
        expect(commit.message).toBeDefined();
        expect(commit.author).toBeDefined();
        expect(commit.date).toBeDefined();
        expect(commit.branch).toBeDefined();
      });
    });

    it("should have commits with 7-character hash", () => {
      MOCK_GIT_COMMITS.forEach((commit) => {
        expect(commit.hash.length).toBe(7);
      });
    });

    it("should have commits on different branches", () => {
      const branches = new Set(MOCK_GIT_COMMITS.map((c) => c.branch));
      expect(branches.size).toBeGreaterThan(1);
    });
  });

  describe("MOCK_NOTIFICATIONS", () => {
    it("should be an array of notifications", () => {
      expect(Array.isArray(MOCK_NOTIFICATIONS)).toBe(true);
      expect(MOCK_NOTIFICATIONS.length).toBeGreaterThan(0);
    });

    it("should have notifications with required properties", () => {
      MOCK_NOTIFICATIONS.forEach((notif) => {
        expect(notif.id).toBeDefined();
        expect(notif.title).toBeDefined();
        expect(notif.message).toBeDefined();
        expect(notif.severity).toBeDefined();
        expect(notif.timestamp).toBeDefined();
        expect(typeof notif.read).toBe("boolean");
        expect(notif.source).toBeDefined();
      });
    });

    it("should have success notifications", () => {
      const successNotifs = MOCK_NOTIFICATIONS.filter((n) => n.severity === "success");
      expect(successNotifs.length).toBeGreaterThan(0);
    });

    it("should have error notifications", () => {
      const errorNotifs = MOCK_NOTIFICATIONS.filter((n) => n.severity === "error");
      expect(errorNotifs.length).toBeGreaterThan(0);
    });

    it("should have warning notifications", () => {
      const warningNotifs = MOCK_NOTIFICATIONS.filter((n) => n.severity === "warning");
      expect(warningNotifs.length).toBeGreaterThan(0);
    });

    it("should have info notifications", () => {
      const infoNotifs = MOCK_NOTIFICATIONS.filter((n) => n.severity === "info");
      expect(infoNotifs.length).toBeGreaterThan(0);
    });

    it("should have unread notifications", () => {
      const unreadNotifs = MOCK_NOTIFICATIONS.filter((n) => !n.read);
      expect(unreadNotifs.length).toBeGreaterThan(0);
    });

    it("should have read notifications", () => {
      const readNotifs = MOCK_NOTIFICATIONS.filter((n) => n.read);
      expect(readNotifs.length).toBeGreaterThan(0);
    });
  });
});
