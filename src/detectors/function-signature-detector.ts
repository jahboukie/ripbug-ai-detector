import { ASTParser } from '../analysis/ast-parser';
import { FileUtils } from '../utils/file-utils';
import { Issue, FunctionInfo, AffectedFile } from '../types/analysis';
import path from 'path';

interface FunctionChange {
  oldFunction: FunctionInfo;
  newFunction: FunctionInfo;
  changeType: 'parameters' | 'name' | 'signature';
  details: string;
}

export class FunctionSignatureDetector {
  private parser: ASTParser;

  constructor() {
    this.parser = new ASTParser();
  }

  // Main detection method
  async detect(files: string[]): Promise<Issue[]> {
    const issues: Issue[] = [];

    for (const file of files) {
      try {
        const fileIssues = await this.analyzeFile(file);
        issues.push(...fileIssues);
      } catch (error) {
        // Skip files that can't be parsed
        console.warn(`Failed to analyze ${file}: ${error}`);
      }
    }

    return issues;
  }

  // Analyze a single file for function signature changes
  private async analyzeFile(filePath: string): Promise<Issue[]> {
    const issues: Issue[] = [];

    // Read current file content
    const fileInfo = await FileUtils.getFileInfo(filePath);
    if (!fileInfo.isJavaScript) {
      return issues;
    }

    // Parse current version
    const currentTree = this.parser.parseFile(fileInfo.content, fileInfo.isTypeScript);
    const currentFunctions = this.parser.extractFunctions(currentTree, filePath);

    // For MVP, we'll simulate "old" version by checking git diff
    // In a full implementation, we'd compare with git HEAD
    const changes = await this.detectFunctionChanges(currentFunctions, filePath);

    // For each changed function, find call sites
    for (const change of changes) {
      const affectedFiles = await this.findCallSites(change.newFunction, files);
      
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

    return issues;
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

        const tree = this.parser.parseFile(fileInfo.content, fileInfo.isTypeScript);
        const calls = this.parser.extractFunctionCalls(tree, file);

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
