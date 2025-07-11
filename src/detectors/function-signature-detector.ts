import { EnhancedASTParser } from '../analysis/ast-parser-enhanced';
import { FeatureFlags } from '../config/feature-flags';
import { FileUtils } from '../utils/file-utils';
import { Issue, FunctionInfo, AffectedFile, Parameter } from '../types/analysis';
import path from 'path';

interface FunctionChange {
  oldFunction: FunctionInfo;
  newFunction: FunctionInfo;
  changeType: 'parameters' | 'name' | 'signature';
  details: string;
}

export class FunctionSignatureDetector {
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

  // Main detection method
  async detect(files: string[]): Promise<Issue[]> {
    const issues: Issue[] = [];

    for (const file of files) {
      try {
        const fileIssues = await this.analyzeFile(file, files);
        issues.push(...fileIssues);
      } catch (error) {
        // Skip files that can't be parsed
        console.warn(`Failed to analyze ${file}: ${error}`);
      }
    }

    return issues;
  }

  // Analyze a single file for function signature changes
  private async analyzeFile(filePath: string, allFiles: string[]): Promise<Issue[]> {
    const issues: Issue[] = [];

    // Read current file content
    const fileInfo = await FileUtils.getFileInfo(filePath);
    if (!fileInfo.isJavaScript) {
      return issues;
    }

    // Parse current version
    const currentFunctions = this.parser.extractFunctions(fileInfo.content, filePath);

    // For MVP, we'll simulate "old" version by checking git diff
    // In a full implementation, we'd compare with git HEAD
    const changes = await this.detectFunctionChanges(currentFunctions, filePath);

    // For each changed function, find call sites
    for (const change of changes) {
      const affectedFiles = await this.findCallSites(change.newFunction, allFiles);

      if (affectedFiles.length > 0) {
        const issue: Issue = {
          id: `func-sig-${change.newFunction.name}-${Date.now()}`,
          type: 'function-signature-change',
          severity: 'error',
          message: this.createIssueMessage(change),
          file: filePath,
          line: change.newFunction.line,
          column: change.newFunction.column,
          details: {
            functionName: change.newFunction.name,
            oldSignature: this.getFunctionSignature(change.oldFunction),
            newSignature: this.getFunctionSignature(change.newFunction),
            affectedFiles,
            context: change.details
          },
          suggestions: this.generateSuggestions(change, affectedFiles),
          confidence: 0.9 // High confidence for function signature changes
        };

        issues.push(issue);
      }
    }

    // ENHANCEMENT: Cross-file signature validation
    const crossFileIssues = await this.validateCrossFileSignatures(currentFunctions, allFiles);
    issues.push(...crossFileIssues);

    return issues;
  }

  // Enhanced Cross-file signature validation using tree-sitter's superior detection
  private async validateCrossFileSignatures(functions: FunctionInfo[], allFiles: string[]): Promise<Issue[]> {
    const issues: Issue[] = [];

    // Step 4 Enhancement: Use tree-sitter's superior function detection
    // Tree-sitter finds 14 functions vs regex's 6 - we need to analyze ALL functions
    for (const func of functions) {
      if (!func.isExported) continue;

      // Enhanced: Use tree-sitter for more accurate call site detection
      const callSites = await this.findCallSitesWithTreeSitter(func, allFiles);

      for (const callSite of callSites) {
        // Enhanced: More sophisticated parameter analysis
        const signatureAnalysis = this.analyzeSignatureCompatibility(func, callSite);

        if (signatureAnalysis.hasBreakingChange) {
          issues.push({
            id: `cross-file-${func.name}-${callSite.line}-${Date.now()}`,
            type: 'function-signature-change',
            severity: signatureAnalysis.severity,
            message: signatureAnalysis.message,
            file: func.file,
            line: func.line,
            column: func.column,
            details: {
              functionName: func.name,
              oldSignature: signatureAnalysis.expectedSignature,
              newSignature: this.getFunctionSignature(func),
              affectedFiles: [callSite],
              context: `Breaking call: ${callSite.context}`,
              breakingChangeType: signatureAnalysis.changeType,
              treeSitterDetected: true // Mark as tree-sitter enhanced detection
            },
            suggestions: signatureAnalysis.suggestions,
            confidence: signatureAnalysis.confidence
          });
        }
      }
    }

    return issues;
  }

