const fs = require('fs');
const { execSync } = require('child_process');
const packageJson = require('../package.json');

const version = packageJson.version;
let git_commit = 'unknown';

try {
  git_commit = execSync('git rev-parse --short HEAD').toString().trim();
} catch (e) {
  console.error('Could not get git commit hash', e);
}

const versionInfo = { version, git_commit };
fs.writeFileSync('./version.json', JSON.stringify(versionInfo, null, 2));