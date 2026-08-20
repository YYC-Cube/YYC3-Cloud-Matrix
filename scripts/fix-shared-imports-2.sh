#!/bin/bash
set -e
BASE="/Users/my/YYC3-CloudPivot Intelli-Matrix/src/app"

echo "=== 1. components/ dir ==="
find "$BASE/components" -type f \( -name "*.tsx" -o -name "*.ts" \) | while read f; do
  sed -i '' \
    -e 's|from "./GlassCard"|from "../modules/shared/GlassCard"|g' \
    -e 's|from '"'"'./GlassCard'"'"'|from '"'"'../modules/shared/GlassCard'"'"'|g' \
    -e 's|from "./YYC3Logo"|from "../modules/shared/YYC3Logo"|g' \
    -e 's|from '"'"'./YYC3Logo'"'"'|from '"'"'../modules/shared/YYC3Logo'"'"'|g' \
    -e 's|from "./YYC3LogoSvg"|from "../modules/shared/YYC3LogoSvg"|g' \
    -e 's|from '"'"'./YYC3LogoSvg'"'"'|from '"'"'../modules/shared/YYC3LogoSvg'"'"'|g' \
    -e 's|from "./ErrorBoundary"|from "../modules/shared/ErrorBoundary"|g' \
    -e 's|from '"'"'./ErrorBoundary'"'"'|from '"'"'../modules/shared/ErrorBoundary'"'"'|g' \
    -e 's|from "./NotFound"|from "../modules/shared/NotFound"|g' \
    -e 's|from '"'"'./NotFound'"'"'|from '"'"'../modules/shared/NotFound'"'"'|g' \
    -e 's|from "./Login"|from "../modules/shared/Login"|g' \
    -e 's|from '"'"'./Login'"'"'|from '"'"'../modules/shared/Login'"'"'|g' \
    "$f"
done

echo "=== 2. ai-family deep paths ==="
find "$BASE/modules/ai-family" -type f \( -name "*.tsx" -o -name "*.ts" \) | while read f; do
  sed -i '' \
    -e 's|from "../../../components/GlassCard"|from "../../shared/GlassCard"|g' \
    -e 's|from '"'"'../../../components/GlassCard'"'"'|from '"'"'../../shared/GlassCard'"'"'|g' \
    -e 's|from "../../../components/ErrorBoundary"|from "../../shared/ErrorBoundary"|g' \
    -e 's|from '"'"'../../../components/ErrorBoundary'"'"'|from '"'"'../../shared/ErrorBoundary'"'"'|g' \
    "$f"
done

echo "=== 3. test files ==="
find "$BASE/__tests__" -type f \( -name "*.tsx" -o -name "*.ts" \) | while read f; do
  sed -i '' \
    -e 's|from "../components/NotFound"|from "../modules/shared/NotFound"|g' \
    -e 's|from '"'"'../components/NotFound'"'"'|from '"'"'../modules/shared/NotFound'"'"'|g' \
    -e 's|from "../components/GlassCard"|from "../modules/shared/GlassCard"|g' \
    -e 's|from '"'"'../components/GlassCard'"'"'|from '"'"'../modules/shared/GlassCard'"'"'|g' \
    -e 's|from "../components/YYC3Logo"|from "../modules/shared/YYC3Logo"|g' \
    -e 's|from '"'"'../components/YYC3Logo'"'"'|from '"'"'../modules/shared/YYC3Logo'"'"'|g' \
    -e 's|from "../components/YYC3LogoSvg"|from "../modules/shared/YYC3LogoSvg"|g' \
    -e 's|from '"'"'../components/YYC3LogoSvg'"'"'|from '"'"'../modules/shared/YYC3LogoSvg'"'"'|g' \
    -e 's|from "../components/Layout"|from "../modules/shared/Layout"|g' \
    -e 's|from '"'"'../components/Layout'"'"'|from '"'"'../modules/shared/Layout'"'"'|g' \
    -e 's|from "../components/Sidebar"|from "../modules/shared/Sidebar"|g' \
    -e 's|from '"'"'../components/Sidebar'"'"'|from '"'"'../modules/shared/Sidebar'"'"'|g' \
    -e 's|from "../components/TopBar"|from "../modules/shared/TopBar"|g' \
    -e 's|from '"'"'../components/TopBar'"'"'|from '"'"'../modules/shared/TopBar'"'"'|g' \
    -e 's|from "../components/BottomNav"|from "../modules/shared/BottomNav"|g' \
    -e 's|from '"'"'../components/BottomNav'"'"'|from '"'"'../modules/shared/BottomNav'"'"'|g' \
    -e 's|from "../components/Login"|from "../modules/shared/Login"|g' \
    -e 's|from '"'"'../components/Login'"'"'|from '"'"'../modules/shared/Login'"'"'|g' \
    -e 's|from "../components/ErrorBoundary"|from "../modules/shared/ErrorBoundary"|g' \
    -e 's|from '"'"'../components/ErrorBoundary'"'"'|from '"'"'../modules/shared/ErrorBoundary'"'"'|g' \
    "$f"
done

echo "=== Done ==="