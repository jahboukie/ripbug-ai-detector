// Enhanced AST Parser with Hybrid Tree-sitter/Regex Approach
// Following Claude S4's incremental roadmap for zero-downtime upgrades

import { SimpleParser } from './simple-parser';
import { FunctionInfo, Parameter } from '../types/analysis';
import Parser from 'tree-sitter';
import JavaScript from 'tree-sitter-javascript';
import TypeScript from 'tree-sitter-typescript';

export interface EnhancedParserConfig {
  enableTreeSitter?: boolean;
  fallbackToRegex?: boolean;
  debugMode?: boolean;
}

export class EnhancedASTParser {
  private simpleParser: SimpleParser;
  private treeParser?: TreeSitterParser;
  private useTreeSitter: boolean;
  private fallbackToRegex: boolean;
  private debugMode: boolean;

  constructor(config: EnhancedParserConfig = {}) {
    // Always keep the working regex parser
    this.simpleParser = new SimpleParser();
    
    // Feature flags for safe rollout
    this.useTreeSitter = config.enableTreeSitter ?? false;
    this.fallbackToRegex = config.fallbackToRegex ?? true;
    this.debugMode = config.debugMode ?? false;
    
    // Initialize tree-sitter only if enabled
    if (this.useTreeSitter) {
      try {
        this.treeParser = new TreeSitterParser();
        if (this.debugMode) {
          console.log('✅ Tree-sitter parser initialized successfully');
        }
      } catch (error) {
        console.warn('⚠️ Tree-sitter initialization failed, using regex fallback:', error);
        this.useTreeSitter = false;
      }
    }
  }

  // Hybrid extraction method - tries tree-sitter first, falls back to regex
  extractFunctions(content: string, filePath: string): FunctionInfo[] {
    if (this.useTreeSitter && this.treeParser) {
      try {
        const treeFunctions = this.treeParser.extractFunctions(content, filePath);
        
        if (this.debugMode) {
          console.log(`🌳 Tree-sitter found ${treeFunctions.length} functions in ${filePath}`);
        }
        
        // Validate tree-sitter results
        if (treeFunctions.length > 0) {
          return treeFunctions;
        }
        
        // If tree-sitter found nothing, fall back to regex
        if (this.fallbackToRegex) {
          if (this.debugMode) {
            console.log('🔄 Tree-sitter found no functions, falling back to regex');
          }
          return this.simpleParser.extractFunctions(content, filePath);
        }
        
        return treeFunctions;
      } catch (error) {
        if (this.debugMode) {
          console.warn('❌ Tree-sitter failed, falling back to regex:', error);
        }
        
        // Fallback to regex on any error
        if (this.fallbackToRegex) {
          return this.simpleParser.extractFunctions(content, filePath);
        }
        
        // If fallback disabled, re-throw error
        throw error;
      }
    }
    
    // Use regex parser (default/fallback)
    if (this.debugMode) {
      console.log(`📝 Using regex parser for ${filePath}`);
    }
    return this.simpleParser.extractFunctions(content, filePath);
  }

  // Extract function calls with enhanced tree-sitter analysis
  extractFunctionCalls(content: string, filePath: string): Array<{
    name: string;
    file: string;
    line: number;
    column: number;
    context: string;
    arguments: string[];
    argumentCount: number;
    callType: 'function' | 'method' | 'constructor';
  }> {
    if (this.useTreeSitter && this.treeParser) {
      try {
        return this.treeParser.extractFunctionCalls(content, filePath);
      } catch (error) {
        if (this.debugMode) {
          console.warn('❌ Tree-sitter call extraction failed, falling back to regex:', error);
        }
        
        if (this.fallbackToRegex) {
          const simpleCalls = this.simpleParser.extractFunctionCalls(content, filePath);
          return simpleCalls.map(call => ({
            ...call,
            arguments: [],
            argumentCount: 0,
            callType: 'function' as const
          }));
        }
        
        throw error;
      }
    }
    
    const simpleCalls = this.simpleParser.extractFunctionCalls(content, filePath);
    return simpleCalls.map(call => ({
      ...call,
      arguments: [],
      argumentCount: 0,
      callType: 'function' as const
    }));
  }

