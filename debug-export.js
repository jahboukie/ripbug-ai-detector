// Debug export detection specifically
const Parser = require('tree-sitter');
const TypeScript = require('tree-sitter-typescript');
const fs = require('fs');

function debugExport() {
  console.log('🔍 DEBUG EXPORT DETECTION');
  
  const parser = new Parser();
  parser.setLanguage(TypeScript.typescript);
  
  const content = fs.readFileSync('./tree-sitter-stress-test.ts', 'utf8');
  const tree = parser.parse(content);
  
  // Find the processComplexUserData function
  function findFunction(node, depth = 0) {
    if (node.type === 'function_declaration') {
      const nameNode = node.childForFieldName('name');
      if (nameNode && nameNode.text === 'processComplexUserData') {
        console.log(`\nFound function at depth ${depth}:`);
        console.log(`Node type: ${node.type}`);
        console.log(`Node text (first 100 chars): "${node.text.substring(0, 100)}..."`);
        console.log(`Parent type: ${node.parent?.type || 'none'}`);
        console.log(`Parent text (first 50 chars): "${node.parent?.text.substring(0, 50) || 'none'}..."`);
        
        // Check all ancestors
        let current = node.parent;
        let level = 1;
        while (current && level < 5) {
          console.log(`Ancestor ${level}: ${current.type} - "${current.text.substring(0, 30)}..."`);
          current = current.parent;
          level++;
        }
        
        return true;
      }
    }
    
    for (let i = 0; i < node.childCount; i++) {
      if (findFunction(node.child(i), depth + 1)) {
        return true;
      }
    }
    return false;
  }
  
  findFunction(tree.rootNode);
}

debugExport();
