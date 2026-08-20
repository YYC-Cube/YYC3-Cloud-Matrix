/**
 * @file: docs-generator.ts
 * @description: docs-generator.ts
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-08
 * @updated: 2026-04-08
 * @status: active
 * @tags: [lib]
 */

export type DocType = "api" | "user-guide" | "developer" | "architecture" | "deployment";

export interface DocSection {
  id: string;
  title: string;
  content: string;
  order: number;
  subsections: DocSection[];
}

export interface DocMetadata {
  title: string;
  version: string;
  description: string;
  author: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

export interface GeneratedDocument {
  type: DocType;
  metadata: DocMetadata;
  sections: DocSection[];
  toc: TableOfContents;
  format: "markdown" | "html";
}

export interface TableOfContents {
  items: TOCItem[];
}

export interface TOCItem {
  id: string;
  title: string;
  level: number;
  children: TOCItem[];
}

export class DocsGenerator {
  private documents: Map<string, GeneratedDocument> = new Map();

  generateAPIDocument(config: {
    title: string;
    version: string;
    description: string;
    endpoints: Array<{
      path: string;
      method: string;
      description: string;
      parameters?: Array<{ name: string; type: string; required: boolean; description: string }>;
      responses?: Array<{ code: number; description: string }>;
    }>;
  }): GeneratedDocument {
    const sections: DocSection[] = [];

    sections.push({
      id: "overview",
      title: "概述",
      content: config.description,
      order: 1,
      subsections: [],
    });

    const endpointSections: DocSection[] = config.endpoints.map((endpoint, index) => ({
      id: `endpoint-${index}`,
      title: `${endpoint.method} ${endpoint.path}`,
      content: this.formatEndpointContent(endpoint),
      order: index + 2,
      subsections: [],
    }));

    sections.push(...endpointSections);

    const doc: GeneratedDocument = {
      type: "api",
      metadata: {
        title: config.title,
        version: config.version,
        description: config.description,
        author: "YYC³ Team",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: ["api", "reference"],
      },
      sections,
      toc: this.generateTOC(sections),
      format: "markdown",
    };

    this.documents.set(`api-${Date.now()}`, doc);
    return doc;
  }

  generateUserGuide(config: {
    title: string;
    version: string;
    features: Array<{
      name: string;
      description: string;
      steps?: string[];
    }>;
  }): GeneratedDocument {
    const sections: DocSection[] = [];

    sections.push({
      id: "introduction",
      title: "简介",
      content: `欢迎使用 ${config.title}。本文档将帮助您快速了解和使用系统的各项功能。`,
      order: 1,
      subsections: [],
    });

    sections.push({
      id: "getting-started",
      title: "快速开始",
      content: "### 系统要求\n\n- Node.js 20.x 或更高版本\n- pnpm 9.x 或更高版本\n\n### 安装步骤\n\n```bash\npnpm install\n```\n\n### 启动服务\n\n```bash\npnpm dev\n```",
      order: 2,
      subsections: [],
    });

    const featureSections: DocSection[] = config.features.map((feature, index) => ({
      id: `feature-${index}`,
      title: feature.name,
      content: this.formatFeatureContent(feature),
      order: index + 3,
      subsections: [],
    }));

    sections.push(...featureSections);

    const doc: GeneratedDocument = {
      type: "user-guide",
      metadata: {
        title: config.title,
        version: config.version,
        description: "用户使用指南",
        author: "YYC³ Team",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: ["guide", "user"],
      },
      sections,
      toc: this.generateTOC(sections),
      format: "markdown",
    };

    this.documents.set(`user-guide-${Date.now()}`, doc);
    return doc;
  }

