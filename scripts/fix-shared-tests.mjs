import fs from 'fs';
import path from 'path';

const dir = '/Users/my/YYC3-CloudPivot Intelli-Matrix/src/app/__tests__';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.test.tsx'));

const replacements = [
  ['../components/AIAssistant', '../modules/shared/AIAssistant'],
  ['../components/CommandPalette', '../modules/shared/CommandPalette'],
  ['../components/OfflineIndicator', '../modules/shared/OfflineIndicator'],
  ['../components/ConnectionStatus', '../modules/shared/ConnectionStatus'],
  ['../components/QuickActionGrid', '../modules/shared/QuickActionGrid'],
];

for (const file of files) {
  const fp = path.join(dir, file);
  let content = fs.readFileSync(fp, 'utf8');
  let changed = false;
  for (const [oldRep, newRep] of replacements) {
    if (content.includes(oldRep)) {
      content = content.split(oldRep).join(newRep);
      changed = true;
    }
  }
  if (changed) {
    fs.writeFileSync(fp, content);
    console.log('Fixed:', file);
  }
}
console.log('Done');