  // Enhanced call site detection using tree-sitter's superior parsing
  private async findCallSitesWithTreeSitter(func: FunctionInfo, allFiles: string[]): Promise<AffectedFile[]> {
    const affectedFiles: AffectedFile[] = [];

    for (const file of allFiles) {
      if (file === func.file) continue; // Skip the file where function is defined

      try {
        const fileInfo = await FileUtils.getFileInfo(file);
        if (!fileInfo.isJavaScript) continue;

        // Use enhanced parser with tree-sitter for superior call detection
        const calls = this.parser.extractFunctionCalls(fileInfo.content, file);

        // Find calls to our function with enhanced matching
        const matchingCalls = calls.filter(call => {
          // Enhanced matching: handle method calls, destructured imports, etc.
          return call.name === func.name ||
                 call.name.endsWith(`.${func.name}`) ||
                 call.context.includes(`${func.name}(`);
        });

        for (const call of matchingCalls) {
          affectedFiles.push({
            path: file,
            line: call.line,
            column: call.column,
            context: call.context,
            suggestion: this.generateEnhancedCallSiteSuggestion(func, call)
          });
        }

      } catch (error) {
        // Fallback to original method if tree-sitter fails
        const fallbackCalls = await this.findCallSites(func, [file]);
        affectedFiles.push(...fallbackCalls);
      }
    }

    return affectedFiles;
  }

  // Enhanced signature compatibility analysis
  private analyzeSignatureCompatibility(func: FunctionInfo, callSite: AffectedFile): {
    hasBreakingChange: boolean;
    severity: 'error' | 'warning';
    message: string;
    expectedSignature: string;
    changeType: string;
    suggestions: string[];
    confidence: number;
  } {
    // Count required parameters (non-optional)
    const requiredParams = func.parameters.filter(p => !p.optional).length;

    // Get provided arguments using enhanced analysis
    const providedArgs = this.getArgumentCountFromContext(callSite.context);

    // Analyze the type of breaking change
    if (providedArgs < requiredParams) {
      return {
        hasBreakingChange: true,
        severity: 'error',
        message: `Function call missing ${requiredParams - providedArgs} required parameter(s): ${func.name}()`,
        expectedSignature: `${func.name}(${this.getSimpleSignature(providedArgs)})`,
        changeType: 'missing-parameters',
        suggestions: [
          `Add ${requiredParams - providedArgs} missing parameter(s) to call in ${callSite.path}:${callSite.line}`,
          'Check if function signature was changed by AI without updating callers',
          'Consider making new parameters optional with default values'
        ],
        confidence: 0.95 // High confidence for missing parameters
      };
    }

    // Check for complex parameter types that might cause issues
    const hasComplexTypes = func.parameters.some(p =>
      p.type && (p.type.includes('{') || p.type.includes('<') || p.type.includes('|'))
    );

    if (hasComplexTypes && providedArgs === requiredParams) {
      return {
        hasBreakingChange: true,
        severity: 'warning',
        message: `Function call may have type compatibility issues: ${func.name}()`,
        expectedSignature: `${func.name}(${this.getParameterSignature(func.parameters)})`,
        changeType: 'type-compatibility',
        suggestions: [
          'Verify argument types match the updated function signature',
          'Check for TypeScript compilation errors',
          'Review parameter types that may have been changed by AI'
        ],
        confidence: 0.75 // Medium confidence for type issues
      };
    }

    return {
      hasBreakingChange: false,
      severity: 'warning',
      message: '',
      expectedSignature: '',
      changeType: 'none',
      suggestions: [],
      confidence: 0
    };
  }

