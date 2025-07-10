import Parser from 'tree-sitter';
import JavaScript from 'tree-sitter-javascript';
import TypeScript from 'tree-sitter-typescript';
import { FunctionInfo, Parameter, ImportInfo, ExportInfo, TypeInfo } from '../types/analysis';

export class ASTParser {
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

  // Parse file and extract AST
  parseFile(content: string, isTypeScript: boolean = false): Parser.Tree {
    const parser = isTypeScript ? this.tsParser : this.jsParser;
    return parser.parse(content);
  }

  // Extract all function definitions from AST
  extractFunctions(tree: Parser.Tree, filePath: string): FunctionInfo[] {
    const functions: FunctionInfo[] = [];
    
    const traverse = (node: Parser.SyntaxNode) => {
      // Function declarations: function myFunc() {}
      if (node.type === 'function_declaration') {
        const func = this.parseFunctionDeclaration(node, filePath);
        if (func) functions.push(func);
      }
      
      // Arrow functions: const myFunc = () => {}
      if (node.type === 'variable_declarator') {
        const func = this.parseArrowFunction(node, filePath);
        if (func) functions.push(func);
      }
      
      // Method definitions: class methods
      if (node.type === 'method_definition') {
        const func = this.parseMethodDefinition(node, filePath);
        if (func) functions.push(func);
      }

      // Recursively traverse children
      for (const child of node.children) {
        traverse(child);
      }
    };

    traverse(tree.rootNode);
    return functions;
  }

  // Extract function calls from AST
  extractFunctionCalls(tree: Parser.Tree, filePath: string): Array<{
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

    const traverse = (node: Parser.SyntaxNode) => {
      if (node.type === 'call_expression') {
        const call = this.parseFunctionCall(node, filePath);
        if (call) calls.push(call);
      }

      for (const child of node.children) {
        traverse(child);
      }
    };

    traverse(tree.rootNode);
    return calls;
  }

  // Extract imports from AST
  extractImports(tree: Parser.Tree, filePath: string): ImportInfo[] {
    const imports: ImportInfo[] = [];

    const traverse = (node: Parser.SyntaxNode) => {
      if (node.type === 'import_statement') {
        const importInfo = this.parseImportStatement(node, filePath);
        if (importInfo) imports.push(...importInfo);
      }

      for (const child of node.children) {
        traverse(child);
      }
    };

    traverse(tree.rootNode);
    return imports;
  }

  // Extract exports from AST
  extractExports(tree: Parser.Tree, filePath: string): ExportInfo[] {
    const exports: ExportInfo[] = [];

    const traverse = (node: Parser.SyntaxNode) => {
      if (node.type === 'export_statement') {
        const exportInfo = this.parseExportStatement(node, filePath);
        if (exportInfo) exports.push(...exportInfo);
      }

      for (const child of node.children) {
        traverse(child);
      }
    };

    traverse(tree.rootNode);
    return exports;
  }

  // Parse function declaration
  private parseFunctionDeclaration(node: Parser.SyntaxNode, filePath: string): FunctionInfo | null {
    const nameNode = node.childForFieldName('name');
    const parametersNode = node.childForFieldName('parameters');
    
    if (!nameNode || !parametersNode) return null;

    const name = nameNode.text;
    const parameters = this.parseParameters(parametersNode);
    const isAsync = node.text.startsWith('async ');

    return {
      name,
      parameters,
      file: filePath,
      line: node.startPosition.row + 1,
      column: node.startPosition.column + 1,
      isExported: this.isExported(node),
      isAsync,
      isArrow: false
    };
  }

  // Parse arrow function
  private parseArrowFunction(node: Parser.SyntaxNode, filePath: string): FunctionInfo | null {
    const nameNode = node.childForFieldName('name');
    const valueNode = node.childForFieldName('value');
    
    if (!nameNode || !valueNode || valueNode.type !== 'arrow_function') return null;

    const name = nameNode.text;
    const parametersNode = valueNode.childForFieldName('parameters');
    const parameters = parametersNode ? this.parseParameters(parametersNode) : [];
    const isAsync = valueNode.text.startsWith('async ');

    return {
      name,
      parameters,
      file: filePath,
      line: node.startPosition.row + 1,
      column: node.startPosition.column + 1,
      isExported: this.isExported(node.parent),
      isAsync,
      isArrow: true
    };
  }

