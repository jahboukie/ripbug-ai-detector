// Step 5: Enhanced Signature Detector - Sophisticated Signature Analysis
// Using tree-sitter's AST parsing for advanced pattern detection

import { FunctionInfo, Parameter } from '../types/analysis';
import { EnhancedASTParser } from './ast-parser-enhanced';
import { FeatureFlags } from '../config/feature-flags';

export interface SignatureChange {
  function: FunctionInfo;
  changeType: 'parameter-added' | 'parameter-removed' | 'type-changed' | 'signature-restructured';
  breakingCalls: BreakingCall[];
  confidence: number;
  severity: 'error' | 'warning';
  aiPatterns: string[];
}

export interface SignatureAnalysis {
  isLikelyChanged: boolean;
  changeType: 'parameter-added' | 'parameter-removed' | 'type-changed' | 'signature-restructured';
  confidence: number;
  aiPatterns: string[];
  reasoning: string[];
}

export interface BreakingCall {
  filePath: string;
  line: number;
  column: number;
  context: string;
  expectedArgs: number;
  providedArgs: number;
  missingParams: Parameter[];
  typeIssues: TypeIssue[];
}

export interface TypeIssue {
  parameterName: string;
  expectedType: string;
  providedType: string;
  severity: 'error' | 'warning';
}

export class EnhancedSignatureDetector {
  private parser: EnhancedASTParser;

  constructor() {
    // Use tree-sitter for sophisticated analysis
    this.parser = new EnhancedASTParser({
      enableTreeSitter: true,
      fallbackToRegex: true,
      debugMode: true // Enable debug for Step 5 testing
    });
  }

  // Main signature change detection method
  async detectSignatureChanges(
    currentFunctions: FunctionInfo[],
    allFiles: string[]
  ): Promise<SignatureChange[]> {
    const changes: SignatureChange[] = [];
    
    for (const func of currentFunctions) {
      // For Step 5 testing: temporarily analyze all functions, not just exported ones
      // TODO: Re-enable export check once export detection is fixed
      // if (!func.isExported) continue;

      // Use tree-sitter for sophisticated signature pattern analysis
      const potentialChange = this.analyzeSignaturePattern(func);

      // Debug logging
      if (FeatureFlags.getConfig().debugMode) {
        console.log(`Analyzing ${func.name}: confidence=${potentialChange.confidence}, patterns=[${potentialChange.aiPatterns.join(', ')}]`);
      }

      if (potentialChange.isLikelyChanged) {
        const callSites = await this.findCallSitesWithTreeSitter(func, allFiles);
        const breakingCalls = this.validateCallCompatibility(func, callSites);
        
        if (breakingCalls.length > 0) {
          changes.push({
            function: func,
            changeType: potentialChange.changeType,
            breakingCalls,
            confidence: potentialChange.confidence,
            severity: this.determineSeverity(potentialChange, breakingCalls),
            aiPatterns: potentialChange.aiPatterns
          });
        }
      }
    }
    
    return changes;
  }

  // Enhanced AI pattern detection with sophisticated analysis
  private analyzeSignaturePattern(func: FunctionInfo): SignatureAnalysis {
    const patterns: string[] = [];
    const reasoning: string[] = [];
    let confidence = 0;

    // Pattern 1: AI loves adding "options" or "config" parameters
    const hasOptionsParam = func.parameters.some(p => 
      p.name.toLowerCase().includes('option') ||
      p.name.toLowerCase().includes('config') ||
      p.name.toLowerCase().includes('setting')
    );
    if (hasOptionsParam) {
      patterns.push('options-parameter');
      reasoning.push('Function has options/config parameter (common AI pattern)');
      confidence += 0.4;
    }

    // Pattern 2: Complex nested object types (AI signature)
    const hasComplexTypes = func.parameters.some(p => 
      p.type && (
        p.type.includes('{') || 
        p.type.includes('<') || 
        p.type.includes('|') ||
        p.type.includes('Record<') ||
        p.type.includes('Pick<') ||
        p.type.includes('Omit<')
      )
    );
    if (hasComplexTypes) {
      patterns.push('complex-types');
      reasoning.push('Function uses complex TypeScript utility types');
      confidence += 0.3;
    }

    // Pattern 3: Default values (AI often adds these)
    const hasDefaultValues = func.parameters.some(p => p.defaultValue);
    if (hasDefaultValues) {
      patterns.push('default-values');
      reasoning.push('Function has parameters with default values');
      confidence += 0.2;
    }

    // Pattern 4: High parameter count (AI tends to over-parameterize)
    if (func.parameters.length > 3) {
      patterns.push('high-parameter-count');
      reasoning.push(`Function has ${func.parameters.length} parameters (high complexity)`);
      confidence += 0.1;
    }

    // Pattern 5: Generic parameters (AI loves generics)
    const hasGenerics = func.parameters.some(p => 
      p.type && (p.type.includes('<T>') || p.type.includes('<K>') || p.type.includes('<V>'))
    );
    if (hasGenerics) {
      patterns.push('generic-parameters');
      reasoning.push('Function uses generic type parameters');
      confidence += 0.15;
    }

    // Pattern 6: Destructuring parameters (AI pattern)
    const hasDestructuring = func.parameters.some(p => 
      p.name.includes('{') || p.name.includes('[')
    );
    if (hasDestructuring) {
      patterns.push('destructuring-parameters');
      reasoning.push('Function uses destructuring in parameters');
      confidence += 0.1;
    }

    // Pattern 7: Async/Promise patterns (AI often adds these)
    const isAsyncFunction = func.isAsync || (func.name.includes('async') || func.name.includes('Async'));
    if (isAsyncFunction) {
      patterns.push('async-pattern');
      reasoning.push('Function is async or has async naming pattern');
      confidence += 0.05;
    }

    return {
      isLikelyChanged: confidence > 0.4, // Lowered threshold for better detection
      changeType: this.determineChangeType(func, patterns),
      confidence: Math.min(confidence, 0.99), // Cap at 99%
      aiPatterns: patterns,
      reasoning
    };
  }

