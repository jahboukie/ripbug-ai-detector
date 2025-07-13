import { logger } from '../utils/logger';
import { AuthManager } from '../auth/auth-manager';
import { UsageTracker } from '../usage/usage-tracker';

export async function upgradeCommand(): Promise<void> {
  try {
    logger.header();
    
    // Get current status
    const authManager = new AuthManager();
    const usageTracker = new UsageTracker();
    
    const status = await authManager.getStatus();
    const usage = await usageTracker.getUsage();

    // Show current plan
    if (status.authenticated && status.user) {
      logger.info(`Current plan: ${status.user.plan}`);
      logger.usageStatus(usage.current, usage.limit);
      logger.newLine();
    }

    // Show upgrade benefits
    logger.info('🚀 RipBug Pro Benefits:');
    logger.info('  ✓ 1,000 AI bug validations per month');
    logger.info('  ✓ Priority email support');
    logger.info('  ✓ Early access to new features');
    logger.newLine();

    // Show pricing
    logger.money('💰 Pricing: $49/month');
    logger.info('  • Less than $1.60 per day');
    logger.info('  • Pays for itself with one prevented bug');
    logger.info('  • Cancel anytime');
    logger.newLine();

    // Show value proposition
    if (usage.current > 0) {
      const hoursPerBug = 2; // Average debugging time
      const hoursSaved = usage.current * hoursPerBug;
      const hourlyRate = 75; // Average developer hourly rate
      const valueSaved = hoursSaved * hourlyRate;

      logger.money(`This month you've saved ~${hoursSaved} hours of debugging`);
      logger.money(`That's worth ~$${valueSaved} of your time!`);
      logger.newLine();
    }

    // Upgrade instructions
    logger.upgrade('Ready to upgrade?');
    
    if (status.authenticated && status.licenseKey) {
      const upgradeUrl = `https://ripbug.dev/pro?key=${status.licenseKey}`;
      logger.info(`Visit: ${upgradeUrl}`);
    } else {
      logger.info('Visit: https://ripbug.dev/pro');
    }

    logger.newLine();
    logger.tip('Questions? Email us at: support@ripbug.dev');

  } catch (error) {
    logger.error(`Upgrade command failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
}
