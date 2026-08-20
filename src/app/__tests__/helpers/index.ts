/**
 * file: index.ts
 * description: 测试 Helpers Barrel · 统一导出所有公用测试工具
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-07-25
 * updated: 2026-07-25
 * status: active
 * tags: [test],[helper],[barrel]
 *
 * brief: 模块测试公用工具统一入口
 *
 * exports: renderWithProviders, renderWithI18n, createTestWrapper, screen, waitFor, act, fireEvent, within, vi,
 *          createMockNode, createMockAlert, createMockModel, createMockLocalStorage, createMockWebSocket, createMockFetch,
 *          flushPromises, delay, setupTestEnvironment, cleanupTestEnvironment, generateRandomString
 */

// Rendering
export {
  renderWithProviders,
  renderWithI18n,
  createTestWrapper,
  screen,
  waitFor,
  act,
  fireEvent,
  within,
  vi,
  getTextSnapshot,
  getHtmlSnapshot,
  isFocusable,
  hasAccessibleLabel,
} from "./render-utils";

// Mock Factories
export {
  createMockNode,
  createMockNodes,
  createMockAlert,
  createMockAlerts,
  createMockModel,
  createMockConfiguredModel,
  createMockLocalStorage,
  createMockWebSocket,
  createMockFetch,
  createMockResponse,
  flushPromises,
  delay,
  setupTestEnvironment,
  cleanupTestEnvironment,
  generateRandomString,
  generateRandomNumber,
  generateRandomBoolean,
} from "./mock-factories";

export type { MockWebSocketEvents } from "./mock-factories";