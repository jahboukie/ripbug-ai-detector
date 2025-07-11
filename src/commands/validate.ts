import { logger } from '../utils/logger';
import { configManager } from '../config/config';
import { GitManager } from '../git/git-manager';
import { RippleAnalyzer } from '../analysis/analyzer';
import { UsageTracker } from '../usage/usage-tracker';
import { OutputFormatter } from '../output/formatter';

interface ValidateOptions {
  format: 'console' | 'json';
  files?: string[];
  all?: boolean;
  treeSitterMode?: boolean;
  compareMethods?: boolean;
  experimental?: boolean;
  reportDifferences?: boolean;
}

export async function validateCommand(options: ValidateOptions): Promise<void> {
  try {
    // Load configuration
    await configManager.loadConfig();
    const config = configManager.getConfig();

    // Check usage limits
    const usageTracker = new UsageTracker();
    const canValidate = await usageTracker.canValidate();
    
    if (!canValidate) {
      const usage = await usageTracker.getUsage();
      logger.error(`Monthly validation limit reached (${usage.current}/${usage.limit})`);
      logger.money('You\'ve saved hours of debugging this month!');
      logger.upgrade('Upgrade to Pro for unlimited validations: $49/month');
      logger.tip('Visit: https://ripple.dev/upgrade');
      process.exit(1);
    }

    // Show header
    if (options.format === 'console') {
      logger.header();
    }

    // Determine files to analyze
    let filesToAnalyze: string[] = [];
    
    if (options.files) {
      filesToAnalyze = options.files;
    } else if (options.all) {
      // Analyze all files in project
      const gitManager = new GitManager();
      filesToAnalyze = await gitManager.getAllJSFiles();
    } else {
      // Default: analyze staged files
      const gitManager = new GitManager();
      filesToAnalyze = await gitManager.getStagedFiles();
      
      if (filesToAnalyze.length === 0) {
        logger.warning('No staged files found');
        logger.tip('Stage some files with "git add" or use --all to analyze entire project');
        return;
      }
    }

    // Filter for supported files
    filesToAnalyze = filesToAnalyze.filter(file => 
      file.endsWith('.js') || file.endsWith('.jsx') || 
      file.endsWith('.ts') || file.endsWith('.tsx')
    );

    if (filesToAnalyze.length === 0) {
      logger.warning('No JavaScript/TypeScript files to analyze');
      return;
    }

    // Start analysis
    logger.startSpinner(`Analyzing ${filesToAnalyze.length} files...`);

    const analyzer = new RippleAnalyzer(config);
    const results = await analyzer.analyze(filesToAnalyze);

    logger.stopSpinner(true, `Analysis complete`);

    // Track usage
    await usageTracker.trackValidation(filesToAnalyze.length, results.aiGenerated);

    // Format and display results
    const formatter = new OutputFormatter(options.format);
    await formatter.displayResults(results);

    // Show usage status
    if (options.format === 'console') {
      const usage = await usageTracker.getUsage();
      logger.newLine();
      logger.usageStatus(usage.current, usage.limit);
      
      // Show upgrade prompt if getting close to limit
      if (usage.current >= usage.limit * 0.8) {
        logger.upgrade('Upgrade to Pro for unlimited validations: ripple.dev/pro');
      }
    }

    // Exit with error code if issues found
    if (results.issues.some(issue => issue.severity === 'error')) {
      process.exit(1);
    }

  } catch (error) {
    logger.stopSpinner(false, 'Analysis failed');
    logger.error(`Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
}
