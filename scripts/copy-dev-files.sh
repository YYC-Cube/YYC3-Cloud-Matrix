#!/bin/bash
SRC="/Users/my/YYC3-Cloud-Pivot Intelli-Matrix/src/app"
DST="/Users/my/YYC3-CloudPivot Intelli-Matrix/src/app/modules/dev"

cp "$SRC/components/DevGuidePage.tsx" "$DST/DevGuidePage.tsx"
cp "$SRC/components/RefactoringReport.tsx" "$DST/RefactoringReport.tsx"
cp "$SRC/components/ArchitectureAudit.tsx" "$DST/ArchitectureAudit.tsx"
cp "$SRC/components/ThemeCustomizer.tsx" "$DST/ThemeCustomizer.tsx"
cp "$SRC/components/CLITerminal.tsx" "$DST/CLITerminal.tsx"
cp "$SRC/components/IntegratedTerminal.tsx" "$DST/IntegratedTerminal.tsx"
cp "$SRC/components/IDEPanel.tsx" "$DST/IDEPanel.tsx"
cp "$SRC/components/design-system/DesignSystemPage.tsx" "$DST/design-system/"
cp "$SRC/components/design-system/DesignTokens.tsx" "$DST/design-system/"
cp "$SRC/components/design-system/ComponentShowcase.tsx" "$DST/design-system/"
cp "$SRC/components/design-system/StageReview.tsx" "$DST/design-system/"
cp "$SRC/components/theme/ColorSwatch.tsx" "$DST/theme/"
cp "$SRC/components/theme/ColorPicker.tsx" "$DST/theme/"
cp "$SRC/components/theme/color-utils.ts" "$DST/theme/"
cp "$SRC/components/theme/theme-presets.ts" "$DST/theme/"

# IDE files
for f in "$SRC/components/ide/"*.tsx "$SRC/components/ide/"*.ts "$SRC/components/ide/"*.css; do
  [ -f "$f" ] && cp "$f" "$DST/ide/"
done

cp "$SRC/hooks/useTerminal.ts" "$DST/hooks/"

echo "Done. Files in DST:"
ls "$DST/"
ls "$DST/design-system/"
ls "$DST/ide/" | head -5