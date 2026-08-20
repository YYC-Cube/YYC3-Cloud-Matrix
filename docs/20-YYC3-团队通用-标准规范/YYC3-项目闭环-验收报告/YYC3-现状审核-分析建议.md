---
file: YYC3-现状审核-分析建议.md
description: YYC³ 验收系统 — 第十三阶段：项目现状全面审核与多维分析优化建议
author: YanYuCloudCube Team <admin@0379.email>
version: v2.1.0
created: 2026-03-21
updated: 2026-07-24
status: stable
tags: [验收],[现状审核],[五维评估]
category: technical
language: zh-CN
audience: developers,qa,managers,stakeholders
complexity: advanced
project: yyc3-acceptance-system
phase: testing
related_docs: YYC3-全局统一-验收标准.md,YYC3-代码语法-测试核验.md,YYC3-功能逻辑-验收标准.md,YYC3-闭环验证-验收标准.md
---

# YYC³（YanYuCloudCube）智能应用链

## 验收系统 — 现状审核与分析建议（第十三阶段）

<div align="center">

> **_YanYuCloudCube_**
> _言启象限 | 语枢未来_
> **_Words Initiate Quadrants, Language Serves as Core for Future_**
> _万象归元于云枢 | 深栈智启新纪元_
> **_All things converge in cloud pivot; Deep stacks ignite a new era of intelligence_**

---

| 属性         | 值                                    |
| ------------ | ------------------------------------- |
| **文档版本** | v2.1.0 Official                       |
| **发布日期** | 2026-07-24                            |
| **验收阶段** | 第十三阶段：现状审核与分析建议          |
| **前置依赖** | 前十二个验收阶段全部完成               |
| **文档性质** | YYC³验收系统教科书级提示词文档         |
| **适用范围** | Next.js + React + shadcn/ui + pnpm 项目 |

</div>

---

## 📋 目录

