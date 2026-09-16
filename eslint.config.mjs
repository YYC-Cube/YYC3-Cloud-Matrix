// @ts-check
// YYC³ ESLint 扁平配置（ESLint v9+ 规范）
import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist/**', 'dist-electron/**', 'coverage/**', 'node_modules/**', 'docs/**', 'scripts/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    plugins: { 'react-hooks': reactHooks },
    rules: {
      // 稳定经典规则：Hooks 调用顺序必须严格（error），依赖数组提醒（warn）。
      // 新版编译器级规则（set-state-in-effect/refs 等）待架构专项治理后启用。
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  {
    files: ['**/*.{js,jsx}'],
    extends: [js.configs.recommended],
  },
  // 渐进收紧策略：存量代码存量问题降级为警告（门禁不阻断），
  // 类型安全由 tsc strict 模式把关；后续按模块逐步恢复 error 级
  {
    rules: {
      '@typescript-eslint/ban-ts-comment': 'warn',
      '@typescript-eslint/no-require-imports': 'warn',
      '@typescript-eslint/no-unused-expressions': 'warn',
      'no-undef': 'warn',
      'no-useless-assignment': 'warn',
      'no-useless-escape': 'warn',
      'prefer-const': 'warn',
      'preserve-caught-error': 'warn',
      '@typescript-eslint/no-unsafe-function-type': 'warn',
      '@typescript-eslint/no-this-alias': 'warn',
      'no-empty': 'warn',
      // 存量代码中的 eslint-disable 引用了本项目未启用的规则，忽略报错
    },
  },
);
