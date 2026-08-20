#!/bin/bash
set -e
BASE="/Users/my/YYC3-CloudPivot Intelli-Matrix/src/app"

echo "=== 1. Fix admin module internal imports ==="
find "$BASE/modules/admin" -type f \( -name "*.tsx" -o -name "*.ts" \) | while read f; do
  sed -i '' \
    -e 's|from "../lib/|from "../../lib/|g' \
    -e "s|from '../lib/|from '../../lib/|g" \
    -e 's|from "../hooks/|from "../../hooks/|g' \
    -e "s|from '../hooks/|from '../../hooks/|g" \
    -e 's|from "../types"|from "../../types"|g' \
    -e "s|from '../types'|from '../../types'|g" \
    -e 's|from "../store/|from "../../store/|g' \
    -e "s|from '../store/|from '../../store/|g" \
    -e 's|from "../modules/shared/|from "../shared/|g' \
    -e "s|from '../modules/shared/|from '../shared/|g" \
    -e 's|from "../components/GlassCard"|from "../shared/GlassCard"|g' \
    -e "s|from '../components/GlassCard'|from '../shared/GlassCard'|g" \
    -e 's|from "../components/YYC3Logo"|from "../shared/YYC3Logo"|g' \
    -e "s|from '../components/YYC3Logo'|from '../shared/YYC3Logo'|g" \
    -e 's|from "../components/YYC3LogoSvg"|from "../shared/YYC3LogoSvg"|g' \
    -e "s|from '../components/YYC3LogoSvg'|from '../shared/YYC3LogoSvg'|g" \
    -e 's|from "../components/ErrorBoundary"|from "../shared/ErrorBoundary"|g' \
    -e "s|from '../components/ErrorBoundary'|from '../shared/ErrorBoundary'|g" \
    "$f"
done

echo "=== 2. Fix admin module: ./X → ../../components/X for non-shared ==="
find "$BASE/modules/admin" -type f \( -name "*.tsx" -o -name "*.ts" \) | while read f; do
  sed -i '' \
    -e 's|from "./CodeEditor"|from "../../components/CodeEditor"|g' \
    -e "s|from './CodeEditor'|from '../../components/CodeEditor'|g" \
    -e 's|from "./InlineEditableTable"|from "./InlineEditableTable"|g' \
    -e "s|from './InlineEditableTable'|from './InlineEditableTable'|g" \
    -e 's|from "./DataEditorTables"|from "./DataEditorTables"|g' \
    -e "s|from './DataEditorTables'|from './DataEditorTables'|g" \
    -e 's|from "./QuickActionGrid"|from "../../components/QuickActionGrid"|g' \
    -e "s|from './QuickActionGrid'|from '../../components/QuickActionGrid'|g" \
    -e 's|from "./QuickActionGroup"|from "../../components/QuickActionGroup"|g' \
    -e "s|from './QuickActionGroup'|from '../../components/QuickActionGroup'|g" \
    -e 's|from "./CommandPalette"|from "../../components/CommandPalette"|g' \
    -e "s|from './CommandPalette'|from '../../components/CommandPalette'|g" \
    -e 's|from "./AIAssistant"|from "../../components/AIAssistant"|g' \
    -e "s|from './AIAssistant'|from '../../components/AIAssistant'|g" \
    -e 's|from "./NodeDetailModal"|from "../../components/NodeDetailModal"|g' \
    -e "s|from './NodeDetailModal'|from '../../components/NodeDetailModal'|g" \
    -e 's|from "./FollowUpCard"|from "../../components/FollowUpCard"|g' \
    -e "s|from './FollowUpCard'|from '../../components/FollowUpCard'|g" \
    "$f"
done

