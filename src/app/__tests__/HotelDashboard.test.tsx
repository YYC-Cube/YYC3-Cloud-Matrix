/**
 * @file: HotelDashboard.test.tsx
 * @description: YYC3智慧酒店 - 控制台基础功能验证
 * @author: YanYuCloudCube Team (导师指导)
 * @version: v1.0.0
 * @created: 2026-04-09
 * @updated: 2026-04-16
 * @status: active
 * @tags: [hotel, dashboard, smoke-test]
 */

import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HotelDashboard } from '../modules/business/HotelDashboard';

vi.mock('../lib/ai-family-hotel-manager', () => ({
  AIFamilyHotelManager: vi.fn().mockImplementation(function () {
    return {
      getAllStaffMembers: () => [],
      getAllConversations: () => [],
    };
  }),
}));

vi.mock('../lib/zhipu-ai-service', () => ({
  getZhipuAIService: vi.fn().mockReturnValue({
    chat: vi.fn(),
    chatStream: vi.fn(),
  }),
}));

vi.mock('../lib/hotel-voice-service', () => ({
  getHotelVoiceService: vi.fn().mockReturnValue({
    startListening: vi.fn(),
    stopListening: vi.fn(),
    speak: vi.fn(),
    on: vi.fn().mockReturnValue(vi.fn()),
    HotelVoiceService: {
      checkBrowserSupport: vi.fn().mockReturnValue({
        recognition: true,
        synthesis: true,
        availableLanguages: [],
        availableVoices: [],
      }),
    },
  }),
}));

vi.mock('../lib/hotel-knowledge-base', () => ({
  getHotelKnowledgeBase: vi.fn().mockReturnValue({
    getCategories: () => [],
    getStats: () => ({
      totalArticles: 0,
      categories: 0,
      averageVersion: 0,
      lastUpdate: '',
    }),
    search: vi.fn(),
  }),
}));

vi.mock('../modules/ai-family/shared', () => ({
  FAMILY_MEMBERS: [
    { id: 'navigator', name: '言启·千行', shortName: '千行', color: '#FFD700', icon: () => null, status: 'online' },
    { id: 'thinker', name: '语枢·万物', shortName: '万物', color: '#FF69B4', icon: () => null, status: 'online' },
    { id: 'prophet', name: '预见·先知', shortName: '先知', color: '#00BFFF', icon: () => null, status: 'online' },
    { id: 'bolero', name: '千里·伯乐', shortName: '伯乐', color: '#E8E8E8', icon: () => null, status: 'online' },
    { id: 'meta-oracle', name: '元启·天枢', shortName: '天枢', color: '#00FF88', icon: () => null, status: 'online' },
    { id: 'sentinel', name: '智云·守护', shortName: '守护', color: '#BF00FF', icon: () => null, status: 'online' },
    { id: 'master', name: '格物·宗师', shortName: '宗师', color: '#C0C0C0', icon: () => null, status: 'online' },
    { id: 'creative', name: '创想·灵韵', shortName: '灵韵', color: '#FF7043', icon: () => null, status: 'online' },
  ],
  MEMBERS_MAP: {
    navigator: { id: 'navigator', name: '言启·千行', shortName: '千行', color: '#FFD700', icon: () => null },
    thinker: { id: 'thinker', name: '语枢·万物', shortName: '万物', color: '#FF69B4', icon: () => null },
    prophet: { id: 'prophet', name: '预见·先知', shortName: '先知', color: '#00BFFF', icon: () => null },
    bolero: { id: 'bolero', name: '千里·伯乐', shortName: '伯乐', color: '#E8E8E8', icon: () => null },
    'meta-oracle': { id: 'meta-oracle', name: '元启·天枢', shortName: '天枢', color: '#00FF88', icon: () => null },
    sentinel: { id: 'sentinel', name: '智云·守护', shortName: '守护', color: '#BF00FF', icon: () => null },
    master: { id: 'master', name: '格物·宗师', shortName: '宗师', color: '#C0C0C0', icon: () => null },
    creative: { id: 'creative', name: '创想·灵韵', shortName: '灵韵', color: '#FF7043', icon: () => null },
  },
}));

vi.mock('../lib/ai-learning-engine', () => ({
  getAILearningEngine: vi.fn().mockReturnValue({
    getLearningSummary: () => ({
      totalFeedbackRecords: 0,
      totalStaffTracked: 0,
      totalInsightsGenerated: 0,
      averageSatisfactionAcrossAllStaff: 0,
      topPerformers: [],
      needsAttention: [],
    }),
    getInsights: () => [],
  }),
}));

describe('HotelDashboard Smoke Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render successfully', () => {
    const { baseElement } = render(<HotelDashboard />);
    expect(baseElement).toBeTruthy();
  });

  it('should contain the main title', () => {
    render(<HotelDashboard />);

    const titleElements = screen.getAllByText(/智慧酒店/i);
    expect(titleElements.length).toBeGreaterThan(0);
  });

  it('should display subtitle text', () => {
    render(<HotelDashboard />);

    const subtitleElements = screen.getAllByText(/多模型协作/i);
    expect(subtitleElements.length).toBeGreaterThan(0);
  });

  it('should have a header element', () => {
    const { container } = render(<HotelDashboard />);

    const h2 = container.querySelector('h2');
    expect(h2).toBeTruthy();
    expect(h2?.textContent).toContain('智慧酒店');
  });

  it('should have navigation section', () => {
    const { container } = render(<HotelDashboard />);

    const buttons = container.querySelectorAll('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('should have main content area', () => {
    const { container } = render(<HotelDashboard />);

    const content = container.querySelector('.space-y-4');
    expect(content).toBeTruthy();
  });

  it('should show overview statistics by default', () => {
    render(<HotelDashboard />);

    const statsElements = screen.getAllByText(/总交互次数/i);
    expect(statsElements.length).toBeGreaterThan(0);
  });
});
