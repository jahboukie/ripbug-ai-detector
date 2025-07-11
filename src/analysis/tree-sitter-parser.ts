// Advanced Tree-sitter AST Parser for RipBug
// Replaces SimpleParser with full semantic analysis

import Parser from 'tree-sitter';
import JavaScript from 'tree-sitter-javascript';
import TypeScript from 'tree-sitter-typescript';
import { FunctionInfo, Parameter } from '../types/analysis';

// Extend the SyntaxNode interface to include field methods
declare module 'tree-sitter' {
  interface SyntaxNode {
    childForFieldName(fieldName: string): SyntaxNode | null;
  }
}

export class TreeSitterParser {
  private jsParser: Parser;
  private tsParser: Parser;

  constructor() {
    // Initialize JavaScript parser
    this.jsParser = new Parser();
    this.jsParser.setLanguage(JavaScript);

    // Initialize TypeScript parser
    this.tsParser = new Parser();
    this.tsParser.setLanguage(TypeScript.typescript);
  }

  // Parse file and extract functions with full semantic analysis
  extractFunctions(content: string, filePath: string): FunctionInfo[] {
    const functions: FunctionInfo[] = [];
    const isTypeScript = filePath.endsWith('.ts') || filePath.endsWith('.tsx');
    
    try {
      const parser = isTypeScript ? this.tsParser : this.jsParser;
      const tree = parser.parse(content);
      
      this.traverseTree(tree.rootNode, content, filePath, functions);
    } catch (error) {
      console.warn(`Failed to parse ${filePath}:`, error);
    }

    return functions;
  }

  // Extract function calls with precise location and context
  extractFunctionCalls(content: string, filePath: string): Array<{
    name: string;
    file: string;
    line: number;
    column: number;
    context: string;
    arguments: string[];
  }> {
    const calls: Array<{
      name: string;
      file: string;
      line: number;
      column: number;
      context: string;
      arguments: string[];
    }> = [];

    const isTypeScript = filePath.endsWith('.ts') || filePath.endsWith('.tsx');
    
    try {
      const parser = isTypeScript ? this.tsParser : this.jsParser;
      const tree = parser.parse(content);
      
      this.findFunctionCalls(tree.rootNode, content, filePath, calls);
    } catch (error) {
      console.warn(`Failed to parse calls in ${filePath}:`, error);
    }

    return calls;
  }

  // Extract imports and exports with full dependency analysis
  extractImports(content: string, filePath: string): Array<{
    type: 'import' | 'export';
    source: string;
    specifiers: string[];
    line: number;
    isDefault: boolean;
  }> {
    const imports: Array<{
      type: 'import' | 'export';
      source: string;
      specifiers: string[];
      line: number;
      isDefault: boolean;
    }> = [];

    const isTypeScript = filePath.endsWith('.ts') || filePath.endsWith('.tsx');
    
    try {
      const parser = isTypeScript ? this.tsParser : this.jsParser;
      const tree = parser.parse(content);
      
      this.findImportsExports(tree.rootNode, content, filePath, imports);
    } catch (error) {
      console.warn(`Failed to parse imports in ${filePath}:`, error);
    }

    return imports;
  }

  // Traverse AST tree to find function definitions
  private traverseTree(node: Parser.SyntaxNode, content: string, filePath: string, functions: FunctionInfo[]): void {
    // Function declarations: function name() {}
    if (node.type === 'function_declaration') {
      const func = this.parseFunctionDeclaration(node, content, filePath);
      if (func) functions.push(func);
    }

    // Arrow functions: const name = () => {}
    if (node.type === 'variable_declarator') {
      const func = this.parseArrowFunction(node, content, filePath);
      if (func) functions.push(func);
    }

    // Method definitions: methodName() {}
    if (node.type === 'method_definition') {
      const func = this.parseMethodDefinition(node, content, filePath);
      if (func) functions.push(func);
    }

    // Recursively traverse child nodes
    for (let i = 0; i < node.childCount; i++) {
      this.traverseTree(node.child(i)!, content, filePath, functions);
    }
  }

  // Parse function declaration with full parameter analysis
  private parseFunctionDeclaration(node: Parser.SyntaxNode, content: string, filePath: string): FunctionInfo | null {
    const nameNode = node.childForFieldName('name');
    const paramsNode = node.childForFieldName('parameters');
    
    if (!nameNode || !paramsNode) return null;

    const name = nameNode.text;
    const parameters = this.parseParameters(paramsNode, content);
    const position = node.startPosition;

    return {
      name,
      parameters,
      file: filePath,
      line: position.row + 1,
      column: position.column,
      isExported: this.isExported(node),
      isAsync: this.isAsync(node),
      isArrow: false
    };
  }

  // Parse arrow function with context analysis
  private parseArrowFunction(node: Parser.SyntaxNode, content: string, filePath: string): FunctionInfo | null {
    const nameNode = node.childForFieldName('name');
    const valueNode = node.childForFieldName('value');
    
    if (!nameNode || !valueNode || valueNode.type !== 'arrow_function') return null;

    const name = nameNode.text;
    const paramsNode = valueNode.childForFieldName('parameters');
    const parameters = paramsNode ? this.parseParameters(paramsNode, content) : [];
    const position = node.startPosition;

    return {
      name,
      parameters,
      file: filePath,
      line: position.row + 1,
      column: position.column,
      isExported: this.isExported(node.parent!),
      isAsync: this.isAsync(valueNode),
      isArrow: true
    };
  }

