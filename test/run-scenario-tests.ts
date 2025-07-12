import * as fs from 'fs';
import * as path from 'path';
import { RipBugAnalyzer } from '../src/analysis/analyzer';
import { StaleReferenceDetector } from '../src/detectors/stale-reference-detector';
import { ImportExportMismatchDetector } from '../src/detectors/import-export-mismatch-detector';
import { SignatureMismatchDetector } from '../src/detectors/signature-mismatch-detector';

const scenarios = [
  {
    name: "Stale References",
    files: ["test/scenarios/stale-reference-scenarios.ts"],
    detectors: [new StaleReferenceDetector()],
    expected: { StaleReference: 6 }
  },
  {
    name: "Signature Mismatches",
    files: ["test/scenarios/signature-mismatch-scenarios.ts"],
    detectors: [new SignatureMismatchDetector()],
    expected: { SignatureMismatch: 7 }
  },
  {
    name: "Import/Export Mismatches",
    files: [
      "test/scenarios/import-export-scenarios/main.ts",
      "test/scenarios/import-export-scenarios/auth.ts",
      "test/scenarios/import-export-scenarios/user-service.ts",
      "test/scenarios/import-export-scenarios/order-utils.ts",
      "test/scenarios/import-export-scenarios/tax-utils.ts",
      "test/scenarios/import-export-scenarios/user-utils.ts",
      "test/scenarios/import-export-scenarios/billing.ts"
    ],
    detectors: [new ImportExportMismatchDetector()],
    expected: { MissingExport: 6 }
  },
  {
    name: "Complex Patterns",
    files: ["test/scenarios/complex-ai-patterns.ts"],
    detectors: [new StaleReferenceDetector(), new SignatureMismatchDetector()],
    expected: { StaleReference: 6, SignatureMismatch: 1 }
  },
  {
    name: "Edge Cases",
    files: ["test/scenarios/edge-cases.ts"],
    detectors: [new SignatureMismatchDetector()],
    expected: { SignatureMismatch: 11 }
  }
];

async function runTests() {
  console.log("Running RipBug scenario tests...\n");

  for (const scenario of scenarios) {
    console.log(`Testing: ${scenario.name}`);

    const missingFiles = scenario.files.filter(file => !fs.existsSync(file));
    if (missingFiles.length > 0) {
      console.log(`❌ Missing files: ${missingFiles.join(", ")}\n`);
      continue;
    }

    try {
      const analyzer = new RipBugAnalyzer(scenario.detectors);
      const result = await analyzer.analyze(scenario.files);

      const actual = result.issues.reduce((acc, issue) => {
        acc[issue.type] = (acc[issue.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      let passed = true;
      for (const [type, expectedCount] of Object.entries(scenario.expected)) {
        const actualCount = actual[type] || 0;
        if (actualCount === expectedCount) {
          console.log(`✅ ${type}: ${actualCount}/${expectedCount}`);
        } else {
          console.log(`❌ ${type}: ${actualCount}/${expectedCount}`);
          passed = false;
        }
      }

      console.log(passed ? "PASSED\n" : "FAILED\n");

    } catch (error) {
      console.log(`Error: ${error}\n`);
    }
  }
}

runTests().catch(console.error);
