#!/bin/bash
set -e
BASE="/Users/my/YYC3-CloudPivot Intelli-Matrix/src/app"

echo "=== 1. Fix StorageManager ==="
sed -i '' \
  -e 's|from "./ui/page-header"|from "../../components/ui/page-header"|g' \
  -e "s|from './ui/page-header'|from '../../components/ui/page-header'|g" \
  -e 's|from "../services/storageManager"|from "../../services/storageManager"|g' \
  -e "s|from '../services/storageManager'|from '../../services/storageManager'|g" \
  -e 's|from "../types/storage"|from "../../types/storage"|g' \
  -e "s|from '../types/storage'|from '../../types/storage'|g" \
  "$BASE/modules/admin/StorageManager.tsx"

echo "=== 2. Fix StorageSyncStatus ==="
sed -i '' \
  -e 's|from "./ui/progress"|from "../../components/ui/progress"|g' \
  -e "s|from './ui/progress'|from '../../components/ui/progress'|g" \
  -e 's|from "../services/storageManager"|from "../../services/storageManager"|g' \
  -e "s|from '../services/storageManager'|from '../../services/storageManager'|g" \
  -e 's|from "../types/storage"|from "../../types/storage"|g' \
  -e "s|from '../types/storage'|from '../../types/storage'|g" \
  "$BASE/modules/admin/StorageSyncStatus.tsx"

echo "=== 3. Fix SystemSettings ==="
sed -i '' \
  -e 's|from "../modules/dev/design-system/DesignSystemPage"|from "../dev/design-system/DesignSystemPage"|g' \
  -e "s|from '../modules/dev/design-system/DesignSystemPage'|from '../dev/design-system/DesignSystemPage'|g" \
  -e 's|from "../modules/dev/ThemeCustomizer"|from "../dev/ThemeCustomizer"|g' \
  -e "s|from '../modules/dev/ThemeCustomizer'|from '../dev/ThemeCustomizer'|g" \
  -e 's|from "./UnifiedModelManager"|from "../../components/UnifiedModelManager"|g' \
  -e "s|from './UnifiedModelManager'|from '../../components/UnifiedModelManager'|g" \
  "$BASE/modules/admin/SystemSettings.tsx"

echo "=== 4. Fix UnifiedSettingsPanel ==="
sed -i '' \
  -e 's|from "../store"|from "../../store"|g' \
  -e "s|from '../store'|from '../../store'|g" \
  -e 's|from "../stores/global-store"|from "../../stores/global-store"|g' \
  -e "s|from '../stores/global-store'|from '../../stores/global-store'|g" \
  -e 's|from "./ui/alert-dialog"|from "../../components/ui/alert-dialog"|g' \
  -e "s|from './ui/alert-dialog'|from '../../components/ui/alert-dialog'|g" \
  -e 's|from "./ui/progress"|from "../../components/ui/progress"|g' \
  -e "s|from './ui/progress'|from '../../components/ui/progress'|g" \
  "$BASE/modules/admin/UnifiedSettingsPanel.tsx"

echo "=== 5. Fix VariableCenter ==="
sed -i '' \
  -e 's|from "./ui/scroll-area"|from "../../components/ui/scroll-area"|g' \
  -e "s|from './ui/scroll-area'|from '../../components/ui/scroll-area'|g" \
  "$BASE/modules/admin/VariableCenter.tsx"

echo "=== 6. Fix DatabaseManager ref to InlineEditableTable ==="
sed -i '' \
  -e 's|from "../../components/InlineEditableTable"|from "../admin/InlineEditableTable"|g' \
  -e "s|from '../../components/InlineEditableTable'|from '../admin/InlineEditableTable'|g" \
  "$BASE/modules/ops/DatabaseManager.tsx"

echo "=== 7. Fix Layout ref to PWAInstallPrompt ==="
sed -i '' \
  -e 's|from "../../components/PWAInstallPrompt"|from "../admin/PWAInstallPrompt"|g' \
  -e "s|from '../../components/PWAInstallPrompt'|from '../admin/PWAInstallPrompt'|g" \
  "$BASE/modules/shared/Layout.tsx"

echo "=== Done ==="