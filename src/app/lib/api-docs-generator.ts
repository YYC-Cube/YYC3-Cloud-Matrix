/**
 * @file: api-docs-generator.ts
 * @description: api-docs-generator.ts
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-08
 * @updated: 2026-04-08
 * @status: active
 * @tags: [lib]
 */

export interface APIEndpoint {
  path: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  description: string;
  parameters?: APIParameter[];
  requestBody?: APIRequestBody;
  responses: APIResponse[];
  tags?: string[];
  deprecated?: boolean;
}

export interface APIParameter {
  name: string;
  in: "query" | "path" | "header" | "cookie";
  required: boolean;
  type: string;
  description: string;
  example?: unknown;
}

export interface APIRequestBody {
  required: boolean;
  contentType: string;
  schema: Record<string, unknown>;
  example?: unknown;
}

export interface APIResponse {
  statusCode: number;
  description: string;
  contentType?: string;
  schema?: Record<string, unknown>;
  example?: unknown;
}

export interface APIDocumentation {
  version: string;
  title: string;
  description: string;
  baseUrl: string;
  endpoints: APIEndpoint[];
  generatedAt: string;
}

export class APIDocsGenerator {
  private endpoints: APIEndpoint[] = [];
  private version: string;
  private title: string;
  private description: string;
  private baseUrl: string;

  constructor(config: {
    version: string;
    title: string;
    description: string;
    baseUrl: string;
  }) {
    this.version = config.version;
    this.title = config.title;
    this.description = config.description;
    this.baseUrl = config.baseUrl;
  }

  addEndpoint(endpoint: APIEndpoint): void {
    this.endpoints.push(endpoint);
  }

  addEndpoints(endpoints: APIEndpoint[]): void {
    this.endpoints.push(...endpoints);
  }

  generateDocumentation(): APIDocumentation {
    return {
      version: this.version,
      title: this.title,
      description: this.description,
      baseUrl: this.baseUrl,
      endpoints: this.endpoints,
      generatedAt: new Date().toISOString(),
    };
  }

  generateMarkdown(): string {
    const doc = this.generateDocumentation();
    let markdown = `# ${doc.title}\n\n`;
    markdown += `**版本**: ${doc.version}\n\n`;
    markdown += `**生成时间**: ${doc.generatedAt}\n\n`;
    markdown += `## 概述\n\n${doc.description}\n\n`;
    markdown += `**基础 URL**: \`${doc.baseUrl}\`\n\n`;
    markdown += `## 目录\n\n`;

    const tags = new Set<string>();
    this.endpoints.forEach((e) => e.tags?.forEach((t) => tags.add(t)));

    if (tags.size > 0) {
      tags.forEach((tag) => {
        markdown += `- [${tag}](#${tag.toLowerCase().replace(/\s+/g, "-")})\n`;
      });
    } else {
      this.endpoints.forEach((endpoint, index) => {
        markdown += `- [${endpoint.method} ${endpoint.path}](#${endpoint.method.toLowerCase()}-${endpoint.path.replace(/\//g, "").replace(/:/g, "")}-${index})\n`;
      });
    }

    markdown += `\n---\n\n`;

    if (tags.size > 0) {
      tags.forEach((tag) => {
        markdown += `## ${tag}\n\n`;
        this.endpoints
          .filter((e) => e.tags?.includes(tag))
          .forEach((endpoint, index) => {
            markdown += this.generateEndpointMarkdown(endpoint, index);
          });
      });
    } else {
      this.endpoints.forEach((endpoint, index) => {
        markdown += this.generateEndpointMarkdown(endpoint, index);
      });
    }

    return markdown;
  }

