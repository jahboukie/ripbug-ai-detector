import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

const FIXTURE_DIR = path.resolve(__dirname, 'fixtures');
const LOCK_FILE = path.join(FIXTURE_DIR, '.fixtures.lock.json');

// Load lockfile
const lockedHashes = JSON.parse(fs.readFileSync(LOCK_FILE, 'utf-8'));

// Hash checker
function hashFile(filepath: string): string {
  const content = fs.readFileSync(filepath);
  return crypto.createHash('sha256').update(content).digest('hex');
}

// Verify each file
let allMatch = true;

for (const filename of Object.keys(lockedHashes)) {
  const fullPath = path.join(FIXTURE_DIR, filename);
  const currentHash = hashFile(fullPath);
  const expectedHash = lockedHashes[filename];

  if (currentHash !== expectedHash) {
    console.error(`❌ Hash mismatch: ${filename}`);
    console.error(`   Expected: ${expectedHash}`);
    console.error(`   Found:    ${currentHash}`);
    allMatch = false;
  } else {
    console.log(`✅ ${filename} verified.`);
  }
}

if (!allMatch) {
  process.exit(1);
}
