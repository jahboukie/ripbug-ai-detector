// Accuracy Comparison Framework - Step 3 of Claude S4's Roadmap
// A/B test tree-sitter vs regex accuracy

import { SimpleParser } from './simple-parser';
import { EnhancedASTParser } from './ast-parser-enhanced';
import { FunctionInfo } from '../types/analysis';

export interface ComparisonResult {
  regexCount: number;
  treeCount: number;
  differences: Difference;
  complexityScore: number;
  recommendation: 'regex' | 'tree-sitter' | 'hybrid';
  performanceMetrics: PerformanceMetrics;
  accuracyScore: number;
}

export interface Difference {
  missedByRegex: FunctionInfo[];
  missedByTree: FunctionInfo[];
  parameterDifferences: ParameterDifference[];
}

export interface ParameterDifference {
  functionName: string;
  regexParams: string[];
  treeParams: string[];
  line: number;
}

export interface PerformanceMetrics {
  regexTimeMs: number;
  treeTimeMs: number;
  speedRatio: number;
  memoryUsage?: number;
}

export class AccuracyTester {
  private simpleParser: SimpleParser;
  private enhancedParser: EnhancedASTParser;

  constructor() {
    this.simpleParser = new SimpleParser();
    this.enhancedParser = new EnhancedASTParser({
      enableTreeSitter: true,
      fallbackToRegex: false, // Force tree-sitter for comparison
      debugMode: false
    });
  }

  // Main comparison method
  async compareAccuracy(content: string, filePath: string): Promise<ComparisonResult> {
    console.log(`🔍 Comparing accuracy for: ${filePath}`);

    // Parse with both methods and measure performance
    const regexResult = await this.parseWithRegex(content, filePath);
    const treeResult = await this.parseWithTreeSitter(content, filePath);

    // Find differences
    const differences = this.findDifferences(regexResult.functions, treeResult.functions);

    // Assess complexity
    const complexityScore = this.assessComplexity(content);

    // Calculate accuracy score
    const accuracyScore = this.calculateAccuracyScore(regexResult.functions, treeResult.functions, complexityScore);

    // Performance metrics
    const performanceMetrics: PerformanceMetrics = {
      regexTimeMs: regexResult.timeMs,
      treeTimeMs: treeResult.timeMs,
      speedRatio: regexResult.timeMs / treeResult.timeMs
    };

    // Generate recommendation
    const recommendation = this.getRecommendation(regexResult.functions, treeResult.functions, performanceMetrics, complexityScore);

    return {
      regexCount: regexResult.functions.length,
      treeCount: treeResult.functions.length,
      differences,
      complexityScore,
      recommendation,
      performanceMetrics,
      accuracyScore
    };
  }

  // Parse with regex parser and measure time
  private async parseWithRegex(content: string, filePath: string): Promise<{ functions: FunctionInfo[]; timeMs: number }> {
    const startTime = performance.now();
    
    try {
      const functions = this.simpleParser.extractFunctions(content, filePath);
      const endTime = performance.now();
      
      return {
        functions,
        timeMs: endTime - startTime
      };
    } catch (error) {
      console.warn('⚠️ Regex parsing failed:', error);
      return {
        functions: [],
        timeMs: performance.now() - startTime
      };
    }
  }

  // Parse with tree-sitter and measure time
  private async parseWithTreeSitter(content: string, filePath: string): Promise<{ functions: FunctionInfo[]; timeMs: number }> {
    const startTime = performance.now();
    
    try {
      const functions = this.enhancedParser.extractFunctions(content, filePath);
      const endTime = performance.now();
      
      return {
        functions,
        timeMs: endTime - startTime
      };
    } catch (error) {
      console.warn('⚠️ Tree-sitter parsing failed:', error);
      return {
        functions: [],
        timeMs: performance.now() - startTime
      };
    }
  }

  // Find differences between regex and tree-sitter results
  private findDifferences(regexFunctions: FunctionInfo[], treeFunctions: FunctionInfo[]): Difference {
    // Functions found by tree-sitter but missed by regex
    const missedByRegex = treeFunctions.filter(tf => 
      !regexFunctions.find(rf => rf.name === tf.name && rf.line === tf.line)
    );

    // Functions found by regex but missed by tree-sitter
    const missedByTree = regexFunctions.filter(rf => 
      !treeFunctions.find(tf => tf.name === rf.name && tf.line === rf.line)
    );

    // Parameter differences for functions found by both
    const parameterDifferences: ParameterDifference[] = [];
    
    for (const regexFunc of regexFunctions) {
      const treeFunc = treeFunctions.find(tf => tf.name === regexFunc.name && tf.line === regexFunc.line);
      if (treeFunc) {
        const regexParams = regexFunc.parameters.map(p => p.name);
        const treeParams = treeFunc.parameters.map(p => p.name);
        
        if (JSON.stringify(regexParams) !== JSON.stringify(treeParams)) {
          parameterDifferences.push({
            functionName: regexFunc.name,
            regexParams,
            treeParams,
            line: regexFunc.line
          });
        }
      }
    }

    return {
      missedByRegex,
      missedByTree,
      parameterDifferences
    };
  }

