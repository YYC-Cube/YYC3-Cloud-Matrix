#!/bin/bash
set -e
BASE="/Users/my/YYC3-CloudPivot Intelli-Matrix/src/app"

echo "=== 1. Fix admin module: ../config → ../../config ==="
find "$BASE/modules/admin" -type f \( -name "*.tsx" -o -name "*.ts" \) | while read f; do
  sed -i '' \
    -e 's|from "../config"|from "../../config"|g' \
    -e "s|from '../config'|from '../../config'|g" \
    -e 's|from "../config/|from "../../config/|g' \
    -e "s|from '../config/|from '../../config/|g" \
    "$f"
done

echo "=== 2. Fix admin module: ./ui/ → ../../components/ui/ ==="
find "$BASE/modules/admin" -type f \( -name "*.tsx" -o -name "*.ts" \) | while read f; do
  sed -i '' \
    -e 's|from "./ui/button"|from "../../components/ui/button"|g' \
    -e "s|from './ui/button'|from '../../components/ui/button'|g" \
    -e 's|from "./ui/card"|from "../../components/ui/card"|g' \
    -e "s|from './ui/card'|from '../../components/ui/card'|g" \
    -e 's|from "./ui/label"|from "../../components/ui/label"|g' \
    -e "s|from './ui/label'|from '../../components/ui/label'|g" \
    -e 's|from "./ui/switch"|from "../../components/ui/switch"|g' \
    -e "s|from './ui/switch'|from '../../components/ui/switch'|g" \
    -e 's|from "./ui/select"|from "../../components/ui/select"|g' \
    -e "s|from './ui/select'|from '../../components/ui/select'|g" \
    -e 's|from "./ui/input"|from "../../components/ui/input"|g' \
    -e "s|from './ui/input'|from '../../components/ui/input'|g" \
    -e 's|from "./ui/tabs"|from "../../components/ui/tabs"|g' \
    -e "s|from './ui/tabs'|from '../../components/ui/tabs'|g" \
    -e 's|from "./ui/badge"|from "../../components/ui/badge"|g' \
    -e "s|from './ui/badge'|from '../../components/ui/badge'|g" \
    -e 's|from "./ui/slider"|from "../../components/ui/slider"|g' \
    -e "s|from './ui/slider'|from '../../components/ui/slider'|g" \
    -e 's|from "./ui/alert"|from "../../components/ui/alert"|g' \
    -e "s|from './ui/alert'|from '../../components/ui/alert'|g" \
    -e 's|from "./ui/tooltip"|from "../../components/ui/tooltip"|g' \
    -e "s|from './ui/tooltip'|from '../../components/ui/tooltip'|g" \
    -e 's|from "./ui/separator"|from "../../components/ui/separator"|g' \
    -e "s|from './ui/separator'|from '../../components/ui/separator'|g" \
    -e 's|from "./ui/dropdown-menu"|from "../../components/ui/dropdown-menu"|g' \
    -e "s|from './ui/dropdown-menu'|from '../../components/ui/dropdown-menu'|g" \
    "$f"
done

echo "=== 3. Fix admin module: ../modules/ops/ → ../ops/ ==="
find "$BASE/modules/admin" -type f \( -name "*.tsx" -o -name "*.ts" \) | while read f; do
  sed -i '' \
    -e 's|from "../modules/ops/|from "../ops/|g' \
    -e "s|from '../modules/ops/|from '../ops/|g" \
    "$f"
done

echo "=== 4. Fix StorageConfigPanel special paths ==="
sed -i '' \
  -e 's|from "../types/storage"|from "../../types/storage"|g' \
  -e "s|from '../types/storage'|from '../../types/storage'|g" \
  -e 's|from "../../database/types"|from "../../../database/types"|g' \
  -e "s|from '../../database/types'|from '../../../database/types'|g" \
  "$BASE/modules/admin/StorageConfigPanel.tsx"

echo "=== 5. Fix test files remaining ==="
sed -i '' \
  -e 's|from "../components/DataEditorTables"|from "../modules/admin/DataEditorTables"|g' \
  -e "s|from '../components/DataEditorTables'|from '../modules/admin/DataEditorTables'|g" \
  -e 's|from "../components/PWAInstallPrompt"|from "../modules/admin/PWAInstallPrompt"|g' \
  -e "s|from '../components/PWAInstallPrompt'|from '../modules/admin/PWAInstallPrompt'|g" \
  "$BASE/__tests__/DataEditorTables.test.tsx" \
  "$BASE/__tests__/PWAInstallPrompt.test.tsx"

echo "=== Done ==="