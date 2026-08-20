import fs from 'fs';
import path from 'path';

const dir = '/Users/my/YYC3-CloudPivot Intelli-Matrix/src/app/modules/shared';
const files = ['AIAssistant.tsx', 'CommandPalette.tsx', 'OfflineIndicator.tsx', 'ConnectionStatus.tsx', 'QuickActionGrid.tsx'];

const replacements = [
  ['../hooks/', '../../hooks/'],
  ['../lib/', '../../lib/'],
  ['../store/', '../../store/'],
  ['../types', '../../types'],
  ['../modules/shared/YYC3LogoSvg', './YYC3LogoSvg'],
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