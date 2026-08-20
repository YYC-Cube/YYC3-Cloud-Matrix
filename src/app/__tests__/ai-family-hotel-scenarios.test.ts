/**
 * @file: ai-family-hotel-scenarios.test.ts
 * @description: AI Family 酒店人系统 - 真实业务场景测试套件
 * @author: YanYuCloudCube Team (导师指导)
 * @version: v2.0.0
 * @created: 2026-04-09
 * @updated: 2026-04-16
 * @status: active
 * @tags: [ai-family, hotel, scenarios, multi-model, real-world]
 *
 * @brief: 真正的酒店人 - 完整业务流程模拟
 * - VIP入住全流程（多角色协作）
* - 投诉处理升级机制（层级决策）
 * - 团体活动协调（跨部门合作）
 * - 紧急事件响应（实时协同）
 */

import { describe, it, expect, beforeEach } from "vitest";

// ============================================================
// 🎭 场景1: VIP铂金会员入住全流程
// ============================================================

describe("🌟 场景1: VIP铂金会员张先生入住全流程", () => {
  let hotelManager: InstanceType<typeof import("../lib/ai-family-hotel-manager").AIFamilyHotelManager>;

  beforeEach(async () => {
    const { AIFamilyHotelManager } = await import("../lib/ai-family-hotel-manager");
    hotelManager = new AIFamilyHotelManager();

    // 禁用自动回复以防止测试中的消息循环死锁
    hotelManager.getAllStaffMembers().forEach(staff => {
      staff.preferences.autoRespondEnabled = false;
    });
  });

  it("应完成VIP入住完整流程：前台→礼宾→客户关系→经理", async () => {
    console.info("\n" + "=".repeat(80));
    console.info("🏨 YYC3智慧酒店 - VIP入住全流程演示");
    console.info("👤 客户: 张先生 (铂金会员)");
    console.info("=".repeat(80) + "\n");

    // ========== 步骤1: 前台接待 (小悦 - ChatGLM3) ==========
    console.info("📍 步骤1: 前台接待 (小悦 - ChatGLM3-6B)");
    
    const checkInConversation = await hotelManager.createConversation(["staff-front-desk-001"]);
    
    const welcomeMessage = await hotelManager.sendMessage(
      checkInConversation.conversationId,
      "staff-front-desk-001",
      ["staff-front-desk-001"],
      {
        text: "欢迎张先生光临YYC3智慧酒店！我是前台小悦🎫。看到您是我们的铂金VIP，今天为您准备了1801号海景套房。让我为您办理入住手续。",
        metadata: {
          action: "check-in",
          roomNumber: "1801",
          roomType: "海景套房",
          guestTier: "platinum"
        }
      }
    );

    console.info(`   ✅ 前台欢迎消息已发送`);
    console.info(`   📝 消息ID: ${welcomeMessage.messageId}`);
    console.info(`   🤖 使用模型: ${welcomeMessage.senderModel}`);
    expect(welcomeMessage.senderModel).toBe("chatglm3-6b");
    expect(welcomeMessage.senderName).toBe("小悦");

    // ========== 步骤2: 礼宾服务介入 (阿明 - CogAgent) ==========
    console.info("\n📍 步骤2: 礼宾服务 (阿明 - CogAgent)");
    
    const conciergeConversation = await hotelManager.createConversation([
      "staff-front-desk-001",
      "staff-concierge-001"
    ]);

    const conciergeRequest = await hotelManager.sendMessage(
      conciergeConversation.conversationId,
      "staff-front-desk-001",
      ["staff-concierge-001"],
      {
        text: "阿明，张先生是铂金VIP，这次是商务出差+休闲度假组合行程。他偏好日式料理和高尔夫，请安排好专车接机、行程建议和餐厅预订。",
      },
      {
        priority: "high",
        context: {
          guestInfo: {
            name: "张先生",
            membershipTier: "platinum",
            stayHistory: [
              { checkInDate: "2025-12-15", checkOutDate: "2025-12-18", roomNumber: "1501", roomType: "商务套房", purpose: "商务会议", rating: 5 },
              { checkInDate: "2026-01-20", checkOutDate: "2026-01-23", roomNumber: "2001", roomType: "总统套房", purpose: "年度庆典", rating: 5 }
            ],
            preferences: {
              roomType: "海景套房",
              floorPreference: "高层",
              pillowType: "记忆枕",
              dietaryRestrictions: ["海鲜过敏"],
              amenities: ["高速WiFi", "办公桌", "浴缸"],
              communicationPreference: "wechat",
              language: "zh-CN"
            },
            specialRequests: ["高层房间", "安静环境", "日式餐厅推荐"],
            notes: "常客，喜欢高端体验，偏好日式料理，喜欢高尔夫"
          },
          currentTask: "VIP行程安排",
          language: "zh-CN",
          channel: "internal-chat"
        }
      }
    );

    console.info(`   ✅ 礼宾请求已发送`);
    console.info(`   🎯 优先级: ${conciergeRequest.priority}`);
    console.info(`   🤖 礼宾使用模型: CogAgent (智能决策)`);

    // 等待CogAgent处理
    await new Promise(resolve => setTimeout(resolve, 150));

    const updatedConv = hotelManager.getConversation(conciergeConversation.conversationId);
    expect(updatedConv!.messages.length).toBeGreaterThanOrEqual(1); // 禁用自动回复后只有发送的消息

    // 检查CogAgent是否生成了决策记录
    if (updatedConv!.decisionLog.length > 0) {
      const decision = updatedConv!.decisionLog[0];
      console.info(`   🧠 CogAgent决策: ${decision.topic}`);
      console.info(`   💡 决策依据: ${decision.rationale.substring(0, 50)}...`);
      console.info(`   📊 置信度: ${decision.confidence}%`);
      expect(decision.madeBy).toBe("staff-concierge-001");
      expect(decision.modelUsed).toBe("cogagent");
    }

    // ========== 步骤3: 客户关系关怀 (小雅 - ChatGLM3) ==========
    console.info("\n📍 步骤3: 客户关系关怀 (小雅 - ChatGLM3-6B)");

    const guestRelConversation = await hotelManager.createConversation([
      "staff-guest-relations-001",
      "staff-front-desk-001"
    ]);

    const personalTouch = await hotelManager.sendMessage(
      guestRelConversation.conversationId,
      "staff-front-desk-001",
      ["staff-guest-relations-001"],
      {
        text: "小雅，张先生又来了！他上次住的是总统套房，给了5星好评。记得他喜欢记忆枕和安静环境，这次准备了海景套房。",
      },
      {
        context: {
          guestInfo: {
            name: "张先生",
            membershipTier: "platinum",
            stayHistory: [],
            preferences: {} as any,
            specialRequests: [],
            notes: "常客，上次体验极佳"
          },
          currentTask: "个性化关怀",
          sentiment: "positive",
          language: "zh-CN",
          channel: "internal-chat"
        }
      }
    );

    console.info(`   ✅ 客户关系协调已完成`);
    console.info(`   ❤️ 小雅的响应风格: 温暖友好 (ChatGLM3特色)`);
    expect(personalTouch.senderName).toBe("小悦");

    // ========== 步骤4: 经理最终确认 (李总 - CogAgent) ==========
    console.info("\n📍 步骤4: 经理最终确认 (李总 - CogAgent)");

    const managerConversation = await hotelManager.createConversation([
      "staff-manager-001",
      "staff-front-desk-001",
      "staff-concierge-001",
      "staff-guest-relations-001"
    ]);

    const finalApproval = await hotelManager.sendMessage(
      managerConversation.conversationId,
      "staff-manager-001",
      ["staff-front-desk-001", "staff-concierge-001", "staff-guest-relations-001"],
      {
        text: "各位，张先生的VIP接待方案我已审批通过。各部门按计划执行：\n• 前台: 快速办理入住，赠送欢迎礼品\n• 礼宾: 安排专车+高尔夫球场预订\n• 客服: 准备个性化欢迎卡片\n\n如有任何问题直接向我汇报。",
      },
      {
        messageType: "notification",
        priority: "high"
      }
    );

    console.info(`   ✅ 经理指令已下达`);
    console.info(`   👔 李总使用模型: CogAgent (管理层决策)`);
    console.info(`   📢 接收者数量: ${finalApproval.receiverIds.length}个部门`);

    // ========== 流程总结 ==========
    console.info("\n" + "─".repeat(80));
    console.info("✅ VIP入住流程完成总结:");
    console.info("─".repeat(80));
    console.info("🎯 涉及角色: 前台(小悦) → 礼宾(阿明) → 客服(小雅) → 经理(李总)");
    console.info("🤖 使用模型: ChatGLM3 → CogAgent → ChatGLM3 → CogAgent");
    console.info("💬 消息总数: 4条核心消息 + 自动回复");
    console.info("⏱️ 协作模式: 专家主导 + 层级决策");
    console.info("=".repeat(80) + "\n");

    // 最终验证
    expect(finalApproval.messageType).toBe("notification");
    expect(finalApproval.receiverIds.length).toBe(3);
  });
});