  private generateEndpointMarkdown(endpoint: APIEndpoint, _index: number): string {
    let markdown = `### ${endpoint.method} ${endpoint.path}\n\n`;

    if (endpoint.deprecated) {
      markdown += `> ⚠️ **已废弃**: 此端点已废弃，请使用替代方案。\n\n`;
    }

    markdown += `${endpoint.description}\n\n`;

    if (endpoint.parameters && endpoint.parameters.length > 0) {
      markdown += `#### 参数\n\n`;
      markdown += `| 名称 | 位置 | 必需 | 类型 | 描述 | 示例 |\n`;
      markdown += `|------|------|------|------|------|------|\n`;
      endpoint.parameters.forEach((param) => {
        markdown += `| ${param.name} | ${param.in} | ${param.required ? "是" : "否"} | ${param.type} | ${param.description} | ${param.example ?? "-"} |\n`;
      });
      markdown += `\n`;
    }

    if (endpoint.requestBody) {
      markdown += `#### 请求体\n\n`;
      markdown += `- **必需**: ${endpoint.requestBody.required ? "是" : "否"}\n`;
      markdown += `- **Content-Type**: ${endpoint.requestBody.contentType}\n\n`;
      if (endpoint.requestBody.example) {
        markdown += `**示例**:\n\n\`\`\`json\n${JSON.stringify(endpoint.requestBody.example, null, 2)}\n\`\`\`\n\n`;
      }
    }

    markdown += `#### 响应\n\n`;
    endpoint.responses.forEach((response) => {
      markdown += `**状态码 ${response.statusCode}**: ${response.description}\n\n`;
      if (response.example) {
        markdown += `\`\`\`json\n${JSON.stringify(response.example, null, 2)}\n\`\`\`\n\n`;
      }
    });

    markdown += `---\n\n`;
    return markdown;
  }

  generateOpenAPI(): Record<string, unknown> {
    const doc = this.generateDocumentation();

    const openapi: Record<string, unknown> = {
      openapi: "3.0.0",
      info: {
        title: doc.title,
        version: doc.version,
        description: doc.description,
      },
      servers: [
        {
          url: doc.baseUrl,
          description: "API Server",
        },
      ],
      paths: {},
    };

    const paths: Record<string, Record<string, unknown>> = {};

    this.endpoints.forEach((endpoint) => {
      if (!paths[endpoint.path]) {
        paths[endpoint.path] = {};
      }

      const methodDoc: Record<string, unknown> = {
        summary: endpoint.description,
        deprecated: endpoint.deprecated,
        tags: endpoint.tags,
      };

      if (endpoint.parameters && endpoint.parameters.length > 0) {
        methodDoc.parameters = endpoint.parameters.map((param) => ({
          name: param.name,
          in: param.in,
          required: param.required,
          schema: { type: param.type },
          description: param.description,
          example: param.example,
        }));
      }

      if (endpoint.requestBody) {
        methodDoc.requestBody = {
          required: endpoint.requestBody.required,
          content: {
            [endpoint.requestBody.contentType]: {
              schema: endpoint.requestBody.schema,
              example: endpoint.requestBody.example,
            },
          },
        };
      }

      const responses: Record<string, unknown> = {};
      endpoint.responses.forEach((response) => {
        responses[response.statusCode] = {
          description: response.description,
          content: response.contentType
            ? {
                [response.contentType]: {
                  schema: response.schema,
                  example: response.example,
                },
              }
            : undefined,
        };
      });
      methodDoc.responses = responses;

      paths[endpoint.path][endpoint.method.toLowerCase()] = methodDoc;
    });

    openapi.paths = paths;
    return openapi;
  }

  clear(): void {
    this.endpoints = [];
  }
}