  // Parse method definition
  private parseMethodDefinition(node: Parser.SyntaxNode, filePath: string): FunctionInfo | null {
    const nameNode = node.childForFieldName('name');
    const parametersNode = node.childForFieldName('parameters');
    
    if (!nameNode || !parametersNode) return null;

    const name = nameNode.text;
    const parameters = this.parseParameters(parametersNode);
    const isAsync = node.text.includes('async ');

    return {
      name,
      parameters,
      file: filePath,
      line: node.startPosition.row + 1,
      column: node.startPosition.column + 1,
      isExported: true, // Methods are accessible if class is exported
      isAsync,
      isArrow: false
    };
  }

  // Parse function parameters
  private parseParameters(parametersNode: Parser.SyntaxNode): Parameter[] {
    const parameters: Parameter[] = [];

    for (const child of parametersNode.children) {
      if (child.type === 'required_parameter' || child.type === 'optional_parameter') {
        const param = this.parseParameter(child);
        if (param) parameters.push(param);
      }
    }

    return parameters;
  }

  // Parse individual parameter
  private parseParameter(node: Parser.SyntaxNode): Parameter | null {
    const nameNode = node.childForFieldName('pattern') || node.children[0];
    if (!nameNode) return null;

    const name = nameNode.text;
    const optional = node.type === 'optional_parameter' || name.includes('?');
    
    // Extract type annotation if present
    let type: string | undefined;
    const typeNode = node.childForFieldName('type');
    if (typeNode) {
      type = typeNode.text;
    }

    // Extract default value if present
    let defaultValue: string | undefined;
    const defaultNode = node.childForFieldName('value');
    if (defaultNode) {
      defaultValue = defaultNode.text;
    }

    return {
      name: name.replace('?', ''), // Remove optional marker
      type,
      optional,
      defaultValue
    };
  }

  // Parse function call
  private parseFunctionCall(node: Parser.SyntaxNode, filePath: string): {
    name: string;
    file: string;
    line: number;
    column: number;
    context: string;
  } | null {
    const functionNode = node.childForFieldName('function');
    if (!functionNode) return null;

    let name = '';
    
    // Handle different call patterns
    if (functionNode.type === 'identifier') {
      name = functionNode.text;
    } else if (functionNode.type === 'member_expression') {
      const propertyNode = functionNode.childForFieldName('property');
      if (propertyNode) {
        name = propertyNode.text;
      }
    }

    if (!name) return null;

    // Get surrounding context (the line containing the call)
    const context = this.getLineContext(node, filePath);

    return {
      name,
      file: filePath,
      line: node.startPosition.row + 1,
      column: node.startPosition.column + 1,
      context
    };
  }

  // Parse import statement
  private parseImportStatement(node: Parser.SyntaxNode, filePath: string): ImportInfo[] {
    const imports: ImportInfo[] = [];
    const sourceNode = node.childForFieldName('source');
    
    if (!sourceNode) return imports;
    
    const modulePath = sourceNode.text.replace(/['"]/g, '');
    
    // Handle different import patterns
    for (const child of node.children) {
      if (child.type === 'import_specifier') {
        const nameNode = child.childForFieldName('name');
        if (nameNode) {
          imports.push({
            importName: nameNode.text,
            modulePath,
            isDefault: false,
            isNamespace: false,
            file: filePath,
            line: node.startPosition.row + 1,
            column: node.startPosition.column + 1
          });
        }
      }
    }

    return imports;
  }

  // Parse export statement
  private parseExportStatement(node: Parser.SyntaxNode, filePath: string): ExportInfo[] {
    const exports: ExportInfo[] = [];
    
    // This is a simplified implementation
    // In a full implementation, we'd handle all export patterns
    
    return exports;
  }

  // Check if node is exported
  private isExported(node: Parser.SyntaxNode | null): boolean {
    if (!node) return false;
    
    // Check if parent is export statement
    let current = node.parent;
    while (current) {
      if (current.type === 'export_statement') {
        return true;
      }
      current = current.parent;
    }
    
    return false;
  }

  // Get line context for error reporting
  private getLineContext(node: Parser.SyntaxNode, filePath: string): string {
    // This would extract the full line containing the node
    // For now, return the node text
    return node.text;
  }
}