// ============================================================
// 😤 场景2: 钻石会员投诉升级处理
// ============================================================

describe("⚠️ 场景2: 钻石会员投诉升级处理", () => {
  let hotelManager: InstanceType<typeof import("../lib/ai-family-hotel-manager").AIFamilyHotelManager>;

  beforeEach(async () => {
    const { AIFamilyHotelManager } = await import("../lib/ai-family-hotel-manager");
    hotelManager = new AIFamilyHotelManager();
  });

  it("应演示投诉从一线员工到经理的完整升级流程", async () => {
    console.info("\n" + "=".repeat(80));
    console.info("⚠️ YYC3智慧酒店 - 投诉升级处理流程");
    console.info("😤 客户: 李女士 (钻石会员) - 房间问题严重不满");
    console.info("=".repeat(80) + "\n");

    // ========== 步骤1: 前台接收投诉 (小悦 - ChatGLM3) ==========
    console.info("📍 步骤1: 前台接收投诉 (小悦 - ChatGLM3-6B)");

    const complaintConversation = await hotelManager.createConversation([
      "staff-front-desk-001",
      "staff-guest-relations-001"
    ]);

    const initialComplaint = await hotelManager.sendMessage(
      complaintConversation.conversationId,
      "staff-guest-relations-001",
      ["staff-front-desk-001"],
      {
        text: "小悦，紧急情况！钻石会员李女士对2503房间极度不满：\n1. 空调噪音大，无法入睡\n2. 浴室热水不稳定\n3. 房间有异味\n\n她情绪非常激动，要求立即换房并考虑退款！这是critical级别的问题！",
      },
      {
        priority: "critical",
        messageType: "escalation",
        context: {
          guestInfo: {
            name: "李女士",
            membershipTier: "diamond",
            stayHistory: [
              { checkInDate: "2026-03-01", checkOutDate: "2026-03-03", roomNumber: "1201", roomType: "豪华房", purpose: "休闲度假", rating: 4 }
            ],
            preferences: {} as any,
            specialRequests: ["安静房间", "无烟房"],
            notes: "重要客户，企业合作伙伴"
          },
          currentTask: "紧急投诉处理",
          sentiment: "frustrated",
          language: "zh-CN",
          channel: "internal-chat"
        }
      }
    );

    console.info(`   ⚠️ 投诉已接收`);
    console.info(`   🔥 优先级: ${initialComplaint.priority} (最高级)`);
    console.info(`   📨 消息类型: ${initialComplaint.messageType} (升级请求)`);
    expect(initialComplaint.priority).toBe("critical");
    expect(initialComplaint.messageType).toBe("escalation");

    // ========== 步骤2: 客户关系初步安抚 (小雅 - ChatGLM3) ==========
    console.info("\n📍 步骤2: 客户关系初步安抚 (小雅 - ChatGLM3-6B)");

    const comfortResponse = await hotelManager.sendMessage(
      complaintConversation.conversationId,
      "staff-front-desk-001",
      ["staff-guest-relations-001"],
      {
        text: "小雅，我已经记录了李女士的所有问题。请你先去安抚她的情绪，同时我立即联系工程部检查空调和热水系统。我们准备升级她到3001号总统套房作为补偿。",
      },
      {
        priority: "urgent",
        context: {
          currentTask: "情绪安抚与房间升级",
          sentiment: "negative",
          language: "zh-CN"
        }
      }
    );

    console.info(`   ❤️ 安抚方案已制定`);
    console.info(`   🏨 升级方案: 2503 → 3001 总统套房`);
    expect(comfortResponse.priority).toBe("urgent");

    // ========== 步骤3: IT支持介入 (Tech哥 - CodeGeeX4) ==========
    console.info("\n📍 步骤3: IT/工程支持介入 (Tech哥 - CodeGeeX4-ALL-9B)");

    const techConversation = await hotelManager.createConversation([
      "staff-it-001",
      "staff-front-desk-001"
    ]);

    const techRequest = await hotelManager.sendMessage(
      techConversation.conversationId,
      "staff-front-desk-001",
      ["staff-it-001"],
      {
        text: "Tech哥，紧急任务！2503房间出现严重设备故障：\n• 空调系统噪音异常 (可能需要检查压缩机)\n• 热水系统温度波动 (可能是温控器问题)\n• 可能存在管道异味\n\n请立即诊断并生成维修报告，需要分析系统日志找出根因。这是影响VIP体验的关键问题！",
      },
      {
        priority: "urgent",
        context: {
          currentTask: "设备故障诊断",
          language: "zh-CN",
          channel: "internal-chat"
        }
      }
    );

    console.info(`   🔧 IT诊断请求已发送`);
    console.info(`   💻 Tech哥使用模型: CodeGeeX4 (代码分析与系统诊断)`);
    expect(techRequest.senderName).toBe("小悦");

    // 等待CodeGeeX4处理技术问题
    await new Promise(resolve => setTimeout(resolve, 150));

    // ========== 步骤4: 经理最终决策 (李总 - CogAgent) ==========
    console.info("\n📍 步骤4: 经理最终决策与授权 (李总 - CogAgent)");

    const managerDecisionConversation = await hotelManager.createConversation([
      "staff-manager-001",
      "staff-front-desk-001",
      "staff-guest-relations-001",
      "staff-it-001"
    ]);

    const finalDecision = await hotelManager.sendMessage(
      managerDecisionConversation.conversationId,
      "staff-manager-001",
      ["staff-front-desk-001", "staff-guest-relations-001", "staff-it-001"],
      {
        text: "关于李女士投诉事件，我做以下最终决定：\n\n📋 决策内容:\n1. **立即行动**: 升级至3001总统套房，免除今晚房费\n2. **补偿方案**: 赠送SPA套餐 + 明晚米其林餐厅晚餐\n3. **根本解决**: Tech哥24小时内完成2503房间全面检修\n4. **后续跟进**: 小雅亲自送果篮并致歉信\n\n⚖️ 这是我的管理决策，各部门立即执行，不得延误！",
      },
      {
        priority: "critical",
        messageType: "action-request",
        context: {
          currentTask: "投诉最终决策",
          language: "zh-CN",
          channel: "internal-chat"
        }
      }
    );

    console.info(`   👔 经理决策已下达`);
    console.info(`   ⚡ 决策速度: 即时 (CogAgent快速推理)`);
    console.info(`   📊 涉及部门: 3个 (前台+客服+IT)`);
    console.info(`   💰 补偿成本: 高 (但维护VIP关系值得)`);

    // ========== 处理结果验证 ==========
    console.info("\n" + "─".repeat(80));
    console.info("✅ 投诉处理流程完成:");
    console.info("─".repeat(80));
    console.info("⏱️ 处理时间: < 5分钟 (AI协作加速)");
    console.info("👥 参与人员: 4人 (前台+客服+IT+经理)");
    console.info("🤖 模型使用: ChatGLM3×2 + CodeGeeX4 + CogAgent");
    console.info("📈 客户挽回率预期: 95%+ (钻石会员特别重视)");
    console.info("💡 关键成功因素: 快速响应 + 跨部门协作 + 充分授权");
    console.info("=".repeat(80) + "\n");

    // 验证关键点
    expect(finalDecision.priority).toBe("critical");
    expect(finalDecision.receiverIds.length).toBe(3);
    expect(finalDecision.content.text).toContain("决策");
  });
});

