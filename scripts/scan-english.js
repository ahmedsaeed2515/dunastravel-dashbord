const fs = require('fs');
const path = require('path');

const englishPattern = />\s*([A-Za-z][A-Za-z0-9 ,.'’"!?()]{2,60})\s*</g;

function scanDir(dir, results = []) {
  if (!fs.existsSync(dir)) return results;
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const f of files) {
    const full = path.join(dir, f.name);
    if (f.isDirectory() && f.name !== 'node_modules' && f.name !== '.next' && f.name !== '__tests__') {
      scanDir(full, results);
    } else if (f.isFile() && (f.name.endsWith('.tsx') || f.name.endsWith('.ts'))) {
      const content = fs.readFileSync(full, 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        let match;
        while ((match = englishPattern.exec(line)) !== null) {
          const txt = match[1].trim();
          if (
            txt &&
            !txt.startsWith('http') &&
            !txt.startsWith('col-') &&
            !txt.startsWith('grid-') &&
            !/^[0-9]+$/.test(txt) &&
            !txt.startsWith('fa-') &&
            !txt.startsWith('lucide')
          ) {
            results.push({ file: path.relative(process.cwd(), full), line: idx + 1, text: txt });
          }
        }
      });
    }
  }
  return results;
}

const resApp = scanDir('dunastravel-dashbord/src/app');
const resComp = scanDir('dunastravel-dashbord/src/components');
const resFeat = scanDir('dunastravel-dashbord/src/features');

const all = [...resApp, ...resComp, ...resFeat];
console.log('Total English text occurrences found:', all.length);

const byFile = {};
all.forEach((item) => {
  if (!byFile[item.file]) byFile[item.file] = [];
  byFile[item.file].push(item);
});

const sortedFiles = Object.entries(byFile).sort((a, b) => b[1].length - a[1].length);
console.log('\nTop files with English text:');
sortedFiles.slice(0, 40).forEach(([f, items]) => {
  console.log(`\n--- ${f} (${items.length} occurrences) ---`);
  items.slice(0, 8).forEach((it) => {
    console.log(`  Line ${it.line}: "${it.text}"`);
  });
});
