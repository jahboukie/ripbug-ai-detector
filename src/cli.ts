#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { validateCommand } from './commands/validate';
import { initCommand } from './commands/init';
import { authCommand } from './commands/auth';
import { upgradeCommand } from './commands/upgrade';

const program = new Command();

// ASCII Art Banner
const banner = `
🌊 ${chalk.bold.blue('Ripple AI Bug Detector')}
   ${chalk.gray('Catch AI-generated bugs before you commit')}
`;

program
  .name('ripple')
  .description('AI Bug Detector - Built by an AI that knows its flaws')
  .version('1.0.0')
  .addHelpText('beforeAll', banner);

// Main validate command
program
  .command('validate')
  .description('Analyze staged files for AI-generated bugs')
  .option('-f, --format <type>', 'output format (console|json)', 'console')
  .option('--files <files...>', 'specific files to validate')
  .option('--all', 'validate all files (not just staged)')
  .action(validateCommand);

// Initialize project
program
  .command('init')
  .description('Initialize Ripple in current project')
  .action(initCommand);

// Authentication commands
program
  .command('auth')
  .description('Manage authentication')
  .addCommand(
    new Command('login')
      .description('Login with license key')
      .argument('<key>', 'license key')
      .action(authCommand.login)
  )
  .addCommand(
    new Command('status')
      .description('Check authentication status')
      .action(authCommand.status)
  )
  .addCommand(
    new Command('logout')
      .description('Logout and clear credentials')
      .action(authCommand.logout)
  );

// Upgrade command
program
  .command('upgrade')
  .description('Upgrade to Pro plan')
  .action(upgradeCommand);

// Handle unknown commands
program.on('command:*', () => {
  console.error(chalk.red(`Unknown command: ${program.args.join(' ')}`));
  console.log(chalk.gray('Run "ripple --help" for available commands'));
  process.exit(1);
});

// Parse arguments
program.parse();

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
