/**
 * @file: api/input-validator.ts
 * @description: API 边界层输入验证器 — 统一请求参数校验、类型守护、安全过滤
 *              遵循五高标准（High Security）中的纵深防御原则
 * @author: YanYuCloudCube Team <admin@0379.email>
 * @version: v1.0.0
 * @created: 2026-06-03
 * @updated: 2026-06-03
 * @status: dev
 * @license: MIT
 * @copyright: Copyright (c) 2026 YanYuCloudCube Team
 * @tags: api,validation,security,input-sanitization
 */

import { logger } from '../services/Logger'

// ============================================================================
// 通用校验结果类型
// ============================================================================

export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
}

export interface ValidationError {
  field: string
  message: string
  code: ValidationErrorCode
}

export type ValidationErrorCode =
  | 'REQUIRED'
  | 'INVALID_TYPE'
  | 'INVALID_FORMAT'
  | 'TOO_LONG'
  | 'TOO_SHORT'
  | 'UNSAFE_PATH'
  | 'UNKNOWN_COMMAND'
  | 'EMPTY_STRING'

// ============================================================================
// 命令行输入校验
// ============================================================================

const MAX_COMMAND_LENGTH = 4096
const SESSION_ID_PATTERN = /^term_\d+_[a-z0-9]+$/
const MAX_PATH_LENGTH = 512
// 路径穿越检测：防止 ../ 或 ..\ 等路径提升攻击
const PATH_TRAVERSAL_PATTERN = /\.\.[/\\]/

/**
 * 校验命令字符串
 */
