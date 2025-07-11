// Enhanced SimpleParser - gradually adding tree-sitter features
// Keeps working regex base while adding AST parsing incrementally

import { FunctionInfo, Parameter } from '../types/analysis';
import Parser from 'tree-sitter';
import JavaScript from 'tree-sitter-javascript';
import TypeScript from 'tree-sitter-typescript';

export class SimpleParser {
  private jsParser?: Parser;
  private tsParser?: Parser;

  constructor() {
    // Initialize parsers lazily for better performance
    this.initializeParsers();
  }

  private initializeParsers(): void {
    try {
      this.jsParser = new Parser();
      this.jsParser.setLanguage(JavaScript);

      this.tsParser = new Parser();
      this.tsParser.setLanguage(TypeScript.typescript);
    } catch (error) {
      console.warn('Tree-sitter initialization failed, falling back to regex:', error);
    }
  }
  
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

  // Enhanced parameter parsing with optional tree-sitter fallback
  private parseParameters(paramsStr: string, content?: string, isTypeScript?: boolean): Parameter[] {
    if (!paramsStr.trim()) {
      return [];
    }

    // Try tree-sitter parsing for better accuracy (if available)
    if (content && (this.jsParser || this.tsParser)) {
      const astParams = this.parseParametersWithAST(content, isTypeScript || false);
      if (astParams.length > 0) {
        return astParams;
      }
    }

    // Fallback to regex parsing (existing working code)
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

  // Tree-sitter parameter parsing (enhanced accuracy)
  private parseParametersWithAST(content: string, isTypeScript: boolean): Parameter[] {
    try {
      const parser = isTypeScript ? this.tsParser : this.jsParser;
      if (!parser) return [];

      const tree = parser.parse(content);
      const parameters: Parameter[] = [];

      // Find function declarations in the AST
      this.findFunctionParameters(tree.rootNode, parameters);

      return parameters;
    } catch (error) {
      // Silently fall back to regex parsing
      return [];
    }
  }

  // Safely traverse AST to find function parameters
  private findFunctionParameters(node: any, parameters: Parameter[]): void {
    try {
      // Look for function declarations
      if (node.type === 'function_declaration' || node.type === 'arrow_function') {
        const paramsNode = this.findParametersNode(node);
        if (paramsNode) {
          this.extractParametersFromNode(paramsNode, parameters);
        }
      }

      // Recursively check child nodes (safely)
      if (node.children && Array.isArray(node.children)) {
        for (const child of node.children) {
          if (child && typeof child === 'object') {
            this.findFunctionParameters(child, parameters);
          }
        }
      }
    } catch (error) {
      // Skip this node if there's any error
    }
  }

  // Find the parameters node in a function
  private findParametersNode(functionNode: any): any {
    try {
      if (!functionNode.children) return null;

      for (const child of functionNode.children) {
        if (child && child.type === 'formal_parameters') {
          return child;
        }
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  // Extract parameters from the parameters node
  private extractParametersFromNode(paramsNode: any, parameters: Parameter[]): void {
    try {
      if (!paramsNode.children) return;

      for (const child of paramsNode.children) {
        if (!child || child.type === '(' || child.type === ')' || child.type === ',') {
          continue;
        }

        const param = this.parseParameterNode(child);
        if (param) {
          parameters.push(param);
        }
      }
    } catch (error) {
      // Skip this parameter if there's any error
    }
  }

  // Parse individual parameter node
  private parseParameterNode(node: any): Parameter | null {
    try {
      if (!node.text) return null;

      const text = node.text.trim();

      // Handle TypeScript typed parameters: name: type
      const typedMatch = text.match(/^(\w+)(\?)?:\s*([^=]+)(?:\s*=\s*(.+))?$/);
      if (typedMatch) {
        const [, name, optional, type, defaultValue] = typedMatch;
        return {
          name,
          type: type.trim(),
          optional: !!optional || !!defaultValue,
          defaultValue: defaultValue?.trim()
        };
      }

      // Handle parameters with default values: name = value
      const defaultMatch = text.match(/^(\w+)\s*=\s*(.+)$/);
      if (defaultMatch) {
        const [, name, defaultValue] = defaultMatch;
        return {
          name,
          optional: true,
          defaultValue: defaultValue.trim()
        };
      }

      // Simple parameter: just name
      const nameMatch = text.match(/^(\w+)$/);
      if (nameMatch) {
        return {
          name: nameMatch[1],
          optional: false
        };
      }

      return null;
    } catch (error) {
      return null;
    }
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
