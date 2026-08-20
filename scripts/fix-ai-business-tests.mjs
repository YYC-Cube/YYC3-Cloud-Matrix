import fs from 'fs';
import path from 'path';

const dir = '/Users/my/YYC3-CloudPivot Intelli-Matrix/src/app/__tests__';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.test.tsx'));

const replacements = [
  ['../components/AIDiagnostics', '../modules/ai/AIDiagnostics'],
  ['../components/ModelProviderPanel', '../modules/ai/ModelProviderPanel'],
  ['../components/AddModelModal', '../modules/ai/AddModelModal'],
  ['../components/ProviderEditorModal', '../modules/ai/ProviderEditorModal'],
  ['../components/HotelDashboard', '../modules/business/HotelDashboard'],
  ['../components/CommStationPanel', '../modules/business/CommStationPanel'],
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