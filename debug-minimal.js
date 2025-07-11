// Minimal debug - what's actually happening?
const { EnhancedASTParser } = require('./dist/analysis/ast-parser-enhanced');
const fs = require('fs');

async function debugMinimal() {
  console.log('🔍 MINIMAL DEBUG - What is actually happening?');
  
  const parser = new EnhancedASTParser({
    enableTreeSitter: true,
    fallbackToRegex: true,
    debugMode: false
  });
  
  // 1. Check function extraction
  console.log('\n1. 📄 FUNCTION EXTRACTION:');
  const content = fs.readFileSync('./tree-sitter-stress-test.ts', 'utf8');
  const functions = parser.extractFunctions(content, './tree-sitter-stress-test.ts');
  
  console.log(`Found ${functions.length} functions:`);
  functions.forEach(func => {
    console.log(`  - ${func.name}() at line ${func.line} - exported: ${func.isExported}`);
  });
  
  // 2. Check call extraction
  console.log('\n2. 📞 CALL EXTRACTION:');
  const consumerContent = fs.readFileSync('./user-consumer.ts', 'utf8');
  const calls = parser.extractFunctionCalls(consumerContent, './user-consumer.ts');
  
  console.log(`Found ${calls.length} calls:`);
  calls.forEach(call => {
    console.log(`  - ${call.name}() at line ${call.line} with ${call.arguments.length} args`);
    console.log(`    Context: ${call.context}`);
  });
  
  // 3. Check the specific function we care about
  console.log('\n3. 🎯 SPECIFIC FUNCTION CHECK:');
  const targetFunc = functions.find(f => f.name === 'processComplexUserData');
  if (targetFunc) {
    console.log(`Function: ${targetFunc.name}`);
    console.log(`Exported: ${targetFunc.isExported}`);
    console.log(`Parameters: ${targetFunc.parameters.length}`);
    targetFunc.parameters.forEach(p => {
      console.log(`  • ${p.name}: ${p.type || 'any'}${p.optional ? ' (optional)' : ' (required)'}${p.defaultValue ? ` = ${p.defaultValue}` : ''}`);
    });
  } else {
    console.log('❌ processComplexUserData not found!');
  }
  
  // 4. Check calls to that function
  console.log('\n4. 📞 CALLS TO TARGET FUNCTION:');
  const targetCalls = calls.filter(c => c.name === 'processComplexUserData');
  console.log(`Found ${targetCalls.length} calls to processComplexUserData:`);
  targetCalls.forEach(call => {
    console.log(`  - Line ${call.line}: ${call.arguments.length} arguments`);
    console.log(`    Arguments: [${call.arguments.join(', ')}]`);
  });
  
  // 5. Manual breaking change check
  if (targetFunc && targetCalls.length > 0) {
    console.log('\n5. 🚨 MANUAL BREAKING CHANGE CHECK:');
    const requiredParams = targetFunc.parameters.filter(p => !p.optional && !p.defaultValue);
    console.log(`Required parameters: ${requiredParams.length}`);
    requiredParams.forEach(p => console.log(`  • ${p.name} (required)`));
    
    targetCalls.forEach((call, i) => {
      console.log(`\nCall ${i+1}:`);
      console.log(`  Provided: ${call.arguments.length} arguments`);
      console.log(`  Required: ${requiredParams.length} arguments`);
      console.log(`  Breaking: ${call.arguments.length < requiredParams.length ? 'YES' : 'NO'}`);
    });
  }
}

debugMinimal();
