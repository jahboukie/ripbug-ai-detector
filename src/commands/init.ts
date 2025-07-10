import { logger } from '../utils/logger';
import { configManager } from '../config/config';
import { FileUtils } from '../utils/file-utils';
import path from 'path';

export async function initCommand(): Promise<void> {
  try {
    logger.header();
    logger.info('Initializing Ripple in current project...');

    const cwd = process.cwd();
    
    // Check if config already exists
    const hasConfig = await configManager.hasConfigFile(cwd);
    if (hasConfig) {
      logger.warning('Ripple configuration already exists in this project');
      logger.tip('Edit .ripple.config.js to customize settings');
      return;
    }

    // Create default configuration
    const configPath = await configManager.createDefaultConfig(cwd);
    logger.success(`Created configuration file: ${path.relative(cwd, configPath)}`);

    // Check if this is a git repository
    const gitDir = path.join(cwd, '.git');
    const isGitRepo = await FileUtils.isDirectory(gitDir);
    
    if (isGitRepo) {
      logger.success('Git repository detected');
      logger.tip('Run "ripple validate" to analyze staged files');
      logger.tip('Or run "ripple validate --all" to analyze entire project');
    } else {
      logger.warning('Not a git repository');
      logger.tip('Initialize git with "git init" for best experience');
      logger.tip('Or use "ripple validate --all" to analyze all files');
    }

    // Show next steps
    logger.newLine();
    logger.info('🎉 Ripple is ready to catch AI bugs!');
    logger.newLine();
    logger.info('Next steps:');
    logger.info('  1. Make some code changes');
    logger.info('  2. Stage files with "git add"');
    logger.info('  3. Run "ripple validate"');
    logger.info('  4. Fix any issues found');
    logger.info('  5. Commit with confidence!');
    logger.newLine();
    logger.tip('Get unlimited validations: ripple.dev/pro');

  } catch (error) {
    logger.error(`Initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
}