export function validateCommand(value: unknown): ValidationResult {
  const errors: ValidationError[] = []

  if (value === undefined || value === null) {
    errors.push({ field: 'command', message: 'command 参数为必填项', code: 'REQUIRED' })
    return { valid: false, errors }
  }

  if (typeof value !== 'string') {
    errors.push({ field: 'command', message: `command 应为字符串，实际类型: ${typeof value}`, code: 'INVALID_TYPE' })
    return { valid: false, errors }
  }

  const trimmed = value.trim()

  if (trimmed.length === 0) {
    errors.push({ field: 'command', message: 'command 不能为空字符串', code: 'EMPTY_STRING' })
  }

  if (value.length > MAX_COMMAND_LENGTH) {
    errors.push({ field: 'command', message: `command 长度超过限制 (${MAX_COMMAND_LENGTH} 字符)`, code: 'TOO_LONG' })
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * 校验会话 ID
 */
export function validateSessionId(value: unknown): ValidationResult {
  const errors: ValidationError[] = []

  if (value === undefined || value === null) {
    errors.push({ field: 'sessionId', message: 'sessionId 参数为必填项', code: 'REQUIRED' })
    return { valid: false, errors }
  }

  if (typeof value !== 'string') {
    errors.push({ field: 'sessionId', message: `sessionId 应为字符串，实际类型: ${typeof value}`, code: 'INVALID_TYPE' })
    return { valid: false, errors }
  }

  if (!SESSION_ID_PATTERN.test(value)) {
    errors.push({
      field: 'sessionId',
      message: `sessionId 格式无效 (期望: term_<timestamp>_<random>)`,
      code: 'INVALID_FORMAT',
    })
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * 校验工作目录路径（可选参数）
 */
export function validateCwd(value: unknown): ValidationResult {
  const errors: ValidationError[] = []

  // cwd 是可选的，undefined/null 视为合法
  if (value === undefined || value === null || value === '') {
    return { valid: true, errors: [] }
  }

  if (typeof value !== 'string') {
    errors.push({ field: 'cwd', message: `cwd 应为字符串，实际类型: ${typeof value}`, code: 'INVALID_TYPE' })
    return { valid: false, errors }
  }

  if (value.length > MAX_PATH_LENGTH) {
    errors.push({ field: 'cwd', message: `cwd 路径长度超过限制 (${MAX_PATH_LENGTH} 字符)`, code: 'TOO_LONG' })
  }

  if (PATH_TRAVERSAL_PATTERN.test(value)) {
    errors.push({ field: 'cwd', message: 'cwd 路径包含不安全的路径穿越字符 (../)', code: 'UNSAFE_PATH' })
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * 批量校验 exec 请求体
 */
export function validateExecRequest(body: Record<string, unknown>): ValidationResult {
  const allErrors: ValidationError[] = []

  // 校验 command
  const cmdResult = validateCommand(body.command)
  allErrors.push(...cmdResult.errors)

  // 校验 sessionId
  const sidResult = validateSessionId(body.sessionId)
  allErrors.push(...sidResult.errors)

  // 校验 cwd（可选）
  const cwdResult = validateCwd(body.cwd)
  allErrors.push(...cwdResult.errors)

  return {
    valid: allErrors.length === 0,
    errors: allErrors,
  }
}

// ============================================================================
// JSON 解析安全包装
// ============================================================================

/**
 * 安全解析 JSON 请求体
 * 防止 Prototype Pollution、过大 payload 等攻击
 */
export function safeJSONParse(raw: string): { success: true; data: any } | { success: false; error: string } {
  // 拒绝过大的 payload (1MB 限制，命令请求远超此值即为异常)
  const MAX_PAYLOAD = 1024 * 1024
  if (raw.length > MAX_PAYLOAD) {
    logger.warn(`[InputValidator] 请求体过大被拒绝: ${raw.length} bytes`)
    return { success: false, error: '请求体超过最大允许大小 (1MB)' }
  }

  try {
    const data = JSON.parse(raw)
    return { success: true, data }
  } catch (e: any) {
    logger.warn(`[InputValidator] JSON 解析失败: ${e.message}`)
    return { success: false, error: `JSON 解析失败: ${e.message}` }
  }
}

// ============================================================================
// WebSocket 消息校验
// ============================================================================

const VALID_WS_MESSAGE_TYPES = new Set(['exec', 'resize', 'input', 'heartbeat'])

/**
 * 校验 WebSocket 消息
 */
export function validateWSMessage(message: Record<string, unknown>): ValidationResult {
  const errors: ValidationError[] = []

  // type 字段
  if (!message.type || typeof message.type !== 'string') {
    errors.push({ field: 'type', message: 'WS 消息 type 字段必填且为字符串', code: 'REQUIRED' })
    return { valid: false, errors }
  }

  if (!VALID_WS_MESSAGE_TYPES.has(message.type)) {
    errors.push({
      field: 'type',
      message: `无效的消息类型: "${message.type}"，允许: ${Array.from(VALID_WS_MESSAGE_TYPES).join(', ')}`,
      code: 'INVALID_FORMAT',
    })
  }

  // exec 类型：必须包含 command
  if (message.type === 'exec') {
    const cmdResult = validateCommand(message.command)
    errors.push(...cmdResult.errors.map(e => ({ ...e, field: `message.${e.field}` })))
  }

  // input 类型：必须包含 data
  if (message.type === 'input') {
    if (message.data === undefined || message.data === null) {
      errors.push({ field: 'message.data', message: 'input 消息必须包含 data 字段', code: 'REQUIRED' })
    } else if (typeof message.data !== 'string') {
      errors.push({ field: 'message.data', message: 'data 字段必须为字符串', code: 'INVALID_TYPE' })
    }
  }

  // resize 类型：校验 cols/rows
  if (message.type === 'resize') {
    if (message.cols !== undefined && (typeof message.cols !== 'number' || message.cols < 1 || message.cols > 1000)) {
      errors.push({ field: 'message.cols', message: 'cols 必须为 1-1000 之间的数字', code: 'INVALID_FORMAT' })
    }
    if (message.rows !== undefined && (typeof message.rows !== 'number' || message.rows < 1 || message.rows > 500)) {
      errors.push({ field: 'message.rows', message: 'rows 必须为 1-500 之间的数字', code: 'INVALID_FORMAT' })
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

// ============================================================================
// 通用校验包装器
// ============================================================================

/**
 * 在 API 端点中使用：
 * const result = validateExecRequest({ sessionId, command, cwd })
 * if (!result.valid) {
 *   jsonResponse(res, 400, { error: '输入验证失败', details: result.errors })
 *   return
 * }
 */
export function formatValidationResponse(result: ValidationResult): { error: string; details: ValidationError[] } {
  return {
    error: `输入验证失败 (${result.errors.length} 项)`,
    details: result.errors,
  }
}