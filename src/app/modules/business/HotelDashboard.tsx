/**
 * @file: HotelDashboard.tsx
 * @description: YYC3智慧酒店 - AI Family管理控制台
 * @author: YanYuCloudCube Team (导师指导)
 * @version: v1.0.0
 * @created: 2026-04-09
 * @updated: 2026-04-16
 * @status: active
 * @tags: [hotel, dashboard, ui, management]
 *
 * @brief: 真正的酒店人 - 可视化管理界面
 * - 实时员工状态监控
 * - 多模型对话管理
 * - 性能数据分析
 * - 语音交互控制
 */

import { Activity, Building2, Mic, MicOff } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AIFamilyHotelManager } from '../../lib/ai-family-hotel-manager';
import { ConversationParticipant, HOTEL_ROLES, HotelStaffMember, MultiModelConversation } from '../../lib/ai-family-hotel.types';
import { getAILearningEngine } from '../../lib/ai-learning-engine';
import { getHotelKnowledgeBase } from '../../lib/hotel-knowledge-base';
import { HotelVoiceService, getHotelVoiceService } from '../../lib/hotel-voice-service';
import { GlassCard } from '../shared/GlassCard';
import { MEMBERS_MAP, type FamilyMember } from '../ai-family/components/shared';

// ============================================================
// 类型定义
// ============================================================

interface DashboardState {
  activeTab: 'overview' | 'staff' | 'conversations' | 'analytics' | 'voice' | 'knowledge' | 'learning';
  selectedStaffId: string | null;
  isListening: boolean;
  isSpeaking: boolean;
  currentTranscript: string;
  notification: string | null;
}

interface StaffCardData {
  id: string;
  name: string;
  role: string;
  emoji: string;
  status: string;
  model: string;
  satisfaction: number;
  interactions: number;
}

const HOTEL_TABS: { id: string; label: string }[] = [
  { id: 'overview', label: '📊 总览面板' },
  { id: 'staff', label: '👥 团队成员' },
  { id: 'conversations', label: '💬 对话中心' },
  { id: 'analytics', label: '📈 数据分析' },
  { id: 'voice', label: '🎤 语音交互' },
  { id: 'knowledge', label: '📚 知识库' },
  { id: 'learning', label: '🧠 AI学习' },
];

const STAFF_FAMILY_MAP: Record<string, string> = {
  "front-desk": "navigator",
  "concierge": "bolero",
  "manager": "meta-oracle",
  "security": "sentinel",
  "it-support": "master",
  "marketing": "creative",
  "finance": "thinker",
  "guest-relations": "prophet",
};

function getFamilyForMember(role: string): FamilyMember | undefined {
  const familyId = STAFF_FAMILY_MAP[role];
  return familyId ? MEMBERS_MAP[familyId] : undefined;
}

// ============================================================
// 主组件
// ============================================================

