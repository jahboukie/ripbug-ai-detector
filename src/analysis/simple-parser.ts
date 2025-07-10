// Simplified parser for MVP - uses regex instead of tree-sitter
// This avoids the complex tree-sitter API issues for now

import { FunctionInfo, Parameter } from '../types/analysis';

export class SimpleParser {
  
  // Extract function definitions using regex (simplified approach)
  extractFunctions(content: string, filePath: string): FunctionInfo[] {
    const functions: FunctionInfo[] = [];
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Match function declarations: function name(params) or export function name(params)
      const funcMatch = line.match(/(?:export\s+)?function\s+(\w+)\s*\(([^)]*)\)/);
      if (funcMatch) {
        const [, name, paramsStr] = funcMatch;
        const parameters = this.parseParameters(paramsStr);
        
        functions.push({
          name,
          parameters,
          file: filePath,
          line: i + 1,
          column: line.indexOf('function'),
          isExported: line.includes('export'),
          isAsync: line.includes('async'),
          isArrow: false
        });
      }

      // Match arrow functions: const name = (params) => or export const name = (params) =>
      const arrowMatch = line.match(/(?:export\s+)?const\s+(\w+)\s*=\s*(?:async\s*)?\(([^)]*)\)\s*=>/);
      if (arrowMatch) {
        const [, name, paramsStr] = arrowMatch;
        const parameters = this.parseParameters(paramsStr);
        
        functions.push({
          name,
          parameters,
          file: filePath,
          line: i + 1,
          column: line.indexOf('const'),
          isExported: line.includes('export'),
          isAsync: line.includes('async'),
          isArrow: true
        });
      }
    }

    return functions;
  }

  // Extract function calls using regex
  extractFunctionCalls(content: string, filePath: string): Array<{
    name: string;
    file: string;
    line: number;
    column: number;
    context: string;
  }> {
    const calls: Array<{
      name: string;
      file: string;
      line: number;
      column: number;
      context: string;
    }> = [];
    
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Match function calls: functionName(
      const callMatches = line.matchAll(/(\w+)\s*\(/g);
      
      for (const match of callMatches) {
        const [, name] = match;
        
        // Skip common keywords and built-ins
        if (this.isBuiltinFunction(name)) {
          continue;
        }

        calls.push({
          name,
          file: filePath,
          line: i + 1,
          column: match.index || 0,
          context: line.trim()
        });
      }
    }

    return calls;
  }

  // Parse function parameters from string
  private parseParameters(paramsStr: string): Parameter[] {
    if (!paramsStr.trim()) {
      return [];
    }

    const parameters: Parameter[] = [];
    const params = paramsStr.split(',').map(p => p.trim());

    for (const param of params) {
      if (!param) continue;

      // Handle TypeScript types: name: type
      const typeMatch = param.match(/(\w+)(\?)?:\s*([^=]+)(?:=(.+))?/);
      if (typeMatch) {
        const [, name, optional, type, defaultValue] = typeMatch;
        parameters.push({
          name,
          type: type.trim(),
          optional: !!optional,
          defaultValue: defaultValue?.trim()
        });
        continue;
      }

      // Handle default values: name = value
      const defaultMatch = param.match(/(\w+)\s*=\s*(.+)/);
      if (defaultMatch) {
        const [, name, defaultValue] = defaultMatch;
        parameters.push({
          name,
          optional: true,
          defaultValue: defaultValue.trim()
        });
        continue;
      }

      // Simple parameter: just name
      const nameMatch = param.match(/(\w+)/);
      if (nameMatch) {
        parameters.push({
          name: nameMatch[1],
          optional: false
        });
      }
    }

    return parameters;
  }

  // Check if function name is a built-in
  private isBuiltinFunction(name: string): boolean {
    const builtins = [
      'console', 'require', 'import', 'export', 'if', 'for', 'while', 
      'return', 'throw', 'try', 'catch', 'new', 'typeof', 'instanceof',
      'parseInt', 'parseFloat', 'isNaN', 'isFinite', 'encodeURIComponent',
      'decodeURIComponent', 'setTimeout', 'setInterval', 'clearTimeout',
      'clearInterval', 'JSON', 'Object', 'Array', 'String', 'Number',
      'Boolean', 'Date', 'Math', 'RegExp', 'Error', 'Promise'
    ];
    
    return builtins.includes(name);
  }
}
