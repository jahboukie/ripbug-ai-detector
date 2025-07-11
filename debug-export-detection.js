// Debug export detection specifically
const Parser = require('tree-sitter');
const TypeScript = require('tree-sitter-typescript');
const fs = require('fs');

function debugExportDetection() {
  console.log('🔍 DEBUGGING EXPORT DETECTION');
  
  const parser = new Parser();
  parser.setLanguage(TypeScript.typescript);
  
  // Read the actual file content around the export function
  const content = fs.readFileSync('./tree-sitter-stress-test.ts', 'utf8');
  const lines = content.split('\n');
  
  // Find the export function line
  const exportLineIndex = lines.findIndex(line => line.includes('export function processComplexUserData'));
  console.log(`Export function found at line ${exportLineIndex + 1}`);
  console.log(`Line content: "${lines[exportLineIndex]}"`);
  
  // Parse just a small section around the export
  const startLine = Math.max(0, exportLineIndex - 2);
  const endLine = Math.min(lines.length, exportLineIndex + 10);
  const testCode = lines.slice(startLine, endLine).join('\n');
  
  console.log('\n📄 Test code section:');
  console.log(testCode);
  console.log();
  
  const tree = parser.parse(testCode);
  
  console.log('🌳 AST Structure:');
  printNodeWithExportInfo(tree.rootNode, 0);
}

function printNodeWithExportInfo(node, depth) {
  const indent = '  '.repeat(depth);
  const nodeText = node.text.substring(0, 100).replace(/\n/g, '\\n');
  console.log(`${indent}${node.type}: "${nodeText}"`);
  
  // Highlight export-related nodes
  if (node.type === 'export_statement' || node.type === 'function_declaration') {
    console.log(`${indent}  >>> EXPORT RELATED NODE <<<`);
    
    if (node.type === 'function_declaration') {
      // Check parent
      console.log(`${indent}  Parent type: ${node.parent?.type || 'none'}`);
      console.log(`${indent}  Parent text starts with: "${node.parent?.text.substring(0, 20) || 'none'}"`);
    }
  }
  
  if (depth < 3) { // Limit depth
    for (let i = 0; i < node.childCount; i++) {
      const child = node.child(i);
      if (child) {
        printNodeWithExportInfo(child, depth + 1);
      }
    }
  }
}

debugExportDetection();
