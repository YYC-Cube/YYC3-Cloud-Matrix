#!/bin/bash
# fix-shared-imports.sh — 修复 shared 模块迁移后的所有导入路径
set -e

BASE="/Users/my/YYC3-CloudPivot Intelli-Matrix/src/app"

echo "=== 1. 修复 shared 模块内部引用 ==="
# shared 内部文件: ../lib/ → ../../lib/, ../hooks/ → ../../hooks/, ../types → ../../types
find "$BASE/modules/shared" -name "*.tsx" -o -name "*.ts" | while read f; do
  sed -i '' \
    -e 's|from "\.\./lib/|from "../../lib/|g' \
    -e "s|from '\.\./lib/|from '../../lib/|g" \
    -e 's|from "\.\./hooks/|from "../../hooks/|g' \
    -e "s|from '\.\./hooks/|from '../../hooks/|g" \
    -e 's|from "\.\./types"|from "../../types"|g' \
    -e "s|from '\.\./types'|from '../../types'|g" \
    -e 's|from "\.\./modules/dev/|from "../dev/|g' \
    -e "s|from '\.\./modules/dev/|from '../dev/|g" \
    "$f"
done

echo "=== 2. 修复根级文件 (routes.tsx, App.tsx) ==="
# ./components/ → ./modules/shared/
find "$BASE" -maxdepth 1 -name "*.tsx" -o -name "*.ts" | while read f; do
  sed -i '' \
    -e 's|from "\./components/Layout|from "./modules/shared/Layout|g' \
    -e "s|from '\./components/Layout|from './modules/shared/Layout|g" \
    -e 's|from "\./components/ErrorBoundary|from "./modules/shared/ErrorBoundary|g' \
    -e "s|from '\./components/ErrorBoundary|from './modules/shared/ErrorBoundary|g" \
    -e 's|from "\./components/NotFound|from "./modules/shared/NotFound|g' \
    -e "s|from '\./components/NotFound|from './modules/shared/NotFound|g" \
    -e 's|from "\./components/Login|from "./modules/shared/Login|g' \
    -e "s|from '\./components/Login|from './modules/shared/Login|g" \
    "$f"
done

echo "=== 3. 修复 dev 模块 (../../components/ → ../shared/) ==="
find "$BASE/modules/dev" -name "*.tsx" -o -name "*.ts" | while read f; do
  sed -i '' \
    -e 's|from "\.\./\.\./components/GlassCard|from "../shared/GlassCard|g' \
    -e "s|from '\.\./\.\./components/GlassCard|from '../shared/GlassCard|g" \
    -e 's|from "\.\./\.\./components/YYC3Logo|from "../shared/YYC3Logo|g' \
    -e "s|from '\.\./\.\./components/YYC3Logo|from '../shared/YYC3Logo|g" \
    -e 's|from "\.\./\.\./components/YYC3LogoSvg|from "../shared/YYC3LogoSvg|g' \
    -e "s|from '\.\./\.\./components/YYC3LogoSvg|from '../shared/YYC3LogoSvg|g" \
    -e 's|from "\.\./\.\./components/ErrorBoundary|from "../shared/ErrorBoundary|g' \
    -e "s|from '\.\./\.\./components/ErrorBoundary|from '../shared/ErrorBoundary|g" \
    -e 's|from "\.\./\.\./components/Layout|from "../shared/Layout|g' \
    -e "s|from '\.\./\.\./components/Layout|from '../shared/Layout|g" \
    -e 's|from "\.\./\.\./components/NotFound|from "../shared/NotFound|g' \
    -e "s|from '\.\./\.\./components/NotFound|from '../shared/NotFound|g" \
    -e 's|from "\.\./\.\./components/Login|from "../shared/Login|g' \
    -e "s|from '\.\./\.\./components/Login|from '../shared/Login|g" \
    "$f"
done

echo "=== 4. 修复 dev/ide 子目录 (../../../components/ → ../../shared/) ==="
find "$BASE/modules/dev/ide" -name "*.tsx" -o -name "*.ts" | while read f; do
  sed -i '' \
    -e 's|from "\.\./\.\./\.\./components/|from "../../shared/|g' \
    -e "s|from '\.\./\.\./\.\./components/|from '../../shared/|g" \
    "$f"
done

echo "=== 5. 修复 ai-family 模块 (../../components/ → ../shared/) ==="
find "$BASE/modules/ai-family" -name "*.tsx" -o -name "*.ts" | while read f; do
  sed -i '' \
    -e 's|from "\.\./\.\./components/GlassCard|from "../shared/GlassCard|g' \
    -e "s|from '\.\./\.\./components/GlassCard|from '../shared/GlassCard|g" \
    -e 's|from "\.\./\.\./components/ErrorBoundary|from "../shared/ErrorBoundary|g' \
    -e "s|from '\.\./\.\./components/ErrorBoundary|from '../shared/ErrorBoundary|g" \
    "$f"
done

echo "=== 6. 修复测试文件 (../components/ → ../modules/shared/) ==="
find "$BASE/__tests__" -name "*.tsx" -o -name "*.ts" | while read f; do
  sed -i '' \
    -e 's|from "\.\./components/Layout|from "../modules/shared/Layout|g' \
    -e "s|from '\.\./components/Layout|from '../modules/shared/Layout|g" \
    -e 's|from "\.\./components/ErrorBoundary|from "../modules/shared/ErrorBoundary|g' \
    -e "s|from '\.\./components/ErrorBoundary|from '../modules/shared/ErrorBoundary|g" \
    -e 's|from "\.\./components/NotFound|from "../modules/shared/NotFound|g' \
    -e "s|from '\.\./components/NotFound|from '../modules/shared/NotFound|g" \
    -e 's|from "\.\./components/Login|from "../modules/shared/Login|g' \
    -e "s|from '\.\./components/Login|from '../modules/shared/Login|g" \
    -e 's|from "\.\./components/GlassCard|from "../modules/shared/GlassCard|g' \
    -e "s|from '\.\./components/GlassCard|from '../modules/shared/GlassCard|g" \
    -e 's|from "\.\./components/YYC3Logo|from "../modules/shared/YYC3Logo|g' \
    -e "s|from '\.\./components/YYC3Logo|from '../modules/shared/YYC3Logo|g" \
    -e 's|from "\.\./components/YYC3LogoSvg|from "../modules/shared/YYC3LogoSvg|g' \
    -e "s|from '\.\./components/YYC3LogoSvg|from '../modules/shared/YYC3LogoSvg|g" \
    -e 's|from "\.\./components/Sidebar|from "../modules/shared/Sidebar|g' \
    -e "s|from '\.\./components/Sidebar|from '../modules/shared/Sidebar|g" \
    -e 's|from "\.\./components/TopBar|from "../modules/shared/TopBar|g' \
    -e "s|from '\.\./components/TopBar|from '../modules/shared/TopBar|g" \
    -e 's|from "\.\./components/BottomNav|from "../modules/shared/BottomNav|g' \
    -e "s|from '\.\./components/BottomNav|from '../modules/shared/BottomNav|g" \
    -e 's|from "\.\./components/LanguageSwitcher|from "../modules/shared/LanguageSwitcher|g' \
    -e "s|from '\.\./components/LanguageSwitcher|from '../modules/shared/LanguageSwitcher|g" \
    "$f"
done

echo "=== 完成 ==="