import { AnalysisResult, Issue } from '../types/analysis';
import { logger } from '../utils/logger';
import chalk from 'chalk';
import path from 'path';

export class OutputFormatter {
  private format: 'console' | 'json';

  constructor(format: 'console' | 'json' = 'console') {
    this.format = format;
  }

  // Main method to display results
  async displayResults(results: AnalysisResult): Promise<void> {
    if (this.format === 'json') {
      this.displayJSON(results);
    } else {
      this.displayConsole(results);
    }
  }

  // Display results in beautiful console format
  private displayConsole(results: AnalysisResult): void {
    // AI Detection Header
    if (results.aiGenerated) {
      logger.newLine();
      logger.aiDetected(
        'AI-generated changes detected',
        Math.round(results.confidence * 100)
      );
      logger.newLine();
    }

    // Display issues
    if (results.issues.length > 0) {
      this.displayIssues(results.issues);
    } else {
      logger.success('No issues detected');
      if (!results.aiGenerated) {
        logger.info('AI Detection: Low confidence - likely human-written code');
      }
    }

    // Display summary
    this.displaySummary(results);

    // Display recommendations
    this.displayRecommendations(results);
  }

  // Display issues in console
  private displayIssues(issues: Issue[]): void {
    logger.info('Issues found:');
    logger.newLine();

    const errors = issues.filter(i => i.severity === 'error');
    const warnings = issues.filter(i => i.severity === 'warning');

    // Display errors first
    for (const issue of errors) {
      this.displayIssue(issue);
      logger.newLine();
    }

    // Then warnings
    for (const issue of warnings) {
      this.displayIssue(issue);
      logger.newLine();
    }
  }

  // Display individual issue
  private displayIssue(issue: Issue): void {
    const icon = issue.severity === 'error' ? '❌' : '⚠️';
    const color = issue.severity === 'error' ? 'red' : 'yellow';
    
    // Main issue message
    console.log(chalk[color](`${icon} ${issue.message}`));
    
    // File location
    const relativePath = path.relative(process.cwd(), issue.file);
    const location = issue.line ? `${relativePath}:${issue.line}` : relativePath;
    console.log(chalk.gray(`   File: ${location}`));

    // Issue-specific details
    this.displayIssueDetails(issue);

    // Affected files (for function signature changes)
    if (issue.details.affectedFiles && issue.details.affectedFiles.length > 0) {
      console.log(chalk.red('   💥 This will break:'));
      for (const affected of issue.details.affectedFiles) {
        const affectedPath = path.relative(process.cwd(), affected.path);
        console.log(chalk.red(`   - ${affectedPath}:${affected.line}`));
      }
    }

    // Suggestions
    if (issue.suggestions && issue.suggestions.length > 0) {
      console.log(chalk.cyan('   💡 Suggestions:'));
      for (const suggestion of issue.suggestions) {
        console.log(chalk.cyan(`   • ${suggestion}`));
      }
    }

    // Confidence score
    if (issue.confidence > 0) {
      const confidencePercent = Math.round(issue.confidence * 100);
      const confidenceColor = issue.confidence > 0.8 ? 'green' : issue.confidence > 0.6 ? 'yellow' : 'red';
      console.log(chalk[confidenceColor](`   Confidence: ${confidencePercent}%`));
    }
  }

  // Display issue-specific details
  private displayIssueDetails(issue: Issue): void {
    switch (issue.type) {
      case 'function-signature-change':
        if (issue.details.oldSignature && issue.details.newSignature) {
          console.log(chalk.gray(`   Function: ${issue.details.oldSignature} → ${issue.details.newSignature}`));
        }
        break;

      case 'import-export-mismatch':
        if (issue.details.importName && issue.details.exportName) {
          console.log(chalk.gray(`   Import: '${issue.details.importName}' not found`));
          if (issue.details.availableExports) {
            console.log(chalk.gray(`   Available: ${issue.details.availableExports.join(', ')}`));
          }
        }
        break;

      case 'ai-pattern-detected':
        if (issue.details.aiPatterns) {
          console.log(chalk.magenta(`   🤖 AI Patterns: ${issue.details.aiPatterns.join(', ')}`));
        }
        break;
    }
  }

  // Display summary
  private displaySummary(results: AnalysisResult): void {
    logger.newLine();
    logger.separator();
    
    const { errors, warnings, filesAnalyzed, timeMs } = results.summary;
    
    // Summary line
    const summaryParts: string[] = [];
    if (errors > 0) summaryParts.push(chalk.red(`${errors} error${errors !== 1 ? 's' : ''}`));
    if (warnings > 0) summaryParts.push(chalk.yellow(`${warnings} warning${warnings !== 1 ? 's' : ''}`));
    
    if (summaryParts.length > 0) {
      console.log(`Summary: ${summaryParts.join(', ')}`);
    } else {
      logger.success('Summary: No issues found');
    }

    // Analysis details
    console.log(chalk.gray(`Files analyzed: ${filesAnalyzed}`));
    console.log(chalk.gray(`Analysis time: ${timeMs}ms`));
    
    if (results.confidence > 0) {
      const confidencePercent = Math.round(results.confidence * 100);
      console.log(chalk.gray(`Confidence: ${confidencePercent}% this analysis is accurate`));
    }
  }

  // Display recommendations
  private displayRecommendations(results: AnalysisResult): void {
    logger.newLine();

    if (results.aiGenerated) {
      logger.tip('Recommendation: Review AI-generated changes carefully before committing');
    }

    if (results.issues.some(i => i.severity === 'error')) {
      logger.error('❌ Not safe to commit - fix errors first');
    } else if (results.issues.some(i => i.severity === 'warning')) {
      logger.warning('⚠️  Safe to commit, but consider fixing warnings');
    } else {
      logger.success('✅ Safe to commit');
    }
  }

  // Display results in JSON format
  private displayJSON(results: AnalysisResult): void {
    const jsonOutput = {
      success: results.success,
      confidence: results.confidence,
      aiGenerated: results.aiGenerated,
      summary: results.summary,
      issues: results.issues.map(issue => ({
        id: issue.id,
        type: issue.type,
        severity: issue.severity,
        message: issue.message,
        file: issue.file,
        line: issue.line,
        column: issue.column,
        details: issue.details,
        suggestions: issue.suggestions,
        confidence: issue.confidence
      })),
      metadata: results.metadata
    };

    console.log(JSON.stringify(jsonOutput, null, 2));
  }

  // Create upgrade prompt message
  static createUpgradePrompt(current: number, limit: number): string {
    const remaining = limit - current;
    
    if (remaining <= 0) {
      return '🚀 Upgrade to Pro for unlimited validations: ripple.dev/pro';
    }
    
    if (remaining <= 2) {
      return `⚠️  Only ${remaining} validations left this month. Upgrade: ripple.dev/pro`;
    }
    
    return `💡 ${remaining} validations remaining. Get unlimited: ripple.dev/pro`;
  }

  // Create value proposition message
  static createValueMessage(validationsUsed: number): string {
    const hoursPerBug = 2;
    const hoursSaved = validationsUsed * hoursPerBug;
    const hourlyRate = 75;
    const valueSaved = hoursSaved * hourlyRate;

    return `💰 This month: ${validationsUsed} validations = ~${hoursSaved} hours saved = ~$${valueSaved} value!`;
  }
}
