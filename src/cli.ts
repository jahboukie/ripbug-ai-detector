#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { readFileSync } from 'fs';
import { join } from 'path';
import { validateCommand } from './commands/validate';
import { initCommand } from './commands/init';
import { authCommand } from './commands/auth';
import { upgradeCommand } from './commands/upgrade';

// Read version from package.json
const packageJson = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf8'));
const version = packageJson.version;

const program = new Command();

// ASCII Art Banner
const banner = `
🔥 ${chalk.bold.red('RipBug AI Bug Detector')}
   ${chalk.gray('Rip AI-generated bugs before you commit')}
`;

program
  .name('ripbug')
  .description('AI Bug Detector - Built by an AI that rips its own bugs')
  .version(version)
  .addHelpText('beforeAll', banner);

// Main validate command
program
  .command('validate')
  .description('Analyze staged files for AI-generated bugs')
  .option('-f, --format <type>', 'output format (console|json)', 'console')
  .option('--files <files...>', 'specific files to validate')
  .option('--all', 'validate all files (not just staged)')
  .option('--tree-sitter-mode', 'force tree-sitter parsing mode')
  .option('--compare-methods', 'compare tree-sitter vs regex methods')
  .option('--experimental', 'enable experimental features')
  .option('--report-differences', 'report differences between parsing methods')
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
