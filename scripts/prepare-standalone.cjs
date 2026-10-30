const fs = require('node:fs');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..');
const standaloneRoot = path.join(projectRoot, '.next', 'standalone');
const staticSource = path.join(projectRoot, '.next', 'static');
const publicSource = path.join(projectRoot, 'public');

if (!fs.existsSync(path.join(standaloneRoot, 'server.js'))) {
  throw new Error(
    'Standalone server was not generated at .next/standalone/server.js',
  );
}

fs.cpSync(staticSource, path.join(standaloneRoot, '.next', 'static'), {
  recursive: true,
  force: true,
});
fs.cpSync(publicSource, path.join(standaloneRoot, 'public'), {
  recursive: true,
  force: true,
});

console.log(
  'Standalone bundle prepared: .next/standalone/server.js, public/, and .next/static/',
);
