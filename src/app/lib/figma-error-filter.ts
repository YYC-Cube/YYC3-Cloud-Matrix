/**
 * @file: figma-error-filter.ts
 * @description: figma-error-filter.ts
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-08
 * @updated: 2026-04-08
 * @status: active
 * @tags: [lib]
 */

/**
 * 判断是否为 Figma iframe 平台内部错误
 * @param nameOrType - 错误名称 / 构造函数名（e.g. "IframeMessageAbortError"）
 * @param message    - 错误消息文本
 * @param source     - 可选，来源文件名 / URL
 * @param stack      - 可选，错误堆栈字符串（增强维度 4）
 */
export function isFigmaPlatformError(
  nameOrType: string,
  message: string,
  source?: string,
  stack?: string
): boolean {
  const n = nameOrType.toLowerCase();
  const m = message.toLowerCase();
  const s = (source || "").toLowerCase();
  const st = (stack || "").toLowerCase();

  // 1) 错误名 / 类名匹配
  // First check for specific IframeMessage* errors
  if (n.includes("iframemessage")) {
    return true;
  }

  // Then check for aborterror (requires message/port context)
  if (n.includes("aborterror")) {
    // IframeMessageAbortError extends AbortError in Figma's runtime
    // Also match bare "AbortError" when combined with message-port content
    if (m.includes("message") || m.includes("port") || st.includes("port")) {
      return true;
    }
  }

  // 2) 消息内容匹配（覆盖不带类名前缀的场景）
  if (
    m.includes("message aborted") ||
    m.includes("message port was destroyed") ||
    m.includes("iframemessage") ||
    m.includes("message port closed") ||
    m.includes("setimmediate$") ||
    m.includes("port was destroyed") ||
    m.includes("message channel") ||
    m.includes("the message port") ||
    m.includes("user aborted")
  ) {
    return true;
  }

  // 3) 来源文件匹配（Figma 宿主脚本 & webpack 产物）
  if (
    s.includes("figma.com") ||
    s.includes("webpack-artifacts") ||
    s.includes("figma_app") ||
    s.includes("figma-") ||
    s.includes("/figma/") ||
    s.includes("figma_infra") ||
    /\d+-[a-f0-9]+\.min\.js/.test(s)  // Figma chunk pattern: 1741-0091e26ad4c06e70.min.js
  ) {
    return true;
  }

  // 4) 堆栈匹配（cross-origin 场景下 name/source 可能为空，但 stack 包含 Figma URL）
  if (
    st.includes("figma.com") ||
    st.includes("webpack-artifacts") ||
    st.includes("figma_app") ||
    st.includes("setupmessagechannel") ||
    st.includes("iframemessage") ||
    st.includes("figma_infra")
  ) {
    return true;
  }

  // 5) Combined heuristic: AbortError + message-port keywords in any field
  if (n.includes("abort") && (m.includes("port") || m.includes("message") || st.includes("port"))) {
    return true;
  }

  return false;
}