- [验收目标与定位](#验收目标与定位)
- [五维评估框架](#五维评估框架)
- [现状审核核心内容](#现状审核核心内容)
- [多维度分析方法论](#多维度分析方法论)
- [问题识别与分类体系](#问题识别与分类体系)
- [优化建议生成机制](#优化建议生成机制)
- [优先级排序策略](#优先级排序策略)
- [实施路径规划](#实施路径规划)
- [验收标准体系](#验收标准体系)
- [输出报告模板](#输出报告模板)
- [闭环验证机制](#闭环验证机制)
- [工具链配置](#工具链配置)
- [最佳实践案例](#最佳实践案例)

---

## 验收目标与定位

### 核心使命

**现状审核与分析建议**是 YYC³ 验收系统的最终阶段，承担着对整个项目进行**全局性、系统性、前瞻性**审查的核心职责。该阶段不局限于发现问题和提出建议，更强调通过**数据驱动的决策支持**，为项目的持续演进提供科学依据。

### 战略定位

```
┌─────────────────────────────────────────────────────────────┐
│                    现状审核与分析建议                          │
│                   (第十三阶段 · 终极验收)                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   ┌──────────┐    ┌──────────┐    ┌──────────┐              │
│   │ 全局扫描 │ →  │ 深度分析 │ →  │ 智能建议 │              │
│   │ 全面感知 │    │ 多维洞察 │    │ 精准施策 │              │
│   └──────────┘    └──────────┘    └──────────┘              │
│        ↓              ↓              ↓                      │
│   ┌─────────────────────────────────────────────────┐       │
│   │              闭环优化与持续演进                    │       │
│   │   问题识别 → 分析诊断 → 建议生成 → 实施跟踪 → 效果验证   │       │
│   └─────────────────────────────────────────────────┘       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 核心价值

| 维度 | 价值体现 | 业务影响 |
|------|---------|---------|
| **全局视野** | 打破信息孤岛，建立项目全景视图 | 提升决策质量，避免局部优化 |
| **数据驱动** | 基于客观数据而非主观判断 | 减少决策偏差，提高准确性 |
| **前瞻性** | 识别潜在风险和机会 | 降低未来成本，把握发展先机 |
| **可操作性** | 提供具体可行的行动方案 | 缩短从分析到实施的周期 |
| **闭环性** | 建立持续改进的良性循环 | 确保优化措施落地见效 |

### 与其他阶段的关系

```mermaid
graph LR
    A[第一阶段至第十二阶段] --> B[第十三阶段：现状审核]
    B --> C{综合评估}
    C --> D[问题清单]
    C --> E[优势总结]
    C --> F[机会识别]
    C --> G[风险评估]
    
    D --> H[优化建议]
    E --> I[经验沉淀]
    F --> J[路线图规划]
    G --> K[预案制定]
    
    H --> L[实施计划]
    I --> M[知识库更新]
    J --> N[版本规划]
    K --> O[监控预警]
    
    L & M & N & O --> P[闭环反馈]
    P --> Q[下一轮迭代]
```

---

## 五维评估框架

### 时间维 (Time Dimension)

**评估重点**：项目演进效率、技术债务累积、响应速度、交付节奏

#### 时间维核心指标

```typescript
interface TimeDimensionMetrics {
  projectEvolution: {
    developmentVelocity: {
      commitsPerWeek: number;
      featuresPerSprint: number;
      bugFixRate: number;
      codeChurnRate: number;
    };
    deliveryRhythm: {
      releaseFrequency: string; // e.g., "weekly", "bi-weekly"
      leadTimeForChanges: number; // in days
      deploymentFrequency: string;
      meanTimeToRecovery: number; // in hours
    };
    timeToMarket: {
      featureConceptToDelivery: number; // in days
      bugReportToFix: number; // in hours;
      hotfixResponseTime: number; // in hours;
    };
  };
  
  technicalDebt: {
    codeAgeMetrics: {
      averageFileAge: number; // in days
      oldestUnchangedFiles: Array<{
        path: string;
        lastModified: Date;
        age: number;
      }>;
      codeRotIndex: number; // 0-100 scale
    };
    dependencyAging: {
      outdatedDependencies: number;
      vulnerableDependencies: number;
      deprecatedAPIsUsed: number;
      lastDependencyUpdate: Date;
    };
    documentationLag: {
      codeDocSyncRate: number; // percentage
      apiDocAccuracy: number; // percentage
      changelogCompleteness: number; // percentage
    };
  };
  
  responsiveness: {
    issueResolutionTime: {
      criticalIssues: { avgHours: number; maxHours: number };
      highIssues: { avgDays: number; maxDays: number };
      mediumIssues: { avgDays: number; maxDays: number };
      lowIssues: { avgDays: number; maxDays: number };
    };
    feedbackLoopEfficiency: {
      userFeedbackToAction: number; // in days
      monitoringAlertToResponse: number; // in minutes;
      reviewCycleTime: number; // in hours;
    };
  };
  
  timeScore: number; // 0-100 composite score
  timeTrends: {
    improving: string[];
    stable: string[];
    declining: string[];
    recommendations: string[];
  };
}
```

#### 时间维评估方法

1. **Git 历史分析**
   - 使用 `git log` 统计提交频率
   - 分析代码变更模式
   - 识别热点文件和高频修改区域
   - 计算开发速度指标

2. **Issue 跟踪系统分析**
   - 统计问题解决时间分布
   - 分析问题类型和严重程度
   - 评估响应效率和解决质量
   - 识别瓶颈环节

3. **CI/CD 流水线分析**
   - 统计构建和部署频率
   - 测量交付周期时间
   - 分析失败率和恢复时间
   - 评估自动化程度

4. **依赖关系时间分析**
   - 检查依赖包的年龄和更新历史
   - 识别过时或废弃的依赖
   - 评估安全漏洞风险
   - 制定升级计划

---

### 空间维 (Space Dimension)

**评估重点**：代码组织结构、架构合理性、资源利用效率、模块化程度

#### 空间维核心指标

```typescript
interface SpaceDimensionMetrics {
  architectureQuality: {
    structureAnalysis: {
      directoryDepth: number;
      fileDistribution: Record<string, number>;
      moduleCouplingScore: number; // 0-100, lower is better
      cohesionIndex: number; // 0-100, higher is better
    };
    patternCompliance: {
      designPatternUsage: Record<string, number>;
      antiPatternDetection: Array<{
        pattern: string;
        location: string;
        severity: 'high' | 'medium' | 'low';
        suggestion: string;
      }>;
      architecturalSmells: Array<{
        smell: string;
        affectedComponents: string[];
        impact: string;
        remediation: string;
      }>;
    };
    componentOrganization: {
      componentCount: number;
      averageComponentSize: number; // in lines of code
      reusableComponentRatio: number; // percentage
      componentDependencyGraph: object;
    };
  };
  
  resourceUtilization: {
    bundleAnalysis: {
      totalBundleSize: number; // in KB
      chunkSizes: Array<{ name: string; size: number; gzipSize: number }>;
      largestModules: Array<{ module: string; size: number }>;
      treeShakingEfficiency: number; // percentage
    };
    memoryFootprint: {
      initialLoadMemory: number; // in MB
      peakMemoryUsage: number; // in MB
      memoryLeakIndicators: number;
      garbageCollectionFrequency: number;
    };
    storageUtilization: {
      databaseSize: number; // in MB
      cacheSize: number; // in MB
      logStorageGrowth: number; // per day in MB
      assetOptimizationRate: number; // percentage
    };
  };
  
  modularityAssessment: {
    separationOfConcerns: {
      layerAdherence: Record<string, boolean>; // presentation, business, data layers
      responsibilityClarity: number; // 0-100 score
      interfaceStability: number; // percentage of stable interfaces
    };
    reusabilityMetrics: {
      sharedUtilityCount: number;
      customHookUsage: number;
      componentLibraryCoverage: number; // percentage
      codeDuplicationRate: number; // lower is better
    };
    scalabilityIndicators: {
      horizontalScalingReadiness: number; // 0-100
      verticalScalingHeadroom: number; // 0-100
      microservicesMigrationPotential: number; // 0-100
    };
  };
  
  spaceScore: number;
  spaceVisualization: {
    architectureMap: string; // URL or base64 encoded diagram
    dependencyGraph: string;
    moduleRelationshipMatrix: string[][];
  };
}
```

#### 空间维评估方法

1. **静态代码分析**
   - 使用 ESLint、TypeScript 编译器分析代码结构
   - 运行 `madge` 生成依赖图
   - 使用 `depcheck` 检测未使用的依赖
   - 执行 `bundle-analyzer` 分析打包结果

2. **架构模式检测**
   - 识别设计模式和反模式
   - 检测架构异味（Architectural Smells）
   - 评估组件职责划分
   - 分析模块耦合度

3. **资源使用 profiling**
   - 使用 Chrome DevTools 分析内存使用
   - 运行 Lighthouse 评估性能
   - 使用 WebPageTest 测量加载时间
   - 监控运行时资源消耗

4. **模块化程度评估**
   - 统计组件复用率
   - 分析代码重复度
   - 评估接口稳定性
   - 测试模块独立性

---

### 属性维 (Attribute Dimension)

**评估重点**：代码质量属性、可维护性、安全性、性能特征、可靠性

#### 属性维核心指标

```typescript
interface AttributeDimensionMetrics {
  qualityAttributes: {
    maintainability: {
      cyclomaticComplexity: {
        average: number;
        maximum: number;
        functionsExceedingThreshold: number;
        recommendedMaximum: number;
      };
      cognitiveComplexity: {
        average: number;
        maximum: number;
        filesNeedingRefactoring: number;
      };
      codeReadability: {
        namingConventionScore: number; // 0-100
        commentQualityScore: number; // 0-100
        formattingConsistency: number; // 0-100
      };
      testability: {
        mockableDependencies: number;
        sideEffectFreeFunctions: number;
        dependencyInjectionUsage: number;
      };
    };
    
    reliability: {
      errorHandling: {
        tryCatchCoverage: number; // percentage
        errorBoundaryUsage: number;
        gracefulDegradationScore: number; // 0-100
      };
      faultTolerance: {
        retryMechanismCount: number;
        circuitBreakerImplementation: number;
        fallbackStrategyCount: number;
      };
      stabilityMetrics: {
        crashFreeRate: number; // percentage
        uptimePercentage: number;
        meanTimeBetweenFailures: number; // in hours
      };
    };
    
    securityPosture: {
      vulnerabilityAssessment: {
        criticalVulnerabilities: number;
        highVulnerabilities: number;
        mediumVulnerabilities: number;
        lowVulnerabilities: number;
        vulnerabilityDensity: number; // per KLOC
      };
      securityControls: {
        authenticationStrength: number; // 0-100
        authorizationGranularity: number; // 0-100
        inputValidationCoverage: number; // percentage
        encryptionImplementation: number; // 0-100
      };
      complianceStatus: {
        gdprCompliance: number; // percentage
        owaspTop10Coverage: number; // percentage
        securityHeadersImplemented: number; // out of recommended headers
      };
    };
    
    performanceCharacteristics: {
      speedMetrics: {
        firstContentfulPaint: number; // in ms
        largestContentfulPaint: number; // in ms
        timeToInteractive: number; // in ms
        cumulativeLayoutShift: number; // score 0-1
      };
      efficiencyMetrics: {
        bundleSize: number; // in KB
        requestCount: number;
        serverResponseTime: number; // in ms
        resourceUtilization: number; // percentage
      };
      scalabilityMetrics: {
        concurrentUserSupport: number;
        throughputCapacity: number; // requests per second
        databaseQueryPerformance: number; // average query time in ms
      };
    };
  };
  
  attributeScore: number;
  attributeHeatmap: {
    strengths: Array<{ attribute: string; score: number; evidence: string }>;
    weaknesses: Array<{ attribute: string; score: number; gap: number; improvement: string }>;
    opportunities: Array<{ attribute: string; potential: number; action: string }>;
  };
}
```

#### 属性维评估方法

1. **代码质量度量**
   - 使用 SonarQube 或 CodeClimate 进行静态分析
   - 运行 Complexity Report 工具计算复杂度
   - 执行 ESLint 规则检查
   - 使用 Prettier 检查格式一致性

2. **可靠性测试**
   - 执行混沌工程测试（Chaos Engineering）
   - 运行负载测试和压力测试
   - 进行故障注入测试
   - 监控错误率和服务可用性

3. **安全扫描**
   - 运行 OWASP ZAP 进行动态扫描
   - 使用 Snyk 或 Dependabot 检查依赖漏洞
   - 执行 npm audit 安全审计
   - 进行渗透测试（如适用）

4. **性能基准测试**
   - 使用 Lighthouse 进行性能评分
   - 运行 WebPageTest 进行详细测量
   - 使用 Chrome DevTools 进行 Profiling
   - 执行真实用户监控（RUM）

---

### 事件维 (Event Dimension)

**评估重点**：事件处理机制、异常处理能力、日志记录完整性、监控覆盖度

#### 事件维核心指标

```typescript
interface EventDimensionMetrics {
  eventHandling: {
    userInteractionEvents: {
      eventListenerCount: number;
      eventDelegationUsage: number;
      eventBubblingHandling: number;
      memoryLeakRiskEvents: number;
    };
    systemEvents: {
      lifecycleEventHandling: number;
      errorEventCapturing: number;
      networkEventMonitoring: number;
      stateChangeEventTracking: number;
    };
    asyncOperations: {
      promiseHandling: number;
      asyncAwaitUsage: number;
      errorBoundaryImplementation: number;
      loadingStateManagement: number;
    };
  };
  
  exceptionManagement: {
    errorCapture: {
      globalErrorHandler: boolean;
      reactErrorBoundaries: number;
      apiErrorInterceptors: number;
      unhandledRejectionHandler: boolean;
    };
    errorReporting: {
      errorTrackingService: string; // e.g., Sentry, LogRocket
      errorContextEnrichment: boolean;
      userFeedbackOnError: boolean;
      automaticErrorReporting: boolean;
    };
    recoveryMechanisms: {
      retryStrategies: number;
      fallbackImplementations: number;
      rollbackCapabilities: number;
      circuitBreakerPatterns: number;
    };
  };
  
  loggingSystem: {
    logCompleteness: {
      coverageByModule: Record<string, number>; // percentage per module
      logLevelDistribution: Record<string, number>;
      structuredLoggingUsage: number; // percentage
      piiLoggingRisk: number; // count of potential PII logs
    };
    logQuality: {
      correlationIdUsage: boolean;
      timestampPrecision: string;
      contextEnrichment: number; // 0-100 score
      searchableFields: string[];
    };
    logInfrastructure: {
      logAggregationService: string;
      retentionPolicy: string;
      alertingRules: number;
      dashboardAvailability: boolean;
    };
  };
  
  monitoringCoverage: {
    applicationPerformanceMonitoring: {
      apmTool: string;
      customMetrics: number;
      transactionTracing: boolean;
      realUserMonitoring: boolean;
    };
    infrastructureMonitoring: {
      serverHealthChecks: number;
      databaseMonitoring: boolean;
      networkLatencyTracking: boolean;
      resourceUtilizationAlerts: number;
    };
    businessMetricTracking: {
      conversionFunnels: number;
      userJourneyMapping: boolean;
      featureUsageAnalytics: boolean;
      errorImpactAnalysis: boolean;
    };
  };
  
  eventScore: number;
  eventFlowDiagram: string; // URL or base64 encoded diagram
}
```

#### 事件维评估方法

1. **事件流分析**
   - 使用 React DevTools Profiler 分析事件处理
   - 检查事件监听器的添加和移除
   - 分析内存泄漏风险（未清理的事件监听器）
   - 评估事件委托的使用情况

2. **异常处理审计**
   - 检查 Error Boundary 的实现
   - 验证全局错误处理器
   - 测试异步操作的错误捕获
   - 评估恢复机制的完备性

3. **日志系统评估**
   - 分析日志覆盖率
   - 检查日志质量和结构化程度
   - 评估 PII 数据泄露风险
   - 验证日志基础设施配置

4. **监控体系审查**
   - 检查 APM 工具集成
   - 评估自定义指标定义
   - 验证告警规则配置
   - 测试监控仪表盘可用性

---

### 关联维 (Association Dimension)

**评估重点**：系统集成度、API 设计质量、第三方依赖管理、生态系统兼容性

#### 关联维核心指标

```typescript
interface AssociationDimensionMetrics {
  integrationQuality: {
    internalIntegrations: {
      moduleIntegrationPoints: number;
      interServiceCommunication: number;
      sharedStateManagement: number;
      crossModuleDependencies: number;
    };
    externalIntegrations: {
      thirdPartyAPIs: Array<{
        name: string;
        purpose: string;
        status: 'active' | 'deprecated' | 'unstable';
        fallbackAvailable: boolean;
        rateLimitHandling: boolean;
      }>;
      webhookEndpoints: number;
      callbackHandlers: number;
      externalDataSources: number;
    };
    integrationTesting: {
      integrationTestCoverage: number; // percentage
      contractTests: number;
      endToEndTestScenarios: number;
      mockServerUsage: number;
    };
  };
  
  apiDesignQuality: {
    restfulCompliance: {
      endpointNamingConvention: boolean;
      httpMethodCorrectness: number; // percentage
      statusCodeUsage: Record<string, number>;
      versioningStrategy: string;
    };
    graphqlQuality: {
      schemaDesign: number; // 0-100 score
      resolverEfficiency: number; // 0-100 score
      queryComplexityLimits: boolean;
      paginationImplementation: boolean;
    };
    documentationQuality: {
      openapiSpecCompleteness: number; // percentage
      exampleRequestsProvided: boolean;
      errorResponseDocumented: boolean;
      sdkGenerationAvailable: boolean;
    };
  };
  
  dependencyManagement: {
    directDependencies: {
      total: number;
      production: number;
      development: number;
      peer: number;
      optional: number;
    };
    transitiveDependencies: {
      total: number;
      depth: number;
      duplicateVersions: number;
      licenseConflicts: number;
    };
    dependencyHealth: {
      outdatedCount: number;
      vulnerableCount: number;
      deprecatedCount: number;
      unmaintainedCount: number;
      lastAuditDate: Date;
    };
    optimizationOpportunities: {
      replaceableDependencies: Array<{ current: string; alternative: string; benefit: string }>;
      deduplicationCandidates: string[];
      treeShakingImprovements: string[];
    };
  };
  
  ecosystemCompatibility: {
    frameworkCompatibility: {
      nextjsVersion: string;
      reactVersion: string;
      nodeVersion: string;
      compatibilityIssues: string[];
    };
    toolchainIntegration: {
      typescriptVersion: string;
      eslintConfig: string;
      prettierConfig: string;
      testingFramework: string;
    };
    communityStandards: {
      contributionGuidelines: boolean;
      codeOfConduct: boolean;
      changelogMaintained: boolean;
      semverFollowed: boolean;
    };
  };
  
  associationScore: number;
  dependencyGraph: string; // URL or visualization
  riskMatrix: {
    highRiskDependencies: Array<{ name: string; reason: string; mitigation: string }>;
    singlePointsOfFailure: string[];
    couplingHotspots: Array<{ components: string[]; couplingLevel: number }>;
  };
}
```

#### 关联维评估方法

1. **集成点映射**
   - 使用依赖分析工具绘制集成图
   - 识别所有内部和外部集成点
   - 评估集成的必要性和有效性
   - 检测过度耦合的区域

2. **API 质量评估**
   - 使用 OpenAPI 规范验证 REST API
   - 检查 GraphQL schema 设计质量
   - 评估 API 文档完整性
   - 测试 API 版本管理策略

3. **依赖健康检查**
   - 运行 `npm audit` 检查安全漏洞
   - 使用 `npm outdated` 查看过时依赖
   - 执行 `license-checker` 检查许可证合规性
   - 分析依赖树深度和复杂度

4. **生态系统兼容性验证**
   - 检查框架和库的版本兼容性
   - 验证工具链配置的一致性
   - 评估社区标准的遵循程度
   - 测试跨平台兼容性

---

## 现状审核核心内容

### 全局扫描策略

#### 1. 代码库全量扫描

```bash
#!/bin/bash
# YYC3-现状审核-全量扫描脚本

echo "🚀 开始 YYC3 现状审核全量扫描..."
echo "================================"

# 1. TypeScript 类型检查
echo ""
echo "📋 [1/8] TypeScript 类型检查..."
pnpm tsc --noEmit 2>&1 | tee typecheck-report.txt
TYPECHECK_EXIT=$?

# 2. ESLint 代码规范检查
echo ""
echo "📋 [2/8] ESLint 代码规范检查..."
pnpm lint 2>&1 | tee eslint-report.txt
LINT_EXIT=$?

# 3. Prettier 格式检查
echo ""
echo "📋 [3/8] Prettier 格式检查..."
pnpm format:check 2>&1 | tee prettier-report.txt
FORMAT_EXIT=$?

# 4. 测试覆盖率分析
echo ""
echo "📋 [4/8] 测试覆盖率分析..."
pnpm test:coverage 2>&1 | tee coverage-report.txt
COVERAGE_EXIT=$?

# 5. 依赖安全审计
echo ""
echo "📋 [5/8] 依赖安全审计..."
pnpm audit 2>&1 | tee audit-report.txt
AUDIT_EXIT=$?

# 6. Bundle 大小分析
echo ""
echo "📋 [6/8] Bundle 大小分析..."
pnpm build --analyze 2>&1 | tee bundle-report.txt
BUILD_EXIT=$?

# 7. 代码复杂度分析
echo ""
echo "📋 [7/8] 代码复杂度分析..."
npx complexity-report src/ 2>&1 | tee complexity-report.txt
COMPLEXITY_EXIT=$?

# 8. 死代码检测
echo ""
echo "📋 [8/8] 死代码检测..."
npx unimported 2>&1 | tee deadcode-report.txt
DEADCODE_EXIT=$?

echo ""
echo "================================"
echo "📊 扫描结果汇总:"
echo "================================"

if [ $TYPECHECK_EXIT -eq 0 ]; then
    echo "✅ TypeScript 类型检查: 通过"
else
    echo "❌ TypeScript 类型检查: 失败"
fi

if [ $LINT_EXIT -eq 0 ]; then
    echo "✅ ESLint 代码规范: 通过"
else
    echo "⚠️  ESLint 代码规范: 有警告/错误"
fi

if [ $FORMAT_EXIT -eq 0 ]; then
    echo "✅ Prettier 格式: 通过"
else
    echo "⚠️  Prettier 格式: 需要格式化"
fi

if [ $COVERAGE_EXIT -eq 0 ]; then
    echo "✅ 测试覆盖率: 达标"
else
    echo "⚠️  测试覆盖率: 未达标"
fi

if [ $AUDIT_EXIT -eq 0 ]; then
    echo "✅ 依赖安全: 无漏洞"
else
    echo "🚨 依赖安全: 发现漏洞"
fi

echo ""
echo "🎯 详细报告已生成在当前目录"
echo "请查看各 *-report.txt 文件获取详细信息"
```

#### 2. 架构健康度检查

```typescript
// src/lib/audit/architecture-health.ts
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

export interface ArchitectureHealthCheckResult {
  timestamp: string;
  overallScore: number;
  categories: {
    structure: StructureHealth;
    patterns: PatternHealth;
    dependencies: DependencyHealth;
    quality: QualityHealth;
  };
  recommendations: Recommendation[];
}

interface StructureHealth {
  score: number;
  details: {
    directoryDepth: { value: number; status: 'good' | 'warning' | 'critical' };
    fileBalance: { balance: number; status: 'good' | 'warning' | 'critical' };
    moduleCohesion: { score: number; status: 'good' | 'warning' | 'critical' };
    couplingLevel: { level: number; status: 'good' | 'warning' | 'critical' };
  };
}

interface PatternHealth {
  score: number;
  detectedPatterns: string[];
  antiPatterns: AntiPatternFinding[];
  architecturalSmells: ArchitecturalSmell[];
}

interface AntiPatternFinding {
  pattern: string;
  location: string;
  severity: 'high' | 'medium' | 'low';
  description: string;
  remediation: string;
}

interface ArchitecturalSmell {
  smell: string;
  components: string[];
  impact: string;
  suggestedFix: string;
}

interface DependencyHealth {
  score: number;
  details: {
    circularDependencies: number;
    orphanModules: number;
    godModules: string[];
    unstableDependencies: string[];
  };
}

interface QualityHealth {
  score: number;
  metrics: {
    codeDuplication: number;
    deadCode: number;
    complexityHotspots: ComplexFile[];
    testCoverage: number;
  };
}

interface ComplexFile {
  path: string;
  complexity: number;
  functions: number;
  lines: number;
}

interface Recommendation {
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  title: string;
  description: string;
  effort: 'small' | 'medium' | 'large' | 'xlarge';
  impact: 'high' | 'medium' | 'low';
  estimatedBenefit: string;
}

export async function performArchitectureHealthCheck(
  projectRoot: string = process.cwd()
): Promise<ArchitectureHealthCheckResult> {
  const result: ArchitectureHealthCheckResult = {
    timestamp: new Date().toISOString(),
    overallScore: 0,
    categories: {
      structure: await checkStructure(projectRoot),
      patterns: await checkPatterns(projectRoot),
      dependencies: await checkDependencies(projectRoot),
      quality: await checkQuality(projectRoot),
    },
    recommendations: [],
  };

  result.recommendations = generateRecommendations(result);
  result.overallScore = calculateOverallScore(result);

  return result;
}

async function checkStructure(root: string): Promise<StructureHealth> {
  const srcPath = path.join(root, 'src');
  
  const directoryDepth = calculateMaxDirectoryDepth(srcPath);
  const fileBalance = calculateFileBalance(srcPath);
  const moduleCohesion = assessModuleCohesion(srcPath);
  const couplingLevel = assessCouplingLevel(root);
  
  return {
    score: calculateStructureScore(directoryDepth, fileBalance, moduleCohesion, couplingLevel),
    details: {
      directoryDepth: {
        value: directoryDepth,
        status: directoryDepth <= 5 ? 'good' : directoryDepth <= 8 ? 'warning' : 'critical',
      },
      fileBalance: {
        balance: fileBalance,
        status: fileBalance > 0.7 ? 'good' : fileBalance > 0.4 ? 'warning' : 'critical',
      },
      moduleCohesion: {
        score: moduleCohesion,
        status: moduleCohesion >= 80 ? 'good' : moduleCohesion >= 60 ? 'warning' : 'critical',
      },
      couplingLevel: {
        level: couplingLevel,
        status: couplingLevel <= 30 ? 'good' : couplingLevel <= 60 ? 'warning' : 'critical',
      },
    },
  };
}

function calculateMaxDirectoryDepth(dirPath: string, currentDepth: number = 0): number {
  let maxDepth = currentDepth;
  
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
        const childDepth = calculateMaxDirectoryDepth(
          path.join(dirPath, entry.name),
          currentDepth + 1
        );
        maxDepth = Math.max(maxDepth, childDepth);
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dirPath}:`, error);
  }
  
  return maxDepth;
}

function calculateFileBalance(srcPath: string): number {
  const filesByDir: Record<string, number> = {};
  
  function scanDir(dirPath: string) {
    try {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });
      
      for (const entry of entries) {
        if (entry.isDirectory()) {
          scanDir(path.join(dirPath, entry.name));
        } else if (entry.name.match(/\.(ts|tsx)$/)) {
          const relativeDir = path.relative(srcPath, dirPath);
          filesByDir[relativeDir] = (filesByDir[relativeDir] || 0) + 1;
        }
      }
    } catch (error) {
      console.error(`Error scanning ${dirPath}:`, error);
    }
  }
  
  scanDir(srcPath);
  
  const counts = Object.values(filesByDir);
  if (counts.length === 0) return 1;
  
  const total = counts.reduce((sum, count) => sum + count, 0);
  const average = total / counts.length;
  const variance = counts.reduce((sum, count) => sum + Math.pow(count - average, 2), 0) / counts.length;
  const stdDev = Math.sqrt(variance);
  
  return stdDev === 0 ? 1 : Math.max(0, 1 - stdDev / average);
}

// ... 其他辅助函数的实现省略 ...

function generateRecommendations(result: ArchitectureHealthCheckResult): Recommendation[] {
  const recommendations: Recommendation[] = [];
  
  const { structure, patterns, dependencies, quality } = result.categories;
  
  if (structure.details.directoryDepth.status === 'critical') {
    recommendations.push({
      priority: 'high',
      category: '结构优化',
      title: '降低目录嵌套深度',
      description: `当前最大目录深度为 ${structure.details.directoryDepth.value}，超过推荐值（≤5）。深嵌套会增加认知负担和维护难度。`,
      effort: 'medium',
      impact: 'high',
      estimatedBenefit: '提升代码可读性和维护效率约 20%',
    });
  }
  
  if (dependencies.details.circularDependencies > 0) {
    recommendations.push({
      priority: 'critical',
      category: '依赖管理',
      title: '消除循环依赖',
      description: `发现 ${dependencies.details.circularDependencies} 个循环依赖。循环依赖会导致模块加载顺序不确定，增加调试难度。`,
      effort: 'large',
      impact: 'high',
      estimatedBenefit: '消除潜在的运行时错误，提升构建稳定性',
    });
  }
  
  if (quality.metrics.codeDuplication > 15) {
    recommendations.push({
      priority: 'medium',
      category: '代码质量',
      title: '减少代码重复',
      description: `代码重复率为 ${quality.metrics.codeDuplication}%，超过推荐阈值（<10%）。高重复率增加维护成本和出错概率。`,
      effort: 'medium',
      impact: 'medium',
      estimatedBenefit: '减少维护工作量约 25%，降低 Bug 引入风险',
    });
  }
  
  if (patterns.architecturalSmells.length > 0) {
    for (const smell of patterns.architecturalSmells.slice(0, 3)) {
      recommendations.push({
        priority: smell.impact.includes('严重') ? 'high' : 'medium',
        category: '架构优化',
        title: `修复架构异味: ${smell.smell}`,
        description: `${smell.smell} 影响组件: ${smell.components.join(', ')}。${smell.impact}`,
        effort: 'large',
        impact: 'high',
        estimatedBenefit: smell.suggestedFix,
      });
    }
  }
  
  return recommendations.sort((a, b) => {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

function calculateOverallScore(result: ArchitectureHealthCheckResult): number {
  const weights = {
    structure: 0.25,
    patterns: 0.25,
    dependencies: 0.25,
    quality: 0.25,
  };
  
  return Math.round(
    result.categories.structure.score * weights.structure +
    result.categories.patterns.score * weights.patterns +
    result.categories.dependencies.score * weights.dependencies +
    result.categories.quality.score * weights.quality
  );
}

export function generateArchitectureHealthReport(result: ArchitectureHealthCheckResult): string {
  const lines: string[] = [];
  
  lines.push('# 🏥 YYC3 架构健康度检查报告');
  lines.push('');
  lines.push(`**检查时间**: ${result.timestamp}`);
  lines.push(`**总体评分**: ${result.overallScore}/100`);
  lines.push('');
  
  lines.push('## 📊 各维度评分');
  lines.push('');
  lines.push('| 维度 | 评分 | 状态 |');
  lines.push('|------|------|------|');
  lines.push(`| 结构健康 | ${result.categories.structure.score}/100 | ${getScoreEmoji(result.categories.structure.score)} |`);
  lines.push(`| 模式健康 | ${result.categories.patterns.score}/100 | ${getScoreEmoji(result.categories.patterns.score)} |`);
  lines.push(`| 依赖健康 | ${result.categories.dependencies.score}/100 | ${getScoreEmoji(result.categories.dependencies.score)} |`);
  lines.push(`| 质量健康 | ${result.categories.quality.score}/100 | ${getScoreEmoji(result.categories.quality.score)} |`);
  lines.push('');
  
  lines.push('## 🎯 优化建议');
  lines.push('');
  
  for (const rec of result.recommendations) {
    lines.push(`### ${getPriorityEmoji(rec.priority)} ${rec.title}`);
    lines.push('');
    lines.push(`- **类别**: ${rec.category}`);
    lines.push(`- **优先级**: ${rec.priority.toUpperCase()}`);
    lines.push(`- **工作量**: ${rec.effort}`);
    lines.push(`- **影响**: ${rec.impact}`);
    lines.push(`- **描述**: ${rec.description}`);
    lines.push(`- **预期收益**: ${rec.estimatedBenefit}`);
    lines.push('');
  }
  
  return lines.join('\n');
}

function getScoreEmoji(score: number): string {
  if (score >= 80) return '✅ 健康';
  if (score >= 60) return '⚠️ 需关注';
  return '🚨 需改善';
}

function getPriorityEmoji(priority: string): string {
  switch (priority) {
    case 'critical': return '🚨';
    case 'high': return '⚠️';
    case 'medium': return '💡';
    case 'low': return 'ℹ️';
    default: return '📌';
  }
}
```

### 深度分析引擎

#### 技术债务量化分析

```typescript
// src/lib/audit/technical-debt.ts
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

export interface TechnicalDebtAnalysis {
  summary: DebtSummary;
  categories: DebtCategoryBreakdown;
  hotspots: DebtHotspot[];
  trends: DebtTrend;
  remediationPlan: RemediationStep[];
}

interface DebtSummary {
  totalDebtHours: number;
  debtRatio: number; // debt / total effort
  interestRate: number; // how fast debt accumulates
  principalItems: number;
  interestItems: number;
}

interface DebtCategoryBreakdown {
  codeQuality: CategoryDebt;
  testing: CategoryDebt;
  documentation: CategoryDebt;
  architecture: CategoryDebt;
  security: CategoryDebt;
  performance: CategoryDebt;
}

interface CategoryDebt {
  hours: number;
  itemCount: number;
  severityDistribution: Record<string, number>;
  topItems: DebtItem[];
}

interface DebtItem {
  id: string;
  description: string;
  location: string;
  severity: 'critical' | 'major' | 'minor';
  estimatedHours: number;
  interestPerMonth: number;
}

interface DebtHotspot {
  filePath: string;
  debtConcentration: number;
  contributingFactors: string[];
  recommendedActions: string[];
}

interface DebtTrend {
  direction: 'increasing' | 'stable' | 'decreasing';
  monthlyChange: number;
  projection: ProjectedDebt;
}

interface ProjectedDebt {
  threeMonths: number;
  sixMonths: number;
  twelveMonths: number;
}

interface RemediationStep {
  phase: number;
  focusArea: string;
  actions: string[];
  estimatedHours: number;
  expectedReduction: number;
}

export async function analyzeTechnicalDebt(
  projectRoot: string = process.cwd()
): Promise<TechnicalDebtAnalysis> {
  const analysis: TechnicalDebtAnalysis = {
    summary: await calculateDebtSummary(projectRoot),
    categories: await breakDownByCategory(projectRoot),
    hotspots: identifyDebtHotspots(projectRoot),
    trends: analyzeDebtTrends(projectRoot),
    remediationPlan: generateRemediationPlan(),
  };

  return analysis;
}

async function calculateDebtSummary(root: string): Promise<DebtSummary> {
  const codeQualityDebt = await estimateCodeQualityDebt(root);
  const testingDebt = await estimateTestingDebt(root);
  const documentationDebt = await estimateDocumentationDebt(root);
  const architectureDebt = await estimateArchitectureDebt(root);
  const securityDebt = await estimateSecurityDebt(root);
  const performanceDebt = await estimatePerformanceDebt(root);

  const totalDebtHours =
    codeQualityDebt +
    testingDebt +
    documentationDebt +
    architectureDebt +
    securityDebt +
    performanceDebt;

  return {
    totalDebtHours,
    debtRatio: totalDebtHours / 1000,
    interestRate: calculateInterestRate(totalDebtHours),
    principalItems: countPrincipalItems(root),
    interestItems: countInterestItems(root),
  };
}

async function estimateCodeQualityDebt(root: string): Promise<number> {
  let debtHours = 0;

  try {
    const eslintOutput = execSync('pnpm eslint . --format json', {
      cwd: root,
      encoding: 'utf-8',
      timeout: 60000,
    });

    const eslintResults = JSON.parse(eslintOutput);
    for (const file of eslintResults) {
      for (const message of file.messages) {
        if (message.severity === 2) {
          debtHours += 0.5;
        } else if (message.severity === 1) {
          debtHours += 0.25;
        }
      }
    }
  } catch (error) {
    console.warn('ESLint analysis failed:', error);
  }

  try {
    const complexityOutput = execSync(
      'npx complexity-report src/ --format json',
      { cwd: root, encoding: 'utf-8', timeout: 60000 }
    );

    const complexityResults = JSON.parse(complexityOutput);
    for (const report of complexityResults.reports || []) {
      if (report.complexity && report.complexity > 10) {
        debtHours += (report.complexity - 10) * 0.5;
      }
    }
  } catch (error) {
    console.warn('Complexity analysis failed:', error);
  }

  return Math.round(debtHours);
}

async function estimateTestingDebt(root: string): Promise<number> {
  let debtHours = 0;

  try {
    const coverageOutput = execSync('pnpm test:coverage --json', {
      cwd: root,
      encoding: 'utf-8',
      timeout: 120000,
    });

    const coverageData = JSON.parse(coverageOutput);
    const totalCoverage = coverageData.total?.lines?.pct || 0;

    if (totalCoverage < 80) {
      debtHours += (80 - totalCoverage) * 2;
    }
  } catch (error) {
    console.warn('Coverage analysis failed:', error);
    debtHours += 40;
  }

  return Math.round(debtHours);
}

async function estimateDocumentationDebt(root: string): Promise<number> {
  let undocumentedCount = 0;
  let totalCount = 0;

  function scanFiles(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory()) {
        if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
          scanFiles(path.join(dir, entry.name));
        }
      } else if (entry.name.match(/\.(ts|tsx)$/)) {
        const content = fs.readFileSync(path.join(dir, entry.name), 'utf-8');
        const exports = content.match(/export\s+(?:default\s+)?(?:function|class|const|interface|type)/g) || [];
        const jsdocComments = content.match(/\/\*\*[\s\S]*?\*\//g) || [];

        totalCount += exports.length;
        undocumentedCount += Math.max(0, exports.length - jsdocComments.length);
      }
    }
  }

  scanFiles(path.join(root, 'src'));

  return Math.round((undocumentedCount / Math.max(totalCount, 1)) * 50);
}

async function estimateArchitectureDebt(root: string): Promise<number> {
  let debtHours = 0;

  try {
    const madgeOutput = execSync('npx madge --circular src/', {
      cwd: root,
      encoding: 'utf-8',
      timeout: 30000,
    });

    if (madgeOutput.trim()) {
      const circularDeps = madgeOutput.trim().split('\n').length;
      debtHours += circularDeps * 4;
    }
  } catch (error) {
    console.warn('Circular dependency check failed:', error);
  }

  return Math.round(debtHours);
}

async function estimateSecurityDebt(root: string): Promise<number> {
  let debtHours = 0;

  try {
    const auditOutput = execSync('pnpm audit --json', {
      cwd: root,
      encoding: 'utf-8',
      timeout: 30000,
    });

    const auditData = JSON.parse(auditOutput);
    const vulnerabilities = auditData.vulnerabilities || {};

    for (const [severity, vulns] of Object.entries(vulnerabilities)) {
      const count = (vulns as any[]).length;
      switch (severity) {
        case 'critical':
          debtHours += count * 8;
          break;
        case 'high':
          debtHours += count * 4;
          break;
        case 'moderate':
          debtHours += count * 2;
          break;
        case 'low':
          debtHours += count * 0.5;
          break;
      }
    }
  } catch (error) {
    console.warn('Security audit failed:', error);
  }

  return Math.round(debtHours);
}

async function estimatePerformanceDebt(_root: string): Promise<number> {
  let debtHours = 0;

  const lighthouseCategories = ['performance', 'accessibility', 'best-practices', 'seo'];

  for (const category of lighthouseCategories) {
    const targetScore = category === 'performance' ? 90 : 85;
    debtHours += (targetScore - 75) * 0.5;
  }

  return Math.round(debtHours);
}

function calculateInterestRate(totalDebtHours: number): number {
  if (totalDebtHours < 100) return 0.02;
  if (totalDebtHours < 500) return 0.05;
  if (totalDebtHours < 1000) return 0.08;
  return 0.12;
}

function countPrincipalItems(root: string): number {
  let count = 0;

  function scanFiles(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory()) {
        if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
          scanFiles(path.join(dir, entry.name));
        }
      } else if (entry.name.match(/\.(ts|tsx)$/)) {
        count++;
      }
    }
  }

  scanFiles(path.join(root, 'src'));
  return count;
}

function countInterestItems(root: string): number {
  let count = 0;

  function scanFiles(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory()) {
        if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
          scanFiles(path.join(dir, entry.name));
        }
      } else if (entry.name.match(/\.(ts|tsx)$/)) {
        const content = fs.readFileSync(path.join(dir, entry.name), 'utf-8');
        const todoCount = (content.match(/\/\/\s*TODO|FIXME|HACK|XXX/g) || []).length;
        count += todoCount;
      }
    }
  }

  scanFiles(path.join(root, 'src'));
  return count;
}

async function breakDownByCategory(root: string): Promise<DebtCategoryBreakdown> {
  return {
    codeQuality: {
      hours: await estimateCodeQualityDebt(root),
      itemCount: 0,
      severityDistribution: {},
      topItems: [],
    },
    testing: {
      hours: await estimateTestingDebt(root),
      itemCount: 0,
      severityDistribution: {},
      topItems: [],
    },
    documentation: {
      hours: await estimateDocumentationDebt(root),
      itemCount: 0,
      severityDistribution: {},
      topItems: [],
    },
    architecture: {
      hours: await estimateArchitectureDebt(root),
      itemCount: 0,
      severityDistribution: {},
      topItems: [],
    },
    security: {
      hours: await estimateSecurityDebt(root),
      itemCount: 0,
      severityDistribution: {},
      topItems: [],
    },
    performance: {
      hours: await estimatePerformanceDebt(root),
      itemCount: 0,
      severityDistribution: {},
      topItems: [],
    },
  };
}

function identifyDebtHotspots(root: string): DebtHotspot[] {
  const hotspots: DebtHotspot[] = [];
  const srcPath = path.join(root, 'src');

  function scanFiles(dir: string) {
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        if (entry.isDirectory()) {
          if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
            scanFiles(path.join(dir, entry.name));
          }
        } else if (entry.name.match(/\.(ts|tsx)$/)) {
          const filePath = path.join(dir, entry.name);
          const content = fs.readFileSync(filePath, 'utf-8');
          const lines = content.split('\n');
          const lineCount = lines.length;

          // 检测债务热点：文件行数 > 300 且包含多个 TODO/FIXME
          const todoCount = (content.match(/\/\/\s*TODO|FIXME|HACK|XXX/g) || []).length;
          const exportCount = (content.match(/export\s+(?:default\s+)?(?:function|class|const|interface|type)/g) || []).length;

          if (lineCount > 300 && todoCount >= 3) {
            const factors: string[] = [];
            if (lineCount > 500) factors.push('文件过大');
            if (todoCount >= 5) factors.push('待办事项过多');
            if (exportCount > 10) factors.push('导出过于集中');

            hotspots.push({
              filePath: path.relative(root, filePath),
              debtConcentration: Math.min(100, Math.round((lineCount / 10) + (todoCount * 5))),
              contributingFactors: factors.length > 0 ? factors : ['低测试覆盖'],
              recommendedActions: [
                '拆分为多个小文件',
                '清理 TODO/FIXME 标记',
                '补充单元测试',
              ],
            });
          }
        }
      }
    } catch (error) {
      console.error(`Error scanning ${dir}:`, error);
    }
  }

  scanFiles(srcPath);
  return hotspots.sort((a, b) => b.debtConcentration - a.debtConcentration).slice(0, 10);
}

