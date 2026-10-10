// @ts-check
// YYC³ ESLint 扁平配置（ESLint v9+ 规范）
import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import unusedImports from 'eslint-plugin-unused-imports';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist/**', 'dist-electron/**', 'coverage/**', 'node_modules/**', 'docs/**', 'scripts/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  // 运行环境域声明：no-undef 只对真实 JS 文件有意义；
  // TS 文件一律关闭（由 tsc strict + lib types 把关），避免误报浏览器/Node 全局
  {
    files: ['**/*.{js,mjs,cjs}', '**/*.{config,}.{ts,mts,js,mjs}'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser,
      },
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    plugins: { 'react-hooks': reactHooks, 'unused-imports': unusedImports },
    rules: {
      // 稳定经典规则：Hooks 调用顺序必须严格（error），依赖数组提醒（warn）。
      // 新版编译器级规则（set-state-in-effect/refs 等）待架构专项治理后启用。
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      // 未用变量：交由 unused-imports 插件统一接管（其 --fix 可自动移除未用导入）
      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'warn',
      'unused-imports/no-unused-vars': [
        'warn',
        { vars: 'all', varsIgnorePattern: '^_', args: 'after-used', argsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  {
    files: ['**/*.{js,jsx}'],
    extends: [js.configs.recommended],
  },
  // Electron 主进程 CJS 域：require 为运行时必需（项目无 "type": "module"）
  {
    files: ['electron/**/*.js'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  // 渐进收紧策略：存量代码存量问题降级为警告（门禁不阻断），
  // 类型安全由 tsc strict 模式把关；后续按模块逐步恢复 error 级。
  // 注意：TS 专属规则必须限定 files，否则会覆盖上方 electron CJS 域的豁免
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/ban-ts-comment': [
        'warn',
        {
          'ts-expect-error': 'allow-with-description',
          'ts-ignore': true,
          'ts-nocheck': 'allow-with-description',
          minimumDescriptionLength: 3,
        },
      ],
      '@typescript-eslint/no-require-imports': 'warn',
      '@typescript-eslint/no-unused-expressions': 'warn',
      '@typescript-eslint/no-unsafe-function-type': 'warn',
      '@typescript-eslint/no-this-alias': 'warn',
    },
  },
  {
    rules: {
      'no-useless-assignment': 'warn',
      'no-useless-escape': 'warn',
      'prefer-const': 'warn',
      'preserve-caught-error': 'warn',
      'no-empty': 'warn',
    },
  },
);