  // Assess file complexity using heuristics
  private assessComplexity(content: string): number {
    let score = 0;

    // TypeScript features
    if (content.includes('interface ')) score += 0.2;
    if (content.includes('type ')) score += 0.15;
    if (content.includes('<') && content.includes('>')) score += 0.2; // Generics
    
    // Complex patterns
    if (content.includes('destructur') || content.includes('...')) score += 0.2;
    if (content.includes('async ') || content.includes('await ')) score += 0.1;
    if (content.match(/\{[^}]{50,}\}/)) score += 0.3; // Complex objects
    
    // Object-oriented features
    if (content.includes('class ')) score += 0.15;
    if (content.includes('extends ') || content.includes('implements ')) score += 0.1;
    
    // File size factor
    const lines = content.split('\n').length;
    if (lines > 100) score += 0.1;
    if (lines > 300) score += 0.1;

    // Import complexity
    const importCount = (content.match(/import .* from/g) || []).length;
    if (importCount > 5) score += 0.1;

    return Math.min(score, 1.0);
  }

  // Calculate accuracy score based on results
  private calculateAccuracyScore(regexFunctions: FunctionInfo[], treeFunctions: FunctionInfo[], complexity: number): number {
    if (regexFunctions.length === 0 && treeFunctions.length === 0) {
      return 1.0; // Perfect if both find nothing
    }

    const totalFunctions = Math.max(regexFunctions.length, treeFunctions.length);
    const commonFunctions = regexFunctions.filter(rf => 
      treeFunctions.find(tf => rf.name === tf.name && rf.line === tf.line)
    ).length;

    const baseAccuracy = commonFunctions / totalFunctions;
    
    // Bonus for tree-sitter finding more functions in complex files
    if (complexity > 0.5 && treeFunctions.length > regexFunctions.length) {
      return Math.min(1.0, baseAccuracy + 0.1);
    }

    return baseAccuracy;
  }

  // Generate recommendation based on results
  private getRecommendation(
    regexFunctions: FunctionInfo[], 
    treeFunctions: FunctionInfo[], 
    performance: PerformanceMetrics,
    complexity: number
  ): 'regex' | 'tree-sitter' | 'hybrid' {
    // If tree-sitter is much slower (>3x) and doesn't find more functions
    if (performance.speedRatio > 3 && treeFunctions.length <= regexFunctions.length) {
      return 'regex';
    }

    // If tree-sitter finds significantly more functions
    if (treeFunctions.length > regexFunctions.length * 1.2) {
      return 'tree-sitter';
    }

    // For complex files, prefer tree-sitter
    if (complexity > 0.7) {
      return 'tree-sitter';
    }

    // For simple files with good regex performance, use hybrid
    if (complexity < 0.3 && performance.speedRatio < 2) {
      return 'hybrid';
    }

    // Default to hybrid approach
    return 'hybrid';
  }

  // Generate detailed report
  generateReport(result: ComparisonResult, filePath: string): string {
    const report = [
      `📊 ACCURACY COMPARISON REPORT`,
      `File: ${filePath}`,
      `Complexity: ${(result.complexityScore * 100).toFixed(1)}%`,
      ``,
      `🔍 FUNCTION DETECTION:`,
      `  Regex found: ${result.regexCount} functions`,
      `  Tree-sitter found: ${result.treeCount} functions`,
      `  Accuracy score: ${(result.accuracyScore * 100).toFixed(1)}%`,
      ``,
      `⚡ PERFORMANCE:`,
      `  Regex time: ${result.performanceMetrics.regexTimeMs.toFixed(2)}ms`,
      `  Tree-sitter time: ${result.performanceMetrics.treeTimeMs.toFixed(2)}ms`,
      `  Speed ratio: ${result.performanceMetrics.speedRatio.toFixed(2)}x`,
      ``,
      `🎯 RECOMMENDATION: ${result.recommendation.toUpperCase()}`,
      ``
    ];

    // Add differences if any
    if (result.differences.missedByRegex.length > 0) {
      report.push(`🌳 Functions found only by tree-sitter:`);
      result.differences.missedByRegex.forEach(func => {
        report.push(`  - ${func.name}() at line ${func.line}`);
      });
      report.push('');
    }

    if (result.differences.missedByTree.length > 0) {
      report.push(`📝 Functions found only by regex:`);
      result.differences.missedByTree.forEach(func => {
        report.push(`  - ${func.name}() at line ${func.line}`);
      });
      report.push('');
    }

    if (result.differences.parameterDifferences.length > 0) {
      report.push(`🔧 Parameter parsing differences:`);
      result.differences.parameterDifferences.forEach(diff => {
        report.push(`  - ${diff.functionName}() at line ${diff.line}:`);
        report.push(`    Regex: (${diff.regexParams.join(', ')})`);
        report.push(`    Tree-sitter: (${diff.treeParams.join(', ')})`);
      });
    }

    return report.join('\n');
  }
}
