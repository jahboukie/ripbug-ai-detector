// Debug AST structure to understand tree-sitter output
const Parser = require('tree-sitter');
const TypeScript = require('tree-sitter-typescript');
const fs = require('fs');

function debugAST() {
  console.log('🔍 DEBUGGING AST STRUCTURE');
  
  const parser = new Parser();
  parser.setLanguage(TypeScript.typescript);
  
  // Simple test case
  const testCode = `export function processComplexUserData(
  userId: string,
  options: { test?: boolean } = {}
): Promise<any> {
  return Promise.resolve();
}`;
  
  console.log('📄 Test code:');
  console.log(testCode);
  console.log();
  
  const tree = parser.parse(testCode);
  
  console.log('🌳 AST Structure:');
  printNode(tree.rootNode, 0);
}

function printNode(node, depth) {
  const indent = '  '.repeat(depth);
  console.log(`${indent}${node.type}: "${node.text.substring(0, 50).replace(/\n/g, '\\n')}"`);
  
  if (depth < 4) { // Limit depth to avoid too much output
    for (let i = 0; i < node.childCount; i++) {
      const child = node.child(i);
      if (child) {
        printNode(child, depth + 1);
      }
    }
  }
}

debugAST();
