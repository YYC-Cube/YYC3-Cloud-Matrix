#!/bin/bash
set -e
BASE="/Users/my/YYC3-CloudPivot Intelli-Matrix/src/app"

echo "=== 1. Fix ops module: ../modules/ops/X → ./X ==="
find "$BASE/modules/ops" -type f \( -name "*.tsx" -o -name "*.ts" \) | while read f; do
  sed -i '' \
    -e 's|from "../modules/ops/|from "./|g' \
    -e "s|from '../modules/ops/|from './|g" \
    "$f"
done

echo "=== 2. Fix ops module: ./CodeEditor → ../components/CodeEditor ==="
find "$BASE/modules/ops" -type f \( -name "*.tsx" -o -name "*.ts" \) | while read f; do
  sed -i '' \
    -e 's|from "./CodeEditor"|from "../components/CodeEditor"|g' \
    -e "s|from './CodeEditor'|from '../components/CodeEditor'|g" \
    -e 's|from "./InlineEditableTable"|from "../components/InlineEditableTable"|g' \
    -e "s|from './InlineEditableTable'|from '../components/InlineEditableTable'|g" \
    -e 's|from "./QuickActionGrid"|from "../components/QuickActionGrid"|g' \
    -e "s|from './QuickActionGrid'|from '../components/QuickActionGrid'|g" \
    -e 's|from "./DataFlowDiagram"|from "../components/DataFlowDiagram"|g' \
    -e "s|from './DataFlowDiagram'|from '../components/DataFlowDiagram'|g" \
    -e 's|from "./QuickActionGroup"|from "../components/QuickActionGroup"|g' \
    -e "s|from './QuickActionGroup'|from '../components/QuickActionGroup'|g" \
    "$f"
done

echo "=== 3. Fix ConnectionMonitorPanel special paths ==="
sed -i '' \
  -e 's|from "../../database/ConnectionManager"|from "../../lib/database/ConnectionManager"|g' \
  -e "s|from '../../database/ConnectionManager'|from '../../lib/database/ConnectionManager'|g" \
  -e 's|from "../../database/types"|from "../../lib/database/types"|g' \
  -e "s|from '../../database/types'|from '../../lib/database/types'|g" \
  "$BASE/modules/ops/ConnectionMonitorPanel.tsx"

echo "=== 4. Fix routes.tsx remaining ==="
sed -i '' \
  -e 's|from "./components/OperationCenter"|from "./modules/ops/OperationCenter"|g' \
  -e "s|from './components/OperationCenter'|from './modules/ops/OperationCenter'|g" \
  -e 's|from "./components/LocalFileManager"|from "./modules/ops/LocalFileManager"|g' \
  -e "s|from './components/LocalFileManager'|from './modules/ops/LocalFileManager'|g" \
  -e 's|from "./components/ServiceLoopPanel"|from "./modules/ops/ServiceLoopPanel"|g' \
  -e "s|from './components/ServiceLoopPanel'|from './modules/ops/ServiceLoopPanel'|g" \
  -e 's|from "./components/ReportExporter"|from "./modules/ops/ReportExporter"|g' \
  -e "s|from './components/ReportExporter'|from './modules/ops/ReportExporter'|g" \
  -e 's|from "./components/HostFileManager"|from "./modules/ops/HostFileManager"|g' \
  -e "s|from './components/HostFileManager'|from './modules/ops/HostFileManager'|g" \
  -e 's|from "./components/DatabaseManager"|from "./modules/ops/DatabaseManager"|g' \
  -e "s|from './components/DatabaseManager'|from './modules/ops/DatabaseManager'|g" \
  -e 's|from "./components/DatabaseConnectionPanel"|from "./modules/ops/DatabaseConnectionPanel"|g' \
  -e "s|from './components/DatabaseConnectionPanel'|from './modules/ops/DatabaseConnectionPanel'|g" \
  -e 's|from "./components/ConnectionMonitorPanel"|from "./modules/ops/ConnectionMonitorPanel"|g' \
  -e "s|from './components/ConnectionMonitorPanel'|from './modules/ops/ConnectionMonitorPanel'|g" \
  -e 's|from "./components/ServiceConnectionTest"|from "./modules/ops/ServiceConnectionTest"|g' \
  -e "s|from './components/ServiceConnectionTest'|from './modules/ops/ServiceConnectionTest'|g" \
  -e 's|from "./components/ConfigExportCenter"|from "./modules/ops/ConfigExportCenter"|g' \
  -e "s|from './components/ConfigExportCenter'|from './modules/ops/ConfigExportCenter'|g" \
  "$BASE/routes.tsx"

echo "=== 5. Fix test files remaining ==="
find "$BASE/__tests__" -type f \( -name "*.tsx" -o -name "*.ts" \) | while read f; do
  sed -i '' \
    -e 's|from "../components/OperationCategory"|from "../modules/ops/OperationCategory"|g' \
    -e "s|from '../components/OperationCategory'|from '../modules/ops/OperationCategory'|g" \
    -e 's|from "../components/OperationChain"|from "../modules/ops/OperationChain"|g' \
    -e "s|from '../components/OperationChain'|from '../modules/ops/OperationChain'|g" \
    -e 's|from "../components/OperationLogStream"|from "../modules/ops/OperationLogStream"|g' \
    -e "s|from '../components/OperationLogStream'|from '../modules/ops/OperationLogStream'|g" \
    -e 's|from "../components/OperationTemplate"|from "../modules/ops/OperationTemplate"|g' \
    -e "s|from '../components/OperationTemplate'|from '../modules/ops/OperationTemplate'|g" \
    -e 's|from "../components/OperationCenter"|from "../modules/ops/OperationCenter"|g' \
    -e "s|from '../components/OperationCenter'|from '../modules/ops/OperationCenter'|g" \
    "$f"
done

echo "=== Done ==="