  // Determine the type of signature change based on patterns
  private determineChangeType(
    func: FunctionInfo, 
    patterns: string[]
  ): 'parameter-added' | 'parameter-removed' | 'type-changed' | 'signature-restructured' {
    
    // If has options parameter, likely parameter addition
    if (patterns.includes('options-parameter')) {
      return 'parameter-added';
    }

    // If has complex types, likely type changes
    if (patterns.includes('complex-types')) {
      return 'type-changed';
    }

    // If has destructuring, likely signature restructuring
    if (patterns.includes('destructuring-parameters')) {
      return 'signature-restructured';
    }

    // Default to parameter addition (most common AI pattern)
    return 'parameter-added';
  }

  // Find call sites using tree-sitter's enhanced parsing
  private async findCallSitesWithTreeSitter(func: FunctionInfo, allFiles: string[]): Promise<Array<{
    filePath: string;
    line: number;
    column: number;
    context: string;
    arguments: string[];
  }>> {
    const callSites: Array<{
      filePath: string;
      line: number;
      column: number;
      context: string;
      arguments: string[];
    }> = [];

    for (const file of allFiles) {
      if (file === func.file) continue; // Skip the file where function is defined

      try {
        const fileContent = require('fs').readFileSync(file, 'utf8');
        const calls = this.parser.extractFunctionCalls(fileContent, file);

        // Find calls to our function with enhanced matching
        const matchingCalls = calls.filter(call => 
          call.name === func.name || 
          call.name.endsWith(`.${func.name}`) ||
          call.context.includes(`${func.name}(`)
        );

        for (const call of matchingCalls) {
          callSites.push({
            filePath: file,
            line: call.line,
            column: call.column,
            context: call.context,
            arguments: call.arguments || []
          });
        }

      } catch (error) {
        // Skip files that can't be read or parsed
        continue;
      }
    }

    return callSites;
  }

  // Validate call compatibility with sophisticated analysis
  private validateCallCompatibility(func: FunctionInfo, callSites: Array<{
    filePath: string;
    line: number;
    column: number;
    context: string;
    arguments: string[];
  }>): BreakingCall[] {
    const breakingCalls: BreakingCall[] = [];

    for (const callSite of callSites) {
      const requiredParams = func.parameters.filter(p => !p.optional && !p.defaultValue);
      const providedArgs = callSite.arguments.length;
      const expectedArgs = requiredParams.length;

      // Check for missing parameters
      if (providedArgs < expectedArgs) {
        const missingParams = requiredParams.slice(providedArgs);
        
        breakingCalls.push({
          filePath: callSite.filePath,
          line: callSite.line,
          column: callSite.column,
          context: callSite.context,
          expectedArgs,
          providedArgs,
          missingParams,
          typeIssues: this.analyzeTypeCompatibility(func.parameters, callSite.arguments)
        });
      }
    }

    return breakingCalls;
  }

  // Analyze type compatibility between expected and provided arguments
  private analyzeTypeCompatibility(expectedParams: Parameter[], providedArgs: string[]): TypeIssue[] {
    const typeIssues: TypeIssue[] = [];

    for (let i = 0; i < Math.min(expectedParams.length, providedArgs.length); i++) {
      const param = expectedParams[i];
      const arg = providedArgs[i];

      if (param.type && this.hasTypeIncompatibility(param.type, arg)) {
        typeIssues.push({
          parameterName: param.name,
          expectedType: param.type,
          providedType: this.inferArgType(arg),
          severity: 'warning'
        });
      }
    }

    return typeIssues;
  }

  // Check for type incompatibility (simplified heuristic)
  private hasTypeIncompatibility(expectedType: string, providedArg: string): boolean {
    // Simple type checking heuristics
    if (expectedType.includes('string') && !providedArg.includes('"') && !providedArg.includes("'")) {
      return true;
    }
    if (expectedType.includes('number') && isNaN(Number(providedArg))) {
      return true;
    }
    if (expectedType.includes('boolean') && !['true', 'false'].includes(providedArg)) {
      return true;
    }
    return false;
  }

  // Infer argument type from its string representation
  private inferArgType(arg: string): string {
    if (arg.startsWith('"') || arg.startsWith("'")) return 'string';
    if (!isNaN(Number(arg))) return 'number';
    if (['true', 'false'].includes(arg)) return 'boolean';
    if (arg.startsWith('{')) return 'object';
    if (arg.startsWith('[')) return 'array';
    return 'unknown';
  }

  // Determine severity based on analysis and breaking calls
  private determineSeverity(analysis: SignatureAnalysis, breakingCalls: BreakingCall[]): 'error' | 'warning' {
    // High confidence + breaking calls = error
    if (analysis.confidence > 0.8 && breakingCalls.length > 0) {
      return 'error';
    }
    
    // Any breaking calls = error
    if (breakingCalls.length > 0) {
      return 'error';
    }
    
    // Otherwise warning
    return 'warning';
  }
}
