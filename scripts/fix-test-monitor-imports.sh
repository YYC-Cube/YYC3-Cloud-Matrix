#!/bin/bash
set -e
BASE="/Users/my/YYC3-CloudPivot Intelli-Matrix/src/app/__tests__"

for f in "$BASE"/*.test.tsx; do
  sed -i '' \
    -e "s|../components/ActionRecommender|../modules/monitor/ActionRecommender|g" \
    -e "s|../components/AISuggestionPanel|../modules/monitor/AISuggestionPanel|g" \
    -e "s|../components/AlertBanner|../modules/monitor/AlertBanner|g" \
    -e "s|../components/AlertRulesPanel|../modules/monitor/AlertRulesPanel|g" \
    -e "s|../components/CreateRuleModal|../modules/monitor/CreateRuleModal|g" \
    -e "s|../components/Dashboard|../modules/monitor/Dashboard|g" \
    -e "s|../components/DataMonitoring|../modules/monitor/DataMonitoring|g" \
    -e "s|../components/FollowUpCard|../modules/monitor/FollowUpCard|g" \
    -e "s|../components/FollowUpDrawer|../modules/monitor/FollowUpDrawer|g" \
    -e "s|../components/FollowUpManager|../modules/monitor/FollowUpManager|g" \
    -e "s|../components/FollowUpPanel|../modules/monitor/FollowUpPanel|g" \
    -e "s|../components/PatrolDashboard|../modules/monitor/PatrolDashboard|g" \
    -e "s|../components/PatrolHistory|../modules/monitor/PatrolHistory|g" \
    -e "s|../components/PatrolReport|../modules/monitor/PatrolReport|g" \
    -e "s|../components/PatrolScheduler|../modules/monitor/PatrolScheduler|g" \
    -e "s|../components/PatternAnalyzer|../modules/monitor/PatternAnalyzer|g" \
    -e "s|../components/QuickActionGroup|../modules/monitor/QuickActionGroup|g" \
    -e "s|../components/SDKChatPanel|../modules/monitor/SDKChatPanel|g" \
    "$f"
done
echo "Test imports fixed"