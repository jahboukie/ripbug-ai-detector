import chalk from 'chalk';
import ora, { Ora } from 'ora';

export class Logger {
  private spinner: Ora | null = null;

  // Success messages
  success(message: string): void {
    console.log(chalk.green('✓'), message);
  }

  // Error messages
  error(message: string): void {
    console.log(chalk.red('❌'), message);
  }

  // Warning messages
  warning(message: string): void {
    console.log(chalk.yellow('⚠️'), message);
  }

  // Info messages
  info(message: string): void {
    console.log(chalk.blue('ℹ️'), message);
  }

  // AI-specific messages
  aiDetected(message: string, confidence: number): void {
    const confidenceColor = confidence > 80 ? 'red' : confidence > 60 ? 'yellow' : 'blue';
    console.log(
      chalk.magenta('🤖'),
      message,
      chalk[confidenceColor](`(${confidence}% confidence)`)
    );
  }

  // Bug detection
  bugFound(message: string): void {
    console.log(chalk.red('💥'), message);
  }

  // Tips and suggestions
  tip(message: string): void {
    console.log(chalk.cyan('💡'), message);
  }

  // Upgrade prompts
  upgrade(message: string): void {
    console.log(chalk.green('🚀'), message);
  }

  // Money/pricing messages
  money(message: string): void {
    console.log(chalk.green('💰'), message);
  }

  // Spinner for loading
  startSpinner(message: string): void {
    this.spinner = ora(message).start();
  }

  updateSpinner(message: string): void {
    if (this.spinner) {
      this.spinner.text = message;
    }
  }

  stopSpinner(success: boolean = true, message?: string): void {
    if (this.spinner) {
      if (success) {
        this.spinner.succeed(message);
      } else {
        this.spinner.fail(message);
      }
      this.spinner = null;
    }
  }

  // Usage tracking display
  usageStatus(current: number, limit: number): void {
    const percentage = (current / limit) * 100;
    const color = percentage >= 100 ? 'red' : percentage >= 80 ? 'yellow' : 'green';
    
    console.log(
      chalk.gray(`Validation ${current}/${limit} this month`),
      '•',
      chalk[color](`${percentage.toFixed(0)}% used`)
    );
  }

  // Separator line
  separator(): void {
    console.log(chalk.gray('─'.repeat(50)));
  }

  // Empty line
  newLine(): void {
    console.log();
  }

  // Header with banner
  header(): void {
    console.log();
    console.log(chalk.red('🔥 ') + chalk.bold.red('RipBug AI Bug Detector'));
    console.log(chalk.gray('   Rip AI-generated bugs before you commit'));
    console.log();
  }
}

// Export singleton instance
export const logger = new Logger();
