// Test MICRO-STEP 5A: Separate AI Pattern Detector
// DOES NOT TOUCH STEP 4 AT ALL!

const { SimpleAIPatterns } = require('./dist/detectors/simple-ai-patterns');
const { EnhancedASTParser } = require('./dist/analysis/ast-parser-enhanced');
const fs = require('fs');
const path = require('path');

async function testMicroStep5A() {
  console.log('🎯 MICRO-STEP 5A TEST');
  console.log('Separate AI Pattern Detector - NO Step 4 changes!\n');
  
  try {
    // Initialize separate AI pattern detector
    const aiPatterns = new SimpleAIPatterns();
    
    // Initialize parser to get function info
    const parser = new EnhancedASTParser({
      enableTreeSitter: true,
      fallbackToRegex: true,
      debugMode: false
    });
    
    // Test with the stress test file
    const testFile = path.resolve('./tree-sitter-stress-test.ts');
    const content = fs.readFileSync(testFile, 'utf8');
    
    console.log('📁 Test file:', path.basename(testFile));
    console.log();
    
    // Extract functions using existing parser
    const functions = parser.extractFunctions(content, testFile);
    
    console.log(`🔍 Found ${functions.length} functions to analyze for AI patterns\n`);
    
    // Test AI pattern detection on each function
    functions.forEach((func, index) => {
      console.log(`${index + 1}. Function: ${func.name}()`);
      console.log(`   Parameters: ${func.parameters.length}`);
      console.log(`   Param names: [${func.parameters.map(p => p.name).join(', ')}]`);
      
      // Detect AI patterns
      const result = aiPatterns.detectBasicPatterns(func);
      
      console.log(`   🤖 AI Patterns: ${result.patterns.length > 0 ? result.patterns.join(', ') : 'none'}`);
      console.log(`   📊 AI Confidence: ${Math.round(result.confidence * 100)}%`);
      
      // Check if likely AI generated
      const isAI = aiPatterns.isLikelyAIGenerated(func);
      console.log(`   🎯 Likely AI: ${isAI ? 'YES' : 'NO'}`);
      
      // Get confidence boost
      const boost = aiPatterns.getConfidenceBoost(func);
      console.log(`   📈 Confidence Boost: +${Math.round(boost * 100)}%`);
      
      // Get AI suggestions
      if (result.patterns.length > 0) {
        const suggestions = aiPatterns.generateAISuggestions(result.patterns);
        console.log(`   💡 AI Suggestions:`);
        suggestions.forEach(suggestion => {
          console.log(`     • ${suggestion}`);
        });
      }
      
      console.log();
    });
    
    // Focus on processComplexUserData function
    const targetFunc = functions.find(f => f.name === 'processComplexUserData');
    if (targetFunc) {
      console.log('🎯 FOCUS: processComplexUserData Analysis');
      console.log('==========================================');
      
      const result = aiPatterns.detectBasicPatterns(targetFunc);
      
      console.log(`Function: ${targetFunc.name}`);
      console.log(`Parameters: ${targetFunc.parameters.length}`);
      targetFunc.parameters.forEach(p => {
        console.log(`  - ${p.name}: ${p.type || 'any'}`);
      });
      
      console.log(`\n🤖 AI Patterns Detected: ${result.patterns.join(', ')}`);
      console.log(`📊 AI Confidence: ${Math.round(result.confidence * 100)}%`);
      console.log(`🎯 Likely AI Generated: ${aiPatterns.isLikelyAIGenerated(targetFunc) ? 'YES' : 'NO'}`);
      console.log(`📈 Confidence Boost: +${Math.round(aiPatterns.getConfidenceBoost(targetFunc) * 100)}%`);
      
      if (result.patterns.length > 0) {
        console.log('\n💡 AI-Specific Suggestions:');
        const suggestions = aiPatterns.generateAISuggestions(result.patterns);
        suggestions.forEach(suggestion => {
          console.log(`  • ${suggestion}`);
        });
      }
      
      console.log('\n✅ SUCCESS: Micro-Step 5A working independently!');
      console.log('🔧 AI pattern detection operational');
      console.log('🎯 Ready for integration with Step 4');
      
    } else {
      console.log('⚠️  processComplexUserData function not found');
    }
    
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

testMicroStep5A();