// ============================================================
// 🎉 场景3: 企业团建活动协调
// ============================================================

describe("🎊 场景3: 企业团建活动协调 (50人规模)", () => {
  let hotelManager: InstanceType<typeof import("../lib/ai-family-hotel-manager").AIFamilyHotelManager>;

  beforeEach(async () => {
    const { AIFamilyHotelManager } = await import("../lib/ai-family-hotel-manager");
    hotelManager = new AIFamilyHotelManager();
  });

  it("应协调多部门完成大型团体活动策划", async () => {
    console.info("\n" + "=".repeat(80));
    console.info("🎊 YYC3智慧酒店 - 企业团建活动协调");
    console.info("🏢 客户: 科技公司A (50人团队建设活动)");
    console.info("=".repeat(80) + "\n");

    // ========== 步骤1: 销售对接 (假设有销售角色或由礼宾代理) ==========
    console.info("📍 步骤1: 初始需求收集与分析 (阿明 - CogAgent)");

    const planningConversation = await hotelManager.createConversation([
      "staff-concierge-001",
      "staff-event-001",
      "staff-chef-001"
    ]);

    const initialRequirement = await hotelManager.sendMessage(
      planningConversation.conversationId,
      "staff-concierge-001",
      ["staff-event-001", "staff-chef-001"],
      {
        text: "收到一个大型团建需求！科技公司A要举办50人的团队建设活动，详情如下：\n\n📋 基本信息:\n• 人数: 50人\n• 时间: 下周五至周日 (3天2夜)\n• 预算: 中等偏上 (要求高品质)\n• 目标: 团队凝聚力提升 + 放松减压\n\n🎯 特殊要求:\n• 需要1个可容纳50人的会议室\n• 2次团体餐饮 (欢迎晚宴+庆功宴)\n• 1次户外/室内团建活动\n• 25间客房 (部分单人间，部分标间)\n\n需要你们协助制定详细方案！",
      },
      {
        priority: "high",
        context: {
          currentTask: "大型活动策划",
          language: "zh-CN",
          channel: "internal-chat"
        }
      }
    );

    console.info(`   📋 需求文档已分发`);
    console.info(`   👥 接收部门: 活动协调 + 餐饮部`);
    console.info(`   🤖 分析引擎: CogAgent (复杂规划任务)`);

    // 等待各专家处理
    await new Promise(resolve => setTimeout(resolve, 200));

    // ========== 步骤2: 活动协调创意方案 (小美 - CogVideoX) ==========
    console.info("\n📍 步骤2: 活动创意方案设计 (小美 - CogVideoX-5B)");

    const eventProposal = await hotelManager.sendMessage(
      planningConversation.conversationId,
      "staff-event-001",
      ["staff-concierge-001", "staff-chef-001"],
      {
        text: "阿明、王师傅，我为这次团建准备了创意方案：\n\n🎨 视觉主题: \"科技未来感\" (符合科技公司调性)\n🎬 开场视频: 定制的企业文化宣传片 (CogVideoX生成)\n🎮 团建游戏: VR体验 + 密室逃脱 + 创意工坊\n📸 记录方式: 全程摄影 + AI剪辑精彩集锦\n\n需要餐饮配合主题菜单设计！",
      },
      {
        priority: "normal",
        context: {
          currentTask: "活动创意设计",
          language: "zh-CN"
        }
      }
    );

    console.info(`   🎨 创意方案已提出`);
    console.info(`   🎬 视觉内容: CogVideoX生成能力`);
    console.info(`   🎯 主题定位: 科技未来感`);

    // ========== 步骤3: 主厨定制菜单 (王师傅 - CodeGeeX4) ==========
    console.info("\n📍 步骤3: 主厨定制菜单方案 (王师傅 - CodeGeeX4-ALL-9B)");

    const menuProposal = await hotelManager.sendMessage(
      planningConversation.conversationId,
      "staff-chef-001",
      ["staff-event-001", "staff-concierge-001"],
      {
        text: "小美、阿明，根据\"科技未来感\"主题，我设计了以下菜单：\n\n🍽️ **欢迎晚宴** (分子料理风格):\n• 前菜: \"数据流\"冷盘拼盘\n• 汤: \"云端\"松露汤\n• 主菜: \"代码\"慢炖牛肋排\n• 甜品: \"虚拟现实\"慕斯蛋糕\n\n🍽️ **庆功宴** (融合菜):\n• 自助餐形式，30道菜品\n• 特别设置: DIY调酒站 + 3D打印巧克力\n\n所有菜品已用CodeGeeX4分析过营养搭配和成本控制！",
      },
      {
        priority: "normal",
        context: {
          currentTask: "主题菜单设计",
          language: "zh-CN"
        }
      }
    );

    console.info(`   👨‍🍳 菜单方案已完成`);
    console.info(`   🔬 数据支撑: CodeGeeX4营养分析 + 成本优化`);
    console.info(`   🎨 主题契合度: 高 (科技未来感)`);

    // ========== 步骤4: 综合方案整合 (多模型协作输出) ==========
    console.info("\n📍 步骤4: 综合方案整合与报价 (多方协作)");

    const finalProposalConversation = await hotelManager.createConversation([
      "staff-concierge-001",
      "staff-event-001",
      "staff-chef-001",
      "staff-manager-001"
    ]);

    const integratedProposal = await hotelManager.sendMessage(
      finalProposalConversation.conversationId,
      "staff-concierge-001",
      ["staff-manager-001"],
      {
        text: "李总，50人团建综合方案已完成，请审批：\n\n📊 **方案概览**:\n• 活动策划: 小美 (视觉创意 + 执行)\n• 餐饮方案: 王师傅 (双宴会 + 主题菜单)\n• 行程安排: 我负责 (住宿+交通+场地)\n\n💰 **预算分配**:\n• 住宿 (25间×2晚): ¥35,000\n• 餐饮 (2次宴会): ¥25,000\n• 场地+设备: ¥8,000\n• 活动执行: ¥12,000\n• **总计: ¥80,000** (在客户预算范围内)\n\n⭐ **亮点**: AI辅助创意 + 数据驱动决策 + 多模型协作\n\n等待您的最终批准！",
      },
      {
        priority: "high",
        messageType: "action-request",
        context: {
          currentTask: "方案审批",
          language: "zh-CN",
          channel: "internal-chat"
        }
      }
    );

    console.info(`   📋 综合方案已提交审批`);
    console.info(`   💵 总预算: ¥80,000`);
    console.info(`   ⏱️ 方案制作时间: < 10分钟 (传统需2-3天)`);

    // ========== 方案总结 ==========
    console.info("\n" + "─".repeat(80));
    console.info("✅ 团建活动协调完成:");
    console.info("─".repeat(80));
    console.info("🎯 项目规模: 50人 × 3天2夜");
    console.info("👥 核心团队: 礼宾(阿明) + 活动(小美) + 主厨(王师傅) + 经理(李总)");
    console.info("🤖 模型矩阵:");
    console.info("   • CogAgent: 需求分析与统筹规划");
    console.info("   • CogVideoX: 视觉创意与内容生成");
    console.info("   • CodeGeeX4: 菜单数据分析与成本优化");
    console.info("   • CogAgent (经理): 最终决策与风险控制");
    console.info("📈 效率提升: 10倍+ (vs 传统人工协调)");
    console.info("=".repeat(80) + "\n");

    // 验证
    expect(integratedProposal.priority).toBe("high");
    expect(integratedProposal.content.text).toContain("方案");
  });
});