export function createYYC3APIDocs(): APIDocsGenerator {
  const generator = new APIDocsGenerator({
    version: "1.0.0",
    title: "YYC³ Cloud Intelli-Matrix API",
    description: "YYC³ Cloud Intelli-Matrix 企业级智能矩阵管理系统 API 文档",
    baseUrl: "http://localhost:3118/api",
  });

  generator.addEndpoints([
    {
      path: "/nodes",
      method: "GET",
      description: "获取所有节点状态",
      tags: ["节点管理"],
      responses: [
        {
          statusCode: 200,
          description: "成功返回节点列表",
          contentType: "application/json",
          example: [
            {
              id: "node-001",
              status: "active",
              gpu: 75,
              mem: 60,
              temp: 65,
              model: "LLaMA-70B",
              tasks: 12,
            },
          ],
        },
      ],
    },
    {
      path: "/nodes/{id}",
      method: "GET",
      description: "获取指定节点详情",
      tags: ["节点管理"],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          type: "string",
          description: "节点 ID",
          example: "node-001",
        },
      ],
      responses: [
        {
          statusCode: 200,
          description: "成功返回节点详情",
          contentType: "application/json",
          example: {
            id: "node-001",
            status: "active",
            gpu: 75,
            mem: 60,
            temp: 65,
            model: "LLaMA-70B",
            tasks: 12,
          },
        },
        {
          statusCode: 404,
          description: "节点不存在",
        },
      ],
    },
    {
      path: "/models",
      method: "GET",
      description: "获取所有模型列表",
      tags: ["模型管理"],
      responses: [
        {
          statusCode: 200,
          description: "成功返回模型列表",
          contentType: "application/json",
          example: [
            {
              id: "model-001",
              name: "LLaMA-70B",
              provider: "Meta",
              tier: "primary",
              avg_latency_ms: 150,
              throughput: 1000,
            },
          ],
        },
      ],
    },
    {
      path: "/inference",
      method: "POST",
      description: "执行推理请求",
      tags: ["推理服务"],
      requestBody: {
        required: true,
        contentType: "application/json",
        schema: {
          type: "object",
          properties: {
            model_id: { type: "string" },
            prompt: { type: "string" },
            max_tokens: { type: "number" },
            temperature: { type: "number" },
          },
        },
        example: {
          model_id: "model-001",
          prompt: "Hello, how are you?",
          max_tokens: 100,
          temperature: 0.7,
        },
      },
      responses: [
        {
          statusCode: 200,
          description: "推理成功",
          contentType: "application/json",
          example: {
            result: "I'm doing well, thank you for asking!",
            latency_ms: 150,
            tokens_in: 10,
            tokens_out: 20,
          },
        },
        {
          statusCode: 400,
          description: "请求参数错误",
        },
        {
          statusCode: 503,
          description: "服务不可用",
        },
      ],
    },
    {
      path: "/alerts",
      method: "GET",
      description: "获取告警列表",
      tags: ["告警管理"],
      parameters: [
        {
          name: "level",
          in: "query",
          required: false,
          type: "string",
          description: "告警级别过滤",
          example: "warning",
        },
        {
          name: "limit",
          in: "query",
          required: false,
          type: "number",
          description: "返回数量限制",
          example: 10,
        },
      ],
      responses: [
        {
          statusCode: 200,
          description: "成功返回告警列表",
          contentType: "application/json",
          example: [
            {
              id: "alert-001",
              level: "warning",
              message: "GPU 使用率过高",
              source: "node-001",
              timestamp: "2026-04-03T10:00:00Z",
            },
          ],
        },
      ],
    },
    {
      path: "/config",
      method: "PUT",
      description: "更新系统配置",
      tags: ["系统配置"],
      requestBody: {
        required: true,
        contentType: "application/json",
        schema: {
          type: "object",
          properties: {
            api_endpoints: { type: "object" },
            ai_settings: { type: "object" },
            performance_settings: { type: "object" },
          },
        },
        example: {
          api_endpoints: {
            fsBase: "/api/fs",
            wsEndpoint: "ws://localhost:3113/ws",
          },
          ai_settings: {
            defaultModel: "LLaMA-70B",
            temperature: 0.7,
          },
        },
      },
      responses: [
        {
          statusCode: 200,
          description: "配置更新成功",
        },
        {
          statusCode: 400,
          description: "配置验证失败",
        },
      ],
    },
  ]);

  return generator;
}
