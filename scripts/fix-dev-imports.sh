#!/bin/bash
set -e

# ═══ Fix Dev Module Internal Imports ═══
# These files moved from src/app/components/ to src/app/modules/dev/

BASE="src/app/modules/dev"

# ── Top-level files (modules/dev/*.tsx) ──
# ./GlassCard → ../../components/GlassCard
find "$BASE" -maxdepth 1 -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's|from "./GlassCard"|from "../../components/GlassCard"|g' {} +
# ../hooks/ → ../../hooks/
find "$BASE" -maxdepth 1 -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's|from "../hooks/|from "../../hooks/|g' {} +
# ../lib/ → ../../lib/
find "$BASE" -maxdepth 1 -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's|from "../lib/|from "../../lib/|g' {} +
# ../store/ → ../../store/
find "$BASE" -maxdepth 1 -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's|from "../store/|from "../../store/|g' {} +
# ./YYC3Logo → ../../components/YYC3Logo
find "$BASE" -maxdepth 1 -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's|from "./YYC3Logo"|from "../../components/YYC3Logo"|g' {} +
# ./ide/ → ./ide/ (stays same for IDEPanel)
# ./theme/ → ./theme/ (stays same for ThemeCustomizer)

# ── design-system/ files (modules/dev/design-system/*.tsx) ──
# ../GlassCard → ../../../components/GlassCard
find "$BASE/design-system" -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's|from "../GlassCard"|from "../../../components/GlassCard"|g' {} +
# ../hooks/ → ../../../hooks/
find "$BASE/design-system" -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's|from "../hooks/|from "../../../hooks/|g' {} +
# ../lib/ → ../../../lib/
find "$BASE/design-system" -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's|from "../lib/|from "../../../lib/|g' {} +
# ../store/ → ../../../store/
find "$BASE/design-system" -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's|from "../store/|from "../../../store/|g' {} +

# ── ide/ files (modules/dev/ide/*.tsx) ──
# ../GlassCard → ../../../components/GlassCard
find "$BASE/ide" -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's|from "../GlassCard"|from "../../../components/GlassCard"|g' {} +
# ../hooks/ → ../../../hooks/
find "$BASE/ide" -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's|from "../hooks/|from "../../../hooks/|g' {} +
# ../lib/ → ../../../lib/
find "$BASE/ide" -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's|from "../lib/|from "../../../lib/|g' {} +
# ../store/ → ../../../store/
find "$BASE/ide" -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's|from "../store/|from "../../../store/|g' {} +
# ../types → ../../../types
find "$BASE/ide" -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's|from "../types"|from "../../../types"|g' {} +
# ../components/ (for sibling components like YYC3Logo, etc.) → ../../../components/
find "$BASE/ide" -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's|from "../components/|from "../../../components/|g' {} +

# ── theme/ files (modules/dev/theme/*.tsx) ──
# ../hooks/ → ../../../hooks/
find "$BASE/theme" -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's|from "../hooks/|from "../../../hooks/|g' {} +
# ../lib/ → ../../../lib/
find "$BASE/theme" -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's|from "../lib/|from "../../../lib/|g' {} +
# ../store/ → ../../../store/
find "$BASE/theme" -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's|from "../store/|from "../../../store/|g' {} +

# ── hooks/ files (modules/dev/hooks/*.ts) ──
# ../lib/ → ../../../lib/
find "$BASE/hooks" -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's|from "../lib/|from "../../../lib/|g' {} +
# ../store/ → ../../../store/
find "$BASE/hooks" -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's|from "../store/|from "../../../store/|g' {} +

# ── Fix test files ──
# ../components/DevGuidePage → ../modules/dev/DevGuidePage
find src/app/__tests__ -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's|from "../components/DevGuidePage"|from "../modules/dev/DevGuidePage"|g' {} +
find src/app/__tests__ -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's|from "../components/RefactoringReport"|from "../modules/dev/RefactoringReport"|g' {} +
find src/app/__tests__ -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's|from "../components/ArchitectureAudit"|from "../modules/dev/ArchitectureAudit"|g' {} +
find src/app/__tests__ -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's|from "../components/ThemeCustomizer"|from "../modules/dev/ThemeCustomizer"|g' {} +
find src/app/__tests__ -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's|from "../components/CLITerminal"|from "../modules/dev/CLITerminal"|g' {} +
find src/app/__tests__ -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's|from "../components/IDEPanel"|from "../modules/dev/IDEPanel"|g' {} +
find src/app/__tests__ -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's|from "../components/design-system/|from "../modules/dev/design-system/|g' {} +
find src/app/__tests__ -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's|from "../hooks/useTerminal"|from "../modules/dev/hooks/useTerminal"|g' {} +

echo "Dev module import paths fixed"