export const HotelDashboard: React.FC = () => {
  const [state, setState] = useState<DashboardState>({
    activeTab: 'overview',
    selectedStaffId: null,
    isListening: false,
    isSpeaking: false,
    currentTranscript: '',
    notification: null,
  });

  const [manager] = useState(() => new AIFamilyHotelManager());
  const [voiceService] = useState(() => getHotelVoiceService());
  const [knowledgeBase] = useState(() => getHotelKnowledgeBase());
  const [learningEngine] = useState(() => getAILearningEngine());

  // 数据状态
  const [staffList, setStaffList] = useState<StaffCardData[]>([]);
  const [conversations, setConversations] = useState<MultiModelConversation[]>([]);
  const [stats, setStats] = useState({
    totalInteractions: 0,
    avgSatisfaction: 85,
    activeStaff: 8,
    modelUsage: {} as Record<string, number>,
  });

  // 加载初始数据
  const loadInitialData = useCallback(() => {
    // 加载员工数据
    const allStaff = manager.getAllStaffMembers();
    const staffCards: StaffCardData[] = allStaff.map(staff => {
      const roleInfo = HOTEL_ROLES[staff.role];
      return {
        id: staff.id,
        name: staff.name,
        role: roleInfo.label,
        emoji: roleInfo.emoji,
        status: staff.status,
        model: staff.primaryModel.modelName,
        satisfaction: staff.performanceMetrics.satisfactionScore,
        interactions: staff.performanceMetrics.totalInteractions,
      };
    });
    setStaffList(staffCards);

    // 加载对话数据
    setConversations(manager.getAllConversations());

    // 加载统计数据
    setStats({
      totalInteractions: staffCards.reduce((sum, s) => sum + s.interactions, 0),
      avgSatisfaction: Math.round(
        staffCards.reduce((sum, s) => sum + s.satisfaction, 0) / staffCards.length
      ),
      activeStaff: staffCards.filter(s => s.status === 'available').length,
      modelUsage: calculateModelUsage(allStaff),
    });
  }, [manager]);

  // 初始化数据 + 监听语音事件
  useEffect(() => {
    loadInitialData();

    const unsubscribe = voiceService.on('result', (event) => {
      if (event.data && typeof event.data === 'object' && 'transcript' in event.data) {
        const voiceResult = event.data as { transcript: string; confidence?: number };
        setState(prev => ({
          ...prev,
          currentTranscript: voiceResult.transcript,
        }));
      }
    });

    return () => unsubscribe();
  }, [loadInitialData, voiceService]);

  const calculateModelUsage = (staff: HotelStaffMember[]): Record<string, number> => {
    const usage: Record<string, number> = {};
    staff.forEach(s => {
      usage[s.primaryModel.modelId] = (usage[s.primaryModel.modelId] || 0) + 1;
    });
    return usage;
  };

  // ========== 事件处理函数 ==========

  const handleTabChange = useCallback((tab: DashboardState['activeTab']) => {
    setState(prev => ({ ...prev, activeTab: tab }));
  }, []);

  const handleStaffSelect = useCallback((staffId: string) => {
    setState(prev => ({ ...prev, selectedStaffId: staffId }));
  }, []);

  const handleVoiceToggle = async () => {
    if (state.isListening) {
      await voiceService.stopListening();
      setState(prev => ({ ...prev, isListening: false }));
    } else {
      await voiceService.startListening();
      setState(prev => ({ ...prev, isListening: true }));
    }
  };

  const handleSpeak = async (text: string) => {
    setState(prev => ({ ...prev, isSpeaking: true }));
    try {
      await voiceService.speak(text);
    } catch (error) {
      console.error('语音合成错误:', error);
      showNotification('语音合成失败，请检查浏览器支持');
    } finally {
      setState(prev => ({ ...prev, isSpeaking: false }));
    }
  };

  const showNotification = useCallback((message: string) => {
    setState(prev => ({ ...prev, notification: message }));
    setTimeout(() => {
      setState(prev => ({ ...prev, notification: null }));
    }, 3000);
  }, []);

  const kbCategories = useMemo(() => knowledgeBase.getCategories(), [knowledgeBase]);
  const kbStats = useMemo(() => knowledgeBase.getStats(), [knowledgeBase]);
  const learningSummary = useMemo(() => learningEngine.getLearningSummary(), [learningEngine]);
  const learningInsights = useMemo(() => learningEngine.getInsights({ limit: 5 }), [learningEngine]);
  const staffMap = useMemo(() => new Map(staffList.map(s => [s.id, s])), [staffList]);

  // ========== 渲染函数 ==========

  return (
    <div className="space-y-4">
      {state.notification && (
        <div className="fixed top-5 right-5 z-50 px-5 py-3 rounded-xl shadow-lg"
          style={{ background: "rgba(255,60,60,0.9)", color: "#fff", fontSize: "0.82rem" }}>
          {state.notification}
        </div>
      )}

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[rgba(0,212,255,0.1)] flex items-center justify-center">
            <Building2 className="w-5 h-5 text-[#00d4ff]" />
          </div>
          <div>
            <h2 className="text-[#e0f0ff]" style={{ fontSize: "1.1rem" }}>
              YYC3 智慧酒店 · AI Family 控制台
            </h2>
            <p className="text-[rgba(0,212,255,0.35)]" style={{ fontSize: "0.7rem" }}>
              多模型协作 · 实时监控 · 智能优化
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleVoiceToggle}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all"
            style={{
              background: state.isListening ? "rgba(255,60,60,0.15)" : "rgba(0,212,255,0.06)",
              border: `1px solid ${state.isListening ? "rgba(255,60,60,0.3)" : "rgba(0,212,255,0.15)"}`,
              color: state.isListening ? "#ff3366" : "#00d4ff",
              fontSize: "0.78rem",
            }}
          >
            {state.isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
            {state.isListening ? "停止监听" : "语音控制"}
          </button>

          <GlassCard className="px-3 py-1.5 flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-[#00ff88]" />
            <span className="text-[rgba(0,212,255,0.5)]" style={{ fontSize: "0.72rem" }}>
              {state.isListening ? "监听中..." : new Date().toLocaleString("zh-CN")}
            </span>
          </GlassCard>
        </div>
      </div>

      <div className="flex gap-1 overflow-x-auto">
        {HOTEL_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id as DashboardState['activeTab'])}
            className={`px-4 py-2 rounded-lg transition-all whitespace-nowrap ${state.activeTab === tab.id
              ? "bg-[rgba(0,212,255,0.1)] text-[#00d4ff] border border-[rgba(0,212,255,0.25)]"
              : "text-[rgba(0,212,255,0.4)] border border-transparent hover:border-[rgba(0,180,255,0.15)]"
              }`}
            style={{ fontSize: "0.78rem" }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {renderActiveTab()}
    </div>
  );

  function renderActiveTab() {
    switch (state.activeTab) {
      case 'overview':
        return renderOverview();
      case 'staff':
        return renderStaffManagement();
      case 'conversations':
        return renderConversations();
      case 'analytics':
        return renderAnalytics();
      case 'voice':
        return renderVoiceControl();
      case 'knowledge':
        return renderKnowledgeBase();
      case 'learning':
        return renderLearningPanel();
      default:
        return renderOverview();
    }
  }

  function renderOverview() {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <GlassCard className="p-4 text-center">
            <div className="text-[#00d4ff]" style={{ fontSize: "1.6rem", fontWeight: "bold" }}>
              {stats.totalInteractions}
            </div>
            <div className="text-[rgba(0,212,255,0.4)]" style={{ fontSize: "0.7rem", marginTop: "4px" }}>总交互次数</div>
          </GlassCard>
          <GlassCard className="p-4 text-center">
            <div className="text-[#00ff88]" style={{ fontSize: "1.6rem", fontWeight: "bold" }}>
              {stats.avgSatisfaction}%
            </div>
            <div className="text-[rgba(0,255,136,0.4)]" style={{ fontSize: "0.7rem", marginTop: "4px" }}>平均满意度</div>
          </GlassCard>
          <GlassCard className="p-4 text-center">
            <div className="text-[#FFD700]" style={{ fontSize: "1.6rem", fontWeight: "bold" }}>
              {stats.activeStaff}/{staffList.length}
            </div>
            <div className="text-[rgba(255,215,0,0.4)]" style={{ fontSize: "0.7rem", marginTop: "4px" }}>在线员工</div>
          </GlassCard>
          <GlassCard className="p-4 text-center">
            <div className="text-[#FF69B4]" style={{ fontSize: "1.6rem", fontWeight: "bold" }}>
              {conversations.length}
            </div>
            <div className="text-[rgba(255,105,180,0.4)]" style={{ fontSize: "0.7rem", marginTop: "4px" }}>活跃对话</div>
          </GlassCard>
        </div>

        <GlassCard className="p-4">
          <h3 className="text-[#e0f0ff] mb-3" style={{ fontSize: "0.88rem" }}>🤖 模型使用分布</h3>
          <div className="flex gap-3 flex-wrap">
            {Object.entries(stats.modelUsage).map(([model, count]) => (
              <div key={model} className="flex-1 min-w-[120px] p-3 rounded-lg text-center"
                style={{ background: "rgba(0,212,255,0.06)", border: "1px solid rgba(0,212,255,0.1)" }}>
                <div className="text-[#c0dcf0]" style={{ fontSize: "0.75rem" }}>{model}</div>
                <div className="text-[#00d4ff]" style={{ fontSize: "1.3rem", fontWeight: "bold", margin: "4px 0" }}>{count}</div>
                <div className="text-[rgba(0,212,255,0.3)]" style={{ fontSize: "0.65rem" }}>位员工使用</div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* 快速操作 */}
        <div className="glass-card">
          <h3 style={{ marginBottom: '20px' }}>⚡ 快速操作</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <button style={{
              padding: '20px',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'transform 0.2s',
            }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              🔄 刷新数据
            </button>

            <button style={{
              padding: '20px',
              background: 'linear-gradient(135deg, #f093fb, #f5576c)',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
            >
              📊 生成报告
            </button>

            <button style={{
              padding: '20px',
              background: 'linear-gradient(135deg, #4facfe, #00f2fe)',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
            >
              ⚙️ 系统设置
            </button>

            <button style={{
              padding: '20px',
              background: 'linear-gradient(135deg, #43e97b, #38f9d7)',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
            >
              📥 导出数据
            </button>
          </div>
        </div>
      </div>
    );
  }

  function renderStaffManagement() {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {staffList.map(staff => {
            const family = getFamilyForMember(staffList.find(s => s.id === staff.id)?.role || "");
            const FamilyIcon = family?.icon;
            return (
              <GlassCard
                key={staff.id}
                className="p-4 cursor-pointer hover:border-[rgba(0,212,255,0.2)] transition-all"
                onClick={() => handleStaffSelect(staff.id)}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: `${family?.color || "#00d4ff"}15`, border: `1px solid ${family?.color || "#00d4ff"}30` }}>
                    {FamilyIcon ? <FamilyIcon className="w-5 h-5" style={{ color: family?.color || "#00d4ff" }} /> : <span style={{ fontSize: "1.2rem" }}>{staff.emoji}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[#e0f0ff] truncate" style={{ fontSize: "0.85rem" }}>{staff.name}</div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[rgba(0,212,255,0.35)]" style={{ fontSize: "0.7rem" }}>{staff.role}</span>
                      {family && (
                        <span className="px-1.5 py-0.5 rounded" style={{ fontSize: "0.55rem", background: `${family.color}15`, color: family.color, border: `1px solid ${family.color}25` }}>
                          {family.shortName}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ background: staff.status === "available" ? "#00ff88" : staff.status === "busy" ? "#ffa500" : "#666" }} />
                    <span className="text-[rgba(224,240,255,0.5)]" style={{ fontSize: "0.7rem" }}>
                      {staff.status === "available" ? "空闲" : staff.status === "busy" ? "忙碌" : "离线"}
                    </span>
                  </div>
                  <span className="text-[rgba(0,212,255,0.3)]" style={{ fontSize: "0.65rem" }}>🤖 {staff.model}</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 rounded-lg" style={{ background: "rgba(0,255,136,0.04)", border: "1px solid rgba(0,255,136,0.08)" }}>
                    <div className="text-[rgba(0,255,136,0.4)]" style={{ fontSize: "0.6rem" }}>满意度</div>
                    <div className="text-[#00ff88]" style={{ fontSize: "1rem", fontWeight: "bold" }}>{staff.satisfaction}%</div>
                  </div>
                  <div className="p-2 rounded-lg" style={{ background: "rgba(0,212,255,0.04)", border: "1px solid rgba(0,212,255,0.08)" }}>
                    <div className="text-[rgba(0,212,255,0.4)]" style={{ fontSize: "0.6rem" }}>交互数</div>
                    <div className="text-[#00d4ff]" style={{ fontSize: "1rem", fontWeight: "bold" }}>{staff.interactions}</div>
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      </div>
    );
  }

  function renderConversations() {
    return (
      <div>
        <h2 style={{ marginBottom: '30px', fontSize: '24px' }}>💬 对话中心</h2>

        {conversations.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '60px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>💬</div>
            <h3 style={{ marginBottom: '8px' }}>暂无活跃对话</h3>
            <p style={{ opacity: 0.6 }}>当AI Family成员之间有通信时，对话会显示在这里</p>
          </div>
        ) : (
          conversations.map(conv => (
            <div key={conv.conversationId} className="glass-card" style={{ marginBottom: '16px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px'
              }}>
                <h4 style={{ margin: 0 }}>对话 ID: {conv.conversationId.substring(0, 20)}...</h4>
                <span style={{
                  padding: '4px 12px',
                  background: conv.status === 'active' ? 'rgba(0, 255, 136, 0.2)' : 'rgba(255, 165, 0, 0.2)',
                  borderRadius: '12px',
                  fontSize: '12px',
                }}>
                  {conv.status}
                </span>
              </div>

              <div style={{ opacity: 0.7, fontSize: '14px' }}>
                参与者: {conv.participants.map((p: ConversationParticipant) => p.memberName).join(', ')}
              </div>

              <div style={{ marginTop: '12px', fontSize: '14px' }}>
                消息数: {conv.messages?.length || 0} |
                任务数: {conv.activeTasks?.length || 0} |
                决策记录: {conv.decisionLog?.length || 0}
              </div>
            </div>
          ))
        )}
      </div>
    );
  }

  function renderAnalytics() {
    return (
      <div>
        <h2 style={{ marginBottom: '30px', fontSize: '24px' }}>📈 数据分析</h2>

        <div className="glass-card">
          <h3 style={{ marginBottom: '20px' }}>性能趋势图</h3>
          <div style={{
            height: '300px',
            background: 'rgba(0, 0, 0, 0.2)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0.5,
          }}>
            📊 图表区域（可接入 ECharts 或 Chart.js）
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginTop: '24px'
        }}>
          {['模型响应时间', '客户满意度', '问题解决率', '升级处理'].map(title => (
            <div key={title} className="glass-card">
              <h4 style={{ marginBottom: '12px' }}>{title}</h4>
              <div style={{
                height: '120px',
                background: 'rgba(0, 0, 0, 0.2)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: 0.5,
              }}>
                📈 迷你图表
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function renderVoiceControl() {
    return (
      <div>
        <h2 style={{ marginBottom: '30px', fontSize: '24px' }}>🎤 语音交互控制</h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {/* 语音识别 */}
          <div className="glass-card">
            <h3 style={{ marginBottom: '20px' }}>🎤 语音识别</h3>

            <div style={{
              padding: '24px',
              background: state.isListening ? 'rgba(233, 69, 96, 0.1)' : 'rgba(0, 0, 0, 0.2)',
              borderRadius: '12px',
              minHeight: '120px',
              marginBottom: '16px',
              position: 'relative',
              overflow: 'hidden',
            }}>
              {state.isListening && (
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(233, 69, 96, 0.4), transparent)',
                  animation: 'pulse 1.5s infinite',
                }} />
              )}

              <div style={{ position: 'relative', zIndex: 1 }}>
                {state.currentTranscript || (state.isListening ? '正在聆听...' : '点击下方按钮开始说话')}
              </div>
            </div>

            <button
              onClick={handleVoiceToggle}
              style={{
                width: '100%',
                padding: '16px',
                background: state.isListening ? '#e94560' : '#00d9ff',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s',
              }}
            >
              {state.isListening ? '⏹️ 停止监听' : '🎙️ 开始识别'}
            </button>
          </div>

          {/* 语音合成 */}
          <div className="glass-card">
            <h3 style={{ marginBottom: '20px' }}>🔊 语音合成</h3>

            <textarea
              placeholder="输入要合成的文本..."
              style={{
                width: '100%',
                padding: '16px',
                background: 'rgba(0, 0, 0, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: 'white',
                resize: 'vertical',
                minHeight: '80px',
                marginBottom: '16px',
                fontSize: '14px',
              }}
            />

            <button
              disabled={state.isSpeaking}
              onClick={() => {
                const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
                if (textarea?.value) { handleSpeak(textarea.value); }
              }}
              style={{
                width: '100%',
                padding: '16px',
                background: state.isSpeaking ? '#666' : '#00ff88',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                fontSize: '16px',
                fontWeight: '600',
                cursor: state.isSpeaking ? 'not-allowed' : 'pointer',
              }}
            >
              {state.isSpeaking ? '⏳ 正在播放...' : '▶️ 开始播放'}
            </button>
          </div>
        </div>

        {/* 浏览器支持检测 */}
        <div className="glass-card" style={{ marginTop: '24px' }}>
          <h3 style={{ marginBottom: '16px' }}>🌐 浏览器支持检测</h3>
          {(() => {
            const support = HotelVoiceService.checkBrowserSupport();
            return (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <strong>语音识别:</strong>
                  <span style={{ color: support.recognition ? '#00ff88' : '#e94560' }}>
                    {support.recognition ? '✅ 支持' : '❌ 不支持'}
                  </span>
                </div>
                <div>
                  <strong>语音合成:</strong>
                  <span style={{ color: support.synthesis ? '#00ff88' : '#e94560' }}>
                    {support.synthesis ? '✅ 支持' : '❌ 不支持'}
                  </span>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    );
  }

  function renderKnowledgeBase() {
    return (
      <div>
        <h2 style={{ marginBottom: '30px', fontSize: '24px' }}>📚 酒店知识库</h2>

        {/* 统计信息 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '30px'
        }}>
          {(() => {
            return [
              { label: '总文章数', value: kbStats.totalArticles, icon: '📄' },
              { label: '分类数量', value: kbStats.categories, icon: '📁' },
              { label: '平均版本', value: kbStats.averageVersion.toFixed(1), icon: '🔄' },
              { label: '最后更新', value: kbStats.lastUpdate, icon: '📅' },
            ].map(item => (
              <div key={item.label} className="stat-card">
                <div style={{ fontSize: '24px' }}>{item.icon}</div>
                <div style={{ fontSize: '28px', fontWeight: 'bold', margin: '8px 0' }}>{item.value}</div>
                <div style={{ opacity: 0.6 }}>{item.label}</div>
              </div>
            ));
          })()}
        </div>

        {/* 分类列表 */}
        <div className="glass-card">
          <h3 style={{ marginBottom: '20px' }}>📂 知识分类</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
            {kbCategories.map(cat => (
              <div key={cat.id} style={{
                padding: '16px',
                background: 'rgba(0, 217, 255, 0.05)',
                border: '1px solid rgba(0, 217, 255, 0.1)',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0, 217, 255, 0.15)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0, 217, 255, 0.05)'}
              >
                <div style={{ fontWeight: '600', marginBottom: '4px' }}>{cat.name}</div>
                <div style={{ opacity: 0.6, fontSize: '13px' }}>{cat.count} 篇文章</div>
              </div>
            ))}
          </div>
        </div>

        {/* 搜索框 */}
        <div className="glass-card" style={{ marginTop: '24px' }}>
          <h3 style={{ marginBottom: '16px' }}>🔍 知识搜索</h3>
          <input
            type="text"
            placeholder="输入关键词搜索知识库..."
            style={{
              width: '100%',
              padding: '16px',
              background: 'rgba(0, 0, 0, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              color: 'white',
              fontSize: '15px',
            }}
          />
        </div>
      </div>
    );
  }

  function renderLearningPanel() {
    return (
      <div>
        <h2 style={{ marginBottom: '30px', fontSize: '24px' }}>🧠 AI 学习与优化</h2>

        {/* 学习统计 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '30px'
        }}>
          {[
            { label: '反馈记录总数', value: learningSummary.totalFeedbackRecords, icon: '📝' },
            { label: '追踪员工数', value: learningSummary.totalStaffTracked, icon: '👥' },
            { label: '生成洞察数', value: learningSummary.totalInsightsGenerated, icon: '💡' },
            { label: '平均满意度', value: `${learningSummary.averageSatisfactionAcrossAllStaff}%`, icon: '⭐' },
          ].map(item => (
            <div key={item.label} className="stat-card">
              <div style={{ fontSize: '24px' }}>{item.icon}</div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', margin: '8px 0' }}>{item.value}</div>
              <div style={{ opacity: 0.6 }}>{item.label}</div>
            </div>
          ))}
        </div>

        {/* 表现排名 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
          <div className="glass-card">
            <h3 style={{ marginBottom: '16px', color: '#00ff88' }}>🏆 表现优秀</h3>
            {learningSummary.topPerformers.map(staffId => {
              const staff = staffMap.get(staffId);
              return (
                <div key={staffId} style={{
                  padding: '12px',
                  background: 'rgba(0, 255, 136, 0.05)',
                  borderRadius: '8px',
                  marginBottom: '8px',
                }}>
                  {staff?.emoji} {staff?.name || staffId}
                </div>
              );
            })}
          </div>

          <div className="glass-card">
            <h3 style={{ marginBottom: '16px', color: '#ffa500' }}>⚠️ 需要关注</h3>
            {learningSummary.needsAttention.map(staffId => {
              const staff = staffMap.get(staffId);
              return (
                <div key={staffId} style={{
                  padding: '12px',
                  background: 'rgba(255, 165, 0, 0.05)',
                  borderRadius: '8px',
                  marginBottom: '8px',
                }}>
                  {staff?.emoji} {staff?.name || staffId}
                </div>
              );
            })}
          </div>
        </div>

        {/* 最新洞察 */}
        <div className="glass-card">
          <h3 style={{ marginBottom: '20px' }}>💡 最新学习洞察</h3>

          {learningInsights.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', opacity: 0.5 }}>
              暂无洞察，系统正在收集数据...
            </div>
          ) : (
            learningInsights.map(insight => (
              <div key={insight.id} style={{
                padding: '20px',
                background: insight.type === 'strength' ? 'rgba(0, 255, 136, 0.05)' :
                  insight.type === 'weakness' ? 'rgba(233, 69, 96, 0.05)' :
                    'rgba(0, 217, 255, 0.05)',
                borderLeft: `4px solid ${insight.type === 'strength' ? '#00ff88' :
                  insight.type === 'weakness' ? '#e94560' :
                    '#00d9ff'
                  }`,
                borderRadius: '8px',
                marginBottom: '16px',
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'start',
                  marginBottom: '8px'
                }}>
                  <h4 style={{ margin: 0, fontSize: '16px' }}>{insight.title}</h4>
                  <span style={{
                    padding: '4px 8px',
                    background: insight.impact === 'high' ? 'rgba(233, 69, 96, 0.2)' :
                      insight.impact === 'medium' ? 'rgba(255, 165, 0, 0.2)' :
                        'rgba(0, 255, 136, 0.2)',
                    borderRadius: '4px',
                    fontSize: '12px',
                  }}>
                    {insight.impact.toUpperCase()} IMPACT
                  </span>
                </div>

                <p style={{ margin: '0 0 12px', opacity: 0.8, fontSize: '14px' }}>
                  {insight.description}
                </p>

                <div style={{ fontSize: '13px', opacity: 0.6 }}>
                  置信度: {insight.confidence}% | 建议: {insight.actionableRecommendations.length} 条
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }
};

export default HotelDashboard;
