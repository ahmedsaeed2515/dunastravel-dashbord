const fs = require('fs');
const path = require('path');

const enPath = path.join(__dirname, '../src/messages/en.json');
const arPath = path.join(__dirname, '../src/messages/ar.json');
const ptPath = path.join(__dirname, '../src/messages/pt.json');
const itPath = path.join(__dirname, '../src/messages/it.json');

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const ar = JSON.parse(fs.readFileSync(arPath, 'utf8'));
const pt = JSON.parse(fs.readFileSync(ptPath, 'utf8'));
const it = JSON.parse(fs.readFileSync(itPath, 'utf8'));

function getKeys(obj, prefix = '') {
  let keys = [];
  for (const k in obj) {
    const keyPath = prefix ? `${prefix}.${k}` : k;
    if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
      keys = keys.concat(getKeys(obj[k], keyPath));
    } else {
      keys.push(keyPath);
    }
  }
  return keys;
}

const enKeys = getKeys(en);
const arKeys = getKeys(ar);
const ptKeys = getKeys(pt);
const itKeys = getKeys(it);

const missingInAr = enKeys.filter(k => !arKeys.includes(k));
const missingInEnFromAr = arKeys.filter(k => !enKeys.includes(k));
const missingInPt = enKeys.filter(k => !ptKeys.includes(k));
const missingInEnFromPt = ptKeys.filter(k => !enKeys.includes(k));
const missingInIt = enKeys.filter(k => !itKeys.includes(k));
const missingInEnFromIt = itKeys.filter(k => !enKeys.includes(k));

let hasErrors = false;

if (missingInAr.length > 0) {
  console.error('❌ Keys missing in Arabic (ar.json):');
  missingInAr.forEach(k => console.error(`  - ${k}`));
  hasErrors = true;
}

if (missingInEnFromAr.length > 0) {
  console.error('❌ Extra keys in Arabic not in English (en.json):');
  missingInEnFromAr.forEach(k => console.error(`  - ${k}`));
  hasErrors = true;
}

if (missingInPt.length > 0) {
  console.error('❌ Keys missing in Portuguese (pt.json):');
  missingInPt.forEach(k => console.error(`  - ${k}`));
  hasErrors = true;
}

if (missingInEnFromPt.length > 0) {
  console.error('❌ Extra keys in Portuguese not in English (en.json):');
  missingInEnFromPt.forEach(k => console.error(`  - ${k}`));
  hasErrors = true;
}

if (missingInIt.length > 0) {
  console.error('❌ Keys missing in Italian (it.json):');
  missingInIt.forEach(k => console.error(`  - ${k}`));
  hasErrors = true;
}

if (missingInEnFromIt.length > 0) {
  console.error('❌ Extra keys in Italian not in English (en.json):');
  missingInEnFromIt.forEach(k => console.error(`  - ${k}`));
  hasErrors = true;
}

if (hasErrors) {
  console.error('\nFAIL: Translation key parity check failed!');
  process.exit(1);
} else {
  console.log(`✅ i18n Parity Check PASSED! Total keys: ${enKeys.length} matched perfectly in EN, AR, PT, and IT.`);
  process.exit(0);
}
