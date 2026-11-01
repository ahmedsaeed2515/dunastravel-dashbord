const path = require('path');
const fs = require('fs');

// Support both standalone server path and direct root launch
const standaloneServer = path.join(__dirname, '.next', 'standalone', 'server.js');

if (fs.existsSync(standaloneServer)) {
  require(standaloneServer);
} else {
  console.error('Standalone server not found at: ' + standaloneServer + '. Please run `npm run build` first.');
  process.exit(1);
}
