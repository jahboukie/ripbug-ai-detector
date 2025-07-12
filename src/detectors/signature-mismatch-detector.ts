import { FunctionInfo, Issue } from '../types/analysis';
import { Detector } from '../types/detector';
import { EnhancedASTParser } from '../analysis/ast-parser-enhanced';
import { FileUtils } from '../utils/file-utils';

export class SignatureMismatchDetector implements Detector {
  private parser: EnhancedASTParser;

  constructor() {
    this.parser = new EnhancedASTParser({
      enableTreeSitter: true,
      fallbackToRegex: true,
      debugMode: false
    });
  }

  /**
   * Detect signature mismatches - function calls with wrong argument counts
   * @param files - All files to analyze for function calls
   * @param functions - All function definitions found in the codebase
   * @returns Array of issues for signature mismatches
   */
  async detect(files: string[], functions?: FunctionInfo[]): Promise<Issue[]> {
    if (!functions) {
      return [];
    }
    const issues: Issue[] = [];

    // Create a map of accessible functions for quick lookup
    const functionMap = this.createAccessibleFunctionMap(functions);

    // Analyze each file for function calls with signature mismatches
    for (const file of files) {
      try {
        const fileIssues = await this.analyzeFileForSignatureMismatches(file, functionMap);
        issues.push(...fileIssues);
      } catch (error) {
        // Skip files that can't be analyzed
        console.warn(`Failed to analyze ${file} for signature mismatches:`, error);
      }
    }

    return issues;
  }

  /**
   * Create a map of accessible functions organized by name
   */
  private createAccessibleFunctionMap(functions: FunctionInfo[]): Map<string, FunctionInfo[]> {
    const functionMap = new Map<string, FunctionInfo[]>();

    for (const func of functions) {
      // Only include exported functions or functions that can be called across files
      if (func.isExported || this.isFunctionAccessible(func)) {
        if (!functionMap.has(func.name)) {
          functionMap.set(func.name, []);
        }
        functionMap.get(func.name)!.push(func);
      }
    }

    return functionMap;
  }

  /**
   * Check if a function is accessible (exported or in global scope)
   */
  private isFunctionAccessible(func: FunctionInfo): boolean {
    // For now, consider all functions accessible within the same file
    // and only exported functions accessible across files
    return func.isExported;
  }

  /**
   * Analyze a single file for signature mismatches
   */
  private async analyzeFileForSignatureMismatches(
    filePath: string,
    functionMap: Map<string, FunctionInfo[]>
  ): Promise<Issue[]> {
    const issues: Issue[] = [];

    // Get file info and content
    const fileInfo = await FileUtils.getFileInfo(filePath);
    if (!fileInfo.isJavaScript) {
      return issues;
    }

    // Extract all function calls from this file
    const functionCalls = this.parser.extractFunctionCalls(fileInfo.content, filePath);

    // Check each function call for signature mismatches
    for (const call of functionCalls) {
      const mismatchIssue = this.checkSignatureMismatch(call, functionMap, filePath);
      if (mismatchIssue) {
        issues.push(mismatchIssue);
      }
    }

    return issues;
  }

  /**
   * Check if a function call has a signature mismatch
   */
  private checkSignatureMismatch(
    call: {
      name: string;
      file: string;
      line: number;
      column: number;
      context: string;
      arguments: string[];
      argumentCount: number;
    },
    functionMap: Map<string, FunctionInfo[]>,
    filePath: string
  ): Issue | null {
    const functionName = this.extractFunctionName(call.name);
    const actualArgs = call.argumentCount || (call.arguments ? call.arguments.length : 0);

    // Find function definitions
    const definitions = functionMap.get(functionName);
    if (!definitions || definitions.length === 0) {
      // Function not found - this would be handled by StaleReferenceDetector
      return null;
    }

    // Find the most relevant definition (prefer same file, then exported)
    const relevantDefinition = this.findRelevantDefinition(definitions, filePath);
    if (!relevantDefinition) {
      return null;
    }

    // Check signature mismatch
    const expectedArgs = this.calculateExpectedArguments(relevantDefinition);
    const mismatch = this.detectArgumentMismatch(actualArgs, expectedArgs, relevantDefinition);

    if (mismatch) {
      return this.createSignatureMismatchIssue(
        call,
        relevantDefinition,
        actualArgs,
        expectedArgs,
        mismatch,
        filePath
      );
    }

    return null;
  }

