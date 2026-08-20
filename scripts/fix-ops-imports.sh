#!/bin/bash
set -e
BASE="/Users/my/YYC3-CloudPivot Intelli-Matrix/src/app"

echo "=== 1. Fix ops module internal imports ==="
# Files moved from components/ to modules/ops/
# ./X → ./X (same dir, no change)
# ../lib/ → ../../lib/
# ../hooks/ → ../../hooks/
# ../types → ../../types
# ../store/ → ../../store/
# ../modules/shared/ → ../shared/
# ../components/X → ../shared/X (for shared components) or ../../components/X (for non-shared)

find "$BASE/modules/ops" -type f \( -name "*.tsx" -o -name "*.ts" \) | while read f; do
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
    -e 's|from "../components/ErrorBoundary"|from "../shared/ErrorBoundary"|g' \
    -e "s|from '../components/ErrorBoundary'|from '../shared/ErrorBoundary'|g" \
    -e 's|from "../components/YYC3Logo"|from "../shared/YYC3Logo"|g' \
    -e "s|from '../components/YYC3Logo'|from '../shared/YYC3Logo'|g" \
    -e 's|from "../components/YYC3LogoSvg"|from "../shared/YYC3LogoSvg"|g' \
    -e "s|from '../components/YYC3LogoSvg'|from '../shared/YYC3LogoSvg'|g" \
    "$f"
done

echo "=== 2. Fix external refs to ops module (../../components/opsFile → ../ops/opsFile) ==="
# components/ directory files referencing moved ops files
find "$BASE/components" -type f \( -name "*.tsx" -o -name "*.ts" \) | while read f; do
  sed -i '' \
    -e 's|from "./OperationCenter"|from "../modules/ops/OperationCenter"|g' \
    -e "s|from './OperationCenter'|from '../modules/ops/OperationCenter'|g" \
    -e 's|from "./OperationChain"|from "../modules/ops/OperationChain"|g' \
    -e "s|from './OperationChain'|from '../modules/ops/OperationChain'|g" \
    -e 's|from "./OperationCategory"|from "../modules/ops/OperationCategory"|g' \
    -e "s|from './OperationCategory'|from '../modules/ops/OperationCategory'|g" \
    -e 's|from "./OperationLogStream"|from "../modules/ops/OperationLogStream"|g' \
    -e "s|from './OperationLogStream'|from '../modules/ops/OperationLogStream'|g" \
    -e 's|from "./OperationTemplate"|from "../modules/ops/OperationTemplate"|g' \
    -e "s|from './OperationTemplate'|from '../modules/ops/OperationTemplate'|g" \
    -e 's|from "./LocalFileManager"|from "../modules/ops/LocalFileManager"|g' \
    -e "s|from './LocalFileManager'|from '../modules/ops/LocalFileManager'|g" \
    -e 's|from "./FileBrowser"|from "../modules/ops/FileBrowser"|g' \
    -e "s|from './FileBrowser'|from '../modules/ops/FileBrowser'|g" \
    -e 's|from "./HostFileManager"|from "../modules/ops/HostFileManager"|g' \
    -e "s|from './HostFileManager'|from '../modules/ops/HostFileManager'|g" \
    -e 's|from "./DatabaseManager"|from "../modules/ops/DatabaseManager"|g' \
    -e "s|from './DatabaseManager'|from '../modules/ops/DatabaseManager'|g" \
    -e 's|from "./DatabaseConnectionPanel"|from "../modules/ops/DatabaseConnectionPanel"|g' \
    -e "s|from './DatabaseConnectionPanel'|from '../modules/ops/DatabaseConnectionPanel'|g" \
    -e 's|from "./ServiceConnectionTest"|from "../modules/ops/ServiceConnectionTest"|g' \
    -e "s|from './ServiceConnectionTest'|from '../modules/ops/ServiceConnectionTest'|g" \
    -e 's|from "./ServiceLoopPanel"|from "../modules/ops/ServiceLoopPanel"|g' \
    -e "s|from './ServiceLoopPanel'|from '../modules/ops/ServiceLoopPanel'|g" \
    -e 's|from "./LoopStageCard"|from "../modules/ops/LoopStageCard"|g' \
    -e "s|from './LoopStageCard'|from '../modules/ops/LoopStageCard'|g" \
    -e 's|from "./ReportExporter"|from "../modules/ops/ReportExporter"|g' \
    -e "s|from './ReportExporter'|from '../modules/ops/ReportExporter'|g" \
    -e 's|from "./ReportGenerator"|from "../modules/ops/ReportGenerator"|g' \
    -e "s|from './ReportGenerator'|from '../modules/ops/ReportGenerator'|g" \
    -e 's|from "./ConfigExportCenter"|from "../modules/ops/ConfigExportCenter"|g' \
    -e "s|from './ConfigExportCenter'|from '../modules/ops/ConfigExportCenter'|g" \
    -e 's|from "./ConnectionMonitorPanel"|from "../modules/ops/ConnectionMonitorPanel"|g' \
    -e "s|from './ConnectionMonitorPanel'|from '../modules/ops/ConnectionMonitorPanel'|g" \
    -e 's|from "./LogViewer"|from "../modules/ops/LogViewer"|g' \
    -e "s|from './LogViewer'|from '../modules/ops/LogViewer'|g" \
    "$f"
done

