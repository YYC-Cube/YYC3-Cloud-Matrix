/**
 * @file: design-system.ts
 * @description: design-system.ts
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-06
 * @updated: 2026-04-08
 * @status: active
 * @tags: [module]
 */

// ═══════════════════════════════════════════════════════════════
//  色彩系统
// ═══════════════════════════════════════════════════════════════

export interface ColorToken {
  name: string;
  value: string;
  cssVar: string;
  usage: string;
}

export const COLOR_TOKENS: ColorToken[] = [
  { name: "Background", value: "#060e1f", cssVar: "--background", usage: "全局页面背景" },
  { name: "Foreground", value: "#e0f0ff", cssVar: "--foreground", usage: "主文字颜色" },
  { name: "Primary", value: "#00d4ff", cssVar: "--primary", usage: "主色调 · 按钮 · 链接 · 焦点" },
  { name: "Primary Dark", value: "#060e1f", cssVar: "--primary-foreground", usage: "Primary 上的文字" },
  { name: "Secondary", value: "rgba(0,180,255,0.15)", cssVar: "--secondary", usage: "次要背景 · 标签 · 辅助区域" },
  { name: "Muted", value: "rgba(0,120,200,0.2)", cssVar: "--muted", usage: "禁用 / 弱化内容背景" },
  { name: "Muted FG", value: "#6bb8d9", cssVar: "--muted-foreground", usage: "弱化文字 · 占位符" },
  { name: "Accent", value: "rgba(0,200,255,0.1)", cssVar: "--accent", usage: "高亮悬浮 · 选中态" },
  { name: "Destructive", value: "#ff3366", cssVar: "--destructive", usage: "危险操作 · 错误 · 删除" },
  { name: "Border", value: "rgba(0,180,255,0.2)", cssVar: "--border", usage: "边框 · 分割线" },
  { name: "Ring", value: "rgba(0,212,255,0.5)", cssVar: "--ring", usage: "焦点环 · 外发光" },
  { name: "Card", value: "rgba(10,30,60,0.7)", cssVar: "--card", usage: "GlassCard 背景" },
  { name: "Success", value: "#00ff88", cssVar: "--chart-2", usage: "成功 · 健康 · 正常" },
  { name: "Warning", value: "#ffaa00", cssVar: "(custom)", usage: "警告 · 接近阈值" },
  { name: "Error", value: "#ff3366", cssVar: "--destructive", usage: "错误 · 异常" },
];

export const CHART_COLORS = {
  chart1: "#00d4ff",
  chart2: "#00ff88",
  chart3: "#ff6600",
  chart4: "#aa55ff",
  chart5: "#ffdd00",
};

export const FAMILY_COLORS = {
  navigator: "#FFD700",
  thinker: "#FF69B4",
  prophet: "#00BFFF",
  bolero: "#FFD700",
  sentinel: "#00FF88",
  master: "#FFD700",
  oracle: "#00BFFF",
  creator: "#BF00FF",
};

// ═══════════════════════════════════════════════════════════════
//  字体排版
// ═══════════════════════════════════════════════════════════════

export interface TypographyToken {
  name: string;
  family: string;
  weight: string;
  size: string;
  lineHeight: string;
  usage: string;
}

export const FONT_FAMILIES = {
  display: "'Orbitron', sans-serif",
  body: "'Rajdhani', sans-serif",
  mono: "'JetBrains Mono', monospace",
};

export const FONT_SIZES = {
  micro: "0.625rem",
  caption: "0.75rem",
  body: "0.875rem",
  subtitle: "1rem",
  h3: "1.125rem",
  h2: "1.25rem",
  h1: "1.5rem",
  display: "2rem",
  hero: "3rem",
};

export const FONT_WEIGHTS = {
  normal: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
};

export const TYPOGRAPHY_TOKENS: TypographyToken[] = [
  { name: "Display / H1", family: "Orbitron", weight: "500-700", size: "1.5rem", lineHeight: "1.5", usage: "页面大标题 · Logo 文字" },
  { name: "Heading / H2", family: "Orbitron", weight: "500", size: "1.25rem", lineHeight: "1.5", usage: "模块标题 · 卡片标题" },
  { name: "Subtitle / H3", family: "Rajdhani", weight: "500", size: "1.125rem", lineHeight: "1.5", usage: "区域标题 · 次级标题" },
  { name: "Body", family: "Rajdhani", weight: "400", size: "0.875rem", lineHeight: "1.5", usage: "正文 · 描述 · 段落" },
  { name: "Caption", family: "Rajdhani", weight: "400", size: "0.75rem", lineHeight: "1.5", usage: "辅助文字 · 时间戳 · 标签" },
  { name: "Micro", family: "Rajdhani", weight: "400", size: "0.625rem", lineHeight: "1.5", usage: "极小标注 · 状态角标" },
  { name: "Mono / Code", family: "JetBrains Mono", weight: "400", size: "0.78rem", lineHeight: "1.5", usage: "代码 · 命令行 · 指标数值" },
  { name: "Mono / Metric", family: "Orbitron", weight: "600", size: "1.1rem", lineHeight: "1.5", usage: "大数字指标 · KPI 数值" },
];

