#!/bin/bash
cd "/Users/my/YYC3-CloudPivot Intelli-Matrix/src/app"

# External lib files referencing old ai-family path
sed -i '' 's|from "../components/ai-family/shared"|from "../modules/ai-family/components/shared"|g' \
  lib/family-ai-service.ts \
  lib/ai-family-intelligence.ts \
  lib/FamilyMusicThemes.ts \
  lib/VoiceProfileManager.ts \
  lib/FamilyPersonalizedRecommender.ts \
  lib/MultiTurnDialogManager.ts

# External component files
sed -i '' 's|from "./ai-family/shared"|from "../modules/ai-family/components/shared"|g' \
  components/HotelDashboard.tsx

# Internal module files (relative from within module)
sed -i '' 's|from "../components/ai-family/shared"|from "../components/shared"|g' \
  modules/ai-family/lib/family-data-accessor.ts \
  modules/ai-family/hooks/useAIFamilyNav.ts

# Test files
sed -i '' 's|from "../components/ai-family/|from "../modules/ai-family/components/|g' \
  __tests__/FamilyModelSettings.test.tsx \
  __tests__/EmotionVisualizer.test.tsx \
  __tests__/VinylPhotoPlayer.test.tsx \
  __tests__/FamilyVoiceSystem.test.tsx \
  __tests__/CreationStudio.test.tsx \
  __tests__/FamilyUISettings.test.tsx

sed -i '' "s|'../components/ai-family/shared'|'../modules/ai-family/components/shared'|g" \
  __tests__/HotelDashboard.test.tsx

echo "All external references updated"