echo "=== 3. Fix components/ refs to admin module ==="
find "$BASE/components" -type f \( -name "*.tsx" -o -name "*.ts" \) | while read f; do
  sed -i '' \
    -e 's|from "./OperationAudit"|from "../modules/admin/OperationAudit"|g' \
    -e "s|from './OperationAudit'|from '../modules/admin/OperationAudit'|g" \
    -e 's|from "./UserManagement"|from "../modules/admin/UserManagement"|g' \
    -e "s|from './UserManagement'|from '../modules/admin/UserManagement'|g" \
    -e 's|from "./SystemSettings"|from "../modules/admin/SystemSettings"|g' \
    -e "s|from './SystemSettings'|from '../modules/admin/SystemSettings'|g" \
    -e 's|from "./SecurityMonitor"|from "../modules/admin/SecurityMonitor"|g' \
    -e "s|from './SecurityMonitor'|from '../modules/admin/SecurityMonitor'|g" \
    -e 's|from "./PWAStatusPanel"|from "../modules/admin/PWAStatusPanel"|g' \
    -e "s|from './PWAStatusPanel'|from '../modules/admin/PWAStatusPanel'|g" \
    -e 's|from "./PWAInstallPrompt"|from "../modules/admin/PWAInstallPrompt"|g' \
    -e "s|from './PWAInstallPrompt'|from '../modules/admin/PWAInstallPrompt'|g" \
    -e 's|from "./DataEditorPanel"|from "../modules/admin/DataEditorPanel"|g' \
    -e "s|from './DataEditorPanel'|from '../modules/admin/DataEditorPanel'|g" \
    -e 's|from "./DataEditorTables"|from "../modules/admin/DataEditorTables"|g' \
    -e "s|from './DataEditorTables'|from '../modules/admin/DataEditorTables'|g" \
    -e 's|from "./PerformanceMonitor"|from "../modules/admin/PerformanceMonitor"|g' \
    -e "s|from './PerformanceMonitor'|from '../modules/admin/PerformanceMonitor'|g" \
    -e 's|from "./EnvConfigEditor"|from "../modules/admin/EnvConfigEditor"|g' \
    -e "s|from './EnvConfigEditor'|from '../modules/admin/EnvConfigEditor'|g" \
    -e 's|from "./StorageManager"|from "../modules/admin/StorageManager"|g' \
    -e "s|from './StorageManager'|from '../modules/admin/StorageManager'|g" \
    -e 's|from "./StorageConfigPanel"|from "../modules/admin/StorageConfigPanel"|g' \
    -e "s|from './StorageConfigPanel'|from '../modules/admin/StorageConfigPanel'|g" \
    -e 's|from "./StorageSyncStatus"|from "../modules/admin/StorageSyncStatus"|g' \
    -e "s|from './StorageSyncStatus'|from '../modules/admin/StorageSyncStatus'|g" \
    -e 's|from "./ConfigCenter"|from "../modules/admin/ConfigCenter"|g' \
    -e "s|from './ConfigCenter'|from '../modules/admin/ConfigCenter'|g" \
    -e 's|from "./VariableCenter"|from "../modules/admin/VariableCenter"|g' \
    -e "s|from './VariableCenter'|from '../modules/admin/VariableCenter'|g" \
    -e 's|from "./PageConfigEditor"|from "../modules/admin/PageConfigEditor"|g' \
    -e "s|from './PageConfigEditor'|from '../modules/admin/PageConfigEditor'|g" \
    -e 's|from "./NetworkConfig"|from "../modules/admin/NetworkConfig"|g' \
    -e "s|from './NetworkConfig'|from '../modules/admin/NetworkConfig'|g" \
    -e 's|from "./UnifiedSettingsPanel"|from "../modules/admin/UnifiedSettingsPanel"|g' \
    -e "s|from './UnifiedSettingsPanel'|from '../modules/admin/UnifiedSettingsPanel'|g" \
    -e 's|from "./InlineEditableTable"|from "../modules/admin/InlineEditableTable"|g' \
    -e "s|from './InlineEditableTable'|from '../modules/admin/InlineEditableTable'|g" \
    "$f"
done

echo "=== 4. Fix routes.tsx ==="
sed -i '' \
  -e 's|import("./components/OperationAudit")|import("./modules/admin/OperationAudit")|g' \
  -e "s|import('./components/OperationAudit')|import('./modules/admin/OperationAudit')|g" \
  -e 's|import("./components/UserManagement")|import("./modules/admin/UserManagement")|g' \
  -e "s|import('./components/UserManagement')|import('./modules/admin/UserManagement')|g" \
  -e 's|import("./components/SystemSettings")|import("./modules/admin/SystemSettings")|g' \
  -e "s|import('./components/SystemSettings')|import('./modules/admin/SystemSettings')|g" \
  -e 's|import("./components/SecurityMonitor")|import("./modules/admin/SecurityMonitor")|g' \
  -e "s|import('./components/SecurityMonitor')|import('./modules/admin/SecurityMonitor')|g" \
  -e 's|import("./components/PWAStatusPanel")|import("./modules/admin/PWAStatusPanel")|g' \
  -e "s|import('./components/PWAStatusPanel')|import('./modules/admin/PWAStatusPanel')|g" \
  -e 's|import("./components/DataEditorPanel")|import("./modules/admin/DataEditorPanel")|g' \
  -e "s|import('./components/DataEditorPanel')|import('./modules/admin/DataEditorPanel')|g" \
  -e 's|import("./components/PerformanceMonitor")|import("./modules/admin/PerformanceMonitor")|g' \
  -e "s|import('./components/PerformanceMonitor')|import('./modules/admin/PerformanceMonitor')|g" \
  -e 's|import("./components/EnvConfigEditor")|import("./modules/admin/EnvConfigEditor")|g' \
  -e "s|import('./components/EnvConfigEditor')|import('./modules/admin/EnvConfigEditor')|g" \
  -e 's|import("./components/StorageManager")|import("./modules/admin/StorageManager")|g' \
  -e "s|import('./components/StorageManager')|import('./modules/admin/StorageManager')|g" \
  -e 's|import("./components/ConfigCenter")|import("./modules/admin/ConfigCenter")|g' \
  -e "s|import('./components/ConfigCenter')|import('./modules/admin/ConfigCenter')|g" \
  -e 's|import("./components/VariableCenter")|import("./modules/admin/VariableCenter")|g' \
  -e "s|import('./components/VariableCenter')|import('./modules/admin/VariableCenter')|g" \
  -e 's|import("./components/UnifiedSettingsPanel")|import("./modules/admin/UnifiedSettingsPanel")|g' \
  -e "s|import('./components/UnifiedSettingsPanel')|import('./modules/admin/UnifiedSettingsPanel')|g" \
  "$BASE/routes.tsx"

