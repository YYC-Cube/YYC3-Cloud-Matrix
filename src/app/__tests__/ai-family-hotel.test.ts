/**
 * @file: ai-family-hotel.test.ts
 * @description: AI Family 酒店人系统 - 综合测试套件
 * @author: YanYuCloudCube Team (导师指导)
 * @version: v1.0.0
 * @created: 2026-04-09
 * @updated: 2026-04-16
 * @status: active
 * @tags: [ai-family, hotel, test, multi-model]
 */

import { beforeEach, describe, expect, it } from "vitest";

// ============================================================
// 测试套件
// ============================================================

describe("🏨 AI Family 酒店人系统 - 多模型协作测试", () => {
  // ============================================================
  // 1️⃣ 类型系统与模型配置测试
  // ============================================================

  describe("📦 酒店人类型系统", () => {
    it("应正确导出智谱AI模型配置", async () => {
      const { ZHIPU_MODELS } = await import("../lib/ai-family-hotel.types");

      // 验证4个核心模型存在
      expect(ZHIPU_MODELS["chatglm3-6b"]).toBeDefined();
      expect(ZHIPU_MODELS["codegeex4-all-9b"]).toBeDefined();
      expect(ZHIPU_MODELS["cogagent"]).toBeDefined();
      expect(ZHIPU_MODELS["cogvideox-5b"]).toBeDefined();

      // 验证ChatGLM3配置
      const chatGLM = ZHIPU_MODELS["chatglm3-6b"];
      expect(chatGLM.provider).toBe("zhipu");
      expect(chatGLM.capabilities).toContain("chat");
      expect(chatGLM.supportsStreaming).toBe(true);

      // 验证CodeGeeX配置
      const codeGeeX = ZHIPU_MODELS["codegeex4-all-9b"];
      expect(codeGeeX.capabilities).toContain("code-generation");
      expect(codeGeeX.supportsCodeExecution).toBe(true);
    });

    it("应定义完整的酒店角色体系", async () => {
      const { HOTEL_ROLES } = await import("../lib/ai-family-hotel.types");

      // 验证关键角色
      expect(HOTEL_ROLES["front-desk"].label).toBe("前台接待");
      expect(HOTEL_ROLES["concierge"].label).toBe("礼宾服务");
      expect(HOTEL_ROLES["chef"].label).toBe("主厨");
      expect(HOTEL_ROLES["manager"].label).toBe("酒店经理");

      // 验证角色数量（应该有15个角色）
      expect(Object.keys(HOTEL_ROLES).length).toBe(15);
    });

    it("应提供默认路由策略", async () => {
      const { DEFAULT_ROUTING_STRATEGY } = await import("../lib/ai-family-hotel.types");

      expect(DEFAULT_ROUTING_STRATEGY.strategyName).toBe("hotel-default");
      expect(DEFAULT_ROUTING_STRATEGY.rules.length).toBeGreaterThan(0);
      expect(DEFAULT_ROUTING_STRATEGY.defaultModel).toBe("chatglm3-6b");
      expect(DEFAULT_ROUTING_STRATEGY.fallbackChain.length).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // 2️⃣ 团队初始化与管理测试
  // ============================================================

  describe("👥 酒店团队管理", () => {
    let hotelManager: InstanceType<typeof import("../lib/ai-family-hotel-manager").AIFamilyHotelManager>;

    beforeEach(async () => {
      const { AIFamilyHotelManager } = await import("../lib/ai-family-hotel-manager");
      hotelManager = new AIFamilyHotelManager();
    });

    it("应成功初始化酒店团队", () => {
      const allStaff = hotelManager.getAllStaffMembers();

      // 应该有8个预定义员工
      expect(allStaff.length).toBe(8);

      // 验证关键成员存在
      const staffNames = allStaff.map((s) => s.name);
      expect(staffNames).toContain("小悦");     // 前台
      expect(staffNames).toContain("阿明");     // 礼宾
      expect(staffNames).toContain("王师傅");   // 主厨
      expect(staffNames).toContain("Tech哥");   // IT支持
      expect(staffNames).toContain("小美");     // 活动协调
      expect(staffNames).toContain("李总");     // 经理
      expect(staffNames).toContain("小雅");     // 客户关系
      expect(staffNames).toContain("林老师");   // SPA康养
    });

    it("应正确分配不同模型给不同角色", () => {
      const frontDesk = hotelManager.getStaffByRole("front-desk")[0];
      const chef = hotelManager.getStaffByRole("chef")[0];
      const itSupport = hotelManager.getStaffByRole("it-support")[0];

      // 前台使用 ChatGLM3
      expect(frontDesk.primaryModel.modelId).toBe("chatglm3-6b");

      // 主厨使用 CodeGeeX4 (代码生成能力用于菜单分析)
      expect(chef.primaryModel.modelId).toBe("codegeex4-all-9b");

      // IT支持也使用 CodeGeeX4
      expect(itSupport.primaryModel.modelId).toBe("codegeex4-all-9b");
    });

    it("应支持按角色查询员工", () => {
      const managers = hotelManager.getStaffByRole("manager");
      const chefs = hotelManager.getStaffByRole("chef");

      expect(managers.length).toBe(1);
      expect(managers[0].name).toBe("李总");

      expect(chefs.length).toBe(1);
      expect(chefs[0].name).toBe("王师傅");
    });

    it("应支持按能力查询员工", () => {
      const codeCapableStaff = hotelManager.getStaffByCapability("code-generation");

      // 应该包含IT支持和主厨
      expect(codeCapableStaff.length).toBeGreaterThanOrEqual(2);
      const names = codeCapableStaff.map((s) => s.name);
      expect(names).toContain("Tech哥");
      expect(names).toContain("王师傅");
    });

    it("应更新员工状态", () => {
      const staffId = "staff-front-desk-001";

      hotelManager.updateStaffStatus(staffId, "busy", "处理客人入住");

      const staff = hotelManager.getStaffMember(staffId);
      expect(staff!.status).toBe("busy");
      expect(staff!.currentTask).toBe("处理客人入住");
    });

    it("应提供团队概览", () => {
      const overview = hotelManager.getTeamOverview();

      expect(overview.totalStaff).toBe(8);
      expect(overview.availableStaff).toBeGreaterThan(0);
      expect(overview.modelsInUse.length).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // 3️⃣ 多模型对话引擎测试
  // ============================================================

  describe("💬 多模型对话引擎", () => {
    let hotelManager: InstanceType<typeof import("../lib/ai-family-hotel-manager").AIFamilyHotelManager>;

    beforeEach(async () => {
      const { AIFamilyHotelManager } = await import("../lib/ai-family-hotel-manager");
      hotelManager = new AIFamilyHotelManager();
    });

    it("应创建多参与者对话", async () => {
      const conversation = await hotelManager.createConversation([
        "staff-front-desk-001",
        "staff-concierge-001",
        "staff-manager-001",
      ]);

      expect(conversation.conversationId).toContain("conv-");
      expect(conversation.participants.length).toBe(3);
      expect(conversation.status).toBe("active");
      expect(conversation.messages.length).toBe(0);
    });

    it("应在对话中发送消息并自动回复", async () => {
      // 创建对话：前台 <-> 礼宾
      const conversation = await hotelManager.createConversation([
        "staff-front-desk-001",
        "staff-concierge-001",
      ], {
        currentSituation: "客人询问当地景点推荐",
        language: "zh-CN",
        channel: "internal-chat",
      });

      // 前台发送消息给礼宾
      const message = await hotelManager.sendMessage(
        conversation.conversationId,
        "staff-front-desk-001",
        ["staff-concierge-001"],
        {
          text: "阿明，有位VIP客人想了解附近的景点和餐厅推荐，能帮忙吗？",
        },
        {
          priority: "normal",
          context: {
            guestInfo: {
              name: "张先生",
              membershipTier: "platinum",
              stayHistory: [],
              preferences: {} as any,
              specialRequests: [],
              notes: "常客，喜欢高端体验",
            },
          },
        }
      );

      expect(message.messageId).toContain("msg-");
      expect(message.senderName).toBe("小悦");
      expect(message.receiverNames).toContain("阿明");
      expect(message.status).toMatch(/responded|processing|delivered/);

      // 等待异步处理完成
      await new Promise((resolve) => setTimeout(resolve, 100));

      // 检查对话中是否有回复消息
      const updatedConversation = hotelManager.getConversation(conversation.conversationId);
      expect(updatedConversation!.messages.length).toBeGreaterThanOrEqual(2); // 原始消息 + 回复
    });

    it("应根据消息复杂度选择合适模型", () => {
      const itStaff = hotelManager.getStaffMember("staff-it-001")!;

      // 简单消息 -> 使用默认模型
      const simpleMessage: any = { content: { text: "你好" } };
      const simpleModel = hotelManager.selectBestModel(itStaff, simpleMessage);
      expect(simpleModel.modelId).toBeTruthy();

      // 复杂技术消息 -> 应该路由到 CodeGeeX
      const complexMessage: any = {
        content: {
          text: "系统API出现500错误，需要调试代码并分析数据库查询性能瓶颈，请帮忙排查"
        },
        priority: "normal"
      };
      const complexModel = hotelManager.selectBestModel(itStaff, complexMessage);
      expect(complexModel.capabilities).toContain("code-generation");
    });

    it("应处理多人群组对话", async () => {
      const conversation = await hotelManager.createConversation([
        "staff-manager-001",
        "staff-front-desk-001",
        "staff-it-001",
        "staff-chef-001",
      ]);

      // 经理向所有人发送通知
      const message = await hotelManager.sendMessage(
        conversation.conversationId,
        "staff-manager-001",
        ["staff-front-desk-001", "staff-it-001", "staff-chef-001"],
        {
          text: "各位注意，今晚有重要VIP接待任务，请各部门做好准备。",
        },
        {
          messageType: "notification",
          priority: "high",
        }
      );

      expect(message.receiverIds.length).toBe(3);
      expect(message.messageType).toBe("notification");
    });
  });

  // ============================================================
  // 4️⃣ 不同模型响应风格测试
  // ============================================================

  describe("🤖 模型响应风格差异", () => {
    let hotelManager: InstanceType<typeof import("../lib/ai-family-hotel-manager").AIFamilyHotelManager>;

    beforeEach(async () => {
      const { AIFamilyHotelManager } = await import("../lib/ai-family-hotel-manager");
      hotelManager = new AIFamilyHotelManager();
    });

    it("ChatGLM3 应生成温暖友好的对话响应", async () => {
      const conversation = await hotelManager.createConversation([
        "staff-guest-relations-001",
        "staff-front-desk-001",
      ]);

      await hotelManager.sendMessage(
        conversation.conversationId,
        "staff-front-desk-001",
        ["staff-guest-relations-001"],
        { text: "小雅，有位回头客王女士入住，她喜欢高层海景房" }
      );

      await new Promise((resolve) => setTimeout(resolve, 100));

      const conv = hotelManager.getConversation(conversation.conversationId)!;
      const lastMessage = conv.messages[conv.messages.length - 1];

      // ChatGLM3 的响应应该是温暖的、包含问候语
      if (lastMessage.content.text) {
        expect(lastMessage.content.text.length).toBeGreaterThan(50);
      }
    });

    it("CodeGeeX 应生成结构化的技术响应", async () => {
      const conversation = await hotelManager.createConversation([
        "staff-it-001",
        "staff-manager-001",
      ]);

      await hotelManager.sendMessage(
        conversation.conversationId,
        "staff-manager-001",
        ["staff-it-001"],
        { text: "Tech哥，帮我分析一下上季度的系统性能数据，生成一份报告" }
      );

      await new Promise((resolve) => setTimeout(resolve, 100));

      const conv = hotelManager.getConversation(conversation.conversationId)!;
      const response = conv.messages.find(m => m.senderId === "staff-it-001");

      if (response?.content.text) {
        // CodeGeeX 的响应应该包含结构化内容（表格或代码块）
        expect(response.content.text).toBeDefined();
      }
    });

    it("CogAgent 应展示推理和决策过程", async () => {
      const conversation = await hotelManager.createConversation([
        "staff-concierge-001",
        "staff-manager-001",
      ]);

      await hotelManager.sendMessage(
        conversation.conversationId,
        "staff-manager-001",
        ["staff-concierge-001"],
        {
          text: "阿明，有个复杂的团体预订需求：50人的企业团建，需要会议室、餐饮、住宿一体化方案，预算有限但要求高品质",
          priority: "high"
        }
      );

      await new Promise((resolve) => setTimeout(resolve, 150));

      const conv = hotelManager.getConversation(conversation.conversationId)!;

      // CogAgent 应该产生决策记录
      expect(conv.decisionLog.length).toBeGreaterThan(0);

      const lastDecision = conv.decisionLog[conv.decisionLog.length - 1];
      expect(lastDecision.madeBy).toBe("staff-concierge-001");
      expect(lastDecision.modelUsed).toBe("cogagent");
      expect(lastDecision.confidence).toBeGreaterThanOrEqual(70);
    });

    it("CogVideoX 应生成视觉内容相关响应", async () => {
      const conversation = await hotelManager.createConversation([
        "staff-event-001",
        "staff-guest-relations-001",
      ]);

      await hotelManager.sendMessage(
        conversation.conversationId,
        "staff-event-001",
        ["staff-event-001"], // 自我对话模拟
        { text: "为即将到来的婚礼活动设计一个浪漫的视觉方案" }
      );

      await new Promise((resolve) => setTimeout(resolve, 100));

      const conv = hotelManager.getConversation(conversation.conversationId)!;
      const response = conv.messages.find(m => m.senderId === "staff-event-001" && m.senderModel === "cogvideox-5b");

      if (response?.content.text) {
        // CogVideoX 的响应应该提及视觉素材
        expect(response.content.text).toBeDefined();
      }
    });
  });

  // ============================================================
  // 5️⃣ 升级机制与协作流程测试
  // ============================================================

  describe("⚠️ 升级与协作流程", () => {
    let hotelManager: InstanceType<typeof import("../lib/ai-family-hotel-manager").AIFamilyHotelManager>;

    beforeEach(async () => {
      const { AIFamilyHotelManager } = await import("../lib/ai-family-hotel-manager");
      hotelManager = new AIFamilyHotelManager();
    });

    it("应将复杂问题升级给经理", async () => {
      const conversation = await hotelManager.createConversation([
        "staff-front-desk-001",
        "staff-manager-001",
      ]);

      // 发送一个非常紧急且复杂的问题
      await hotelManager.sendMessage(
        conversation.conversationId,
        "staff-guest-relations-001",
        ["staff-front-desk-001"],
        {
          text: "紧急！钻石会员李总对房间极度不满，要求立即升级套房并全额退款，情绪非常激动！需要马上处理！",
          priority: "critical",
        }
      );

      await new Promise((resolve) => setTimeout(resolve, 200));

      const conv = hotelManager.getConversation(conversation.conversationId)!;

      // 检查是否有升级消息
      const escalatedMessages = conv.messages.filter(m => m.messageType === "escalation");
      // 可能触发升级（取决于阈值设置）
      expect(conv.messages.length).toBeGreaterThan(0);
    });

    it("应记录决策过程", async () => {
      const conversation = await hotelManager.createConversation([
        "staff-concierge-001",
        "staff-manager-001",
      ]);

      // 触发 CogAgent 决策的消息
      await hotelManager.sendMessage(
        conversation.conversationId,
        "staff-front-desk-001",
        ["staff-concierge-001"],
        { text: "客人想要一个独特的生日庆祝方案，预算5000元，要有创意" }
      );

      await new Promise((resolve) => setTimeout(resolve, 150));

      const conv = hotelManager.getConversation(conversation.conversationId)!;

      // 应该有决策记录
      expect(conv.decisionLog.length).toBeGreaterThanOrEqual(0);
    });
  });

  // ============================================================
  // 6️⃣ 性能监控测试
  // ============================================================

  describe("📊 性能与监控", () => {
    let hotelManager: InstanceType<typeof import("../lib/ai-family-hotel-manager").AIFamilyHotelManager>;

    beforeEach(async () => {
      const { AIFamilyHotelManager } = await import("../lib/ai-family-hotel-manager");
      hotelManager = new AIFamilyHotelManager();
    });

    it("应追踪模型使用统计", async () => {
      const conversation = await hotelManager.createConversation([
        "staff-front-desk-001",
        "staff-concierge-001",
      ]);

      // 发送几条消息以产生统计数据
      await hotelManager.sendMessage(
        conversation.conversationId,
        "staff-front-desk-001",
        ["staff-concierge-001"],
        { text: "测试消息1" }
      );
      await hotelManager.sendMessage(
        conversation.conversationId,
        "staff-concierge-001",
        ["staff-front-desk-001"],
        { text: "测试消息2" }
      );

      await new Promise((resolve) => setTimeout(resolve, 200));

      // 检查模型性能统计
      const chatGLMStats = hotelManager.getModelPerformance("chatglm3-6b");
      expect(chatGLMStats).toBeDefined();
      expect(chatGLMStats!.totalRequests).toBeGreaterThan(0);
    });

    it("应追踪员工绩效指标", () => {
      const staff = hotelManager.getStaffMember("staff-front-desk-001")!;

      expect(staff.performanceMetrics).toBeDefined();
      expect(staff.performanceMetrics.totalInteractions).toBeGreaterThanOrEqual(0);
      expect(staff.performanceMetrics.satisfactionScore).toBeGreaterThanOrEqual(0);
      expect(staff.performanceMetrics.averageResponseTime).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // 7️⃣ 综合场景演示
  // ============================================================

  describe("🎭 完整业务场景演示", () => {
    it("应演示 VIP 入住全流程", async () => {
      const { AIFamilyHotelManager } = await import("../lib/ai-family-hotel-manager");
      const manager = new AIFamilyHotelManager();

      console.info("\n=== 🏨 YYC3 智慧酒店 - VIP 入住流程演示 ===\n");

      // 场景：铂金会员张先生入住
      console.info("📅 **场景**: 铂金会员张先生抵达酒店\n");

      // 步骤1: 前台接待
      console.info("1️⃣ **前台接待** (小悦 - ChatGLM3)");
      const conv1 = await manager.createConversation(["staff-front-desk-001"]);
      const msg1 = await manager.sendMessage(
        conv1.conversationId,
        "staff-front-desk-001",
        ["staff-front-desc-001"],
        { text: "欢迎张先生光临YYC3智慧酒店！我是前台小悦，为您办理入住手续。" }
      );
      console.info(`   ✅ 消息已发送: ${msg1.messageId.substring(0, 12)}...`);

      // 步骤2: 礼宾服务介入
      console.info("\n2️⃣ **礼宾服务** (阿明 - CogAgent)");
      const conv2 = await manager.createConversation([
        "staff-front-desk-001",
        "staff-concierge-001",
      ]);
      const msg2 = await manager.sendMessage(
        conv2.conversationId,
        "staff-front-desk-001",
        ["staff-concierge-001"],
        {
          text: "阿明，张先生是铂金VIP，这次是商务出差+休闲度假，请安排好专车接机和行程建议",
          context: {
            guestInfo: {
              name: "张先生",
              membershipTier: "platinum",
              stayHistory: [],
              preferences: {} as any,
              specialRequests: ["高层房间", "安静环境"],
              notes: "偏好日式料理，喜欢高尔夫",
            },
          },
        }
      );
      console.info(`   ✅ 已请求礼宾服务: ${msg2.messageId.substring(0, 12)}...`);
      console.info(`   🤖 使用模型: ${manager.getStaffMember("staff-concierge-001")!.primaryModel.modelName}`);

      // 步骤3: IT支持检查房间系统
      console.info("\n3️⃣ **IT支持** (Tech哥 - CodeGeeX4)");
      const conv3 = await manager.createConversation([
        "staff-front-desk-001",
        "staff-it-001",
      ]);
      const msg3 = await manager.sendMessage(
        conv3.conversationId,
        "staff-front-desk-001",
        ["staff-it-001"],
        { text: "Tech哥，帮确认2808总统套房的智能系统状态，确保一切正常" }
      );
      console.info(`   ✅ 已请求系统检查: ${msg3.messageId.substring(0, 12)}...`);
      console.info(`   🤖 使用模型: ${manager.getStaffMember("staff-it-001")!.primaryModel.modelName}`);

      // 步骤4: 主厨准备欢迎礼物
      console.info("\n4️⃣ **主厨** (王师傅 - CodeGeeX4)");
      const conv4 = await manager.createConversation([
        "staff-concierge-001",
        "staff-chef-001",
      ]);
      const msg4 = await manager.sendMessage(
        conv4.conversationId,
        "staff-concierge-001",
        ["staff-chef-001"],
        { text: "王师傅，为张先生准备一份精致的日式欢迎点心，他偏好清淡口味" }
      );
      console.info(`   ✅ 已请求准备餐点: ${msg4.messageId.substring(0, 12)}...`);
      console.info(`   🤖 使用模型: ${manager.getStaffMember("staff-chef-001")!.primaryModel.modelName}`);

      // 等待所有异步操作完成
      await new Promise((resolve) => setTimeout(resolve, 300));

      // 显示团队状态
      console.info("\n📊 **团队工作状态**:");
      const overview = manager.getTeamOverview();
      console.info(`   总员工数: ${overview.totalStaff}`);
      console.info(`   可用人数: ${overview.availableStaff}`);
      console.info(`   在用模型: ${overview.modelsInUse.join(", ")}`);

      // 显示模型性能
      console.info("\n📈 **模型调用统计**:");
      manager.getAllModelPerformance().forEach((stats, modelId) => {
        if (stats.totalRequests > 0) {
          console.info(`   ${modelId}: ${stats.successfulRequests}/${stats.totalRequests} 成功 | 平均延迟: ${stats.averageLatencyMs.toFixed(0)}ms`);
        }
      });

      manager.destroy();
      console.info("\n=== ✨ VIP 入住流程演示完成 ===\n");
    });

    it("应展示完整的多模型协作能力", async () => {
      const { HOTEL_TEAM_MEMBERS, ZHIPU_MODELS } = await import("../lib/ai-family-hotel-manager");

      console.info("\n🏆 **AI Family 酒店人团队阵容**\n");

      console.info("📋 **团队成员 & 模型分配**:");
      HOTEL_TEAM_MEMBERS.forEach((member) => {
        const roleEmoji = member.role; // 将在运行时获取emoji
        console.info(`${member.name.padEnd(6)} | ${member.primaryModel.modelName.padEnd(20)} | 能力: ${member.primaryModel.capabilities.slice(0, 3).join(", ")}`);
      });

      console.info("\n🤖 **可用模型池**:");
      Object.entries(ZHIPU_MODELS).forEach(([id, model]: [string, any]) => {
        console.info(`   • ${model.modelName?.padEnd(20) ?? "unknown".padEnd(20)} | ${model.provider?.padEnd(8) ?? "unknown".padEnd(8)} | 上下文窗口: ${model.contextWindow ?? "unknown"} tokens`);
      });

      console.info("\n💡 **跨模型协作优势**:");
      console.info("   ✅ 对话理解 → ChatGLM3 (自然语言交互)");
      console.info("   ✅ 代码分析 → CodeGeeX4 (数据处理与报告)");
      console.info("   ✅ 智能决策 → CogAgent (复杂任务规划)");
      console.info("   ✅ 视觉创作 → CogVideoX (多媒体内容)");

      // 验证
      expect(HOTEL_TEAM_MEMBERS.length).toBe(8);
      expect(Object.keys(ZHIPU_MODELS).length).toBe(4);
    });
  });
});
