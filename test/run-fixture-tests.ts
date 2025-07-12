import * as fs from 'fs';
import * as path from 'path';
import { Issue } from '../src/types/analysis';
import { RipBugAnalyzer } from '../src/analysis/analyzer';
import { StaleReferenceDetector } from '../src/detectors/stale-reference-detector';
import { ImportExportMismatchDetector } from '../src/detectors/import-export-mismatch-detector';
import { SignatureMismatchDetector } from '../src/detectors/signature-mismatch-detector';

const FIXTURE_DIR = path.resolve(__dirname, 'fixtures');
const GOLDEN_OUTPUT_DIR = path.resolve(__dirname, 'golden-output');

function formatIssuesForFile(filename: string, issues: Issue[]) {
  return {
    file: filename,
    errors: issues.map(issue => ({
      type: issue.type,
      line: issue.line || 0,
      message: issue.message
    }))
  };
}

function getDetectorsFor(filename: string) {
  if (filename.includes('cascade-rename')) return [new StaleReferenceDetector()];
  if (filename.includes('import-mismatch')) return [new ImportExportMismatchDetector()];
  if (filename.includes('signature-drift')) return [new SignatureMismatchDetector()];
  return [];
}



async function run() {
  const fixtureFiles = fs
    .readdirSync(FIXTURE_DIR)
    .filter((f) => f.endsWith('.ts'));

  for (const file of fixtureFiles) {
    const fullPath = path.join(FIXTURE_DIR, file);

    try {
      const output = await analyzeFixture(fullPath);

      const expectedPath = path.join(GOLDEN_OUTPUT_DIR, `${file}.json`);
      if (!fs.existsSync(expectedPath)) {
        console.warn(`⚠️ No golden output found for ${file}. Skipping comparison.`);
        continue;
      }

      const expected = JSON.parse(fs.readFileSync(expectedPath, 'utf8'));
      const actual = JSON.parse(JSON.stringify(output));

      const expectedStr = JSON.stringify(expected, null, 2);
      const actualStr = JSON.stringify(actual, null, 2);

      if (expectedStr === actualStr) {
        console.log(`✅ ${file} passed`);
      } else {
        console.error(`❌ ${file} failed`);
        console.log(`--- Expected:\n${expectedStr}`);
        console.log(`--- Actual:\n${actualStr}`);
      }
    } catch (error) {
      console.error(`❌ ${file} failed with error:`, error);
    }
  }
}

async function analyzeFixture(filePath: string) {
  const filename = path.basename(filePath);

  // Get targeted detectors for this specific fixture
  const detectors = getDetectorsFor(filename);

  if (detectors.length === 0) {
    console.warn(`No detectors configured for ${filename}`);
    return formatIssuesForFile(filename, []);
  }

  // For import-mismatch test, include the invoice.ts file as well
  let filesToAnalyze = [filePath];
  if (filename.includes('import-mismatch')) {
    const invoiceFile = path.join(path.dirname(filePath), 'invoice.ts');
    if (fs.existsSync(invoiceFile)) {
      filesToAnalyze.push(invoiceFile);
    }
  }

  // Create analyzer with targeted detectors
  const analyzer = new RipBugAnalyzer(detectors);

  // Run analysis on the fixture file(s)
  const result = await analyzer.analyze(filesToAnalyze);

  return formatIssuesForFile(filename, result.issues);
}

run().catch((err) => {
  console.error('Unhandled error:', err);
});