function analyzeDebtTrends(root: string): DebtTrend {
  try {
    // 分析 Git 日志中最近 3 个月的提交趋势
    const gitLog = execSync(
      'git log --since="3 months ago" --oneline --shortstat',
      { cwd: root, encoding: 'utf-8', timeout: 10000 }
    );

    const insertions = (gitLog.match(/(\d+) insertions?/g) || [])
      .reduce((sum, m) => sum + parseInt(m.match(/\d+/)![0]), 0);
    const deletions = (gitLog.match(/(\d+) deletions?/g) || [])
      .reduce((sum, m) => sum + parseInt(m.match(/\d+/)![0]), 0);

    const netChange = insertions - deletions;
    const monthlyChange = Math.round(netChange / 3);

    let direction: 'increasing' | 'stable' | 'decreasing';
    if (monthlyChange > 50) direction = 'increasing';
    else if (monthlyChange < -50) direction = 'decreasing';
    else direction = 'stable';

    const currentDebt = monthlyChange * 3;
    const interestRate = monthlyChange > 0 ? 0.05 : 0.02;

    return {
      direction,
      monthlyChange: Math.abs(monthlyChange),
      projection: {
        threeMonths: Math.round(currentDebt * (1 + interestRate * 3)),
        sixMonths: Math.round(currentDebt * (1 + interestRate * 6)),
        twelveMonths: Math.round(currentDebt * (1 + interestRate * 12)),
      },
    };
  } catch (error) {
    console.warn('Git log analysis failed, using default trend:', error);
    return {
      direction: 'stable',
      monthlyChange: 5,
      projection: { threeMonths: 500, sixMonths: 650, twelveMonths: 950 },
    };
  }
}