// ═══════════════════════════════════════════════════════════════
//  间距规范
// ═══════════════════════════════════════════════════════════════

export interface SpacingToken {
  name: string;
  value: string;
  px: number;
  usage: string;
}

export const SPACING_TOKENS: SpacingToken[] = [
  { name: "4xs", value: "0.125rem", px: 2, usage: "最小间距 · 图标内部" },
  { name: "3xs", value: "0.25rem", px: 4, usage: "紧凑间距 · Badge 内边距" },
  { name: "2xs", value: "0.375rem", px: 6, usage: "小间距 · 标签间距" },
  { name: "xs", value: "0.5rem", px: 8, usage: "常规内边距 · 按钮垂直" },
  { name: "sm", value: "0.75rem", px: 12, usage: "卡片内边距 · 组件间距" },
  { name: "md", value: "1rem", px: 16, usage: "标准间距 · 页面边距" },
  { name: "lg", value: "1.5rem", px: 24, usage: "较大间距 · 区块间距" },
  { name: "xl", value: "2rem", px: 32, usage: "大间距 · 页面留白" },
  { name: "2xl", value: "3rem", px: 48, usage: "超大间距 · 模块分隔" },
];

export const SPACING = {
  "4xs": "0.125rem",
  "3xs": "0.25rem",
  "2xs": "0.375rem",
  xs: "0.5rem",
  sm: "0.75rem",
  md: "1rem",
  lg: "1.5rem",
  xl: "2rem",
  "2xl": "3rem",
};

// ═══════════════════════════════════════════════════════════════
//  圆角规范
// ═══════════════════════════════════════════════════════════════

export const BORDER_RADIUS = {
  none: "0",
  sm: "0.25rem",
  md: "0.5rem",
  lg: "0.75rem",
  xl: "1rem",
  "2xl": "1.5rem",
  full: "9999px",
};

// ═══════════════════════════════════════════════════════════════
//  阴影效果
// ═══════════════════════════════════════════════════════════════

export interface ShadowToken {
  name: string;
  value: string;
  usage: string;
}

export const SHADOW_TOKENS: ShadowToken[] = [
  { name: "Glow-SM", value: "0 0 15px rgba(0,180,255,0.05)", usage: "微弱发光 · 静态状态" },
  { name: "Glow-MD", value: "0 0 30px rgba(0,180,255,0.1)", usage: "默认发光 · GlassCard" },
  { name: "Glow-LG", value: "0 0 40px rgba(0,180,255,0.15)", usage: "Hover 发光 · 焦点状态" },
  { name: "Glow-XL", value: "0 0 60px rgba(0,180,255,0.2)", usage: "强调发光 · 活跃选中" },
  { name: "Glow-Primary", value: "0 0 16px rgba(0,212,255,0.4)", usage: "主色发光 · 按钮活跃" },
  { name: "Glow-Success", value: "0 0 12px rgba(0,255,136,0.3)", usage: "成功发光 · 健康状态" },
  { name: "Glow-Danger", value: "0 0 8px rgba(255,51,102,0.5)", usage: "危险发光 · 告警角标" },
  { name: "Drop-SM", value: "0 4px 15px rgba(0,0,0,0.2)", usage: "弹出菜单 · 下拉" },
  { name: "Drop-LG", value: "0 10px 50px rgba(0,0,0,0.5)", usage: "模态框 · 抽屉" },
];

// ═══════════════════════════════════════════════════════════════
//  动效定义
// ═══════════════════════════════════════════════════════════════

export interface AnimationToken {
  name: string;
  duration: string;
  easing: string;
  usage: string;
}