  /**
   * Extract the base function name from a call
   */
  private extractFunctionName(callName: string): string {
    // Handle method calls like obj.method() -> method
    if (callName.includes('.')) {
      const parts = callName.split('.');
      return parts[parts.length - 1];
    }

    return callName;
  }

  /**
   * Find the most relevant function definition for a call
   */
  private findRelevantDefinition(definitions: FunctionInfo[], fromFile: string): FunctionInfo | null {
    // Prefer functions from the same file
    const sameFileDefinition = definitions.find(def => def.file === fromFile);
    if (sameFileDefinition) {
      return sameFileDefinition;
    }

    // Otherwise, use the first exported function
    const exportedDefinition = definitions.find(def => def.isExported);
    return exportedDefinition || definitions[0];
  }

  /**
   * Calculate expected number of arguments for a function
   */
  private calculateExpectedArguments(func: FunctionInfo): {
    required: number;
    total: number;
    optional: number;
  } {
    const required = func.parameters.filter(p => !p.optional && !p.defaultValue).length;
    const total = func.parameters.length;
    const optional = total - required;

    return { required, total, optional };
  }

  /**
   * Detect if there's an argument count mismatch
   */
  private detectArgumentMismatch(
    actualArgs: number,
    expectedArgs: { required: number; total: number; optional: number },
    func: FunctionInfo
  ): { type: 'too-few' | 'too-many'; severity: 'error' | 'warning' } | null {
    // Too few arguments (missing required parameters)
    if (actualArgs < expectedArgs.required) {
      return { type: 'too-few', severity: 'error' };
    }

    // Too many arguments (more than total parameters)
    if (actualArgs > expectedArgs.total) {
      return { type: 'too-many', severity: 'warning' };
    }

    // Argument count is within acceptable range
    return null;
  }

  /**
   * Create a signature mismatch issue
   */
  private createSignatureMismatchIssue(
    call: {
      name: string;
      file: string;
      line: number;
      column: number;
      context: string;
      arguments: string[];
    },
    func: FunctionInfo,
    actualArgs: number,
    expectedArgs: { required: number; total: number; optional: number },
    mismatch: { type: 'too-few' | 'too-many'; severity: 'error' | 'warning' },
    filePath: string
  ): Issue {
    const functionName = func.name;
    
    // Create appropriate message based on mismatch type
    let message: string;
    if (mismatch.type === 'too-few') {
      const missing = expectedArgs.required - actualArgs;
      message = `Function '${functionName}' called with ${actualArgs} argument${actualArgs !== 1 ? 's' : ''}, but expects ${expectedArgs.required}.`;
    } else {
      message = `Function '${functionName}' called with ${actualArgs} argument${actualArgs !== 1 ? 's' : ''}, but only accepts ${expectedArgs.total}.`;
    }

    return {
      id: `signature-mismatch-${functionName}-${call.line}-${Date.now()}`,
      type: 'SignatureMismatch',
      severity: mismatch.severity,
      message,
      file: filePath,
      line: call.line,
      column: call.column,
      details: {
        functionName,
        expectedArgs: expectedArgs.required,
        actualArgs,
        totalParams: expectedArgs.total,
        optionalParams: expectedArgs.optional,
        codeSnippet: call.context,
        functionDefinition: `${func.file}:${func.line}`,
        parameterSignature: this.getParameterSignature(func.parameters)
      },
      suggestions: [
        mismatch.type === 'too-few' 
          ? `Add ${expectedArgs.required - actualArgs} missing argument(s)`
          : `Remove ${actualArgs - expectedArgs.total} extra argument(s)`,
        `Function signature: ${functionName}(${this.getParameterSignature(func.parameters)})`,
        `Check function definition at ${func.file}:${func.line}`,
        'This may be an AI-generated call that doesn\'t match the function signature'
      ],
      confidence: 0.95
    };
  }

  /**
   * Generate a readable parameter signature
   */
  private getParameterSignature(parameters: any[]): string {
    return parameters.map(p => {
      const optional = p.optional || p.defaultValue ? '?' : '';
      const type = p.type ? `: ${p.type}` : '';
      return `${p.name}${optional}${type}`;
    }).join(', ');
  }
}
