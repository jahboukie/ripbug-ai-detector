import { FunctionInfo, Issue } from '../types/analysis';
import { Detector } from '../types/detector';
import { EnhancedASTParser } from '../analysis/ast-parser-enhanced';
import { FileUtils } from '../utils/file-utils';

export class StaleReferenceDetector implements Detector {
  private parser: EnhancedASTParser;

  constructor() {
    this.parser = new EnhancedASTParser({
      enableTreeSitter: true,
      fallbackToRegex: true,
      debugMode: false
    });
  }

  /**
   * Detect stale function references - calls to functions that no longer exist
   * @param files - All files to analyze for function calls
   * @param functions - All function definitions found in the codebase
   * @returns Array of issues for stale references
   */
  async detect(files: string[], functions?: FunctionInfo[]): Promise<Issue[]> {
    if (!functions) {
      return [];
    }
    const issues: Issue[] = [];

    // Create a map of all defined functions for quick lookup
    const definedFunctions = this.createFunctionMap(functions);

    // Analyze each file for function calls
    for (const file of files) {
      try {
        const fileIssues = await this.analyzeFileForStaleReferences(file, definedFunctions);
        issues.push(...fileIssues);
      } catch (error) {
        // Skip files that can't be analyzed
        console.warn(`Failed to analyze ${file} for stale references:`, error);
      }
    }

    return issues;
  }

  /**
   * Create a map of function names to their definitions for quick lookup
   */
  private createFunctionMap(functions: FunctionInfo[]): Map<string, FunctionInfo[]> {
    const functionMap = new Map<string, FunctionInfo[]>();

    for (const func of functions) {
      if (!functionMap.has(func.name)) {
        functionMap.set(func.name, []);
      }
      functionMap.get(func.name)!.push(func);
    }

    return functionMap;
  }

  /**
   * Analyze a single file for stale function references
   */
  private async analyzeFileForStaleReferences(
    filePath: string, 
    definedFunctions: Map<string, FunctionInfo[]>
  ): Promise<Issue[]> {
    const issues: Issue[] = [];

    // Get file info and content
    const fileInfo = await FileUtils.getFileInfo(filePath);
    if (!fileInfo.isJavaScript) {
      return issues;
    }

    // Extract all function calls from this file
    const functionCalls = this.parser.extractFunctionCalls(fileInfo.content, filePath);

    const knownGlobals = new Set([
      'fetch', 'console', 'setTimeout', 'clearTimeout',
      'Math', 'Date', 'Object', 'Array', 'Number', 'String'
    ]);

    // Check each function call
    for (const call of functionCalls) {
      if (knownGlobals.has(call.name)) continue; // ✅ Skip globals

      const staleIssue = this.checkForStaleReference(call, definedFunctions, filePath);
      if (staleIssue) {
        issues.push(staleIssue);
      }
    }

    return issues;
  }

  /**
   * Check if a function call references a stale (non-existent) function
   */
  private checkForStaleReference(
    call: {
      name: string;
      file: string;
      line: number;
      column: number;
      context: string;
    },
    definedFunctions: Map<string, FunctionInfo[]>,
    filePath: string
  ): Issue | null {
    const functionName = this.extractFunctionName(call.name);

    // Check if this function is defined anywhere
    const definitions = definedFunctions.get(functionName);
    
    if (!definitions || definitions.length === 0) {
      // Function is called but not defined anywhere - this is a stale reference
      return this.createStaleReferenceIssue(call, functionName, filePath);
    }

    // Check if function is accessible from this file
    const accessibleDefinitions = this.filterAccessibleFunctions(definitions, filePath);
    
    if (accessibleDefinitions.length === 0) {
      // Function exists but is not accessible from this file
      return this.createStaleReferenceIssue(call, functionName, filePath);
    }

    return null;
  }

  /**
   * Extract the base function name from a call (handles method calls, etc.)
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
   * Filter functions that are accessible from the given file
   */
  private filterAccessibleFunctions(definitions: FunctionInfo[], fromFile: string): FunctionInfo[] {
    return definitions.filter(func => {
      // Same file - always accessible
      if (func.file === fromFile) {
        return true;
      }

      // Different file - only accessible if exported
      return func.isExported;
    });
  }

  /**
   * Create a stale reference issue
   */
  private createStaleReferenceIssue(
    call: {
      name: string;
      file: string;
      line: number;
      column: number;
      context: string;
    },
    functionName: string,
    filePath: string
  ): Issue {
    return {
      id: `stale-ref-${functionName}-${call.line}-${Date.now()}`,
      type: 'StaleReference',
      severity: 'error',
      message: `Function '${functionName}' is called but is no longer defined in scope.`,
      file: filePath,
      line: call.line,
      column: call.column,
      details: {
        functionName,
        context: call.context,
        codeSnippet: call.context,
        callSite: `${filePath}:${call.line}:${call.column}`
      },
      suggestions: [
        `Verify that '${functionName}' is still defined and exported`,
        `Check if the function was renamed or moved to a different file`,
        `Ensure proper import statements if function is in another module`,
        `This may be an AI-generated change that broke existing references`
      ],
      confidence: 0.9
    };
  }
}
