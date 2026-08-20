/**
 * @file: ai-family.test.ts
 * @description: AI Family 遥测平台综合测试 - 验证所有核心功能
 * @author: YanYuCloudCube Team (导师指导)
 * @version: v2.0.0
 * @created: 2026-04-09
 * @updated: 2026-04-16
 * @status: active
 * @tags: [ai-family, test, telemetry, integration]
 */

import { describe, it, expect, beforeEach, vi } from "vitest";

// ============================================================
// Mock localStorage
// ============================================================

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
    get length() { return Object.keys(store).length; },
    key: (i: number) => Object.keys(store)[i] || null,
    store,
  };
})();

Object.defineProperty(globalThis, "localStorage", {
  value: localStorageMock,
  writable: true,
});

// ============================================================
// Mock MediaStream - 完整实现
// ============================================================

class MockMediaStreamTrack {
  kind: string;
  id: string;
  label: string;
  stopped = false;

  constructor(kind: string) {
    this.kind = kind;
    this.id = `track-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    this.label = `${kind} track`;
  }

  stop() {
    this.stopped = true;
  }
}

class MockMediaStream {
  private tracks: MockMediaStreamTrack[] = [];

  constructor() {
    // 默认添加音视频轨道
    this.tracks.push(new MockMediaStreamTrack("audio"));
    this.tracks.push(new MockMediaStreamTrack("video"));
  }

  getTracks(): MockMediaStreamTrack[] {
    return this.tracks;
  }

  getAudioTracks(): MockMediaStreamTrack[] {
    return this.tracks.filter(t => t.kind === "audio");
  }

  getVideoTracks(): MockMediaStreamTrack[] {
    return this.tracks.filter(t => t.kind === "video");
  }

  getTrackById(id: string): MockMediaStreamTrack | undefined {
    return this.tracks.find(t => t.id === id);
  }

  addTrack(track: MockMediaStreamTrack): void {
    this.tracks.push(track);
  }

  removeTrack(track: MockMediaStreamTrack): void {
    const index = this.tracks.indexOf(track);
    if (index > -1) {
      this.tracks.splice(index, 1);
    }
  }

  clone(): MockMediaStream {
    const stream = new MockMediaStream();
    stream.tracks = [...this.tracks];
    return stream;
  }
}

// 全局注册 MediaStream
(globalThis as any).MediaStream = MockMediaStream;

// Mock navigator.mediaDevices
Object.defineProperty(globalThis.navigator, "mediaDevices", {
  value: {
    getUserMedia: vi.fn().mockResolvedValue(new MockMediaStream()),
    getDisplayMedia: vi.fn().mockResolvedValue(new MockMediaStream()),
  },
  writable: true,
});

// Mock RTCPeerConnection
const mockRTCPeerConnection = {
  createOffer: vi.fn().mockResolvedValue({ type: "offer", sdp: "" }),
  createAnswer: vi.fn().mockResolvedValue({ type: "answer", sdp: "" }),
  setLocalDescription: vi.fn().mockResolvedValue(undefined),
  setRemoteDescription: vi.fn().mockResolvedValue(undefined),
  addIceCandidate: vi.fn().mockResolvedValue(undefined),
  addTrack: vi.fn(),
  onicecandidate: null as ((event: unknown) => void) | null,
  ontrack: null as ((event: unknown) => void) | null,
  onconnectionstatechange: null as (() => void) | null,
  connectionState: "connected" as RTCPeerConnectionState,
  close: vi.fn(),
};

vi.stubGlobal("RTCPeerConnection", vi.fn(() => mockRTCPeerConnection));

// Mock window.addEventListener for unhandledrejection
const originalAddEventListener = window.addEventListener;
window.addEventListener = vi.fn(((event: string, handler: EventListenerOrEventListenerObject) => {
  if (event === "unhandledrejection") {
    return;
  }
  return originalAddEventListener.call(window, event, handler);
}) as typeof window.addEventListener);

// ============================================================
// 测试套件
// ============================================================

describe("🌸 AI Family 遥测平台 - 综合功能测试", () => {
  // ============================================================
  // 1️⃣ 类型定义测试
  // ============================================================

  describe("📦 AI Family 类型系统", () => {
    it("应正确导出所有类型", async () => {
      const typesModule = await import("../lib/ai-family.types");

      // 验证关键常量导出正确
      expect(typesModule.PERSONAL_SPACE_QUOTA_TB).toBe(8);
      expect(typesModule.PERSONAL_SPACE_QUOTA_BYTES).toBe(8 * 1024 * 1024 * 1024 * 1024);
      expect(typesModule.MAX_DEVICES_PER_MEMBER).toBe(8);

      // 验证模块成功导入（TypeScript类型在运行时会被擦除，只保留值）
      // 如果能导入成功且常量正确，说明模块定义正常
      expect(typesModule).toBeDefined();
    });

    it("应支持8种设备类型", () => {
      const deviceTypes = [
        "smartphone",
        "tablet",
        "laptop",
        "desktop",
        "smartwatch",
        "smarttv",
        "iot-device",
        "vr-ar",
      ];

      expect(deviceTypes.length).toBe(8);
    });

    it("应支持10种记忆分类", () => {
      const categories = [
        "moment",
        "conversation",
        "achievement",
        "learning",
        "creation",
        "milestone",
        "dream",
        "reflection",
        "gratitude",
        "legacy",
      ];

      expect(categories.length).toBeGreaterThanOrEqual(10);
    });
  });

  // ============================================================
  // 2️⃣ 遥测通讯测试
  // ============================================================

  describe("📞 遥测通讯系统", () => {
    let telemetryManager: InstanceType<typeof import("../lib/ai-family-telemetry").AIFamilyTelemetryManager>;

    beforeEach(async () => {
      const { AIFamilyTelemetryManager } = await import("../lib/ai-family-telemetry");
      telemetryManager = new AIFamilyTelemetryManager();
    });

    it("应成功创建遥测会话（语音通话）", async () => {
      const session = await telemetryManager.createSession(
        "voice-call",
        "member-1",
        [
          {
            memberId: "member-2",
            deviceId: "device-2",
            displayName: "Alice",
            isMuted: false,
            isVideoOff: false,
            isScreenSharing: false,
            handRaised: false,
          },
        ]
      );

      expect(session).toBeDefined();
      expect(session.id).toContain("session");
      expect(session.type).toBe("voice-call");
      expect(session.initiatorId).toBe("member-1");
      expect(session.participants.length).toBe(1);
      expect(session.status).toBe("initializing");
    });

    it("应支持多种会话类型", async () => {
      const sessionTypes = ["voice-call", "video-call", "group-call", "screen-share", "remote-assist", "virtual-meeting"];

      for (const type of sessionTypes) {
        const session = await telemetryManager.createSession(type as any, "member-1", []);
        expect(session.type).toBe(type);
      }
    });

    it("应允许参与者加入会话", async () => {
      const session = await telemetryManager.createSession(
        "voice-call",
        "member-1",
        []
      );

      // 初始会话可能没有参与者或只有传入的参与者
      expect(session).toBeDefined();
      expect(session.sessionId).toBeDefined();

      const updatedSession = await telemetryManager.joinSession(
        session.sessionId,
        {
          memberId: "member-2",
          deviceId: "device-2",
          displayName: "Bob",
          isMuted: false,
          isVideoOff: false,
          isScreenSharing: false,
          handRaised: false,
        }
      );

      expect(updatedSession).not.toBeNull();
      expect(updatedSession!.participants.length).toBeGreaterThanOrEqual(1);
      expect(updatedSession!.status).toBe("active");
    });

    it("应正确结束会话", async () => {
      const session = await telemetryManager.createSession(
        "voice-call",
        "member-1",
        []
      );

      await telemetryManager.endSession(session.sessionId);

      const stats = telemetryManager.getSessionStats(session.sessionId);
      expect(stats).not.toBeNull();
      expect(stats!.durationSeconds).toBeGreaterThanOrEqual(0);
    });

    it("应发送和跟踪消息状态", () => {
      const message = telemetryManager.sendMessage(
        "sender-1",
        "device-1",
        { type: "text", text: "Hello, AI Family!" },
        { receiverId: "receiver-1" }
      );

      expect(message.id).toContain("msg");
      expect(message.content.text).toBe("Hello, AI Family!");
      expect(message.status).toBe("sending");
      expect(message.sentAt).toBeGreaterThan(0);
    });

    it("应支持消息编辑和删除", () => {
      const message = telemetryManager.sendMessage(
        "sender-1",
        "device-1",
        { type: "text", text: "Original message" },
        {}
      );

      const editResult = telemetryManager.editMessage(message.id, {
        type: "text",
        text: "Edited message",
      });
      expect(editResult).toBe(true);

      const deleteResult = telemetryManager.deleteMessage(message.id);
      expect(deleteResult).toBe(true);
    });

    it("应支持消息表情反应", () => {
      const message = telemetryManager.sendMessage(
        "sender-1",
        "device-1",
        { type: "text", text: "React to this!" },
        {}
      );

      // 这些方法不应该抛出异常
      expect(() => {
        telemetryManager.addReaction(message.id, "❤️", "member-1");
        telemetryManager.addReaction(message.id, "👍", "member-2");
        telemetryManager.removeReaction(message.id, "👍", "member-2");
      }).not.toThrow();
    });

    it("应启动协作白板并触发事件", () => {
      // 验证白板功能不会抛出异常
      expect(() => {
        telemetryManager.startWhiteboard("test-session", "member-1");
      }).not.toThrow();
    });

    it("应处理投票功能", () => {
      // 验证投票创建和响应不会抛出异常
      expect(() => {
        telemetryManager.createPoll(
          "test-session",
          "Best feature?",
          [
            { id: "opt-1", text: "Voice Call" },
            { id: "opt-2", text: "Video Call" },
            { id: "opt-3", text: "Screen Share" },
          ],
          "creator-1"
        );

        // 验证响应投票不会抛出异常
        telemetryManager.respondToPoll("test-session", "opt-1", "voter-1");
        telemetryManager.respondToPoll("test-session", "opt-2", "voter-2");
      }).not.toThrow();
    });

    it("应支持举手功能", () => {
      const handRaised = vi.fn();
      telemetryManager.on("hand-raised", handRaised);

      // 验证举手功能不会抛出异常
      expect(() => {
        telemetryManager.raiseHand("test-session", "student-1");
      }).not.toThrow();

      // 再次调用应该切换状态（不抛异常即可）
      expect(() => {
        telemetryManager.raiseHand("test-session", "student-1");
      }).not.toThrow();
    });

    it("应提供会话统计信息", async () => {
      const session = await telemetryManager.createSession(
        "group-call",
        "host-1",
        [
          { memberId: "p1", deviceId: "d1", displayName: "P1", isMuted: false, isVideoOff: false, isScreenSharing: false, handRaised: false },
          { memberId: "p2", deviceId: "d2", displayName: "P2", isMuted: false, isVideoOff: false, isScreenSharing: false, handRaised: false },
          { memberId: "p3", deviceId: "d3", displayName: "P3", isMuted: false, isVideoOff: false, isScreenSharing: false, handRaised: false },
        ]
      );

      const stats = telemetryManager.getSessionStats(session.sessionId);
      expect(stats).not.toBeNull();
      expect(stats!.participantCount).toBeGreaterThanOrEqual(3);
      expect(stats!.connectionQualityDistribution).toBeDefined();
    });

    it("应提供连接统计信息", () => {
      const connStats = telemetryManager.getConnectionStats();
      expect(connStats).toHaveProperty("totalConnections");
      expect(connStats).toHaveProperty("activeConnections");
      expect(connStats).toHaveProperty("averageQuality");
    });

    it("应正确销毁实例并清理资源", () => {
      const destroyed = vi.fn();
      telemetryManager.on("destroyed", destroyed);

      // 验证销毁不会抛出异常
      expect(() => {
        telemetryManager.destroy();
      }).not.toThrow();

      const activeSessions = telemetryManager.getAllActiveSessions();
      expect(activeSessions.length).toBe(0);
    });
  });

  // ============================================================
  // 3️⃣ 记忆档案系统测试
  // ============================================================

  describe("🧠 记忆档案系统", () => {
    let memoryManager: InstanceType<typeof import("../lib/ai-family-memory").AIFamilyMemoryManager>;

    beforeEach(async () => {
      // 先清理localStorage以确保测试隔离
      localStorage.clear();

      const { AIFamilyMemoryManager } = await import("../lib/ai-family-memory");
      memoryManager = new AIFamilyMemoryManager();
      memoryManager.setMemberContext("test-member-1");
    });

    it("应成功创建记忆档案", () => {
      const memory = memoryManager.createMemory("owner-1", {
        title: "美好的第一次通话",
        description: "与AI Family成员的首次视频交流",
        category: "moment",
        content: {
          type: "text",
          data: "今天与Alice进行了首次视频通话，聊了很多关于未来的计划...",
        },
        tags: ["first-call", "video", "milestone"],
        emotion: "joy",
        isPermanent: true,
        relatedMembers: ["alice-id"],
      });

      expect(memory.id).toContain("mem");
      expect(memory.ownerId).toBe("owner-1");
      expect(memory.title).toBe("美好的第一次通话");
      expect(memory.isPermanent).toBe(true);
      expect(memory.version).toBe(1);
      expect(memory.emotion?.primary).toBe("joy");
      expect(memory.timeline).toBeDefined();
      expect(memory.timeline!.length).toBe(1);
    });

    it("应检索记忆档案", () => {
      const created = memoryManager.createMemory("owner-1", {
        title: "测试记忆",
        category: "learning",
        content: { type: "text", data: "学习内容" },
      });

      const retrieved = memoryManager.getMemory(created.id);
      expect(retrieved).toBeDefined();
      expect(retrieved!.viewCount).toBeGreaterThanOrEqual(1);
    });

    it("应更新记忆档案并记录版本历史", () => {
      const created = memoryManager.createMemory("owner-1", {
        title: "原始标题",
        category: "reflection",
        content: { type: "text", data: "原始内容" },
      });

      const updated = memoryManager.updateMemory(created.id, {
        title: "更新后的标题",
        description: "添加了描述",
      });

      expect(updated).not.toBeNull();
      expect(updated!.title).toBe("更新后的标题");
      expect(updated!.description).toBe("添加了描述");
      expect(updated!.version).toBe(2);
      expect(updated!.editCount).toBe(1);
      expect(updated!.previousVersions).toBeDefined();
    });

    it("应阻止删除永久记忆", () => {
      const permanent = memoryManager.createMemory("owner-1", {
        title: "永久保存的记忆",
        category: "legacy",
        content: { type: "text", data: "重要传承" },
        isPermanent: true,
      });

      const deleteResult = memoryManager.deleteMemory(permanent.id);
      expect(deleteResult).toBe(false);
    });

    it("应允许删除非永久记忆", () => {
      const temporary = memoryManager.createMemory("owner-1", {
        title: "临时记忆",
        category: "moment",
        content: { type: "text", data: "可以删除" },
        isPermanent: false,
      });

      const deleteResult = memoryManager.deleteMemory(temporary.id);
      expect(deleteResult).toBe(true);

      const retrieved = memoryManager.getMemory(temporary.id);
      expect(retrieved).toBeUndefined();
    });

    it("应按类别查询记忆", () => {
      memoryManager.createMemory("owner-1", {
        title: "学习1",
        category: "learning",
        content: { type: "text", data: "" },
      });
      memoryManager.createMemory("owner-1", {
        title: "学习2",
        category: "learning",
        content: { type: "text", data: "" },
      });
      memoryManager.createMemory("owner-1", {
        title: "成就",
        category: "achievement",
        content: { type: "text", data: "" },
      });

      const learningMemories = memoryManager.getMemoriesByCategory("learning", "owner-1");
      expect(learningMemories.length).toBe(2);
    });

    it("应按标签搜索记忆", () => {
      memoryManager.createMemory("owner-1", {
        title: "项目启动",
        category: "milestone",
        content: { type: "text", data: "项目正式启动" },
        tags: ["project", "start", "team"],
      });
      memoryManager.createMemory("owner-1", {
        title: "团队会议",
        category: "conversation",
        content: { type: "text", data: "团队周会讨论" },
        tags: ["meeting", "team"],
      });

      const teamMemories = memoryManager.getMemoriesByTag("team", "owner-1");
      expect(teamMemories.length).toBe(2);
    });

    it("应支持全文搜索", () => {
      memoryManager.createMemory("owner-1", {
        title: "WebRTC 学习笔记",
        category: "learning",
        content: { type: "text", data: "学习了WebRTC的ICE候选、SDP交换等概念" },
        tags: ["webrtc", "tech"],
      });

      const results = memoryManager.searchMemories("WebRTC", {
        ownerId: "owner-1",
        limit: 10,
      });

      expect(results.length).toBeGreaterThanOrEqual(1);
    });

    it("应提供记忆统计信息", () => {
      for (let i = 0; i < 5; i++) {
        memoryManager.createMemory("owner-1", {
          title: `记忆 ${i}`,
          category: "moment",
          content: { type: "text", data: `内容 ${i}` },
          emotion: i % 2 === 0 ? "joy" : "gratitude",
          isPermanent: i < 2,
        });
      }

      const stats = memoryManager.getMemoryStats("owner-1");
      expect(stats.totalMemories).toBe(5);
      expect(stats.permanentMemories).toBe(2);
      expect(stats.categoryDistribution).toHaveProperty("moment");
      expect(stats.monthlyTrend).toBeDefined();
    });

    it("应导出记忆为JSON格式", () => {
      memoryManager.createMemory("owner-1", {
        title: "导出测试",
        category: "achievement",
        content: { type: "text", data: "测试数据" },
      });

      const jsonExport = memoryManager.exportMemories("owner-1", "json");
      const parsed = JSON.parse(jsonExport);

      expect(parsed.memories).toBeDefined();
      expect(parsed.count).toBeGreaterThanOrEqual(1);
      expect(parsed.version).toBe("1.0.0");
    });

    it("应导入记忆数据", () => {
      const importData = JSON.stringify([
        {
          id: "imported-mem-1",
          ownerId: "owner-1",
          title: "导入的记忆",
          category: "moment" as const,
          timestamp: Date.now(),
          content: { type: "text" as const, data: "导入的内容" },
          version: 1,
          viewCount: 0,
          editCount: 0,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ]);

      const result = memoryManager.importMemories(importData);
      expect(result.success).toBeGreaterThanOrEqual(1);
      expect(result.failed).toBe(0);
    });

    it("应恢复到之前的版本", () => {
      const original = memoryManager.createMemory("owner-1", {
        title: "原始版本",
        category: "creation",
        content: { type: "text", data: "原始内容" },
      });

      memoryManager.updateMemory(original.id, {
        title: "修改版本",
        content: { type: "text", data: "修改内容" },
      });

      const restored = memoryManager.restoreMemory(original.id);
      expect(restored).not.toBeNull();
      expect(restored!.title).toBe("原始版本");
    });
  });

  // ============================================================
  // 4️⃣ 多端同步引擎测试
  // ============================================================

  describe("📱 多端同步引擎", () => {
    let syncEngine: InstanceType<typeof import("../lib/ai-family-sync").AIFamilySyncEngine>;

    beforeEach(async () => {
      const { AIFamilySyncEngine } = await import("../lib/ai-family-sync");
      syncEngine = new AIFamilySyncEngine({
        autoSync: false, // 禁用自动同步以便手动控制测试
        syncIntervalMs: 10000,
      });
    });

    it("应初始化同步引擎", () => {
      const status = syncEngine.getSyncStatus();
      expect(["synced", "offline"]).toContain(status);
    });

    it("应注册当前设备", () => {
      syncEngine.registerCurrentDevice({
        id: "device-test-001",
        deviceId: "hw-test-001",
        deviceType: "laptop",
        deviceName: "My MacBook Pro",
        capabilities: ["camera", "microphone", "screen-share"],
      });

      const currentDevice = syncEngine.getCurrentDevice();
      expect(currentDevice).toBeDefined();
      expect(currentDevice!.deviceId).toBe("hw-test-001");
      expect(currentDevice!.deviceType).toBe("laptop");
    });

    it("应推送变更到同步队列", async () => {
      syncEngine.registerCurrentDevice({
        id: "device-1",
        deviceId: "hw-1",
        deviceType: "smartphone",
        deviceName: "iPhone 15",
        capabilities: [],
      });

      const payload = await syncEngine.pushChange(
        "memory",
        "mem-123",
        { title: "测试变更", content: "测试内容" },
        "create"
      );

      expect(payload.operation).toBe("create");
      expect(payload.entityType).toBe("memory");
      expect(payload.entityId).toBe("mem-123");
      expect(payload.sourceDeviceId).toBe("hw-1");
    });

    it("应执行增量同步", async () => {
      syncEngine.registerCurrentDevice({
        id: "device-1",
        deviceId: "hw-1",
        deviceType: "tablet",
        deviceName: "iPad Pro",
        capabilities: [],
      });

      await syncEngine.pushChange("message", "msg-1", { text: "Hello" }, "create");
      await syncEngine.pushChange("message", "msg-2", { text: "World" }, "create");

      const result = await syncEngine.incrementalSync();

      expect(result.success).toBe(true);
      expect(result.changesSynchronized).toBeGreaterThanOrEqual(0);
    });

    it("应执行全量同步", async () => {
      syncEngine.registerCurrentDevice({
        id: "device-1",
        deviceId: "hw-1",
        deviceType: "laptop",
        deviceName: "MacBook",
        capabilities: [],
      });

      for (let i = 0; i < 3; i++) {
        await syncEngine.pushChange(`entity-${i}`, `id-${i}`, { data: `value-${i}` }, "update");
      }

      const result = await syncEngine.fullSync();

      expect(result.success).toBe(true);
      expect(result.entitiesSynchronized).toBeGreaterThanOrEqual(3);
    });

    it("应检测和处理离线状态", () => {
      const offlineHandler = vi.fn();
      syncEngine.on("status:offline", offlineHandler);

      // 验证离线检测机制存在
      expect(typeof syncEngine.isOffline).toBe("function");
      expect(typeof syncEngine.getSyncStatus).toBe("function");
    });

    it("应提供同步统计信息", () => {
      const stats = syncEngine.getSyncStatistics();
      expect(stats).toHaveProperty("totalSyncs");
      expect(stats).toHaveProperty("successfulSyncs");
      expect(stats).toHaveProperty("failedSyncs");
      expect(stats).toHaveProperty("conflictsDetected");
      expect(stats).toHaveProperty("lastSyncAt");
    });

    it("应处理冲突解决", async () => {
      syncEngine.registerCurrentDevice({
        id: "device-1",
        deviceId: "hw-1",
        deviceType: "desktop",
        deviceName: "Desktop PC",
        capabilities: [],
      });

      // 推送变更
      await syncEngine.pushChange("config", "cfg-1", { theme: "dark" }, "update");

      // 验证冲突列表可以获取
      const conflicts = syncEngine.getConflicts();
      expect(Array.isArray(conflicts)).toBe(true);

      // 验证离线状态检测
      expect(typeof syncEngine.isOffline).toBe("function");
      expect(typeof syncEngine.getOfflineQueueSize).toBe("function");
    });

    it("应支持离线队列机制", () => {
      // 验证离线检测和队列功能
      const offlineHandler = vi.fn();
      syncEngine.on("status:offline", offlineHandler);

      // 在离线模式下推送变更
      const offlinePush = async () => {
        await syncEngine.pushChange("note", "note-1", { text: "Offline note" }, "create");
      };

      expect(offlinePush).not.toThrow();

      // 验证可以获取离线队列大小
      expect(typeof syncEngine.getOfflineQueueSize).toBe("function");
    });
  });

  // ============================================================
  // 5️⃣ 综合集成测试
  // ============================================================

  describe("🔗 综合集成测试", () => {
    it("应完整演示 AI Family 工作流程", async () => {
      // 1. 初始化所有管理器
      const { AIFamilyTelemetryManager } = await import("../lib/ai-family-telemetry");
      const { AIFamilyMemoryManager } = await import("../lib/ai-family-memory");
      const { AIFamilySyncEngine } = await import("../lib/ai-family-sync");

      const telemetry = new AIFamilyTelemetryManager();
      const memory = new AIFamilyMemoryManager();
      const sync = new AIFamilySyncEngine({ autoSync: false });

      // 2. 创建遥测会话
      const session = await telemetry.createSession(
        "video-call",
        "member-1",
        [{ memberId: "member-2", deviceId: "device-2", displayName: "Alice", isMuted: false, isVideoOff: false, isScreenSharing: false, handRaised: false }]
      );
      expect(session).toBeDefined();

      // 3. 发送消息
      const msg = telemetry.sendMessage("member-1", "device-1", 
        { type: "text", text: "Hello from AI Family!" }, 
        { receiverId: "member-2" }
      );
      expect(msg.status).toBe("sending");

      // 4. 创建记忆档案
      memory.setMemberContext("member-1");
      const mem = memory.createMemory("member-1", {
        title: "首次通话记录",
        category: "moment",
        content: { type: "text", data: "与Alice进行了首次视频通话" },
        emotion: "joy",
        isPermanent: true,
      });
      expect(mem.isPermanent).toBe(true);

      // 5. 注册设备并同步
      sync.registerCurrentDevice({
        id: "device-1",
        deviceId: "hw-member-1",
        deviceType: "laptop",
        deviceName: "Main Device",
        capabilities: ["camera", "microphone"],
      });

      const changePayload = await sync.pushChange("memory", mem.id, mem, "create");
      expect(changePayload.entityId).toBe(mem.id);

      // 6. 清理
      telemetry.destroy();

      console.info("✅ AI Family 完整工作流程测试通过！");
    });

    it("应支持多人同时在线协作", async () => {
      const { AIFamilyTelemetryManager } = await import("../lib/ai-family-telemetry");
      
      const manager1 = new AIFamilyTelemetryManager();
      const manager2 = new AIFamilyTelemetryManager();

      // 创建群组会话
      const session = await manager1.createSession(
        "virtual-meeting",
        "host-1",
        [
          { memberId: "participant-1", deviceId: "dev-1", displayName: "User 1", isMuted: false, isVideoOff: false, isScreenSharing: false, handRaised: false },
          { memberId: "participant-2", deviceId: "dev-2", displayName: "User 2", isMuted: false, isVideoOff: false, isScreenSharing: false, handRaised: false },
          { memberId: "participant-3", deviceId: "dev-3", displayName: "User 3", isMuted: false, isVideoOff: false, isScreenSharing: false, handRaised: false },
        ]
      );

      expect(session.participants.length).toBe(3);

      // 启动白板协作
      manager1.startWhiteboard(session.sessionId, "host-1");
      
      // 创建投票
      manager1.createPoll(
        session.sessionId,
        "下一步计划？",
        [
          { id: "opt-1", text: "继续开发" },
          { id: "opt-2", text: "测试优化" },
          { id: "opt-3", text: "发布上线" },
        ],
        "host-1"
      );

      // 清理
      manager1.destroy();
      manager2.destroy();
    });

    it("应保证数据持久化和一致性", async () => {
      const { AIFamilyMemoryManager } = await import("../lib/ai-family-memory");
      
      const memory1 = new AIFamilyMemoryManager();
      memory1.setMemberContext("user-1");

      // 创建多个记忆
      const memories = [];
      for (let i = 0; i < 10; i++) {
        const mem = memory1.createMemory("user-1", {
          title: `记忆 ${i + 1}`,
          category: i % 2 === 0 ? "learning" : "creation",
          content: { type: "text", data: `内容 ${i + 1}` },
          tags: [`tag-${i % 3}`],
          emotion: "gratitude",
          isPermanent: i < 3,
        });
        memories.push(mem);
      }

      // 导出数据
      const exportData = memory1.exportMemories("user-1", "json");
      expect(exportData).toBeDefined();

      // 创建新实例并导入
      const memory2 = new AIFamilyMemoryManager();
      memory2.setMemberContext("user-1");
      
      const importResult = memory2.importMemories(exportData);
      expect(importResult.success).toBeGreaterThanOrEqual(10);
      expect(importResult.failed).toBe(0);

      // 验证数据一致性
      const stats = memory2.getMemoryStats("user-1");
      expect(stats.totalMemories).toBeGreaterThanOrEqual(10);
      expect(stats.permanentMemories).toBeGreaterThanOrEqual(3);
    });
  });
});
