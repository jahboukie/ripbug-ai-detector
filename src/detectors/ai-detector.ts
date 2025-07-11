import { AIDetectionResult, AIPattern } from '../types/analysis';
import { FileUtils } from '../utils/file-utils';
import { EnhancedASTParser } from '../analysis/ast-parser-enhanced';
import { FeatureFlags } from '../config/feature-flags';

export class AIDetector {
  private parser: EnhancedASTParser;

  constructor() {
    // Initialize with feature flags for smart tree-sitter rollout
    const useTreeSitter = FeatureFlags.shouldUseTreeSitter('default');
    this.parser = new EnhancedASTParser({
      enableTreeSitter: useTreeSitter,
      fallbackToRegex: true,
      debugMode: false
    });
  }

  // Main AI detection method
  async detect(files: string[]): Promise<AIDetectionResult> {
    const patterns: AIPattern[] = [];
    const reasoning: string[] = [];

    // Pattern 1: Multiple files changed simultaneously
    if (files.length > 3) {
      patterns.push({
        type: 'multiple-file-changes',
        confidence: Math.min(0.3 + (files.length * 0.1), 0.8),
        evidence: `${files.length} files changed together`,
        weight: 0.3
      });
      reasoning.push(`${files.length} files modified simultaneously (AI often changes multiple files)`);
    }

    // Pattern 2: Function signature changes
    const functionPatterns = await this.detectFunctionPatterns(files);
    patterns.push(...functionPatterns.patterns);
    reasoning.push(...functionPatterns.reasoning);

    // Pattern 3: Import/export reorganization
    const importPatterns = await this.detectImportPatterns(files);
    patterns.push(...importPatterns.patterns);
    reasoning.push(...importPatterns.reasoning);

    // Pattern 4: Code style patterns
    const stylePatterns = await this.detectStylePatterns(files);
    patterns.push(...stylePatterns.patterns);
    reasoning.push(...stylePatterns.reasoning);

    // Pattern 5: TypeScript patterns
    const typePatterns = await this.detectTypeScriptPatterns(files);
    patterns.push(...typePatterns.patterns);
    reasoning.push(...typePatterns.reasoning);

    // Calculate overall confidence
    const overallConfidence = this.calculateConfidence(patterns);
    const isAIGenerated = overallConfidence > 0.6;

    return {
      isAIGenerated,
      confidence: overallConfidence,
      patterns,
      reasoning
    };
  }

  // Detect function-related AI patterns
  private async detectFunctionPatterns(files: string[]): Promise<{
    patterns: AIPattern[];
    reasoning: string[];
  }> {
    const patterns: AIPattern[] = [];
    const reasoning: string[] = [];

    let functionsWithOptions = 0;
    let functionsWithTypeAnnotations = 0;
    let totalFunctions = 0;

    for (const file of files) {
      try {
        const fileInfo = await FileUtils.getFileInfo(file);
        if (!fileInfo.isJavaScript) continue;

        const functions = this.parser.extractFunctions(fileInfo.content, file);

        totalFunctions += functions.length;

        for (const func of functions) {
          // AI loves adding "options" parameters
          if (func.parameters.some(p => 
            p.name.toLowerCase().includes('option') ||
            p.name.toLowerCase().includes('config') ||
            p.name.toLowerCase().includes('setting')
          )) {
            functionsWithOptions++;
          }

          // AI often adds type annotations
          if (func.parameters.some(p => p.type)) {
            functionsWithTypeAnnotations++;
          }
        }
      } catch (error) {
        // Skip files that can't be parsed
      }
    }

    if (totalFunctions > 0) {
      const optionsRatio = functionsWithOptions / totalFunctions;
      const typeRatio = functionsWithTypeAnnotations / totalFunctions;

      if (optionsRatio > 0.3) {
        patterns.push({
          type: 'options-parameter-pattern',
          confidence: Math.min(optionsRatio, 0.9),
          evidence: `${functionsWithOptions}/${totalFunctions} functions have options parameters`,
          weight: 0.4
        });
        reasoning.push('High usage of options/config parameters (common AI pattern)');
      }

      if (typeRatio > 0.5) {
        patterns.push({
          type: 'type-annotation-pattern',
          confidence: Math.min(typeRatio, 0.8),
          evidence: `${functionsWithTypeAnnotations}/${totalFunctions} functions have type annotations`,
          weight: 0.3
        });
        reasoning.push('Extensive type annotations added (AI often adds types)');
      }
    }

    return { patterns, reasoning };
  }

