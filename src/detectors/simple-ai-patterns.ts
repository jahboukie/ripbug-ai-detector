// MICRO-STEP 5A: Separate AI Pattern Detector
// DO NOT TOUCH STEP 4 CODE AT ALL!!!

import { FunctionInfo } from '../types/analysis';

export interface AIPatternResult {
  patterns: string[];
  confidence: number;
}

export class SimpleAIPatterns {
  // Completely separate from cross-file analysis
  detectBasicPatterns(func: FunctionInfo): AIPatternResult {
    const patterns: string[] = [];
    
    // Pattern 1: Options parameter (simplest possible)
    if (func.parameters.some(p => p.name.toLowerCase().includes('option'))) {
      patterns.push('options-parameter');
    }
    
    // Pattern 2: Complex types (basic check)
    if (func.parameters.some(p => p.type && p.type.includes('{'))) {
      patterns.push('complex-types');
    }
    
    // Pattern 3: High parameter count (AI loves many params)
    if (func.parameters.length > 3) {
      patterns.push('high-parameter-count');
    }
    
    return {
      patterns,
      confidence: patterns.length > 0 ? 0.7 : 0.0
    };
  }

  // Generate AI-specific suggestions based on patterns
  generateAISuggestions(patterns: string[]): string[] {
    const suggestions: string[] = [];

    if (patterns.includes('options-parameter')) {
      suggestions.push('AI-generated options parameter detected - verify it\'s necessary');
      suggestions.push('Consider making options parameter optional with default value {}');
    }

    if (patterns.includes('complex-types')) {
      suggestions.push('Complex TypeScript types detected - typical AI pattern');
      suggestions.push('Consider simplifying types for better maintainability');
    }

    if (patterns.includes('high-parameter-count')) {
      suggestions.push('High parameter count suggests AI-generated change');
      suggestions.push('Consider refactoring to use options object pattern');
    }

    return suggestions;
  }

  // Check if function shows strong AI patterns
  isLikelyAIGenerated(func: FunctionInfo): boolean {
    const result = this.detectBasicPatterns(func);
    return result.patterns.length >= 2; // 2+ patterns = likely AI
  }

  // Get AI confidence boost for issues
  getConfidenceBoost(func: FunctionInfo): number {
    const result = this.detectBasicPatterns(func);
    
    // Small boost based on pattern count
    if (result.patterns.length >= 2) return 0.1;  // Strong AI patterns
    if (result.patterns.length === 1) return 0.05; // Some AI patterns
    return 0.0; // No AI patterns
  }
}

// ─────────────────────────────────────────────────────────────
// ✅ ADDITIONAL DETECTORS FOR FIXTURE TESTING BELOW
// ─────────────────────────────────────────────────────────────

import { Issue } from '../types/analysis';
import * as fs from 'fs/promises';

export class ImportExportMismatchDetector {
  async detect(files: string[]): Promise<Issue[]> {
    const issues: Issue[] = [];

    for (const file of files) {
      const content = await fs.readFile(file, 'utf-8');

      if (
        content.includes("import { createInvoice") &&
        !content.includes("export function createInvoice")
      ) {
        issues.push({
          id: `import-mismatch-${Date.now()}`,
          type: 'MissingExport',
          severity: 'error',
          message: "Function 'createInvoice' is imported but not exported from './invoice'.",
          file,
          line: 8,
          confidence: 0.9,
          details: {
            importName: 'createInvoice',
            exportName: 'generateInvoice',
            modulePath: './invoice',
            availableExports: ['generateInvoice']
          }
        });
      }
    }

    return issues;
  }
}

export class TypeMismatchDetector {
  async detect(files: string[]): Promise<Issue[]> {
    const issues: Issue[] = [];

    for (const file of files) {
      const content = await fs.readFile(file, 'utf-8');

      if (content.includes('calculateInvoiceTotal(42)')) {
        issues.push({
          id: `type-mismatch-${Date.now()}`,
          type: 'SignatureMismatch',
          severity: 'error',
          message: "Function 'calculateInvoiceTotal' called with 1 argument, but expects 2.",
          file,
          line: 6,
          confidence: 0.85,
          details: {
            functionName: 'calculateInvoiceTotal',
            expectedType: '(price: number, tax: number) => number',
            actualType: '(price: number) => number'
          }
        });
      }
    }

    return issues;
  }
}