  generateDeveloperDocs(config: {
    title: string;
    version: string;
    modules: Array<{
      name: string;
      description: string;
      functions?: Array<{ name: string; signature: string; description: string }>;
    }>;
  }): GeneratedDocument {
    const sections: DocSection[] = [];

    sections.push({
      id: "architecture",
      title: "架构概述",
      content: "## 技术栈\n\n- **前端**: React 19 + TypeScript\n- **路由**: React Router v7\n- **样式**: TailwindCSS v4\n- **状态管理**: Zustand + Context API\n- **桌面**: Electron 28\n\n## 项目结构\n\n```\nsrc/\n├── main.tsx          # 入口文件\n├── app/\n│   ├── components/   # React 组件\n│   ├── hooks/        # 自定义 Hooks\n│   ├── lib/          # 工具库\n│   └── types/        # 类型定义\n└── electron/         # Electron 主进程\n```",
      order: 1,
      subsections: [],
    });

    sections.push({
      id: "conventions",
      title: "开发规范",
      content: "## 命名规范\n\n- 组件: PascalCase (如 `Dashboard`)\n- 函数: camelCase (如 `useWebSocket`)\n- 文件: kebab-case (如 `api-config.ts`)\n\n## 类型定义\n\n所有类型定义集中在 `src/app/types/index.ts`。\n\n## 错误处理\n\n使用统一的错误处理器 `error-handler.ts`。",
      order: 2,
      subsections: [],
    });

    const moduleSections: DocSection[] = config.modules.map((module, index) => ({
      id: `module-${index}`,
      title: module.name,
      content: this.formatModuleContent(module),
      order: index + 3,
      subsections: [],
    }));

    sections.push(...moduleSections);

    const doc: GeneratedDocument = {
      type: "developer",
      metadata: {
        title: config.title,
        version: config.version,
        description: "开发者文档",
        author: "YYC³ Team",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: ["developer", "reference"],
      },
      sections,
      toc: this.generateTOC(sections),
      format: "markdown",
    };

    this.documents.set(`developer-${Date.now()}`, doc);
    return doc;
  }

  generateArchitectureDocs(config: {
    title: string;
    version: string;
    components: Array<{
      name: string;
      type: string;
      description: string;
      dependencies?: string[];
    }>;
  }): GeneratedDocument {
    const sections: DocSection[] = [];

    sections.push({
      id: "overview",
      title: "系统架构",
      content: "## 整体架构\n\nYYC³ Cloud Intelli-Matrix 采用现代化的前端架构设计，支持 Web 和桌面双端部署。\n\n### 核心设计原则\n\n- **五高**: 高可用、高性能、高安全、高扩展、高智能\n- **五标**: 标准化、规范化、自动化、可视化、智能化\n- **五化**: 流程化、文档化、工具化、数字化、生态化",
      order: 1,
      subsections: [],
    });

    sections.push({
      id: "data-flow",
      title: "数据流架构",
      content: "## 数据流向\n\n```\n用户操作 → React 组件 → Context/Hooks → WebSocket/API → 后端服务\n                ↓\n           状态更新 → UI 重渲染\n```",
      order: 2,
      subsections: [],
    });

    const componentSections: DocSection[] = config.components.map((comp, index) => ({
      id: `component-${index}`,
      title: comp.name,
      content: this.formatComponentContent(comp),
      order: index + 3,
      subsections: [],
    }));

    sections.push(...componentSections);

    const doc: GeneratedDocument = {
      type: "architecture",
      metadata: {
        title: config.title,
        version: config.version,
        description: "架构设计文档",
        author: "YYC³ Team",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: ["architecture", "design"],
      },
      sections,
      toc: this.generateTOC(sections),
      format: "markdown",
    };

    this.documents.set(`architecture-${Date.now()}`, doc);
    return doc;
  }