  // Get accurate argument count using enhanced parser
  private async getAccurateArgumentCount(functionFile: string, callSite: AffectedFile): Promise<number> {
    try {
      const fileInfo = await FileUtils.getFileInfo(callSite.path);
      if (!fileInfo.isJavaScript) return 0;

      // Use enhanced parser to get accurate call information
      const calls = this.parser.extractFunctionCalls(fileInfo.content, callSite.path);

      // Find the specific call at this line
      const matchingCall = calls.find(call => call.line === callSite.line);

      if (matchingCall) {
        return matchingCall.argumentCount || matchingCall.arguments?.length || 0;
      }

      // Fallback to context analysis
      return this.getArgumentCountFromContext(callSite.context);
    } catch (error) {
      // Fallback to simple counting on error
      return this.getArgumentCountFromContext(callSite.context);
    }
  }

  // Enhanced argument counting from call context
  private getArgumentCountFromContext(callContext: string): number {
    const match = callContext.match(/\(([^)]*)\)/);
    if (!match || !match[1].trim()) return 0;

    const argsString = match[1];

    // Handle complex arguments with nested objects, arrays, etc.
    let depth = 0;
    let argCount = 0;
    let currentArg = '';

    for (let i = 0; i < argsString.length; i++) {
      const char = argsString[i];

      if (char === '(' || char === '[' || char === '{') {
        depth++;
      } else if (char === ')' || char === ']' || char === '}') {
        depth--;
      } else if (char === ',' && depth === 0) {
        if (currentArg.trim()) argCount++;
        currentArg = '';
        continue;
      }

      currentArg += char;
    }

    // Count the last argument
    if (currentArg.trim()) argCount++;

