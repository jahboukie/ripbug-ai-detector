import { logger } from '../utils/logger';
import { AuthManager } from '../auth/auth-manager';

export const authCommand = {
  async login(licenseKey: string): Promise<void> {
    try {
      logger.header();
      logger.startSpinner('Validating license key...');

      const authManager = new AuthManager();
      const result = await authManager.login(licenseKey);

      logger.stopSpinner(true, 'License validated successfully');
      
      logger.success(`Welcome, ${result.user.email}!`);
      logger.info(`Plan: ${result.user.plan}`);
      logger.info(`Validations: ${result.limits.currentUsage}/${result.limits.validationsPerMonth}`);
      
      if (result.user.plan === 'free') {
        logger.tip('Upgrade to Pro for unlimited validations: ripple.dev/pro');
      }

    } catch (error) {
      logger.stopSpinner(false, 'License validation failed');
      logger.error(`Authentication failed: ${error instanceof Error ? error.message : 'Invalid license key'}`);
      logger.tip('Get a license key at: ripple.dev/pricing');
      process.exit(1);
    }
  },

  async status(): Promise<void> {
    try {
      const authManager = new AuthManager();
      const status = await authManager.getStatus();

      logger.header();

      if (status.authenticated) {
        logger.success('Authenticated');
        logger.info(`Email: ${status.user?.email}`);
        logger.info(`Plan: ${status.user?.plan}`);
        logger.info(`License: ${status.licenseKey?.substring(0, 8)}...`);
        
        if (status.usage) {
          logger.usageStatus(status.usage.current, status.usage.limit);
        }

        if (status.user?.plan === 'free') {
          logger.tip('Upgrade to Pro: ripple.dev/pro');
        }
      } else {
        logger.warning('Not authenticated');
        logger.tip('Login with: ripple auth login <license-key>');
        logger.tip('Get a license: ripple.dev/pricing');
      }

    } catch (error) {
      logger.error(`Status check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      process.exit(1);
    }
  },

  async logout(): Promise<void> {
    try {
      const authManager = new AuthManager();
      await authManager.logout();

      logger.success('Logged out successfully');
      logger.info('Your local credentials have been cleared');
      logger.tip('Login again with: ripple auth login <license-key>');

    } catch (error) {
      logger.error(`Logout failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      process.exit(1);
    }
  }
};