  // Detect import/export AI patterns
  private async detectImportPatterns(files: string[]): Promise<{
    patterns: AIPattern[];
    reasoning: string[];
  }> {
    const patterns: AIPattern[] = [];
    const reasoning: string[] = [];

    let totalImports = 0;
    let namedImports = 0;
    let reorganizedImports = 0;

    for (const file of files) {
      try {
        const fileInfo = await FileUtils.getFileInfo(file);
        if (!fileInfo.isJavaScript) continue;

        // For MVP, we'll skip import analysis to keep it simple
        const imports: any[] = [];

        totalImports += imports.length;
        namedImports += imports.filter(i => !i.isDefault && !i.isNamespace).length;

        // Check for import reorganization patterns
        const content = fileInfo.content;
        const importLines = content.split('\n').filter(line => line.trim().startsWith('import'));
        
        // AI often groups and sorts imports
        if (importLines.length > 3) {
          const sortedLines = [...importLines].sort();
          const isSorted = JSON.stringify(importLines) === JSON.stringify(sortedLines);
          
          if (isSorted) {
            reorganizedImports++;
          }
        }

      } catch (error) {
        // Skip files that can't be parsed
      }
    }

    if (totalImports > 0) {
      const namedImportRatio = namedImports / totalImports;
      
      if (namedImportRatio > 0.7) {
        patterns.push({
          type: 'named-import-preference',
          confidence: Math.min(namedImportRatio, 0.7),
          evidence: `${namedImports}/${totalImports} imports are named imports`,
          weight: 0.2
        });
        reasoning.push('High ratio of named imports (AI prefers explicit imports)');
      }
    }

    if (reorganizedImports > 0) {
      patterns.push({
        type: 'import-organization',
        confidence: 0.6,
        evidence: `${reorganizedImports} files have organized imports`,
        weight: 0.3
      });
      reasoning.push('Imports appear to be automatically organized');
    }

    return { patterns, reasoning };
  }

  // Detect code style AI patterns
  private async detectStylePatterns(files: string[]): Promise<{
    patterns: AIPattern[];
    reasoning: string[];
  }> {
    const patterns: AIPattern[] = [];
    const reasoning: string[] = [];

    let consistentFormatting = 0;
    let verboseComments = 0;
    let totalFiles = files.length;

    for (const file of files) {
      try {
        const fileInfo = await FileUtils.getFileInfo(file);
        if (!fileInfo.isJavaScript) continue;

        const content = fileInfo.content;
        const lines = content.split('\n');

        // Check for consistent formatting (AI is very consistent)
        const indentationPattern = this.detectIndentationPattern(lines);
        if (indentationPattern.consistent) {
          consistentFormatting++;
        }

        // Check for verbose comments (AI often adds explanatory comments)
        const commentLines = lines.filter(line => 
          line.trim().startsWith('//') || 
          line.trim().startsWith('/*') ||
          line.trim().startsWith('*')
        );
        
        if (commentLines.length > lines.length * 0.1) {
          verboseComments++;
        }

      } catch (error) {
        // Skip files that can't be parsed
      }
    }

    if (totalFiles > 0) {
      const formattingRatio = consistentFormatting / totalFiles;
      const commentRatio = verboseComments / totalFiles;

      if (formattingRatio > 0.8) {
        patterns.push({
          type: 'consistent-formatting',
          confidence: Math.min(formattingRatio, 0.6),
          evidence: `${consistentFormatting}/${totalFiles} files have consistent formatting`,
          weight: 0.2
        });
        reasoning.push('Extremely consistent code formatting');
      }

      if (commentRatio > 0.5) {
        patterns.push({
          type: 'verbose-comments',
          confidence: Math.min(commentRatio, 0.7),
          evidence: `${verboseComments}/${totalFiles} files have extensive comments`,
          weight: 0.3
        });
        reasoning.push('High density of explanatory comments');
      }
    }

    return { patterns, reasoning };
  }