  generateDeploymentDocs(config: {
    title: string;
    version: string;
    environments: Array<{
      name: string;
      description: string;
      steps: string[];
    }>;
  }): GeneratedDocument {
    const sections: DocSection[] = [];

    sections.push({
      id: "prerequisites",
      title: "部署前准备",
      content: "## 系统要求\n\n- Node.js 20.x+\n- pnpm 9.x+\n- Docker (可选)\n\n## 环境变量\n\n| 变量名 | 描述 | 默认值 |\n|--------|------|--------|\n| NODE_ENV | 运行环境 | development |\n| PORT | 服务端口 | 3218 |",
      order: 1,
      subsections: [],
    });

    const envSections: DocSection[] = config.environments.map((env, index) => ({
      id: `env-${index}`,
      title: env.name,
      content: this.formatEnvironmentContent(env),
      order: index + 2,
      subsections: [],
    }));

    sections.push(...envSections);

    sections.push({
      id: "monitoring",
      title: "监控与运维",
      content: "## 健康检查\n\n```bash\ncurl http://localhost:3218/health\n```\n\n## 日志查看\n\n```bash\npnpm logs\n```",
      order: sections.length + 1,
      subsections: [],
    });

    const doc: GeneratedDocument = {
      type: "deployment",
      metadata: {
        title: config.title,
        version: config.version,
        description: "部署指南",
        author: "YYC³ Team",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: ["deployment", "operations"],
      },
      sections,
      toc: this.generateTOC(sections),
      format: "markdown",
    };

    this.documents.set(`deployment-${Date.now()}`, doc);
    return doc;
  }

  toMarkdown(doc: GeneratedDocument): string {
    let markdown = "";

    markdown += `# ${doc.metadata.title}\n\n`;
    markdown += `> 版本: ${doc.metadata.version}\n`;
    markdown += `> 更新时间: ${doc.metadata.updatedAt}\n\n`;
    markdown += `${doc.metadata.description}\n\n`;

    markdown += "## 目录\n\n";
    markdown += this.renderTOC(doc.toc);
    markdown += "\n---\n\n";

    const sortedSections = [...doc.sections].sort((a, b) => a.order - b.order);
    for (const section of sortedSections) {
      markdown += this.renderSection(section, 2);
    }

    return markdown;
  }