export const ANIMATION_TOKENS: AnimationToken[] = [
  { name: "Micro", duration: "100ms", easing: "ease-out", usage: "按钮反馈 · 颜色变化" },
  { name: "Fast", duration: "200ms", easing: "ease-out", usage: "Hover 过渡 · 边框" },
  { name: "Normal", duration: "300ms", easing: "ease-in-out", usage: "面板展开 · 标签切换" },
  { name: "Smooth", duration: "500ms", easing: "ease-in-out", usage: "抽屉滑入 · 模态淡入" },
  { name: "Slow", duration: "800ms", easing: "ease-in-out", usage: "页面转场 · 大面积变化" },
  { name: "Pulse", duration: "2s", easing: "linear infinite", usage: "脉冲点 · 活跃指示" },
  { name: "Spin", duration: "1s", easing: "linear infinite", usage: "Loading 旋转" },
];

export const ANIMATION = {
  micro: "100ms ease-out",
  fast: "200ms ease-out",
  normal: "300ms ease-in-out",
  smooth: "500ms ease-in-out",
  slow: "800ms ease-in-out",
};

// ═══════════════════════════════════════════════════════════════
//  断点定义
// ═══════════════════════════════════════════════════════════════

export const BREAKPOINTS = {
  xs: "320px",
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
};

// ═══════════════════════════════════════════════════════════════
//  Z-Index 层级
// ═══════════════════════════════════════════════════════════════

export const Z_INDEX = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  fixed: 30,
  modal: 40,
  popover: 50,
  tooltip: 60,
  toast: 70,
  max: 9999,
};

// ═══════════════════════════════════════════════════════════════
//  组件尺寸规范
// ═══════════════════════════════════════════════════════════════

export const COMPONENT_SIZES = {
  button: {
    sm: { height: "1.75rem", padding: "0.5rem 0.75rem", fontSize: "0.75rem" },
    md: { height: "2.25rem", padding: "0.5rem 1rem", fontSize: "0.875rem" },
    lg: { height: "2.75rem", padding: "0.75rem 1.5rem", fontSize: "1rem" },
  },
  input: {
    sm: { height: "1.75rem", padding: "0.375rem 0.75rem", fontSize: "0.75rem" },
    md: { height: "2.25rem", padding: "0.5rem 1rem", fontSize: "0.875rem" },
    lg: { height: "2.75rem", padding: "0.75rem 1.25rem", fontSize: "1rem" },
  },
  card: {
    sm: { padding: "0.75rem", borderRadius: "0.5rem" },
    md: { padding: "1rem", borderRadius: "0.75rem" },
    lg: { padding: "1.5rem", borderRadius: "1rem" },
  },
  icon: {
    xs: "0.75rem",
    sm: "1rem",
    md: "1.25rem",
    lg: "1.5rem",
    xl: "2rem",
  },
};

// ═══════════════════════════════════════════════════════════════
//  设计系统工具函数
// ═══════════════════════════════════════════════════════════════

export function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {return "0, 0, 0";}
  return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
}

export function rgba(hex: string, alpha: number): string {
  return `rgba(${hexToRgb(hex)}, ${alpha})`;
}

export function getCSSVar(varName: string): string {
  if (typeof window === "undefined") {return "";}
  return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
}

export function setCSSVar(varName: string, value: string): void {
  if (typeof window === "undefined") {return;}
  document.documentElement.style.setProperty(varName, value);
}

// ═══════════════════════════════════════════════════════════════
//  设计系统持久化
// ═══════════════════════════════════════════════════════════════

const STORAGE_KEY = "yyc3-design-system-overrides";

export interface DesignSystemOverrides {
  colors?: Record<string, string>;
  fonts?: Record<string, string>;
  spacing?: Record<string, string>;
  updatedAt: number;
}

export function loadDesignSystemOverrides(): DesignSystemOverrides | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveDesignSystemOverrides(overrides: DesignSystemOverrides): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...overrides, updatedAt: Date.now() }));
  } catch {
    // ignore
  }
}

export function applyDesignSystemOverrides(overrides: DesignSystemOverrides): void {
  if (overrides.colors) {
    for (const [name, value] of Object.entries(overrides.colors)) {
      const token = COLOR_TOKENS.find((t) => t.name === name);
      if (token) {
        setCSSVar(token.cssVar, value);
      }
    }
  }
  if (overrides.fonts) {
    for (const [name, value] of Object.entries(overrides.fonts)) {
      setCSSVar(`--font-${name}`, value);
    }
  }
}

export function resetDesignSystemOverrides(): void {
  localStorage.removeItem(STORAGE_KEY);
  window.location.reload();
}
