import fs from 'fs';
import path from 'path';

const dir = '/Users/my/YYC3-CloudPivot Intelli-Matrix/src/app/__tests__';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.test.tsx'));

const replacements = [
  ['../components/ActionRecommender', '../modules/monitor/ActionRecommender'],
  ['../components/AlertRulesPanel', '../modules/monitor/AlertRulesPanel'],
  ['../components/Dashboard', '../modules/monitor/Dashboard'],
  ['../components/PatternAnalyzer', '../modules/monitor/PatternAnalyzer'],
  ['../components/QuickActionGroup', '../modules/monitor/QuickActionGroup'],
  ['../components/SDKChatPanel', '../modules/monitor/SDKChatPanel'],
  ['../components/CreateRuleModal', '../modules/monitor/CreateRuleModal'],
];

let count = 0;
for (const file of files) {
  const fp = path.join(dir, file);
  let content = fs.readFileSync(fp, 'utf8');
  let changed = false;
  for (const [old, rep] of replacements) {
    if (content.includes(old)) {
      content = content.split(old).join(rep);
      changed = true;
    }
  }
  if (changed) {
    fs.writeFileSync(fp, content);
    count++;
    console.log('Fixed:', file);
  }
}
console.log('Fixed', count, 'files');