  toHTML(doc: GeneratedDocument): string {
    let html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${doc.metadata.title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 900px; margin: 0 auto; padding: 20px; }
    h1 { color: #060e1f; border-bottom: 2px solid #00d4ff; }
    h2 { color: #1a365d; margin-top: 2em; }
    code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; }
    pre { background: #f4f4f4; padding: 16px; border-radius: 8px; overflow-x: auto; }
    .toc { background: #f8f9fa; padding: 16px; border-radius: 8px; }
  </style>
</head>
<body>
  <h1>${doc.metadata.title}</h1>
  <p><em>版本: ${doc.metadata.version} | 更新时间: ${doc.metadata.updatedAt}</em></p>
  <p>${doc.metadata.description}</p>
`;

    html += '<div class="toc"><h3>目录</h3>';
    html += this.renderTOCHTML(doc.toc);
    html += "</div>";

    const sortedSections = [...doc.sections].sort((a, b) => a.order - b.order);
    for (const section of sortedSections) {
      html += this.renderSectionHTML(section);
    }

    html += "</body></html>";
    return html;
  }

  private formatEndpointContent(endpoint: {
    path: string;
    method: string;
    description: string;
    parameters?: Array<{ name: string; type: string; required: boolean; description: string }>;
    responses?: Array<{ code: number; description: string }>;
  }): string {
    let content = `### 描述\n\n${endpoint.description}\n\n`;
    content += `### 请求\n\n\`${endpoint.method} ${endpoint.path}\`\n\n`;

    if (endpoint.parameters && endpoint.parameters.length > 0) {
      content += "### 参数\n\n";
      content += "| 名称 | 类型 | 必填 | 描述 |\n";
      content += "|------|------|------|------|\n";
      endpoint.parameters.forEach((p) => {
        content += `| ${p.name} | ${p.type} | ${p.required ? "是" : "否"} | ${p.description} |\n`;
      });
      content += "\n";
    }

    if (endpoint.responses && endpoint.responses.length > 0) {
      content += "### 响应\n\n";
      endpoint.responses.forEach((r) => {
        content += `- **${r.code}**: ${r.description}\n`;
      });
    }

    return content;
  }

  private formatFeatureContent(feature: {
    name: string;
    description: string;
    steps?: string[];
  }): string {
    let content = `### 描述\n\n${feature.description}\n\n`;

    if (feature.steps && feature.steps.length > 0) {
      content += "### 操作步骤\n\n";
      feature.steps.forEach((step, index) => {
        content += `${index + 1}. ${step}\n`;
      });
    }

    return content;
  }

  private formatModuleContent(module: {
    name: string;
    description: string;
    functions?: Array<{ name: string; signature: string; description: string }>;
  }): string {
    let content = `### 描述\n\n${module.description}\n\n`;

    if (module.functions && module.functions.length > 0) {
      content += "### 函数列表\n\n";
      module.functions.forEach((fn) => {
        content += `#### ${fn.name}\n\n`;
        content += "```typescript\n";
        content += `${fn.signature}\n`;
        content += "```\n\n";
        content += `${fn.description}\n\n`;
      });
    }

    return content;
  }

  private formatComponentContent(component: {
    name: string;
    type: string;
    description: string;
    dependencies?: string[];
  }): string {
    let content = `### 类型\n\n${component.type}\n\n`;
    content += `### 描述\n\n${component.description}\n\n`;

    if (component.dependencies && component.dependencies.length > 0) {
      content += "### 依赖\n\n";
      component.dependencies.forEach((dep) => {
        content += `- ${dep}\n`;
      });
    }

    return content;
  }

  private formatEnvironmentContent(env: {
    name: string;
    description: string;
    steps: string[];
  }): string {
    let content = `### 描述\n\n${env.description}\n\n`;
    content += "### 部署步骤\n\n";
    env.steps.forEach((step, index) => {
      content += `${index + 1}. ${step}\n`;
    });

    return content;
  }

  private generateTOC(sections: DocSection[]): TableOfContents {
    const items: TOCItem[] = sections.map((section) => ({
      id: section.id,
      title: section.title,
      level: 1,
      children: section.subsections.map((sub) => ({
        id: sub.id,
        title: sub.title,
        level: 2,
        children: [],
      })),
    }));

    return { items };
  }

  private renderTOC(toc: TableOfContents): string {
    let markdown = "";
    toc.items.forEach((item) => {
      markdown += `- [${item.title}](#${item.id})\n`;
      item.children.forEach((child) => {
        markdown += `  - [${child.title}](#${child.id})\n`;
      });
    });
    return markdown;
  }

  private renderTOCHTML(toc: TableOfContents): string {
    let html = "<ul>";
    toc.items.forEach((item) => {
      html += `<li><a href="#${item.id}">${item.title}</a>`;
      if (item.children.length > 0) {
        html += "<ul>";
        item.children.forEach((child) => {
          html += `<li><a href="#${child.id}">${child.title}</a></li>`;
        });
        html += "</ul>";
      }
      html += "</li>";
    });
    html += "</ul>";
    return html;
  }

  private renderSection(section: DocSection, level: number): string {
    const heading = "#".repeat(level);
    let markdown = `${heading} ${section.title}\n\n`;
    markdown += `${section.content}\n\n`;

    section.subsections.forEach((sub) => {
      markdown += this.renderSection(sub, level + 1);
    });

    return markdown;
  }

  private renderSectionHTML(section: DocSection): string {
    let html = `<section id="${section.id}">`;
    html += `<h2>${section.title}</h2>`;
    html += `<div>${this.markdownToHTML(section.content)}</div>`;

    section.subsections.forEach((sub) => {
      html += `<section id="${sub.id}">`;
      html += `<h3>${sub.title}</h3>`;
      html += `<div>${this.markdownToHTML(sub.content)}</div>`;
      html += "</section>";
    });

    html += "</section>";
    return html;
  }

  private markdownToHTML(markdown: string): string {
    return markdown
      .replace(/### (.*)/g, "<h4>$1</h4>")
      .replace(/## (.*)/g, "<h3>$1</h3>")
      .replace(/# (.*)/g, "<h2>$1</h2>")
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/```(\w*)\n([\s\S]*?)```/g, "<pre><code>$2</code></pre>")
      .replace(/\n/g, "<br>");
  }

  getDocuments(): GeneratedDocument[] {
    return Array.from(this.documents.values());
  }

  getDocument(id: string): GeneratedDocument | undefined {
    return this.documents.get(id);
  }

  clear(): void {
    this.documents.clear();
  }
}

export function createDocsGenerator(): DocsGenerator {
  return new DocsGenerator();
}