  // Get parser statistics for monitoring
  getParserStats(): {
    usingTreeSitter: boolean;
    fallbackEnabled: boolean;
    parserType: 'tree-sitter' | 'regex' | 'hybrid';
  } {
    return {
      usingTreeSitter: this.useTreeSitter,
      fallbackEnabled: this.fallbackToRegex,
      parserType: this.useTreeSitter ? 
        (this.fallbackToRegex ? 'hybrid' : 'tree-sitter') : 
        'regex'
    };
  }

  // Enable/disable tree-sitter at runtime
  setTreeSitterEnabled(enabled: boolean): void {
    this.useTreeSitter = enabled;
    
    if (enabled && !this.treeParser) {
      try {
        this.treeParser = new TreeSitterParser();
        if (this.debugMode) {
          console.log('✅ Tree-sitter parser enabled at runtime');
        }
      } catch (error) {
        console.warn('⚠️ Failed to enable tree-sitter at runtime:', error);
        this.useTreeSitter = false;
      }
    }
  }
}

// Basic Tree-sitter Parser Implementation
class TreeSitterParser {
  private jsParser: Parser;
  private tsParser: Parser;

  constructor() {
    this.jsParser = new Parser();
    this.jsParser.setLanguage(JavaScript);

    this.tsParser = new Parser();
    this.tsParser.setLanguage(TypeScript.typescript);
  }