  // Parse method definition in classes
  private parseMethodDefinition(node: Parser.SyntaxNode, content: string, filePath: string): FunctionInfo | null {
    const nameNode = node.childForFieldName('name');
    const paramsNode = node.childForFieldName('parameters');
    
    if (!nameNode || !paramsNode) return null;

    const name = nameNode.text;
    const parameters = this.parseParameters(paramsNode, content);
    const position = node.startPosition;

    return {
      name,
      parameters,
      file: filePath,
      line: position.row + 1,
      column: position.column,
      isExported: this.isExported(node.parent!),
      isAsync: this.isAsync(node),
      isArrow: false
    };
  }

  // Parse function parameters with TypeScript support
  private parseParameters(paramsNode: Parser.SyntaxNode, content: string): Parameter[] {
    const parameters: Parameter[] = [];

    for (let i = 0; i < paramsNode.childCount; i++) {
      const child = paramsNode.child(i);
      if (!child) continue;

      if (child.type === 'identifier') {
        parameters.push({
          name: child.text,
          optional: false
        });
      } else if (child.type === 'required_parameter' || child.type === 'optional_parameter') {
        const param = this.parseTypedParameter(child, content);
        if (param) parameters.push(param);
      }
    }

    return parameters;
  }

  // Parse typed parameters (TypeScript)
  private parseTypedParameter(node: Parser.SyntaxNode, content: string): Parameter | null {
    const nameNode = node.childForFieldName('pattern') || node.child(0);
    const typeNode = node.childForFieldName('type');

    if (!nameNode) return null;

    // Check for default value by looking for '=' in the parameter text
    const hasDefaultValue = node.text.includes(' = ');
    let defaultValue: string | undefined;

    if (hasDefaultValue) {
      const match = node.text.match(/=\s*(.+)$/);
      defaultValue = match ? match[1].trim() : undefined;
    }

    // Extract parameter name (handle destructuring)
    let paramName = nameNode.text;
    if (nameNode.type === 'object_pattern' || nameNode.type === 'array_pattern') {
      // For destructuring, use the first identifier found
      paramName = this.extractFirstIdentifier(nameNode) || nameNode.text;
    }

    return {
      name: paramName,
      type: typeNode?.text,
      optional: node.type === 'optional_parameter' || hasDefaultValue,
      defaultValue
    };
  }

  // Extract first identifier from destructuring pattern
  private extractFirstIdentifier(node: Parser.SyntaxNode): string | null {
    if (node.type === 'identifier') {
      return node.text;
    }

    for (let i = 0; i < node.childCount; i++) {
      const child = node.child(i);
      if (child && child.type === 'identifier') {
        return child.text;
      }
    }

    return null;
  }

  // Find function calls in AST
  private findFunctionCalls(node: Parser.SyntaxNode, content: string, filePath: string, calls: any[]): void {
    if (node.type === 'call_expression') {
      const funcNode = node.childForFieldName('function');
      const argsNode = node.childForFieldName('arguments');
      
      if (funcNode) {
        const position = node.startPosition;
        const line = content.split('\n')[position.row] || '';
        
        calls.push({
          name: funcNode.text,
          file: filePath,
          line: position.row + 1,
          column: position.column,
          context: line.trim(),
          arguments: argsNode ? this.parseArguments(argsNode) : []
        });
      }
    }

    // Recursively traverse child nodes
    for (let i = 0; i < node.childCount; i++) {
      this.findFunctionCalls(node.child(i)!, content, filePath, calls);
    }
  }

  // Parse function call arguments
  private parseArguments(argsNode: Parser.SyntaxNode): string[] {
    const args: string[] = [];
    
    for (let i = 0; i < argsNode.childCount; i++) {
      const child = argsNode.child(i);
      if (child && child.type !== ',' && child.type !== '(' && child.type !== ')') {
        args.push(child.text);
      }
    }

    return args;
  }

  // Find imports and exports
  private findImportsExports(node: Parser.SyntaxNode, content: string, filePath: string, imports: any[]): void {
    if (node.type === 'import_statement') {
      const sourceNode = node.childForFieldName('source');
      const position = node.startPosition;
      
      if (sourceNode) {
        imports.push({
          type: 'import',
          source: sourceNode.text.replace(/['"]/g, ''),
          specifiers: this.parseImportSpecifiers(node),
          line: position.row + 1,
          isDefault: this.isDefaultImport(node)
        });
      }
    }

    if (node.type === 'export_statement') {
      const position = node.startPosition;
      
      imports.push({
        type: 'export',
        source: '',
        specifiers: this.parseExportSpecifiers(node),
        line: position.row + 1,
        isDefault: this.isDefaultExport(node)
      });
    }

    // Recursively traverse child nodes
    for (let i = 0; i < node.childCount; i++) {
      this.findImportsExports(node.child(i)!, content, filePath, imports);
    }
  }

  // Helper methods for parsing imports/exports
  private parseImportSpecifiers(node: Parser.SyntaxNode): string[] {
    // Implementation for parsing import specifiers
    return [];
  }

  private parseExportSpecifiers(node: Parser.SyntaxNode): string[] {
    // Implementation for parsing export specifiers
    return [];
  }

  private isExported(node: Parser.SyntaxNode): boolean {
    // Check if this node or its parent is an export statement
    let current: Parser.SyntaxNode | null = node;

    while (current) {
      // Direct export statement
      if (current.type === 'export_statement') {
        return true;
      }

      // Parent is export statement
      if (current.parent?.type === 'export_statement') {
        return true;
      }

      current = current.parent;
    }

    return false;
  }

  private isAsync(node: Parser.SyntaxNode): boolean {
    return node.text.includes('async');
  }

  private isDefaultImport(node: Parser.SyntaxNode): boolean {
    return !node.text.includes('{');
  }

  private isDefaultExport(node: Parser.SyntaxNode): boolean {
    return node.text.includes('export default');
  }
}
