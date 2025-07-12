// tools/generate-fixture-hashes.ts
import fs from 'fs';
import crypto from 'crypto';
import path from 'path';

const FIXTURE_DIR = path.resolve(__dirname, '../test/fixtures');

console.log("✅ New Fixture Hashes:");
fs.readdirSync(FIXTURE_DIR)
  .filter(file => file.endsWith('.ts'))
  .forEach(file => {
    const filePath = path.join(FIXTURE_DIR, file);
    const content = fs.readFileSync(filePath);
    const hash = crypto.createHash('sha256').update(content).digest('hex');
    console.log(`  "${file}": "${hash}",`);
  });