  extractFunctions(content: string, filePath: string): FunctionInfo[] {
    const isTypeScript = filePath.endsWith('.ts') || filePath.endsWith('.tsx');
    const parser = isTypeScript ? this.tsParser : this.jsParser;

    try {
      const tree = parser.parse(content);
      return this.walkAST(tree.rootNode, filePath);
    } catch (error) {
      throw new Error(`Tree-sitter parsing failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  extractFunctionCalls(content: string, filePath: string): Array<{
    name: string;
    file: string;
    line: number;
    column: number;
    context: string;
    arguments: string[];
    argumentCount: number;
    callType: 'function' | 'method' | 'constructor';
  }> {
    const isTypeScript = filePath.endsWith('.ts') || filePath.endsWith('.tsx');
    const parser = isTypeScript ? this.tsParser : this.jsParser;

    try {
      const tree = parser.parse(content);
      return this.extractCallsFromAST(tree.rootNode, filePath, content);
    } catch (error) {
      throw new Error(`Tree-sitter call extraction failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private walkAST(node: any, filePath: string): FunctionInfo[] {
    const functions: FunctionInfo[] = [];

    // Handle function declarations
    if (node.type === 'function_declaration') {
      const func = this.parseFunctionDeclaration(node, filePath);
      if (func) functions.push(func);
    }

    // Handle arrow functions in variable declarations
    if (node.type === 'variable_declarator') {
      const func = this.parseArrowFunction(node, filePath);
      if (func) functions.push(func);
    }

    // Handle method definitions in classes
    if (node.type === 'method_definition') {
      const func = this.parseMethodDefinition(node, filePath);
      if (func) functions.push(func);
    }

    // Recursively process children
    if (node.children) {
      for (const child of node.children) {
        functions.push(...this.walkAST(child, filePath));
      }
    }

    return functions;
  }

  // Enhanced call extraction with sophisticated AST analysis
  private extractCallsFromAST(node: any, filePath: string, content: string): Array<{
    name: string;
    file: string;
    line: number;
    column: number;
    context: string;
    arguments: string[];
    argumentCount: number;
    callType: 'function' | 'method' | 'constructor';
  }> {
    const calls: Array<{
      name: string;
      file: string;
      line: number;
      column: number;
      context: string;
      arguments: string[];
      argumentCount: number;
      callType: 'function' | 'method' | 'constructor';
    }> = [];

    const traverse = (currentNode: any) => {
      // Handle function calls: functionName()
      if (currentNode.type === 'call_expression') {
        const call = this.parseCallExpression(currentNode, filePath, content);
        if (call) calls.push(call);
      }

      // Handle method calls: obj.method()
      if (currentNode.type === 'member_expression') {
        const memberCall = this.parseMemberCall(currentNode, filePath, content);
        if (memberCall) calls.push(memberCall);
      }

      // Handle constructor calls: new ClassName()
      if (currentNode.type === 'new_expression') {
        const constructorCall = this.parseConstructorCall(currentNode, filePath, content);
        if (constructorCall) calls.push(constructorCall);
      }

      // Recursively traverse children
      if (currentNode.children) {
        for (const child of currentNode.children) {
          traverse(child);
        }
      }
    };

    traverse(node);
    return calls;
  }

  private parseFunctionDeclaration(node: any, filePath: string): FunctionInfo | null {
    try {
      const nameNode = this.findChildByType(node, 'identifier');
      if (!nameNode) return null;

      const name = nameNode.text;
      const parameters = this.parseParameters(node);
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
    } catch (error) {
      return null;
    }
  }

  private parseArrowFunction(node: any, filePath: string): FunctionInfo | null {
    try {
      const nameNode = this.findChildByType(node, 'identifier');
      const valueNode = this.findChildByType(node, 'arrow_function');
      
      if (!nameNode || !valueNode) return null;

      const name = nameNode.text;
      const parameters = this.parseParameters(valueNode);
      const position = node.startPosition;

      return {
        name,
        parameters,
        file: filePath,
        line: position.row + 1,
        column: position.column,
        isExported: this.isExported(node.parent),
        isAsync: this.isAsync(valueNode),
        isArrow: true
      };
    } catch (error) {
      return null;
    }
  }

  private parseMethodDefinition(node: any, filePath: string): FunctionInfo | null {
    try {
      const nameNode = this.findChildByType(node, 'property_identifier') || 
                       this.findChildByType(node, 'identifier');
      if (!nameNode) return null;

      const name = nameNode.text;
      const parameters = this.parseParameters(node);
      const position = node.startPosition;

      return {
        name,
        parameters,
        file: filePath,
        line: position.row + 1,
        column: position.column,
        isExported: this.isExported(node.parent),
        isAsync: this.isAsync(node),
        isArrow: false
      };
    } catch (error) {
      return null;
    }
  }

  // Enhanced call expression parsing with argument counting
  private parseCallExpression(node: any, filePath: string, content: string): {
    name: string;
    file: string;
    line: number;
    column: number;
    context: string;
    arguments: string[];
    argumentCount: number;
    callType: 'function' | 'method' | 'constructor';
  } | null {
    try {
      const functionNode = this.findChildByType(node, 'identifier') ||
                          this.findChildByType(node, 'member_expression');
      if (!functionNode) return null;

      const position = node.startPosition;
      const line = position.row + 1;
      const lineContent = content.split('\n')[position.row] || '';
      const args = this.parseArguments(node);

      return {
        name: functionNode.text,
        file: filePath,
        line,
        column: position.column,
        context: lineContent.trim(),
        arguments: args,
        argumentCount: args.length,
        callType: 'function'
      };
    } catch (error) {
      return null;
    }
  }

  // Parse method calls: obj.method()
  private parseMemberCall(node: any, filePath: string, content: string): {
    name: string;
    file: string;
    line: number;
    column: number;
    context: string;
    arguments: string[];
    argumentCount: number;
    callType: 'function' | 'method' | 'constructor';
  } | null {
    try {
      // Look for parent call_expression
      let parent = node.parent;
      while (parent && parent.type !== 'call_expression') {
        parent = parent.parent;
      }

      if (!parent) return null;

      const propertyNode = this.findChildByType(node, 'property_identifier');
      if (!propertyNode) return null;

      const position = parent.startPosition;
      const line = position.row + 1;
      const lineContent = content.split('\n')[position.row] || '';
      const args = this.parseArguments(parent);

      return {
        name: propertyNode.text,
        file: filePath,
        line,
        column: position.column,
        context: lineContent.trim(),
        arguments: args,
        argumentCount: args.length,
        callType: 'method'
      };
    } catch (error) {
      return null;
    }
  }

  // Parse constructor calls: new ClassName()
  private parseConstructorCall(node: any, filePath: string, content: string): {
    name: string;
    file: string;
    line: number;
    column: number;
    context: string;
    arguments: string[];
    argumentCount: number;
    callType: 'function' | 'method' | 'constructor';
  } | null {
    try {
      const constructorNode = this.findChildByType(node, 'identifier');
      if (!constructorNode) return null;

      const position = node.startPosition;
      const line = position.row + 1;
      const lineContent = content.split('\n')[position.row] || '';
      const args = this.parseArguments(node);

      return {
        name: constructorNode.text,
        file: filePath,
        line,
        column: position.column,
        context: lineContent.trim(),
        arguments: args,
        argumentCount: args.length,
        callType: 'constructor'
      };
    } catch (error) {
      return null;
    }
  }

  private parseParameters(node: any): Parameter[] {
    const parameters: Parameter[] = [];
    
    try {
      const paramsNode = this.findChildByType(node, 'formal_parameters');
      if (!paramsNode || !paramsNode.children) return parameters;

      for (const child of paramsNode.children) {
        if (child.type === 'identifier') {
          parameters.push({
            name: child.text,
            optional: false
          });
        } else if (child.type === 'required_parameter' || child.type === 'optional_parameter') {
          const param = this.parseTypedParameter(child);
          if (param) parameters.push(param);
        }
      }
    } catch (error) {
      // Return empty parameters on error
    }

    return parameters;
  }

  private parseTypedParameter(node: any): Parameter | null {
    try {
      const nameNode = this.findChildByType(node, 'identifier');
      if (!nameNode) return null;

      return {
        name: nameNode.text,
        optional: node.type === 'optional_parameter',
        type: this.extractTypeAnnotation(node)
      };
    } catch (error) {
      return null;
    }
  }

  // Enhanced argument parsing with better accuracy
  private parseArguments(node: any): string[] {
    const args: string[] = [];

    try {
      const argsNode = this.findChildByType(node, 'arguments');
      if (!argsNode || !argsNode.children) return args;

      let currentArg = '';
      let parenDepth = 0;
      let bracketDepth = 0;
      let braceDepth = 0;

      for (const child of argsNode.children) {
        const text = child.text;

        if (child.type === '(') {
          parenDepth++;
          if (parenDepth === 1) continue; // Skip opening paren
        } else if (child.type === ')') {
          parenDepth--;
          if (parenDepth === 0) break; // Skip closing paren
        } else if (child.type === ',' && parenDepth === 1 && bracketDepth === 0 && braceDepth === 0) {
          // This is a top-level comma separator
          if (currentArg.trim()) {
            args.push(currentArg.trim());
            currentArg = '';
          }
          continue;
        }

        // Track nested structures
        if (text.includes('[')) bracketDepth++;
        if (text.includes(']')) bracketDepth--;
        if (text.includes('{')) braceDepth++;
        if (text.includes('}')) braceDepth--;

        currentArg += text;
      }

      // Add the last argument
      if (currentArg.trim()) {
        args.push(currentArg.trim());
      }
    } catch (error) {
      // Return empty arguments on error
    }

    return args;
  }

  // Helper methods
  private findChildByType(node: any, type: string): any {
    if (!node.children) return null;
    
    for (const child of node.children) {
      if (child.type === type) return child;
    }
    return null;
  }

  private isExported(node: any): boolean {
    if (!node) return false;
    return node.text && node.text.includes('export');
  }

  private isAsync(node: any): boolean {
    if (!node) return false;
    return node.text && node.text.includes('async');
  }

  private extractTypeAnnotation(node: any): string | undefined {
    const typeNode = this.findChildByType(node, 'type_annotation');
    return typeNode ? typeNode.text.replace(':', '').trim() : undefined;
  }
}