echo "=== 3. Fix routes.tsx ==="
sed -i '' \
  -e 's|from "./components/OperationCenter"|from "./modules/ops/OperationCenter"|g' \
  -e "s|from './components/OperationCenter'|from './modules/ops/OperationCenter'|g" \
  -e 's|from "./components/LocalFileManager"|from "./modules/ops/LocalFileManager"|g' \
  -e "s|from './components/LocalFileManager'|from './modules/ops/LocalFileManager'|g" \
  -e 's|from "./components/HostFileManager"|from "./modules/ops/HostFileManager"|g' \
  -e "s|from './components/HostFileManager'|from './modules/ops/HostFileManager'|g" \
  -e 's|from "./components/DatabaseManager"|from "./modules/ops/DatabaseManager"|g' \
  -e "s|from './components/DatabaseManager'|from './modules/ops/DatabaseManager'|g" \
  -e 's|from "./components/ServiceLoopPanel"|from "./modules/ops/ServiceLoopPanel"|g' \
  -e "s|from './components/ServiceLoopPanel'|from './modules/ops/ServiceLoopPanel'|g" \
  -e 's|from "./components/ReportExporter"|from "./modules/ops/ReportExporter"|g' \
  -e "s|from './components/ReportExporter'|from './modules/ops/ReportExporter'|g" \
  -e 's|from "./components/DatabaseConnectionPanel"|from "./modules/ops/DatabaseConnectionPanel"|g' \
  -e "s|from './components/DatabaseConnectionPanel'|from './modules/ops/DatabaseConnectionPanel'|g" \
  -e 's|from "./components/ConnectionMonitorPanel"|from "./modules/ops/ConnectionMonitorPanel"|g' \
  -e "s|from './components/ConnectionMonitorPanel'|from './modules/ops/ConnectionMonitorPanel'|g" \
  -e 's|from "./components/ServiceConnectionTest"|from "./modules/ops/ServiceConnectionTest"|g' \
  -e "s|from './components/ServiceConnectionTest'|from './modules/ops/ServiceConnectionTest'|g" \
  -e 's|from "./components/ConfigExportCenter"|from "./modules/ops/ConfigExportCenter"|g' \
  -e "s|from './components/ConfigExportCenter'|from './modules/ops/ConfigExportCenter'|g" \
  "$BASE/routes.tsx"

echo "=== 4. Fix test files ==="
find "$BASE/__tests__" -type f \( -name "*.tsx" -o -name "*.ts" \) | while read f; do
  sed -i '' \
    -e 's|from "../components/OperationCenter"|from "../modules/ops/OperationCenter"|g' \
    -e "s|from '../components/OperationCenter'|from '../modules/ops/OperationCenter'|g" \
    -e 's|from "../components/LocalFileManager"|from "../modules/ops/LocalFileManager"|g' \
    -e "s|from '../components/LocalFileManager'|from '../modules/ops/LocalFileManager'|g" \
    -e 's|from "../components/HostFileManager"|from "../modules/ops/HostFileManager"|g' \
    -e "s|from '../components/HostFileManager'|from '../modules/ops/HostFileManager'|g" \
    -e 's|from "../components/DatabaseManager"|from "../modules/ops/DatabaseManager"|g' \
    -e "s|from '../components/DatabaseManager'|from '../modules/ops/DatabaseManager'|g" \
    -e 's|from "../components/ServiceLoopPanel"|from "../modules/ops/ServiceLoopPanel"|g' \
    -e "s|from '../components/ServiceLoopPanel'|from '../modules/ops/ServiceLoopPanel'|g" \
    -e 's|from "../components/ReportExporter"|from "../modules/ops/ReportExporter"|g' \
    -e "s|from '../components/ReportExporter'|from '../modules/ops/ReportExporter'|g" \
    -e 's|from "../components/DatabaseConnectionPanel"|from "../modules/ops/DatabaseConnectionPanel"|g' \
    -e "s|from '../components/DatabaseConnectionPanel'|from '../modules/ops/DatabaseConnectionPanel'|g" \
    -e 's|from "../components/ConnectionMonitorPanel"|from "../modules/ops/ConnectionMonitorPanel"|g' \
    -e "s|from '../components/ConnectionMonitorPanel'|from '../modules/ops/ConnectionMonitorPanel'|g" \
    -e 's|from "../components/ServiceConnectionTest"|from "../modules/ops/ServiceConnectionTest"|g' \
    -e "s|from '../components/ServiceConnectionTest'|from '../modules/ops/ServiceConnectionTest'|g" \
    -e 's|from "../components/ConfigExportCenter"|from "../modules/ops/ConfigExportCenter"|g' \
    -e "s|from '../components/ConfigExportCenter'|from '../modules/ops/ConfigExportCenter'|g" \
    -e 's|from "../components/LogViewer"|from "../modules/ops/LogViewer"|g' \
    -e "s|from '../components/LogViewer'|from '../modules/ops/LogViewer'|g" \
    -e 's|from "../components/FileBrowser"|from "../modules/ops/FileBrowser"|g' \
    -e "s|from '../components/FileBrowser'|from '../modules/ops/FileBrowser'|g" \
    -e 's|from "../components/LoopStageCard"|from "../modules/ops/LoopStageCard"|g' \
    -e "s|from '../components/LoopStageCard'|from '../modules/ops/LoopStageCard'|g" \
    -e 's|from "../components/ReportGenerator"|from "../modules/ops/ReportGenerator"|g' \
    -e "s|from '../components/ReportGenerator'|from '../modules/ops/ReportGenerator'|g" \
    "$f"
done

echo "=== Done ==="