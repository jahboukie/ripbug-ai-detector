// Performance Benchmarking for Tree-sitter vs Regex
// Comprehensive performance analysis

const { AccuracyTester } = require('./dist/analysis/accuracy-tester');
const fs = require('fs');
const path = require('path');

async function benchmarkParsing() {
  console.log('⚡ PERFORMANCE BENCHMARKING: TREE-SITTER VS REGEX');
  console.log('🎯 Comprehensive performance analysis\n');
  
  const tester = new AccuracyTester();
  
  // Test files with different complexity levels
  const testFiles = [
    { path: './tree-sitter-stress-test.ts', name: 'Complex TypeScript (stress test)', expectedComplexity: 'high' },
    { path: './user-consumer.ts', name: 'Simple consumer file', expectedComplexity: 'low' },
    { path: './user-types.ts', name: 'Type definitions', expectedComplexity: 'low' },
    { path: './src/analysis/tree-sitter-parser.ts', name: 'Tree-sitter parser (medium)', expectedComplexity: 'medium' },
    { path: './src/detectors/function-signature-detector.ts', name: 'Function detector (large)', expectedComplexity: 'high' }
  ];
  
  const results = [];
  let totalRegexTime = 0;
  let totalTreeTime = 0;
  let totalFiles = 0;
  
  console.log('📊 INDIVIDUAL FILE BENCHMARKS:');
  console.log('='.repeat(80));
  
  for (const testFile of testFiles) {
    try {
      if (!fs.existsSync(testFile.path)) {
        console.log(`⚠️ Skipping ${testFile.name} (file not found)`);
        continue;
      }
      
      const content = fs.readFileSync(testFile.path, 'utf8');
      const fileSize = content.length;
      const lineCount = content.split('\n').length;
      
      console.log(`\n🔍 ${testFile.name}`);
      console.log(`   File: ${path.basename(testFile.path)}`);
      console.log(`   Size: ${fileSize} bytes, ${lineCount} lines`);
      
      // Run multiple iterations for more accurate timing
      const iterations = 5;
      let regexTotalTime = 0;
      let treeTotalTime = 0;
      let regexFunctions = 0;
      let treeFunctions = 0;
      
      for (let i = 0; i < iterations; i++) {
        const result = await tester.compareAccuracy(content, testFile.path);
        regexTotalTime += result.performanceMetrics.regexTimeMs;
        treeTotalTime += result.performanceMetrics.treeTimeMs;
        regexFunctions = result.regexCount;
        treeFunctions = result.treeCount;
      }
      
      const avgRegexTime = regexTotalTime / iterations;
      const avgTreeTime = treeTotalTime / iterations;
      const speedRatio = avgRegexTime / avgTreeTime;
      const accuracyImprovement = treeFunctions > 0 ? ((treeFunctions - regexFunctions) / Math.max(regexFunctions, 1)) * 100 : 0;
      
      console.log(`   📈 Performance:`);
      console.log(`     Regex:      ${avgRegexTime.toFixed(2)}ms (avg of ${iterations} runs)`);
      console.log(`     Tree-sitter: ${avgTreeTime.toFixed(2)}ms (avg of ${iterations} runs)`);
      console.log(`     Speed ratio: ${speedRatio.toFixed(2)}x (${speedRatio < 1 ? 'tree-sitter slower' : 'regex slower'})`);
      console.log(`   🎯 Accuracy:`);
      console.log(`     Regex found:      ${regexFunctions} functions`);
      console.log(`     Tree-sitter found: ${treeFunctions} functions`);
      console.log(`     Improvement:      ${accuracyImprovement > 0 ? '+' : ''}${accuracyImprovement.toFixed(1)}%`);
      
      // Performance per line metrics
      const regexPerLine = avgRegexTime / lineCount;
      const treePerLine = avgTreeTime / lineCount;
      console.log(`   📏 Per-line performance:`);
      console.log(`     Regex:      ${regexPerLine.toFixed(4)}ms/line`);
      console.log(`     Tree-sitter: ${treePerLine.toFixed(4)}ms/line`);
      
      results.push({
        name: testFile.name,
        path: testFile.path,
        complexity: testFile.expectedComplexity,
        fileSize,
        lineCount,
        regexTime: avgRegexTime,
        treeTime: avgTreeTime,
        speedRatio,
        regexFunctions,
        treeFunctions,
        accuracyImprovement,
        regexPerLine,
        treePerLine
      });
      
      totalRegexTime += avgRegexTime;
      totalTreeTime += avgTreeTime;
      totalFiles++;
      
    } catch (error) {
      console.log(`❌ Error benchmarking ${testFile.name}: ${error.message}`);
    }
  }
  
  // Overall statistics
  console.log('\n📊 OVERALL PERFORMANCE SUMMARY:');
  console.log('='.repeat(80));
  
  const avgRegexTime = totalRegexTime / totalFiles;
  const avgTreeTime = totalTreeTime / totalFiles;
  const overallSpeedRatio = avgRegexTime / avgTreeTime;
  
  console.log(`Files analyzed: ${totalFiles}`);
  console.log(`Average regex time: ${avgRegexTime.toFixed(2)}ms`);
  console.log(`Average tree-sitter time: ${avgTreeTime.toFixed(2)}ms`);
  console.log(`Overall speed ratio: ${overallSpeedRatio.toFixed(2)}x`);
  
  // Performance by complexity
  const complexityGroups = {
    low: results.filter(r => r.complexity === 'low'),
    medium: results.filter(r => r.complexity === 'medium'),
    high: results.filter(r => r.complexity === 'high')
  };
  
  console.log('\n📈 PERFORMANCE BY COMPLEXITY:');
  Object.entries(complexityGroups).forEach(([complexity, files]) => {
    if (files.length === 0) return;
    
    const avgRegex = files.reduce((sum, f) => sum + f.regexTime, 0) / files.length;
    const avgTree = files.reduce((sum, f) => sum + f.treeTime, 0) / files.length;
    const avgAccuracy = files.reduce((sum, f) => sum + f.accuracyImprovement, 0) / files.length;
    
    console.log(`   ${complexity.toUpperCase()} complexity (${files.length} files):`);
    console.log(`     Regex: ${avgRegex.toFixed(2)}ms, Tree-sitter: ${avgTree.toFixed(2)}ms`);
    console.log(`     Speed ratio: ${(avgRegex / avgTree).toFixed(2)}x`);
    console.log(`     Accuracy improvement: ${avgAccuracy > 0 ? '+' : ''}${avgAccuracy.toFixed(1)}%`);
  });
  
  // Recommendations
  console.log('\n🎯 PERFORMANCE RECOMMENDATIONS:');
  console.log('='.repeat(80));
  
  if (overallSpeedRatio < 0.1) {
    console.log('⚠️  Tree-sitter is significantly slower than regex');
    console.log('   Consider using hybrid approach with complexity-based switching');
  } else if (overallSpeedRatio < 0.5) {
    console.log('✅ Tree-sitter performance is acceptable for the accuracy gains');
    console.log('   Recommended for complex files, hybrid for simple files');
  } else {
    console.log('🚀 Tree-sitter performance is excellent!');
    console.log('   Safe to use tree-sitter for all file types');
  }
  
  const highAccuracyFiles = results.filter(r => r.accuracyImprovement > 50);
  if (highAccuracyFiles.length > 0) {
    console.log(`\n🎉 HIGH ACCURACY GAINS (>50% improvement):`);
    highAccuracyFiles.forEach(f => {
      console.log(`   ${f.name}: +${f.accuracyImprovement.toFixed(1)}% (${f.treeFunctions} vs ${f.regexFunctions} functions)`);
    });
  }
  
  // Performance targets from roadmap
  console.log('\n📋 ROADMAP PERFORMANCE TARGETS:');
  console.log('   Target: <15ms for complex files');
  console.log('   Target: 95%+ accuracy improvement');
  console.log('   Target: 95%+ reliability');
  
  const complexFiles = results.filter(r => r.complexity === 'high');
  const avgComplexTime = complexFiles.length > 0 ? 
    complexFiles.reduce((sum, f) => sum + f.treeTime, 0) / complexFiles.length : 0;
  
  console.log(`\n📊 ACTUAL PERFORMANCE:`);
  console.log(`   Complex files avg time: ${avgComplexTime.toFixed(2)}ms ${avgComplexTime < 15 ? '✅' : '❌'}`);
  console.log(`   Overall accuracy: ${results.some(r => r.accuracyImprovement > 95) ? '✅' : '⚠️'}`);
  console.log(`   Reliability: ${totalFiles > 0 && results.length === totalFiles ? '✅ 100%' : '❌'}`);
}

benchmarkParsing().catch(console.error);
