// Debug Step 4 Enhancement
// Let me debug why the mouse trap isn't catching the bug!

const { EnhancedASTParser } = require('./dist/analysis/ast-parser-enhanced');
const { FeatureFlags } = require('./dist/config/feature-flags');
const fs = require('fs');
const path = require('path');

async function debugStep4() {
  console.log('🔍 DEBUGGING STEP 4 ENHANCEMENT');
  console.log('🐭 Why isn\'t the mouse trap catching the bug?\n');
  
  try {
    // Check feature flags first
    console.log('1. 🚩 CHECKING FEATURE FLAGS:');
    const useTreeSitter = FeatureFlags.shouldUseTreeSitter('tree-sitter-stress-test.ts');
    console.log(`   Tree-sitter enabled: ${useTreeSitter}`);
    
    const config = FeatureFlags.getConfig();
    console.log(`   Config:`, config);
    console.log();
    
    // Test the parser directly
    console.log('2. 🔧 TESTING ENHANCED PARSER:');
    const parser = new EnhancedASTParser({
      enableTreeSitter: true,
      fallbackToRegex: true,
      debugMode: true
    });
    
    // Test function extraction from tree-sitter-stress-test.ts
    console.log('   📄 Analyzing tree-sitter-stress-test.ts...');
    const stressTestContent = fs.readFileSync('./tree-sitter-stress-test.ts', 'utf8');
    const functions = parser.extractFunctions(stressTestContent, './tree-sitter-stress-test.ts');
    
    console.log(`   Found ${functions.length} functions:`);
    functions.forEach(func => {
      console.log(`     - ${func.name}() at line ${func.line}`);
      console.log(`       Parameters: ${func.parameters.length}`);
      func.parameters.forEach(p => {
        console.log(`         • ${p.name}${p.optional ? '?' : ''}: ${p.type || 'any'}`);
      });
      console.log(`       Exported: ${func.isExported}`);
    });
    console.log();
    
    // Test function call extraction from user-consumer.ts
    console.log('   📄 Analyzing user-consumer.ts...');
    const consumerContent = fs.readFileSync('./user-consumer.ts', 'utf8');
    const calls = parser.extractFunctionCalls(consumerContent, './user-consumer.ts');
    
    console.log(`   Found ${calls.length} function calls:`);
    calls.forEach(call => {
      console.log(`     - ${call.name}() at line ${call.line}`);
      console.log(`       Context: ${call.context}`);
      console.log(`       Arguments: ${call.arguments?.length || 0}`);
      if (call.arguments) {
        call.arguments.forEach((arg, i) => {
          console.log(`         ${i + 1}. ${arg}`);
        });
      }
    });
    console.log();
    
    // Check the specific function we're looking for
    const targetFunction = functions.find(f => f.name === 'processComplexUserData');
    const targetCall = calls.find(c => c.name === 'processComplexUserData');
    
    if (targetFunction) {
      console.log('3. 🎯 TARGET FUNCTION ANALYSIS:');
      console.log(`   Function: ${targetFunction.name}`);
      console.log(`   Required params: ${targetFunction.parameters.filter(p => !p.optional).length}`);
      console.log(`   Total params: ${targetFunction.parameters.length}`);
      console.log(`   Is exported: ${targetFunction.isExported}`);
      console.log();
    } else {
      console.log('❌ Target function processComplexUserData not found!');
    }
    
    if (targetCall) {
      console.log('4. 🎯 TARGET CALL ANALYSIS:');
      console.log(`   Call: ${targetCall.name}`);
      console.log(`   Provided args: ${targetCall.arguments?.length || 0}`);
      console.log(`   Context: ${targetCall.context}`);
      console.log();
    } else {
      console.log('❌ Target call processComplexUserData not found!');
    }
    
    // Manual breaking change detection
    if (targetFunction && targetCall) {
      const requiredParams = targetFunction.parameters.filter(p => !p.optional).length;
      const providedArgs = targetCall.arguments?.length || 0;
      
      console.log('5. 🚨 BREAKING CHANGE ANALYSIS:');
      console.log(`   Required parameters: ${requiredParams}`);
      console.log(`   Provided arguments: ${providedArgs}`);
      console.log(`   Breaking change: ${providedArgs < requiredParams ? 'YES' : 'NO'}`);
      
      if (providedArgs < requiredParams) {
        console.log('   🎉 SUCCESS: Breaking change detected manually!');
        console.log('   🐛 The issue is in the detector logic, not the parsing');
      }
    }
    
  } catch (error) {
    console.error('❌ DEBUG FAILED:', error.message);
    console.error('Stack:', error.stack);
  }
}

debugStep4();