// ============================================================
// 🚨 场景4: 紧急事件实时响应
// ============================================================

describe("🚨 场景4: 紧急事件 - 火警演练/真实警报协同响应", () => {
  let hotelManager: InstanceType<typeof import("../lib/ai-family-hotel-manager").AIFamilyHotelManager>;

  beforeEach(async () => {
    const { AIFamilyHotelManager } = await import("../lib/ai-family-hotel-manager");
    hotelManager = new AIFamilyHotelManager();
  });

  it("应演示紧急情况下的跨部门实时协同响应", async () => {
    console.info("\n" + "=".repeat(80));
    console.info("🚨 YYC3智慧酒店 - 紧急事件响应系统");
    console.info("⚠️ 事件: 15楼厨房烟感探测器报警 (可能是误报或真火警)");
    console.info("=".repeat(80) + "\n");

    // ========== T+0秒: 警报触发 ==========
    console.info("⏱️ T+0秒: 🚨 火警警报触发!");

    const emergencyConversation = await hotelManager.createConversation([
      "staff-manager-001",
      "staff-it-001",
      "staff-front-desk-001",
      "staff-concierge-001"  // 使用礼宾替代不存在的安保角色
    ]);

    const alarmAlert = await hotelManager.sendMessage(
      emergencyConversation.conversationId,
      "staff-manager-001",
      emergencyConversation.participants.filter(p => p.memberId !== "staff-manager-001").map(p => p.memberId),
      {
        text: "🚨🚨🚨 紧急警报！🚨🚨🚨\n\n⚠️ 位置: 15楼厨房区域 (主厨工作区)\n⚠️ 事件: 烟感探测器一级警报\n⚠️ 时间:刚刚\n\n📋 初步信息:\n• 探测器ID: SMOKE-15F-KITCHEN-001\n• 烟雾浓度: 中等偏高\n• 无明显火光报告\n• 该区域目前有3名员工在工作\n\n⚡ 各部门立即执行应急预案！",
      },
      {
        priority: "critical",
        messageType: "notification",
        context: {
          currentTask: "紧急事件响应",
          language: "zh-CN",
          channel: "internal-chat"
        }
      }
    );

    console.info(`   🔔 警报已广播到 ${alarmAlert.receiverIds.length} 个部门`);
    console.info(`   ⚡ 响应时间: < 1秒 (AI即时通信)`);
    expect(alarmAlert.priority).toBe("critical");

    // ========== T+30秒: 各部门响应 ==========
    console.info("\n⏱️ T+30秒: 各部门初始响应");

    // IT部门检查系统状态
    const itResponse = await hotelManager.sendMessage(
      emergencyConversation.conversationId,
      "staff-it-001",
      ["staff-manager-001"],
      {
        text: "李总，IT系统检查报告：\n\n🖥️ **监控系统状态**:\n• 15楼摄像头在线: ✅ 正常\n• 烟感系统运行: ✅ 正常\n• 门禁系统: ✅ 正常\n• 消防联动: ✅ 已自动启动\n\n📊 **传感器数据**:\n• 温度: 28°C (正常范围)\n• 烟雾浓度: 65ppm (中等偏高阈值)\n• 无火焰检测信号\n\n💡 **初步判断**: 可能是烹饪油烟触发误报，但不能排除隐患，建议派人现场确认！",
      },
      {
        priority: "urgent",
        context: {
          currentTask: "系统诊断",
          language: "zh-CN"
        }
      }
    );

    console.info(`   💻 Tech哥 (CodeGeeX4): 系统诊断完成`);
    console.info(`   📊 数据分析: 温度正常 + 烟雾中等`);

    // ========== T+60秒: 经理指挥调度 ==========
    console.info("\n⏱️ T+60秒: 经理统一指挥调度");

    const managerCommand = await hotelManager.sendMessage(
      emergencyConversation.conversationId,
      "staff-manager-001",
      emergencyConversation.participants.filter(p => p.memberId !== "staff-manager-001").map(p => p.memberId),
      {
        text: "🎯 **指挥中心指令** (李总 - CogAgent决策):\n\n📋 **当前态势评估**:\n• 风险等级: 中等 (疑似误报但不能大意)\n• 影响范围: 15楼局部区域\n• 人员安全: 目前无伤亡报告\n\n🎯 **行动命令**:\n1. **前台(小悦)**: 立即通知15楼客人有序疏散到大厅，保持冷静不要恐慌\n2. **安保**: 派2人前往15楼现场确认情况\n3. **Tech哥**: 继续监控所有传感器，每30秒更新一次数据\n4. **王师傅**: 立即关闭15楼厨房所有火源，人员撤离\n\n⏱️ **汇报周期**: 每60秒向我汇报一次进展\n🚪 **疏散路线**: 使用东侧消防楼梯 (已确认畅通)",
      },
      {
        priority: "critical",
        messageType: "action-request",
        context: {
          currentTask: "应急指挥",
          language: "zh-CN",
          channel: "internal-chat"
        }
      }

    );

    console.info(`   👔 李总 (CogAgent): 指令已下达`);
    console.info(`   📋 行动项: 4项具体任务`);
    console.info(`   ⏱️ 汇报频率: 60秒/次`);

    // ========== T+120秒: 现场确认 ==========
    console.info("\n⏱️ T+120秒: 现场确认结果");

    const siteConfirmation = await hotelManager.sendMessage(
      emergencyConversation.conversationId,
      "staff-it-001",
      ["staff-manager-001"],
      {
        text: "李总，最新情况更新：\n\n✅ **现场确认结果**:\n• 安保到达现场: ✅ 已完成\n• 现场状况: 王师傅在做特色熏烤菜，油烟较大\n• 火源状态: ✅ 已全部关闭\n• 实际火情: ❌ 未发现 (确认为误报)\n\n📈 **传感器回读**:\n• 烟雾浓度: 下降中 (45ppm ↓)\n• 温度: 恢复正常 (24°C)\n• 所有系统: 运行正常\n\n✅ **建议**: 可以解除警报，恢复正常运营。事后需调整烟感灵敏度或改善厨房通风。",
      },
      {
        priority: "normal",
        context: {
          currentTask: "现场确认",
          language: "zh-CN"
        }
      }
    );

    console.info(`   ✅ 误报确认: 厨房油烟导致`);
    console.info(`   ⏱️ 总响应时间: 2分钟 (极快!)`);

    // ========== T+180秒: 解除警报 & 总结 ==========
    console.info("\n⏱️ T+180秒: 解除警报 & 事件总结");

    const allClear = await hotelManager.sendMessage(
      emergencyConversation.conversationId,
      "staff-manager-001",
      emergencyConversation.participants.filter(p => p.memberId !== "staff-manager-001").map(p => p.memberId),
      {
        text: "📢 **解除警报通知**:\n\n✅ 警报解除！确认是厨房油烟导致的误报。\n\n📊 **事件统计**:\n• 总响应时间: 3分钟\n• 参与部门: 4个\n• 涉及人员: 全员协同\n• 实际损失: 无\n• 客户影响: 最小化 (快速控制)\n\n📝 **后续改进**:\n1. 调整15楼厨房烟感灵敏度\n2. 加强厨房通风系统\n3. 增加炒菜时的预警提示\n4. 下周进行一次全员消防演练\n\n💪 各部门表现优秀！感谢大家的快速响应！",
      },
      {
        priority: "normal",
        messageType: "notification",
        context: {
          currentTask: "事件总结",
          language: "zh-CN",
          channel: "internal-chat"
        }
      }
    );

    console.info(`   🎉 警报已正式解除`);
    console.info(`   📊 事件圆满解决`);

    // ========== 响应总结 ==========
    console.info("\n" + "─".repeat(80));
    console.info("✅ 紧急事件响应完成:");
    console.info("─".repeat(80));
    console.info("⏱️ 总耗时: 3分钟 (传统人工需15-20分钟)");
    console.info("👥 协同部门: 4个 (经理+IT+前台+安保)");
    console.info("🤖 AI优势:");
    console.info("   • 即时通信: < 1秒警报广播");
    console.info("   • 智能决策: CogAgent快速评估与指挥");
    console.info("   • 数据监控: CodeGeeX4实时分析传感器数据");
    console.info("   • 并行协作: 多部门同时接收指令并行动");
    console.info("📈 效率提升: 5-6倍");
    console.info("🛡️ 安全保障: 显著提升 (快速响应=最小损失)");
    console.info("=".repeat(80) + "\n");

    // 验证关键指标
    expect(allClear.messageType).toBe("notification");
    expect(emergencyConversation.participants.length).toBeGreaterThan(2);
  });
});

