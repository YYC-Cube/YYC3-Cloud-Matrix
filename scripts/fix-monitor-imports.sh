#!/bin/bash
set -e
BASE="/Users/my/YYC3-CloudPivot Intelli-Matrix/src/app/modules/monitor"

for f in "$BASE"/*.tsx; do
  sed -i '' \
    -e "s|from '../hooks/|from '../../hooks/|g" \
    -e 's|from "../hooks/|from "../../hooks/|g' \
    -e "s|from '../lib/|from '../../lib/|g" \
    -e 's|from "../lib/|from "../../lib/|g' \
    -e "s|from '../stores/|from '../../stores/|g" \
    -e 's|from "../stores/|from "../../stores/|g' \
    -e "s|from '../store/|from '../../store/|g" \
    -e 's|from "../store/|from "../../store/|g' \
    -e "s|from '../types'|from '../../types'|g" \
    -e 's|from "../types"|from "../../types"|g' \
    -e "s|from '../modules/shared/|from '../shared/|g" \
    -e 's|from "../modules/shared/|from "../shared/|g' \
    -e "s|from '../modules/ops/|from '../ops/|g" \
    -e 's|from "../modules/ops/|from "../ops/|g' \
    -e "s|from '../modules/ai-family/|from '../ai-family/|g" \
    -e 's|from "../modules/ai-family/|from "../ai-family/|g' \
    "$f"
done
echo "Monitor import path fixes complete"