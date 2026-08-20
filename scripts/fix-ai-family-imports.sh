#!/bin/bash
cd "/Users/my/YYC3-CloudPivot Intelli-Matrix/src/app/modules/ai-family"

# A: from "../../store" → from "../store" (exact match only)
find . -type f \( -name '*.tsx' -o -name '*.ts' \) -exec sed -i '' 's|from "../../store"|from "../store"|g' {} \;

# B: family-settings-slice path
find . -type f \( -name '*.tsx' -o -name '*.ts' \) -exec sed -i '' 's|from "../../store/slices/family-settings-slice"|from "../store/family-settings-slice"|g' {} \;

# C: provider-slice (still in main store)
find . -type f \( -name '*.tsx' -o -name '*.ts' \) -exec sed -i '' 's|from "../../store/slices/provider-slice"|from "../../../store/slices/provider-slice"|g' {} \;

# D: moved hooks
find . -type f \( -name '*.tsx' -o -name '*.ts' \) -exec sed -i '' 's|from "../../hooks/useAudioEngine"|from "../hooks/useAudioEngine"|g' {} \;
find . -type f \( -name '*.tsx' -o -name '*.ts' \) -exec sed -i '' 's|from "../../hooks/useEmotionMusic"|from "../hooks/useEmotionMusic"|g' {} \;
find . -type f \( -name '*.tsx' -o -name '*.ts' \) -exec sed -i '' 's|from "../../hooks/useMusicPlayer"|from "../hooks/useMusicPlayer"|g' {} \;

echo "Done"