  // Detect TypeScript-specific AI patterns
  private async detectTypeScriptPatterns(files: string[]): Promise<{
    patterns: AIPattern[];
    reasoning: string[];
  }> {
    const patterns: AIPattern[] = [];
    const reasoning: string[] = [];

    let interfaceDefinitions = 0;
    let explicitTypes = 0;
    let tsFiles = 0;

    for (const file of files) {
      try {
        const fileInfo = await FileUtils.getFileInfo(file);
        if (!fileInfo.isTypeScript) continue;

        tsFiles++;
        const content = fileInfo.content;

        // Count interface definitions (AI loves creating interfaces)
        const interfaceMatches = content.match(/interface\s+\w+/g);
        if (interfaceMatches) {
          interfaceDefinitions += interfaceMatches.length;
        }

        // Count explicit type annotations
        const typeMatches = content.match(/:\s*\w+/g);
        if (typeMatches) {
          explicitTypes += typeMatches.length;
        }

      } catch (error) {
        // Skip files that can't be parsed
      }
    }

    if (tsFiles > 0) {
      const interfaceRatio = interfaceDefinitions / tsFiles;
      const typeRatio = explicitTypes / (tsFiles * 10); // Normalize by expected types per file

      if (interfaceRatio > 2) {
        patterns.push({
          type: 'interface-heavy',
          confidence: Math.min(interfaceRatio / 5, 0.8),
          evidence: `${interfaceDefinitions} interfaces across ${tsFiles} TypeScript files`,
          weight: 0.4
        });
        reasoning.push('Heavy use of TypeScript interfaces (AI loves type safety)');
      }

      if (typeRatio > 0.8) {
        patterns.push({
          type: 'explicit-typing',
          confidence: Math.min(typeRatio, 0.7),
          evidence: `Extensive explicit type annotations`,
          weight: 0.3
        });
        reasoning.push('Very explicit type annotations throughout');
      }
    }

    return { patterns, reasoning };
  }

  // Detect indentation pattern consistency
  private detectIndentationPattern(lines: string[]): { consistent: boolean; pattern: string } {
    const indentations = lines
      .filter(line => line.trim().length > 0)
      .map(line => line.match(/^(\s*)/)?.[1] || '')
      .filter(indent => indent.length > 0);

    if (indentations.length === 0) {
      return { consistent: true, pattern: 'none' };
    }

    // Check if all indentations use the same pattern (spaces vs tabs)
    const usesSpaces = indentations.every(indent => !indent.includes('\t'));
    const usesTabs = indentations.every(indent => indent.includes('\t'));
    
    return {
      consistent: usesSpaces || usesTabs,
      pattern: usesSpaces ? 'spaces' : usesTabs ? 'tabs' : 'mixed'
    };
  }

  // Calculate overall confidence from patterns
  private calculateConfidence(patterns: AIPattern[]): number {
    if (patterns.length === 0) {
      return 0;
    }

    // Weighted average of pattern confidences
    const totalWeight = patterns.reduce((sum, p) => sum + p.weight, 0);
    const weightedSum = patterns.reduce((sum, p) => sum + (p.confidence * p.weight), 0);

    return totalWeight > 0 ? Math.min(weightedSum / totalWeight, 0.99) : 0;
  }
}