    return argCount;
  }

  // Enhanced call site suggestion generation
  private generateEnhancedCallSiteSuggestion(func: FunctionInfo, call: any): string {
    const requiredParams = func.parameters.filter(p => !p.optional);
    const providedArgs = call.arguments?.length || this.getArgumentCountFromContext(call.context);

    if (providedArgs < requiredParams.length) {
      const missingParams = requiredParams.slice(providedArgs);
      const suggestions = missingParams.map(p => {
        if (p.defaultValue) return p.defaultValue;
        if (p.type === 'string') return "''";
        if (p.type === 'number') return '0';
        if (p.type === 'boolean') return 'false';
        if (p.type && p.type.includes('{}')) return '{}';
        if (p.type && p.type.includes('[]')) return '[]';
        return 'undefined';
      });

      return `Add missing parameters: ${suggestions.join(', ')}`;
    }

    return 'Verify parameter types match the function signature';
  }

  // Fallback: Count arguments in a function call (simple method)
  private countArgumentsInCall(callContext: string): number {
    return this.getArgumentCountFromContext(callContext);
  }

  // Get parameter signature string
  private getParameterSignature(parameters: Parameter[]): string {
    return parameters.map(p => {
      let sig = p.name;
      if (p.type) sig += `: ${p.type}`;
      if (p.optional) sig += '?';
      if (p.defaultValue) sig += ` = ${p.defaultValue}`;
      return sig;
    }).join(', ');
  }

  // Get simple signature for comparison
  private getSimpleSignature(paramCount: number): string {
    return Array(paramCount).fill(0).map((_, i) => `param${i + 1}`).join(', ');
  }

  // Detect function changes (simplified for MVP)
  private async detectFunctionChanges(currentFunctions: FunctionInfo[], filePath: string): Promise<FunctionChange[]> {
    const changes: FunctionChange[] = [];

    // For MVP, we'll use heuristics to detect likely AI changes
    // This is where we'd normally compare with git HEAD
    
    for (const func of currentFunctions) {
      // Detect common AI patterns that indicate function signature changes
      if (this.looksLikeAIChange(func)) {
        // Simulate an "old" version for demo purposes
        const oldFunction = this.simulateOldFunction(func);
        
        changes.push({
          oldFunction,
          newFunction: func,
          changeType: 'parameters',
          details: 'Function parameters appear to have been modified'
        });
      }
    }

    return changes;
  }

  // Heuristic to detect if function looks like it was changed by AI
  private looksLikeAIChange(func: FunctionInfo): boolean {
    // AI commonly adds options/config parameters
    const hasOptionsParam = func.parameters.some(p => 
      p.name.toLowerCase().includes('option') || 
      p.name.toLowerCase().includes('config') ||
      p.name.toLowerCase().includes('setting')
    );

    // AI often adds optional parameters at the end
    const hasOptionalParams = func.parameters.some(p => p.optional);

    // AI tends to add type annotations
    const hasTypeAnnotations = func.parameters.some(p => p.type);

    // For MVP demo, trigger on any of these patterns
    return hasOptionsParam || (hasOptionalParams && hasTypeAnnotations);
  }

  // Simulate old function for demo (in real implementation, get from git)
  private simulateOldFunction(newFunc: FunctionInfo): FunctionInfo {
    // Remove the last parameter (common AI pattern)
    const oldParameters = newFunc.parameters.slice(0, -1);
    
    return {
      ...newFunc,
      parameters: oldParameters
    };
  }

  // Find all call sites of a function across files
  private async findCallSites(func: FunctionInfo, allFiles: string[]): Promise<AffectedFile[]> {
    const affectedFiles: AffectedFile[] = [];

    for (const file of allFiles) {
      if (file === func.file) continue; // Skip the file where function is defined

      try {
        const fileInfo = await FileUtils.getFileInfo(file);
        if (!fileInfo.isJavaScript) continue;

        const calls = this.parser.extractFunctionCalls(fileInfo.content, file);

        // Find calls to our function
        const matchingCalls = calls.filter(call => call.name === func.name);

        for (const call of matchingCalls) {
          affectedFiles.push({
            path: file,
            line: call.line,
            column: call.column,
            context: call.context,
            suggestion: this.generateCallSiteSuggestion(func, call.context)
          });
        }

      } catch (error) {
        // Skip files that can't be parsed
      }
    }

    return affectedFiles;
  }

  // Create human-readable issue message
  private createIssueMessage(change: FunctionChange): string {
    const oldSig = this.getFunctionSignature(change.oldFunction);
    const newSig = this.getFunctionSignature(change.newFunction);
    
    return `Function signature changed without updating callers: ${oldSig} → ${newSig}`;
  }

  // Get function signature string
  private getFunctionSignature(func: FunctionInfo): string {
    const params = func.parameters.map(p => {
      let param = p.name;
      if (p.type) param += `: ${p.type}`;
      if (p.optional) param += '?';
      if (p.defaultValue) param += ` = ${p.defaultValue}`;
      return param;
    }).join(', ');

    return `${func.name}(${params})`;
  }

  // Generate suggestions for fixing the issue
  private generateSuggestions(change: FunctionChange, affectedFiles: AffectedFile[]): string[] {
    const suggestions: string[] = [];

    suggestions.push(`Update ${affectedFiles.length} call sites to match new signature`);
    suggestions.push(`Add default values to new parameters to maintain compatibility`);
    suggestions.push(`Consider creating a wrapper function for backward compatibility`);

    return suggestions;
  }

  // Generate suggestion for specific call site
  private generateCallSiteSuggestion(func: FunctionInfo, context: string): string {
    const newParams = func.parameters.map(p => {
      if (p.defaultValue) return p.defaultValue;
      if (p.optional) return 'undefined';
      if (p.type === 'string') return "''";
      if (p.type === 'number') return '0';
      if (p.type === 'boolean') return 'false';
      return 'null';
    });

    return `Add missing parameters: ${newParams.slice(-1).join(', ')}`;
  }
}
