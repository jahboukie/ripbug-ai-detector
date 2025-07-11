// Debug Step 5: Why isn't sophisticated analysis triggering?

const { EnhancedSignatureDetector } = require('./dist/analysis/enhanced-signature-detector');
const { EnhancedASTParser } = require('./dist/analysis/ast-parser-enhanced');
const fs = require('fs');
const path = require('path');

async function debugStep5() {
  console.log('🔍 DEBUGGING STEP 5: SOPHISTICATED ANALYSIS');
  console.log('🎯 Why isn\'t the sophisticated analysis triggering?\n');
  
  try {
    // Test the enhanced detector directly
    console.log('1. 🧪 TESTING ENHANCED SIGNATURE DETECTOR:');
    const detector = new EnhancedSignatureDetector();
    
    // Parse functions from test file
    const parser = new EnhancedASTParser({
      enableTreeSitter: true,
      fallbackToRegex: true,
      debugMode: true
    });
    
    const stressTestContent = fs.readFileSync('./tree-sitter-stress-test.ts', 'utf8');
    const functions = parser.extractFunctions(stressTestContent, './tree-sitter-stress-test.ts');
    
    console.log(`   Found ${functions.length} functions:`);
    functions.forEach(func => {
      console.log(`     - ${func.name}() at line ${func.line}`);
      console.log(`       Exported: ${func.isExported}`);
      console.log(`       Parameters: ${func.parameters.length}`);
      func.parameters.forEach(p => {
        console.log(`         • ${p.name}${p.optional ? '?' : ''}: ${p.type || 'any'}${p.defaultValue ? ` = ${p.defaultValue}` : ''}`);
      });
    });
    console.log();
    
    // Test sophisticated analysis on each function
    console.log('2. 🎯 TESTING SOPHISTICATED PATTERN ANALYSIS:');
    for (const func of functions) {
      console.log(`\n   Analyzing: ${func.name}()`);
      console.log(`   Exported: ${func.isExported}`);
      
      if (!func.isExported) {
        console.log('   ⚠️  Skipping - not exported');
        continue;
      }
      
      // Test the pattern analysis directly
      try {
        const testFiles = ['./tree-sitter-stress-test.ts', './user-consumer.ts'];
        const changes = await detector.detectSignatureChanges([func], testFiles);
        
        console.log(`   Changes detected: ${changes.length}`);
        changes.forEach(change => {
          console.log(`     - Type: ${change.changeType}`);
          console.log(`     - Confidence: ${Math.round(change.confidence * 100)}%`);
          console.log(`     - AI Patterns: ${change.aiPatterns.join(', ')}`);
          console.log(`     - Breaking calls: ${change.breakingCalls.length}`);
        });
        
      } catch (error) {
        console.log(`   ❌ Error analyzing ${func.name}: ${error.message}`);
      }
    }
    
    // Test with manually created exported function
    console.log('\n3. 🧪 TESTING WITH MANUALLY EXPORTED FUNCTION:');
    const testFunction = {
      name: 'processComplexUserData',
      parameters: [
        { name: 'userId', type: 'string', optional: false },
        { 
          name: 'options', 
          type: '{ profile?: { includeAvatar?: boolean; }; cache?: { enabled?: boolean; }; }',
          optional: true,
          defaultValue: '{}'
        }
      ],
      file: './tree-sitter-stress-test.ts',
      line: 19,
      column: 0,
      isExported: true, // Force exported
      isAsync: true,
      isArrow: false
    };
    
    console.log(`   Testing function: ${testFunction.name}`);
    console.log(`   Exported: ${testFunction.isExported}`);
    console.log(`   Parameters: ${testFunction.parameters.length}`);
    
    const testFiles = ['./tree-sitter-stress-test.ts', './user-consumer.ts'];
    const changes = await detector.detectSignatureChanges([testFunction], testFiles);
    
    console.log(`   Changes detected: ${changes.length}`);
    changes.forEach(change => {
      console.log(`     - Type: ${change.changeType}`);
      console.log(`     - Confidence: ${Math.round(change.confidence * 100)}%`);
      console.log(`     - AI Patterns: ${change.aiPatterns.join(', ')}`);
      console.log(`     - Breaking calls: ${change.breakingCalls.length}`);
      console.log(`     - Severity: ${change.severity}`);
    });
    
    if (changes.length > 0) {
      console.log('\n🎉 SUCCESS: Sophisticated analysis is working!');
      console.log('🐛 The issue is with export detection, not the analysis logic');
    } else {
      console.log('\n⚠️  Still no changes detected - need to debug further');
    }
    
  } catch (error) {
    console.error('❌ DEBUG FAILED:', error.message);
    console.error('Stack:', error.stack);
  }
}

debugStep5();
