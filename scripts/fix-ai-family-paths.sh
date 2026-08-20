#!/bin/bash
# Fix internal ai-family module files: ../components/ai-family/ → ../components/
find src/app/modules/ai-family -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|"\.\./components/ai-family/shared"|"../components/shared"|g' {} +

# Fix external lib/ files: ../components/ai-family/shared → ../modules/ai-family/components/shared
find src/app/lib -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|"\.\./components/ai-family/shared"|"../modules/ai-family/components/shared"|g' {} +

# Fix AISuggestionPanel: ../hooks/useAIFamilyNav → ../modules/ai-family/hooks/useAIFamilyNav
find src/app/components -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|"\.\./hooks/useAIFamilyNav"|"../modules/ai-family/hooks/useAIFamilyNav"|g' {} +

# Fix test files: ../components/ai-family/ → ../modules/ai-family/components/
find src/app/__tests__ -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|"\.\./components/ai-family/|"../modules/ai-family/components/|g' {} +

# Fix test files for hooks
find src/app/__tests__ -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|"\.\./hooks/useAudioEngine"|"../modules/ai-family/hooks/useAudioEngine"|g' {} +
find src/app/__tests__ -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|"\.\./hooks/useEmotionMusic"|"../modules/ai-family/hooks/useEmotionMusic"|g' {} +
find src/app/__tests__ -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|"\.\./hooks/useMusicPlayer"|"../modules/ai-family/hooks/useMusicPlayer"|g' {} +

echo "Done fixing all import paths"