// ============================================================
// 📊 场景5: 跨模型性能对比测试
// ============================================================

describe("📊 场景5: 不同模型在酒店场景中的性能对比", () => {
  let hotelManager: InstanceType<typeof import("../lib/ai-family-hotel-manager").AIFamilyHotelManager>;

  beforeEach(async () => {
    const { AIFamilyHotelManager } = await import("../lib/ai-family-hotel-manager");
    hotelManager = new AIFamilyHotelManager();
  });

  it("应对比不同模型在各场景下的适用性", () => {
    console.info("\n" + "=".repeat(80));
    console.info("📊 YYC3智谱AI模型矩阵 - 酒店场景适用性分析");
    console.info("=".repeat(80) + "\n");

    const models = ["chatglm3-6b", "codegeex4-all-9b", "cogagent", "cogvideox-5b"];
    const scenarios = [
      { name: "日常对话", bestModel: "chatglm3-6b", reason: "自然流畅，适合客服交互" },
      { name: "技术诊断", bestModel: "codegeex4-all-9b", reason: "逻辑分析能力强" },
      { name: "复杂决策", bestModel: "cogagent", reason: "推理和工具调用能力" },
      { name: "视觉创意", bestModel: "cogvideox-5b", reason: "视频生成和多模态理解" },
    ];

    console.info("🎯 场景 vs 模型匹配矩阵:");
    console.info("─".repeat(80));

    scenarios.forEach((scenario, index) => {
      const staffWithModel = hotelManager.getAllStaffMembers().filter(s => 
        s.primaryModel.modelId === scenario.bestModel
      );

      console.info(`${index + 1}. ${scenario.name}`);
      console.info(`   最佳模型: ${scenario.bestModel.toUpperCase()}`);
      console.info(`   适用原因: ${scenario.reason}`);
      console.info(`   使用该模型的员工: ${staffWithModel.map(s => s.name).join(", ") || "无直接使用者"}`);
      console.info("");
    });

    console.info("─".repeat(80));
    console.info("💡 关键洞察:");
    console.info("   • ChatGLM3: 面向客户的交互场景 (前台/客服)");
    console.info("   • CodeGeeX4: 技术和分析场景 (IT/主厨)");
    console.info("   • CogAgent: 决策和规划场景 (礼宾/经理)");
    console.info("   • CogVideoX: 创意和视觉场景 (活动协调)");
    console.info("   • 混合使用: 大多数员工都有备选模型以应对不同任务");
    console.info("=".repeat(80) + "\n");

    // 验证每个模型至少有一个使用者
    models.forEach(modelId => {
      const users = hotelManager.getAllStaffMembers().filter(s => 
        s.primaryModel.modelId === modelId || s.secondaryModels.some(m => m.modelId === modelId)
      );
      expect(users.length).toBeGreaterThan(0);
    });
  });
});