echo "=== 5. Fix test files ==="
find "$BASE/__tests__" -type f \( -name "*.tsx" -o -name "*.ts" \) | while read f; do
  sed -i '' \
    -e 's|from "../components/OperationAudit"|from "../modules/admin/OperationAudit"|g' \
    -e "s|from '../components/OperationAudit'|from '../modules/admin/OperationAudit'|g" \
    -e 's|from "../components/UserManagement"|from "../modules/admin/UserManagement"|g' \
    -e "s|from '../components/UserManagement'|from '../modules/admin/UserManagement'|g" \
    -e 's|from "../components/SystemSettings"|from "../modules/admin/SystemSettings"|g' \
    -e "s|from '../components/SystemSettings'|from '../modules/admin/SystemSettings'|g" \
    -e 's|from "../components/SecurityMonitor"|from "../modules/admin/SecurityMonitor"|g' \
    -e "s|from '../components/SecurityMonitor'|from '../modules/admin/SecurityMonitor'|g" \
    -e 's|from "../components/PWAStatusPanel"|from "../modules/admin/PWAStatusPanel"|g' \
    -e "s|from '../components/PWAStatusPanel'|from '../modules/admin/PWAStatusPanel'|g" \
    -e 's|from "../components/DataEditorPanel"|from "../modules/admin/DataEditorPanel"|g' \
    -e "s|from '../components/DataEditorPanel'|from '../modules/admin/DataEditorPanel'|g" \
    -e 's|from "../components/PerformanceMonitor"|from "../modules/admin/PerformanceMonitor"|g' \
    -e "s|from '../components/PerformanceMonitor'|from '../modules/admin/PerformanceMonitor'|g" \
    -e 's|from "../components/EnvConfigEditor"|from "../modules/admin/EnvConfigEditor"|g' \
    -e "s|from '../components/EnvConfigEditor'|from '../modules/admin/EnvConfigEditor'|g" \
    -e 's|from "../components/StorageManager"|from "../modules/admin/StorageManager"|g' \
    -e "s|from '../components/StorageManager'|from '../modules/admin/StorageManager'|g" \
    -e 's|from "../components/ConfigCenter"|from "../modules/admin/ConfigCenter"|g' \
    -e "s|from '../components/ConfigCenter'|from '../modules/admin/ConfigCenter'|g" \
    -e 's|from "../components/VariableCenter"|from "../modules/admin/VariableCenter"|g' \
    -e "s|from '../components/VariableCenter'|from '../modules/admin/VariableCenter'|g" \
    -e 's|from "../components/UnifiedSettingsPanel"|from "../modules/admin/UnifiedSettingsPanel"|g' \
    -e "s|from '../components/UnifiedSettingsPanel'|from '../modules/admin/UnifiedSettingsPanel'|g" \
    -e 's|from "../components/NetworkConfig"|from "../modules/admin/NetworkConfig"|g' \
    -e "s|from '../components/NetworkConfig'|from '../modules/admin/NetworkConfig'|g" \
    -e 's|from "../components/InlineEditableTable"|from "../modules/admin/InlineEditableTable"|g' \
    -e "s|from '../components/InlineEditableTable'|from '../modules/admin/InlineEditableTable'|g" \
    -e 's|from "../components/StorageConfigPanel"|from "../modules/admin/StorageConfigPanel"|g' \
    -e "s|from '../components/StorageConfigPanel'|from '../modules/admin/StorageConfigPanel'|g" \
    "$f"
done

echo "=== Done ==="