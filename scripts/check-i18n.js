const fs = require('fs');
const path = require('path');

const enPath = path.join(__dirname, '../src/messages/en.json');
const arPath = path.join(__dirname, '../src/messages/ar.json');

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const ar = JSON.parse(fs.readFileSync(arPath, 'utf8'));

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

const missingInAr = enKeys.filter(k => !arKeys.includes(k));
const missingInEn = arKeys.filter(k => !enKeys.includes(k));

let hasErrors = false;

if (missingInAr.length > 0) {
  console.error('❌ Keys missing in Arabic (ar.json):');
  missingInAr.forEach(k => console.error(`  - ${k}`));
  hasErrors = true;
}

if (missingInEn.length > 0) {
  console.error('❌ Keys missing in English (en.json):');
  missingInEn.forEach(k => console.error(`  - ${k}`));
  hasErrors = true;
}

if (hasErrors) {
  console.error('\nFAIL: Translation key parity check failed!');
  process.exit(1);
} else {
  console.log(`✅ i18n Parity Check PASSED! Total keys: ${enKeys.length} matched perfectly in EN and AR.`);
  process.exit(0);
}