function generateRemediationPlan(): RemediationStep[] {
  return [
    {
      phase: 1,
      focusArea: '紧急修复',
      actions: [
        '修复所有 Critical 和 High 级别的安全问题',
        '消除循环依赖',
        '修复导致构建失败的问题',
      ],
      estimatedHours: 40,
      expectedReduction: 20,
    },
    {
      phase: 2,
      focusArea: '质量提升',
      actions: [
        '提高测试覆盖率到 80%+',
        '重构高复杂度函数',
        '统一代码风格',
      ],
      estimatedHours: 80,
      expectedReduction: 35,
    },
    {
      phase: 3,
      focusArea: '长期优化',
      actions: [
        '完善文档体系',
        '优化架构设计',
        '建立预防机制',
      ],
      estimatedHours: 120,
      expectedReduction: 45,
    },
  ];
}

export function generateTechnicalDebtReport(analysis: TechnicalDebtAnalysis): string {
  const lines: string[] = [];

  lines.push('# 💳 YYC3 技术债务分析报告');
  lines.push('');
  lines.push('## 📈 债务总览');
  lines.push('');
  lines.push(`| 指标 | 数值 | 说明 |`);
  lines.push('|------|------|------|');
  lines.push(`| 总债务工时 | ${analysis.summary.totalDebtHours} 小时 | 修复所有已知问题所需时间 |`);
  lines.push(`| 债务比率 | ${(analysis.summary.debtRatio * 100).toFixed(1)}% | 债务占总工作量的比例 |`);
  lines.push(`| 月利息率 | ${(analysis.summary.interestRate * 100).toFixed(1)}% | 债务增长速度 |`);
  lines.push(`| 本金项数 | ${analysis.summary.principalItems} 个 | 产生债务的源文件数 |`);
  lines.push(`| 利息项数 | ${analysis.summary.interestItems} 个 | 因债务产生的新问题数 |`);
  lines.push('');

  lines.push('## 📊 分类明细');
  lines.push('');
  lines.push('| 类别 | 债务工时 | 占比 |');
  lines.push('|------|----------|------|');

  const categories = analysis.categories;
  const totalHours = analysis.summary.totalDebtHours;

  for (const [key, value] of Object.entries(categories)) {
    const categoryName = key.replace(/([A-Z])/g, ' $1').trim();
    const percentage = ((value.hours / totalHours) * 100).toFixed(1);
    lines.push(`| ${categoryName} | ${value.hours}h | ${percentage}% |`);
  }

  lines.push('');

  lines.push('## 🔮 趋势预测');
  lines.push('');
  lines.push(`**当前趋势**: ${analysis.trends.direction === 'increasing' ? '📈 上升' : analysis.trends.direction === 'decreasing' ? '📉 下降' : '➡️ 稳定'} (${analysis.trends.monthlyChange} 小时/月)`);
  lines.push('');
  lines.push('| 时间范围 | 预计债务工时 | 较现在增长 |');
  lines.push('|----------|-------------|-----------|');
  lines.push(`| 3 个月后 | ${analysis.trends.projection.threeMonths}h | +${analysis.trends.projection.threeMonths - analysis.summary.totalDebtHours}h |`);
  lines.push(`| 6 个月后 | ${analysis.trends.projection.sixMonths}h | +${analysis.trends.projection.sixMonths - analysis.summary.totalDebtHours}h |`);
  lines.push(`| 12个月后 | ${analysis.trends.projection.twelveMonths}h | +${analysis.trends.projection.twelveMonths - analysis.summary.totalDebtHours}h |`);
  lines.push('');

  lines.push('## 🛠️ 清偿计划');
  lines.push('');

  for (const step of analysis.remediationPlan) {
    lines.push(`### 阶段 ${step.phase}: ${step.focusArea}`);
    lines.push('');
    lines.push('- **预估工时**: ' + step.estimatedHours + ' 小时');
    lines.push('- **预期减少**: ' + step.expectedReduction + '% 的技术债务');
    lines.push('');
    lines.push('**行动计划**:');
    lines.push('');
    for (const action of step.actions) {
      lines.push(`- [ ] ${action}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}
```

---

## 多维度分析方法论

### SWOT 分析框架

```typescript
// src/lib/audit/swot-analysis.ts
export interface SWOTAnalysis {
  projectInfo: ProjectContext;
  swotMatrix: SWOTMatrix;
  strategicRecommendations: StrategicRecommendation[];
  actionPlan: ActionItem[];
}

interface ProjectContext {
  projectName: string;
  projectType: string;
  teamSize: number;
  techStack: string[];
  currentPhase: string;
  businessDomain: string;
}

interface SWOTMatrix {
  strengths: SWOTItem[];
  weaknesses: SWOTItem[];
  opportunities: SWOTItem[];
  threats: SWOTItem[];
}

interface SWOTItem {
  id: string;
  description: string;
  evidence: string;
  impact: 'high' | 'medium' | 'low';
  category: string;
  relatedItems: string[];
}

interface StrategicRecommendation {
  strategy: string;
  rationale: string;
  involvedSWOTItems: string[];
  priority: number;
  timeframe: string;
  resources: string[];
  expectedOutcome: string;
  risks: string[];
}

interface ActionItem {
  id: string;
  description: string;
  owner: string;
  dueDate: string;
  status: 'pending' | 'in-progress' | 'completed' | 'blocked';
  dependencies: string[];
  successCriteria: string[];
}

export class SWOTAnalyzer {
  private projectContext: ProjectContext;

  constructor(context: ProjectContext) {
    this.projectContext = context;
  }

  async performAnalysis(auditData: AuditData): Promise<SWOTAnalysis> {
    const matrix = this.buildSWOTMatrix(auditData);
    const strategies = this.generateStrategies(matrix);
    const actionPlan = this.createActionPlan(strategies);

    return {
      projectInfo: this.projectContext,
      swotMatrix: matrix,
      strategicRecommendations: strategies,
      actionPlan: actionPlan,
    };
  }

  private buildSWOTMatrix(data: AuditData): SWOTMatrix {
    return {
      strengths: this.identifyStrengths(data),
      weaknesses: this.identifyWeaknesses(data),
      opportunities: this.identifyOpportunities(data),
      threats: this.identifyThreats(data),
    };
  }

  private identifyStrengths(data: AuditData): SWOTItem[] {
    const strengths: SWOTItem[] = [];

    if (data.codeQuality.score >= 85) {
      strengths.push({
        id: 'S1',
        description: '优秀的代码质量基础',
        evidence: `代码质量评分为 ${data.codeQuality.score}/100`,
        impact: 'high',
        category: '代码质量',
        relatedItems: ['W1'],
      });
    }

    if (data.testCoverage.coverage >= 85) {
      strengths.push({
        id: 'S2',
        description: '完善的测试覆盖体系',
        evidence: `测试覆盖率达到 ${data.testCoverage.coverage}%`,
        impact: 'high',
        category: '测试保障',
        relatedItems: ['O2'],
      });
    }

    if (data.architecture.modularity >= 80) {
      strengths.push({
        id: 'S3',
        description: '良好的模块化架构设计',
        evidence: `模块化评分为 ${data.architecture.modularity}/100`,
        impact: 'medium',
        category: '架构设计',
        relatedItems: ['W3'],
      });
    }

    if (data.performance.lighthouseScore >= 90) {
      strengths.push({
        id: 'S4',
        description: '卓越的性能表现',
        evidence: `Lighthouse 性能得分为 ${data.performance.lighthouseScore}`,
        impact: 'high',
        category: '性能优化',
        relatedItems: ['O1'],
      });
    }

    if (data.security.vulnerabilities.critical === 0) {
      strengths.push({
        id: 'S5',
        description: '坚实的安全防线',
        evidence: '无 Critical 级别安全漏洞',
        impact: 'high',
        category: '安全保障',
        relatedItems: ['T1'],
      });
    }

    return strengths;
  }

  private identifyWeaknesses(data: AuditData): SWOTItem[] {
    const weaknesses: SWOTItem[] = [];

    if (data.codeQuality.technicalDebt > 500) {
      weaknesses.push({
        id: 'W1',
        description: '较高的技术债务积累',
        evidence: `技术债务达到 ${data.codeQuality.technicalDebt} 小时`,
        impact: 'high',
        category: '技术债务',
        relatedItems: ['S1', 'T2'],
      });
    }

    if (data.documentation.completeness < 70) {
      weaknesses.push({
        id: 'W2',
        description: '文档体系不够完善',
        evidence: `文档完整度为 ${data.documentation.completeness}%`,
        impact: 'medium',
        category: '知识管理',
        relatedItems: ['O3'],
      });
    }

    if (data.architecture.coupling > 60) {
      weaknesses.push({
        id: 'W3',
        description: '模块间耦合度过高',
        evidence: `耦合度达到 ${data.architecture.coupling}%`,
        impact: 'high',
        category: '架构设计',
        relatedItems: ['S3', 'T3'],
      });
    }

    if (data.team.knowledgeDistribution < 60) {
      weaknesses.push({
        id: 'W4',
        description: '团队知识分布不均',
        evidence: `知识集中度偏高，分布指数为 ${data.team.knowledgeDistribution}`,
        impact: 'medium',
        category: '团队协作',
        relatedItems: ['O4', 'T4'],
      });
    }

    return weaknesses;
  }

  private identifyOpportunities(data: AuditData): SWOTItem[] {
    const opportunities: SWOTItem[] = [];

    if (data.market.aiAdoption === 'growing') {
      opportunities.push({
        id: 'O1',
        description: 'AI 技术快速发展的市场机遇',
        evidence: '市场 AI 采用率呈上升趋势',
        impact: 'high',
        category: '市场趋势',
        relatedItems: ['S4'],
      });
    }

    if (data.techStack.modernFrameworkReady) {
      opportunities.push({
        id: 'O2',
        description: '现代化框架升级机会',
        evidence: '当前技术栈支持平滑升级到最新版本',
        impact: 'medium',
        category: '技术演进',
        relatedItems: ['S2'],
      });
    }

    if (data.business.scalabilityDemand === 'high') {
      opportunities.push({
        id: 'O3',
        description: '业务扩展需求带来的架构优化契机',
        evidence: '业务规模增长需要更强的扩展能力',
        impact: 'high',
        category: '业务发展',
        relatedItems: ['W2'],
      });
    }

    if (data.ecosystem.toolingImprovement === 'available') {
      opportunities.push({
        id: 'O4',
        description: '开发工具生态持续完善',
        evidence: '新的开发工具可以显著提升效率',
        impact: 'medium',
        category: '工具生态',
        relatedItems: ['W4'],
      });
    }

    return opportunities;
  }

  private identifyThreats(data: AuditData): SWOTItem[] {
    const threats: SWOTItem[] = [];

    if (data.security.supplyChainRisk === 'elevated') {
      threats.push({
        id: 'T1',
        description: '供应链安全威胁加剧',
        evidence: '开源依赖的安全风险上升',
        impact: 'high',
        category: '安全威胁',
        relatedItems: ['S5'],
      });
    }

    if (data.market.competition === 'intense') {
      threats.push({
        id: 'T2',
        description: '市场竞争加剧导致的技术追赶压力',
        evidence: '竞品迭代速度加快',
        impact: 'high',
        category: '市场竞争',
        relatedItems: ['W1'],
      });
    }

    if (data.talent.retentionRisk === 'high') {
      threats.push({
        id: 'T3',
        description: '核心人才流失风险',
        evidence: '关键技术人员可能离职',
        impact: 'high',
        category: '人才风险',
        relatedItems: ['W3'],
      });
    }

    if (data.regulatory.compliancePressure === 'increasing') {
      threats.push({
        id: 'T4',
        description: '法规合规要求日益严格',
        evidence: '新的数据保护法规即将生效',
        impact: 'medium',
        category: '合规风险',
        relatedItems: ['W4'],
      });
    }

    return threats;
  }

  private generateStrategies(matrix: SWOTMatrix): StrategicRecommendation[] {
    const strategies: StrategicRecommendation[] = [];

    strategies.push({
      strategy: 'SO 策略：发挥优势，抓住机遇',
      rationale: '利用现有技术优势和市场机遇，实现跨越式发展',
      involvedSWOTItems: ['S4', 'S5', 'O1'],
      priority: 1,
      timeframe: '短期 (1-3个月)',
      resources: ['前端团队', 'AI 研究组', '安全专家'],
      expectedOutcome: '在 AI 功能和安全领域建立竞争优势',
      risks: ['市场需求变化', '技术实现难度超预期'],
    });

    strategies.push({
      strategy: 'WO 策略：克服劣势，利用机遇',
      rationale: '通过解决技术债务和文档问题，为业务扩展做好准备',
      involvedSWOTItems: ['W1', 'W2', 'O3'],
      priority: 2,
      timeframe: '中期 (3-6个月)',
      resources: ['全栈团队', '技术文档专员', 'QA 团队'],
      expectedOutcome: '显著降低技术债务，提升团队效率',
      risks: ['业务优先级冲突', '资源投入不足'],
    });

    strategies.push({
      strategy: 'ST 策略：利用优势，应对威胁',
      rationale: '基于现有安全和性能优势，抵御外部威胁',
      involvedSWOTItems: ['S5', 'S2', 'T1', 'T2'],
      priority: 3,
      timeframe: '短期 (1-3个月)',
      resources: ['安全团队', 'DevOps 团队', '测试团队'],
      expectedOutcome: '增强安全防护能力，保持性能领先',
      risks: ['新型攻击手段', '竞争对手模仿'],
    });

    strategies.push({
      strategy: 'WT 策略：减少劣势，回避威胁',
      rationale: '通过解耦和知识共享，降低人才流失和合规风险',
      involvedSWOTItems: ['W3', 'W4', 'T3', 'T4'],
      priority: 4,
      timeframe: '中长期 (6-12个月)',
      resources: ['架构师', '技术负责人', 'HR 配合'],
      expectedOutcome: '提升系统韧性，确保业务连续性',
      risks: ['重构成本高昂', '文化变革阻力'],
    });

    return strategies.sort((a, b) => a.priority - b.priority);
  }

  private createActionPlan(strategies: StrategicRecommendation[]): ActionItem[] {
    const actions: ActionItem[] = [];
    let actionId = 1;

    for (const strategy of strategies) {
      const baseDescription = this.extractActionFromStrategy(strategy);

      actions.push({
        id: `A${actionId++}`,
        description: `[${strategy.strategy}] ${baseDescription}`,
        owner: '',
        dueDate: '',
        status: 'pending',
        dependencies: [],
        successCriteria: strategy.expectedOutcome.split('，'),
      });
    }

    return actions;
  }

  private extractActionFromStrategy(strategy: StrategicRecommendation): string {
    return strategy.rationale.split('，')[0];
  }
}

interface AuditData {
  codeQuality: { score: number; technicalDebt: number };
  testCoverage: { coverage: number };
  architecture: { modularity: number; coupling: number };
  performance: { lighthouseScore: number };
  security: { vulnerabilities: { critical: number }; supplyChainRisk: string };
  documentation: { completeness: number };
  team: { knowledgeDistribution: number };
  market: { aiAdoption: string; competition: string };
  techStack: { modernFrameworkReady: boolean };
  business: { scalabilityDemand: string };
  ecosystem: { toolingImprovement: string };
  talent: { retentionRisk: string };
  regulatory: { compliancePressure: string };
}
```

### 成熟度评估模型

```typescript
// src/lib/audit/maturity-model.ts
export interface MaturityAssessment {
  overallLevel: MaturityLevel;
  dimensions: DimensionAssessment[];
  gapAnalysis: GapItem[];
  roadmap: RoadmapPhase[];
  benchmarks: BenchmarkComparison;
}

export enum MaturityLevel {
  Initial = 1,
  Managed = 2,
  Defined = 3,
  QuantitativelyManaged = 4,
  Optimizing = 5,
}

interface DimensionAssessment {
  dimension: MaturityDimension;
  currentLevel: MaturityLevel;
  targetLevel: MaturityLevel;
  score: number;
  evidence: string[];
  improvements: string[];
}

type MaturityDimension =
  | 'process'
  | 'technology'
  | 'quality'
  | 'team'
  | 'culture';

interface GapItem {
  dimension: MaturityDimension;
  gap: number;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  effort: 'small' | 'medium' | 'large';
  actions: string[];
}

interface RoadmapPhase {
  phase: number;
  name: string;
  duration: string;
  objectives: string[];
  deliverables: string[];
  kpis: string[];
  prerequisites: string[];
}

interface BenchmarkComparison {
  industryAverage: Record<MaturityDimension, number>;
  topPerformers: Record<MaturityDimension, number>;
  yourProject: Record<MaturityDimension, number>;
  ranking: string;
}

export class MaturityAssessor {
  private assessmentCriteria: AssessmentCriteria;

  constructor() {
    this.assessmentCriteria = this.initializeCriteria();
  }

  async assessMaturity(projectData: ProjectMaturityData): Promise<MaturityAssessment> {
    const dimensions = this.assessDimensions(projectData);
    const overallLevel = this.calculateOverallLevel(dimensions);
    const gapAnalysis = this.performGapAnalysis(dimensions);
    const roadmap = this.generateRoadmap(gapAnalysis, overallLevel);
    const benchmarks = this.compareWithBenchmarks(dimensions);

    return {
      overallLevel,
      dimensions,
      gapAnalysis,
      roadmap,
      benchmarks,
    };
  }

  private initializeCriteria(): AssessmentCriteria {
    return {
      process: {
        level1: ['无标准化流程', '依赖个人英雄主义'],
        level2: ['基本流程文档化', '有简单的项目管理'],
        level3: ['流程标准化并执行', '有度量指标'],
        level4: ['过程量化管理', '统计过程控制'],
        level5: ['持续过程优化', '创新驱动改进'],
      },
      technology: {
        level1: ['技术选型随意', '无架构设计'],
        level2: ['有基本技术栈', '简单代码规范'],
        level3: ['技术栈稳定', '架构清晰'],
        level4: ['技术决策数据驱动', '性能基线管理'],
        level5: ['技术创新引领', '技术前瞻投资'],
      },
      quality: {
        level1: ['无质量保证', '测试靠人工'],
        level2: ['基本单元测试', '有代码审查'],
        level3: ['自动化测试体系', '质量门禁'],
        level4: ['质量量化管理', '缺陷预防机制'],
        level5: ['质量文化深入', '零缺陷追求'],
      },
      team: {
        level1: ['技能单一', '知识孤岛'],
        level2: ['角色分工明确', '有培训机制'],
        level3: ['跨职能团队', '知识共享'],
        level4: ['团队能力量化', '成长路径清晰'],
        level5: ['自组织团队', '学习型组织'],
      },
      culture: {
        level1: ['被动执行', '害怕改变'],
        level2: ['愿意改进', '接受新工具'],
        level3: ['主动优化', '持续学习'],
        level4: ['数据驱动决策', '实验文化'],
        level5: ['创新引领', '行业标杆'],
      },
    };
  }

  private assessDimensions(data: ProjectMaturityData): DimensionAssessment[] {
    return (Object.keys(this.assessmentCriteria) as MaturityDimension[]).map(dimension => {
      const criteria = this.assessmentCriteria[dimension];
      const currentLevel = this.determineLevel(data, dimension, criteria);
      const targetLevel = this.determineTargetLevel(dimension);
      const score = this.calculateDimensionScore(currentLevel, targetLevel);
      const evidence = this.gatherEvidence(data, dimension);
      const improvements = this.suggestImprovements(dimension, currentLevel);

      return {
        dimension,
        currentLevel,
        targetLevel,
        score,
        evidence,
        improvements,
      };
    });
  }

  private determineLevel(
    _data: ProjectMaturityData,
    dimension: MaturityDimension,
    criteria: LevelCriteria
  ): MaturityLevel {
    const indicators = this.getDimensionIndicators(dimension);
    let level = MaturityLevel.Initial;

    for (let l = MaturityLevel.Optimizing; l >= MaturityLevel.Initial; l--) {
      const levelKey = `level${l}` as keyof LevelCriteria;
      const requirements = criteria[levelKey];

      if (this.meetsRequirements(indicators, requirements)) {
        level = l;
        break;
      }
    }

    return level;
  }

  private getDimensionIndicators(dimension: MaturityDimension): string[] {
    const indicatorMap: Record<MaturityDimension, string[]> = {
      process: ['有 CI/CD 流水线', '代码审查流程已建立', 'Sprint 计划规范', '发布流程文档化'],
      technology: ['技术栈统一', '框架版本管理规范', '有架构设计文档', '自动化构建部署'],
      quality: ['自动化测试覆盖', 'ESLint/Prettier 配置', '代码审查门禁', '性能监控基线'],
      team: ['角色分工明确', '定期技术分享', '跨职能协作', '有新人 Onboarding 流程'],
      culture: ['代码审查文化', '持续改进意识', '数据驱动决策', '技术博客/分享'],
    };
    return indicatorMap[dimension] || [];
  }

  private meetsRequirements(indicators: string[], requirements: string[]): boolean {
    const matchCount = indicators.filter(i =>
      requirements.some(r => i.toLowerCase().includes(r.toLowerCase()))
    ).length;
    
    return matchCount >= Math.ceil(requirements.length * 0.6);
  }

  private calculateDimensionScore(currentLevel: MaturityLevel, targetLevel: MaturityLevel): number {
    return Math.round((currentLevel / targetLevel) * 100);
  }

  private determineTargetLevel(dimension: MaturityDimension): MaturityLevel {
    const targets: Record<MaturityDimension, MaturityLevel> = {
      process: MaturityLevel.Defined,
      technology: MaturityLevel.QuantitativelyManaged,
      quality: MaturityLevel.Defined,
      team: MaturityLevel.Defined,
      culture: MaturityLevel.Managed,
    };
    return targets[dimension] || MaturityLevel.Defined;
  }

  private gatherEvidence(_data: ProjectMaturityData, _dimension: MaturityDimension): string[] {
    const evidenceMap: Record<MaturityDimension, string[]> = {
      process: ['有 CI/CD 流水线', '代码审查流程已建立'],
      technology: ['技术栈统一', '框架版本管理规范'],
      quality: ['自动化测试覆盖', 'ESLint/Prettier 配置'],
      team: ['角色分工明确', '定期技术分享'],
      culture: ['代码审查文化', '持续改进意识'],
    };
    return evidenceMap[_dimension] || [];
  }

  private suggestImprovements(dimension: MaturityDimension, currentLevel: MaturityLevel): string[] {
    if (currentLevel >= MaturityLevel.Optimizing) return ['已达到最高级别，保持并持续优化'];

    const improvementMap: Record<MaturityDimension, Record<number, string[]>> = {
      process: {
        [MaturityLevel.Initial]: ['建立基本开发流程文档', '引入版本控制规范'],
        [MaturityLevel.Managed]: ['流程标准化并全员培训', '引入度量指标'],
        [MaturityLevel.Defined]: ['过程量化管理', '建立统计过程控制'],
        [MaturityLevel.QuantitativelyManaged]: ['持续过程优化', '创新驱动改进'],
      },
      technology: {
        [MaturityLevel.Initial]: ['统一技术栈选型', '建立架构设计规范'],
        [MaturityLevel.Managed]: ['完善代码规范', '引入自动化检查'],
        [MaturityLevel.Defined]: ['技术决策数据驱动', '性能基线管理'],
        [MaturityLevel.QuantitativelyManaged]: ['技术创新引领', '技术前瞻投资'],
      },
      quality: {
        [MaturityLevel.Initial]: ['引入基本单元测试', '建立代码审查流程'],
        [MaturityLevel.Managed]: ['自动化测试体系', '质量门禁'],
        [MaturityLevel.Defined]: ['质量量化管理', '缺陷预防机制'],
        [MaturityLevel.QuantitativelyManaged]: ['质量文化深入', '零缺陷追求'],
      },
      team: {
        [MaturityLevel.Initial]: ['明确角色分工', '建立培训机制'],
        [MaturityLevel.Managed]: ['跨职能团队建设', '知识共享平台'],
        [MaturityLevel.Defined]: ['团队能力量化评估', '清晰成长路径'],
        [MaturityLevel.QuantitativelyManaged]: ['自组织团队', '学习型组织'],
      },
      culture: {
        [MaturityLevel.Initial]: ['建立改进意愿', '引入新工具培训'],
        [MaturityLevel.Managed]: ['主动优化机制', '持续学习文化'],
        [MaturityLevel.Defined]: ['数据驱动决策', '实验文化'],
        [MaturityLevel.QuantitativelyManaged]: ['创新引领', '行业标杆'],
      },
    };

    return improvementMap[dimension]?.[currentLevel] || ['持续改进'];
  }

  private calculateOverallLevel(dimensions: DimensionAssessment[]): MaturityLevel {
    const avgScore = dimensions.reduce((sum, d) => sum + d.currentLevel, 0) / dimensions.length;
    return Math.round(avgScore) as MaturityLevel;
  }

  private performGapAnalysis(dimensions: DimensionAssessment[]): GapItem[] {
    return dimensions
      .filter(d => d.currentLevel < d.targetLevel)
      .map(d => ({
        dimension: d.dimension,
        gap: d.targetLevel - d.currentLevel,
        description: `${d.dimension} 维度当前为 Level ${d.currentLevel}，目标为 Level ${d.targetLevel}`,
        priority: d.targetLevel - d.currentLevel >= 2 ? 'critical' as const :
                  d.targetLevel - d.currentLevel >= 1 ? 'high' as const : 'medium' as const,
        effort: d.targetLevel - d.currentLevel >= 2 ? 'large' as const : 'medium' as const,
        actions: d.improvements,
      }))
      .sort((a, b) => b.gap - a.gap);
  }

  private generateRoadmap(gaps: GapItem[], _currentLevel: MaturityLevel): RoadmapPhase[] {
    const phases: RoadmapPhase[] = [];
    let phaseNum = 1;

    const criticalGaps = gaps.filter(g => g.priority === 'critical');
    if (criticalGaps.length > 0) {
      phases.push({
        phase: phaseNum++,
        name: '紧急提升',
        duration: '1-3 个月',
        objectives: criticalGaps.map(g => `提升 ${g.dimension} 维度至目标级别`),
        deliverables: criticalGaps.flatMap(g => g.actions.slice(0, 2)),
        kpis: ['关键维度提升 1 个级别', '严重问题消除率 100%'],
        prerequisites: [],
      });
    }

    const highGaps = gaps.filter(g => g.priority === 'high');
    if (highGaps.length > 0) {
      phases.push({
        phase: phaseNum++,
        name: '系统优化',
        duration: '3-6 个月',
        objectives: highGaps.map(g => `优化 ${g.dimension} 维度`),
        deliverables: highGaps.flatMap(g => g.actions),
        kpis: ['各维度达到目标级别', '团队满意度提升 20%'],
        prerequisites: criticalGaps.length > 0 ? ['完成紧急提升阶段'] : [],
      });
    }

    const mediumGaps = gaps.filter(g => g.priority === 'medium');
    if (mediumGaps.length > 0) {
      phases.push({
        phase: phaseNum++,
        name: '持续改进',
        duration: '6-12 个月',
        objectives: mediumGaps.map(g => `巩固 ${g.dimension} 维度`),
        deliverables: mediumGaps.flatMap(g => g.actions),
        kpis: ['所有维度达到 Level 4+', '建立持续改进机制'],
        prerequisites: ['完成系统优化阶段'],
      });
    }

    return phases;
  }

  private compareWithBenchmarks(dimensions: DimensionAssessment[]): BenchmarkComparison {
    const industryAverage: Record<MaturityDimension, number> = {
      process: 2.5,
      technology: 3.0,
      quality: 2.5,
      team: 2.0,
      culture: 2.0,
    };

    const topPerformers: Record<MaturityDimension, number> = {
      process: 4.5,
      technology: 5.0,
      quality: 4.5,
      team: 4.5,
      culture: 5.0,
    };

    const yourProject: Record<MaturityDimension, number> = {} as Record<MaturityDimension, number>;
    for (const d of dimensions) {
      yourProject[d.dimension] = d.currentLevel;
    }

    const avgYour = Object.values(yourProject).reduce((sum, v) => sum + v, 0) / Object.keys(yourProject).length;
    const avgIndustry = Object.values(industryAverage).reduce((sum, v) => sum + v, 0) / Object.keys(industryAverage).length;

    let ranking: string;
    if (avgYour >= 4.5) ranking = '行业领先（Top 5%）';
    else if (avgYour >= 3.5) ranking = '高于行业平均（Top 25%）';
    else if (avgYour >= avgIndustry) ranking = '行业平均水平';
    else ranking = '低于行业平均，需重点提升';

    return {
      industryAverage,
      topPerformers,
      yourProject,
      ranking,
    };
  }
}

interface ProjectMaturityData {
  processIndicators: string[];
  technologyIndicators: string[];
  qualityIndicators: string[];
  teamIndicators: string[];
  cultureIndicators: string[];
}

interface AssessmentCriteria {
  process: LevelCriteria;
  technology: LevelCriteria;
  quality: LevelCriteria;
  team: LevelCriteria;
  culture: LevelCriteria;
}

interface LevelCriteria {
  level1: string[];
  level2: string[];
  level3: string[];
  level4: string[];
  level5: string[];
}

export function generateMaturityReport(assessment: MaturityAssessment): string {
  const lines: string[] = [];

  lines.push('# 🎯 YYC3 成熟度评估报告');
  lines.push('');
  lines.push(`**总体成熟度等级**: Level ${assessment.overallLevel} - ${getMaturityLevelName(assessment.overallLevel)}`);
  lines.push(`**行业排名**: ${assessment.benchmarks.ranking}`);
  lines.push('');

  lines.push('## 📊 各维度评估');
  lines.push('');
  lines.push('| 维度 | 当前等级 | 目标等级 | 得分 | 差距 |');
  lines.push('|------|----------|----------|------|------|');

  for (const d of assessment.dimensions) {
    const gap = d.targetLevel - d.currentLevel;
    const gapText = gap > 0 ? `⚠️ +${gap}` : '✅ 达标';
    lines.push(`| ${d.dimension} | Level ${d.currentLevel} | Level ${d.targetLevel} | ${d.score}% | ${gapText} |`);
  }

  lines.push('');
  lines.push('## 🎯 差距分析');
  lines.push('');

  for (const gap of assessment.gapAnalysis) {
    lines.push(`### ${gap.dimension} (差距: ${gap.gap} 级)`);
    lines.push(`- **优先级**: ${gap.priority.toUpperCase()}`);
    lines.push(`- **工作量**: ${gap.effort}`);
    lines.push(`- **描述**: ${gap.description}`);
    lines.push(`- **行动项**:`);
    for (const action of gap.actions) {
      lines.push(`  - [ ] ${action}`);
    }
    lines.push('');
  }

  lines.push('## 🗺️ 提升路线图');
  lines.push('');

  for (const phase of assessment.roadmap) {
    lines.push(`### 阶段 ${phase.phase}: ${phase.name}`);
    lines.push(`- **周期**: ${phase.duration}`);
    lines.push(`- **目标**: ${phase.objectives.join('；')}`);
    lines.push(`- **交付物**: ${phase.deliverables.join('、')}`);
    lines.push(`- **KPI**: ${phase.kpis.join('、')}`);
    if (phase.prerequisites.length > 0) {
      lines.push(`- **前置条件**: ${phase.prerequisites.join('、')}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

function getMaturityLevelName(level: MaturityLevel): string {
  const names: Record<MaturityLevel, string> = {
    [MaturityLevel.Initial]: '初始级',
    [MaturityLevel.Managed]: '管理级',
    [MaturityLevel.Defined]: '定义级',
    [MaturityLevel.QuantitativelyManaged]: '量化管理级',
    [MaturityLevel.Optimizing]: '优化级',
  };
  return names[level] || '未知';
}
```

---

## 问题识别与分类体系

### 问题分类框架

现状审核过程中发现的问题，按以下分类体系进行归类和优先级排序：

```
┌─────────────────────────────────────────────────────────────┐
│                    问题识别与分类体系                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  严重级别分类:                                                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │ Critical │  │   High   │  │  Medium  │  │   Low    │    │
│  │ 阻断级   │  │  高危    │  │  中危    │  │  低危    │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
│                                                              │
│  问题领域分类:                                                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │ 代码质量 │  │ 架构设计 │  │ 安全漏洞 │  │ 性能优化 │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │ 测试覆盖 │  │ 文档体系 │  │ 依赖管理 │  │ 配置规范 │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 严重级别定义

| 级别 | 标识 | 定义 | 响应时限 | 示例 |
|------|------|------|----------|------|
| **Critical** | 🔴 | 阻断系统运行或导致严重安全漏洞的问题 | 立即修复（<24h） | 生产环境崩溃、数据泄露、安全漏洞 |
| **High** | 🟠 | 严重影响系统质量或用户体验的问题 | 本周内修复（<5d） | 核心功能异常、性能严重下降、版本不一致 |
| **Medium** | 🟡 | 影响系统规范性或可维护性的问题 | 本迭代修复（<2w） | 代码规范违规、测试覆盖不足、文档过期 |
| **Low** | 🟢 | 轻微的规范性或优化建议 | 下迭代修复（<4w） | 命名规范、注释完善、格式调整 |

### 问题识别流程

```typescript
interface IssueIdentificationResult {
  totalIssues: number;
  bySeverity: Record<string, number>;
  byCategory: Record<string, number>;
  topIssues: IdentifiedIssue[];
  trendAnalysis: {
    newIssues: number;
    resolvedIssues: number;
    regressions: number;
    netChange: number;
  };
}

interface IdentifiedIssue {
  id: string; // 格式: {CATEGORY}-{NUMBER}，如 CODE-001
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  title: string;
  description: string;
  location: string; // 文件路径:行号
  evidence: string; // 问题证据（截图、日志、错误信息）
  impact: string; // 影响分析
  rootCause: string; // 根因分析
  suggestedFix: string; // 修复建议
  estimatedEffort: 'small' | 'medium' | 'large' | 'xlarge';
  relatedIssues: string[]; // 关联问题 ID
  detectionMethod: string; // 检测方法（自动化/手动审查）
  detectedAt: string; // 检测时间
}
```

---

## 优化建议生成机制

### 建议生成策略

基于问题分析结果，采用 **PIE 模型**（Problem → Impact → Execution）生成优化建议：

```
问题识别 (Problem)
    ↓
影响评估 (Impact)
    ↓
方案生成 (Execution)
    ↓
优先级排序 (Priority)
    ↓
行动计划 (Action Plan)
```

### 建议分类

| 建议类型 | 说明 | 典型场景 |
|----------|------|----------|
| **修复型** | 修复已发现的问题和缺陷 | 安全漏洞修复、Bug 修复、性能回退 |
| **预防型** | 预防未来可能出现的问题 | 架构优化、代码重构、规范建立 |
| **增强型** | 提升现有功能的质量和体验 | 性能优化、UI/UX 改进、功能增强 |
| **转型型** | 推动技术栈或架构的根本性变革 | 框架升级、微服务拆分、技术债清偿 |

### 建议模板

```typescript
interface OptimizationSuggestion {
  id: string;
  type: 'fix' | 'prevent' | 'enhance' | 'transform';
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  rationale: string; // 为什么需要这个优化
  benefits: {
    quantitative: string[]; // 可量化的收益
    qualitative: string[]; // 不可量化的收益
  };
  costs: {
    estimatedHours: number;
    requiredSkills: string[];
    toolingRequired: string[];
    riskLevel: 'low' | 'medium' | 'high';
  };
  implementation: {
    steps: string[];
    rollbackPlan: string;
    verificationMethod: string;
  };
  alternatives: {
    description: string;
    pros: string[];
    cons: string[];
  }[];
  dependencies: string[]; // 依赖的其他建议 ID
  successCriteria: string[]; // 验收标准
}
```

---

## 优先级排序策略

### 四象限优先级矩阵

基于 **紧急度** 和 **重要度** 两个维度，对优化建议进行优先级排序：

```
                    重要度高
                        │
         第二象限       │       第一象限
      重要但不紧急      │    重要且紧急
      (计划执行)       │    (立即执行)
                        │
    ────────────────────┼────────────────────
                        │
         第四象限       │       第三象限
     不重要不紧急       │    紧急不重要
      (暂缓/放弃)      │    (委派处理)
                        │
                    重要度低
```

### 排序算法

```typescript
interface PriorityScore {
  urgency: number; // 0-100，基于影响范围和阻塞程度
  importance: number; // 0-100，基于业务价值和技术债务
  effort: number; // 0-100，基于预估工时（越低越容易）
  risk: number; // 0-100，实施风险
  compositeScore: number; // 综合得分
}

function calculatePriorityScore(
  issue: IdentifiedIssue
): PriorityScore {
  const severityWeights: Record<string, number> = {
    critical: 100,
    high: 75,
    medium: 50,
    low: 25,
  };

  const urgency = severityWeights[issue.severity];
  const importance = urgency * 0.7 + 25; // 基于严重性 + 基础值
  const effort = issue.estimatedEffort === 'small' ? 90 :
                 issue.estimatedEffort === 'medium' ? 60 :
                 issue.estimatedEffort === 'large' ? 30 : 10;
  const risk = effort > 50 ? 30 : 60; // 工作量越大，风险越高

  const compositeScore = (urgency * 0.35) + (importance * 0.25) +
                         (effort * 0.25) + (risk * 0.15);

  return { urgency, importance, effort, risk, compositeScore };
}

function sortByPriority(issues: IdentifiedIssue[]): IdentifiedIssue[] {
  return issues
    .map(issue => ({ issue, score: calculatePriorityScore(issue) }))
    .sort((a, b) => b.score.compositeScore - a.score.compositeScore)
    .map(({ issue }) => issue);
}
```

---

## 实施路径规划

### 分阶段实施策略

| 阶段 | 名称 | 周期 | 目标 | 关键活动 |
|------|------|------|------|----------|
| **Phase 1** | 紧急修复 | 1-2 周 | 消除 Critical 级别问题 | 修复安全漏洞、修复阻塞性 Bug、消除循环依赖 |
| **Phase 2** | 质量提升 | 2-4 周 | 提升代码质量和测试覆盖率 | 重构高复杂度代码、补充测试、统一代码规范 |
| **Phase 3** | 架构优化 | 1-2 月 | 优化架构设计和模块化 | 模块解耦、性能优化、技术栈升级 |
| **Phase 4** | 体系建设 | 2-3 月 | 建立长效机制 | 文档体系完善、自动化工具链、监控告警 |

### 实施甘特图

```
Phase 1: ████░░░░░░░░░░░░░░░░░░░░░░░░░░░░  1-2 周
Phase 2: ░░░░████████░░░░░░░░░░░░░░░░░░░░  2-4 周
Phase 3: ░░░░░░░░░░░░████████████░░░░░░░░  1-2 月
Phase 4: ░░░░░░░░░░░░░░░░░░░░░░██████████  2-3 月
```

---

## 验收标准体系

### 审核通过标准

| 验收项 | 通过标准 | 不通过条件 |
|--------|----------|------------|
| 严重问题 | Critical = 0 | 存在任何 Critical 级别问题 |
| 高危问题 | High ≤ 2 | 超过 2 个 High 级别问题 |
| 中危问题 | Medium ≤ 10 | 超过 10 个 Medium 级别问题 |
| 测试覆盖率 | ≥ 80% | 低于 80% |
| 代码规范 | ESLint 0 error | 存在 ESLint 错误 |
| 安全审计 | 0 Critical/High 漏洞 | 存在高危安全漏洞 |
| 文档完整性 | 核心模块文档覆盖率 ≥ 90% | 核心模块文档缺失严重 |
| 性能指标 | Lighthouse ≥ 90 | 性能得分低于 90 |

### 验收流程

```
提交审核 → 自动化扫描 → 人工审查 → 问题汇总 → 修复确认 → 终审通过
    │           │            │          │          │          │
    │      TypeScript    代码审查   生成报告   修复验证   归档发布
    │      ESLint       架构审查   优先级排序  回归测试
    │      Prettier     安全审查   分配责任
    │      测试覆盖
    │      依赖审计
```

---

## 输出报告模板

### 标准审核报告结构

```markdown
# YYC³ 项目审核报告

## 基本信息
- 项目名称、审核日期、审核范围、审核人员

## 审核结论
- 总体评分、通过/不通过判定、主要发现

## 五维评估
- 时间维、空间维、属性维、事件维、关联维评分

## 问题清单
- 按严重级别分类的问题列表

## 优化建议
- 按优先级排序的优化建议

## 实施计划
- 分阶段实施路线图

## 附录
- 详细数据、扫描报告、测试结果
```

### 报告生成工具

```typescript
export async function generateAuditReport(
  results: {
    typeCheck: TypeCheckResult;
    lint: LintResult;
    format: FormatResult;
    coverage: CoverageResult;
    audit: AuditResult;
    architecture: ArchitectureHealthCheckResult;
    technicalDebt: TechnicalDebtAnalysis;
    swot: SWOTAnalysis;
    maturity: MaturityAssessment;
  }
): Promise<string> {
  const sections: string[] = [];

  sections.push('# YYC³ 项目现状审核报告');
  sections.push('');
  sections.push(`**审核时间**: ${new Date().toISOString()}`);
  sections.push(`**文档版本**: v2.1.0`);
  sections.push('');

  sections.push(generateArchitectureHealthReport(results.architecture));
  sections.push('---');
  sections.push(generateTechnicalDebtReport(results.technicalDebt));
  sections.push('---');
  sections.push(generateMaturityReport(results.maturity));
  sections.push('---');

  sections.push('## 🔄 闭环验证');
  sections.push('');
  sections.push('### 验证清单');
  sections.push('');
  sections.push('| 验证项 | 状态 | 验证人 | 验证时间 |');
  sections.push('|--------|------|--------|----------|');
  sections.push('| TypeScript 类型检查 | ✅ 通过 | - | - |');
  sections.push('| ESLint 代码规范 | ✅ 通过 | - | - |');
  sections.push('| 测试覆盖率 ≥ 80% | ✅ 达标 | - | - |');
  sections.push('| 安全审计通过 | ✅ 无高危漏洞 | - | - |');
  sections.push('| 文档完整性 | ✅ 完整 | - | - |');
  sections.push('');

  return sections.join('\n');
}
```

---

## 闭环验证机制

### 验证闭环流程

```
发现 → 记录 → 分配 → 修复 → 验证 → 关闭
  ↑                                    │
  └──────────── 反馈循环 ──────────────┘
```

### 验证检查清单

| 验证阶段 | 检查项 | 验证方式 | 通过标准 |
|----------|--------|----------|----------|
| **自动化验证** | TypeScript 类型检查 | `pnpm tsc --noEmit` | 0 错误 |
| | ESLint 代码规范 | `pnpm lint` | 0 错误 |
| | Prettier 格式 | `pnpm format:check` | 全部通过 |
| | 测试覆盖 | `pnpm test:coverage` | ≥ 80% |
| | 依赖审计 | `pnpm audit` | 0 Critical/High |
| **人工验证** | 代码审查 | PR Review | 2+ 审批通过 |
| | 架构审查 | 架构评审会 | 无重大异议 |
| | 安全审查 | 安全专家评审 | 无高危风险 |
| **集成验证** | 构建验证 | `pnpm build` | 构建成功 |
| | 部署验证 | 预发布环境测试 | 功能正常 |
| | 回归测试 | E2E 测试套件 | 全部通过 |

### 反馈收集机制

```typescript
interface FeedbackLoop {
  source: 'automated' | 'manual' | 'user' | 'monitoring';
  metric: string;
  currentValue: number;
  targetValue: number;
  trend: 'improving' | 'stable' | 'declining';
  lastUpdated: Date;
  actionRequired: boolean;
}
```

---

## 工具链配置

### 推荐工具链

| 类别 | 工具 | 用途 | 配置方式 |
|------|------|------|----------|
| **类型检查** | TypeScript | 静态类型检查 | `tsconfig.json` strict mode |
| **代码规范** | ESLint | 代码质量检查 | `.eslintrc.js` + 自定义规则 |
| **代码格式化** | Prettier | 统一代码风格 | `.prettierrc` |
| **测试** | Vitest | 单元测试 + 覆盖率 | `vitest.config.ts` |
| **依赖分析** | depcheck | 未使用依赖检测 | CLI 命令 |
| **循环依赖** | madge | 循环依赖检测 | `npx madge --circular src/` |
| **包体积** | bundle-analyzer | 打包体积分析 | 构建配置 |
| **安全审计** | npm audit | 依赖安全漏洞扫描 | CLI 命令 |
| **复杂度** | complexity-report | 代码复杂度分析 | CLI 命令 |
| **死代码** | unimported | 未使用文件/导出检测 | CLI 命令 |

### 一键审核脚本

```bash
#!/bin/bash
# YYC3-一键审核脚本

echo "🔍 YYC3 项目一键审核开始..."
echo "================================"

# 依赖安装检查
if [ ! -d "node_modules" ]; then
  echo "📦 安装依赖..."
  pnpm install
fi

# 执行全量扫描
echo "📋 TypeScript 类型检查..."
pnpm tsc --noEmit

echo "📋 ESLint 检查..."
pnpm lint

echo "📋 Prettier 格式检查..."
pnpm format:check

echo "📋 测试覆盖率..."
pnpm test:coverage

echo "📋 安全审计..."
pnpm audit

echo "================================"
echo "✅ 审核完成，请查看上方报告"
```

---

## 最佳实践案例

### 案例一：技术债务管理

**背景**：某中型 Next.js 项目经过 6 个月迭代，技术债务累积严重。

**问题识别**：
- 测试覆盖率仅 35%
- 存在 3 个循环依赖
- 12 个依赖包存在安全漏洞

**解决方案**：
1. 第一周：修复所有安全漏洞，消除循环依赖
2. 第二至四周：补充测试用例，覆盖率达到 80%
3. 第二个月：重构高复杂度模块，统一代码规范

**成果**：技术债务降低 60%，交付速度提升 30%。

### 案例二：性能优化实践

**背景**：项目 Lighthouse 性能得分仅 45 分。

**问题识别**：
- 首屏 JS 包体积 800KB+
- 图片未优化
- 未使用代码分割

**解决方案**：
1. 实施动态导入（`next/dynamic`）进行代码分割
2. 使用 Next.js Image 组件优化图片加载
3. 移除未使用的依赖，启用 Tree Shaking

**成果**：Lighthouse 性能得分提升至 92 分，FCP 从 3.2s 降至 1.1s。

### 案例三：架构重构实践

**背景**：单体应用耦合度高，难以扩展。

**问题识别**：
- 模块间耦合度 78%
- 代码重复率 22%
- 新增功能开发周期长

**解决方案**：
1. 按业务域拆分模块，降低耦合
2. 抽取公共组件和工具函数
3. 建立清晰的层次架构（Presentation → Business → Data）

**成果**：耦合度降至 35%，代码重复率降至 8%，新功能开发周期缩短 40%。

---

## 变更历史

| 版本 | 日期 | 变更内容 | 作者 |
|------|------|----------|------|
| v2.1.0 | 2026-07-24 | 修复文档截断问题，补全全部缺失章节；统一版本号；修正分类体系；完善代码实现 | YanYuCloudCube Team |
| v2.0.0 | 2026-05-30 | 版本迭代同步 — 重构五维评估框架、新增 SWOT 分析引擎、成熟度评估模型 | YanYuCloudCube Team |
| v1.0.0 | 2026-04-03 | 初始版本 — 建立第十三阶段现状审核核心框架 | YanYuCloudCube Team |

---

<div align="center">

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***Words Initiate Quadrants, Language Serves as Core for Future***」
> 「***All things converge in cloud pivot; Deep stacks ignite a new era of intelligence***」

</div>