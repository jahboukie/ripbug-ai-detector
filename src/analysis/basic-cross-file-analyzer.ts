// Basic Cross-File Analyzer - Simple and working
// No fancy features, just detect breaking changes across files

import { FunctionInfo, Issue, AffectedFile } from '../types/analysis';
import { EnhancedASTParser } from './ast-parser-enhanced';
import { FileUtils } from '../utils/file-utils';

export class BasicCrossFileAnalyzer {
  private parser: EnhancedASTParser;

  constructor() {
    this.parser = new EnhancedASTParser({
      enableTreeSitter: true,
      fallbackToRegex: true,
      debugMode: false
    });
  }

  // Just find function calls across files, compare signatures, report mismatches
  async detectBreakingChanges(functions: FunctionInfo[], allFiles: string[]): Promise<Issue[]> {
    const issues: Issue[] = [];

    for (const func of functions) {
      // Skip non-exported functions (they can't be called from other files)
      if (!func.isExported) continue;

      // Find calls to this function in other files
      const callSites = await this.findCallsInOtherFiles(func, allFiles);

      for (const callSite of callSites) {
        // Compare what the function expects vs what the call provides
        const mismatch = this.compareSignatures(func, callSite);
        
        if (mismatch) {
          issues.push(this.createIssue(func, callSite, mismatch));
        }
      }
    }

    return issues;
  }

  // Find calls to a function in other files
  private async findCallsInOtherFiles(func: FunctionInfo, allFiles: string[]): Promise<Array<{
    file: string;
    line: number;
    column: number;
    context: string;
    argumentCount: number;
  }>> {
    const callSites: Array<{
      file: string;
      line: number;
      column: number;
      context: string;
      argumentCount: number;
    }> = [];

    for (const file of allFiles) {
      // Skip the file where the function is defined
      if (file === func.file) continue;

      try {
        const fileInfo = await FileUtils.getFileInfo(file);
        if (!fileInfo.isJavaScript) continue;

        // Extract function calls from this file
        const calls = this.parser.extractFunctionCalls(fileInfo.content, file);

        // Find calls to our function
        for (const call of calls) {
          if (this.isCallToFunction(call.name, func.name)) {
            callSites.push({
              file: call.file,
              line: call.line,
              column: call.column,
              context: call.context,
              argumentCount: call.arguments ? call.arguments.length : 0
            });
          }
        }

      } catch (error) {
        // Skip files that can't be read
        continue;
      }
    }

    return callSites;
  }

  // Check if a call name matches a function name
  private isCallToFunction(callName: string, functionName: string): boolean {
    // Direct match
    if (callName === functionName) return true;
    
    // Method call (obj.functionName)
    if (callName.endsWith(`.${functionName}`)) return true;
    
    return false;
  }

  // Compare function signature with call site
  private compareSignatures(func: FunctionInfo, callSite: {
    argumentCount: number;
  }): { type: string; message: string; severity: 'error' | 'warning' } | null {
    
    // Count required parameters (non-optional, no default value)
    const requiredParams = func.parameters.filter(p => !p.optional && !p.defaultValue);
    const providedArgs = callSite.argumentCount;

    // Missing required parameters = breaking change
    if (providedArgs < requiredParams.length) {
      const missing = requiredParams.length - providedArgs;
      return {
        type: 'missing-parameters',
        message: `Function call missing ${missing} required parameter(s): ${func.name}()`,
        severity: 'error'
      };
    }

    // Too many parameters = potential issue but not breaking
    if (providedArgs > func.parameters.length) {
      const extra = providedArgs - func.parameters.length;
      return {
        type: 'extra-parameters',
        message: `Function call has ${extra} extra parameter(s): ${func.name}()`,
        severity: 'warning'
      };
    }

    // No mismatch
    return null;
  }

  // Create an issue from a signature mismatch
  private createIssue(
    func: FunctionInfo, 
    callSite: { file: string; line: number; column: number; context: string; argumentCount: number },
    mismatch: { type: string; message: string; severity: 'error' | 'warning' }
  ): Issue {
    
    const requiredParams = func.parameters.filter(p => !p.optional && !p.defaultValue);
    
    return {
      id: `cross-file-${func.name}-${callSite.line}-${Date.now()}`,
      type: 'function-signature-change',
      severity: mismatch.severity,
      message: mismatch.message,
      file: func.file,
      line: func.line,
      column: func.column,
      details: {
        functionName: func.name,
        oldSignature: `${func.name}(${this.getSimpleSignature(callSite.argumentCount)})`,
        newSignature: `${func.name}(${this.getParameterSignature(func.parameters)})`,
        affectedFiles: [{
          path: callSite.file,
          line: callSite.line,
          column: callSite.column,
          context: callSite.context,
          suggestion: this.generateSuggestion(func, callSite, mismatch)
        }],
        context: `Breaking call in ${callSite.file}:${callSite.line}`,
        breakingChangeType: mismatch.type
      },
      suggestions: [
        this.generateSuggestion(func, callSite, mismatch),
        'Check if function signature was changed without updating callers',
        'Verify this is an AI-generated change that broke existing code'
      ],
      confidence: 0.95 // High confidence for clear signature mismatches
    };
  }

  // Generate a simple signature representation
  private getSimpleSignature(argCount: number): string {
    if (argCount === 0) return '';
    return Array(argCount).fill('arg').map((_, i) => `arg${i + 1}`).join(', ');
  }

  // Generate parameter signature
  private getParameterSignature(parameters: any[]): string {
    return parameters.map(p => {
      const optional = p.optional || p.defaultValue ? '?' : '';
      return `${p.name}${optional}: ${p.type || 'any'}`;
    }).join(', ');
  }

  // Generate specific suggestion for fixing the call
  private generateSuggestion(
    func: FunctionInfo,
    callSite: { argumentCount: number },
    mismatch: { type: string }
  ): string {
    
    if (mismatch.type === 'missing-parameters') {
      const requiredParams = func.parameters.filter(p => !p.optional && !p.defaultValue);
      const missing = requiredParams.length - callSite.argumentCount;
      const missingParams = requiredParams.slice(callSite.argumentCount);
      
      const suggestions = missingParams.map(p => {
        if (p.type === 'string') return "''";
        if (p.type === 'number') return '0';
        if (p.type === 'boolean') return 'false';
        if (p.type && p.type.includes('{}')) return '{}';
        if (p.type && p.type.includes('[]')) return '[]';
        return 'undefined';
      });
      
      return `Add missing parameter(s): ${suggestions.join(', ')}`;
    }
    
    if (mismatch.type === 'extra-parameters') {
      return `Remove extra parameters from the function call`;
    }
    
    return 'Update call to match function signature';
  }
}
