#!/usr/bin/env bun
/**
 * CLI entry point for memorize-mcp
 * Usage: npx memorize-mcp [command]
 */

import { pullCommand } from "./commands/pull.js";

const VERSION = "1.3.1";

// ANSI colors
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
};

function printBanner() {
  console.log(`
${colors.cyan}${colors.bright}╔════════════════════════════════════════════════════╗
║              MEMORIZE-MCP v${VERSION}                   ║
║       AI Memory & Workflow Management System        ║
╚════════════════════════════════════════════════════╝${colors.reset}
`);
}

function printHelp() {
  console.log(`${colors.bright}Usage:${colors.reset}
  npx memorize-mcp [command] [options]

${colors.bright}Commands:${colors.reset}
  ${colors.green}pull${colors.reset}              Pull resources to your project
  ${colors.green}pull --all${colors.reset}        Pull all resources (prompts + all skills)
  ${colors.green}pull --prompts${colors.reset}    Pull prompts only (default, includes /save-memory)
  ${colors.green}help${colors.reset}              Show this help message
  ${colors.green}version${colors.reset}           Show version

${colors.bright}Skills Options:${colors.reset}
  ${colors.yellow}--skills --all${colors.reset}    Pull all skills
  ${colors.yellow}--skills --basic${colors.reset}  Pull basic skills (brainstorming, executing-plans, writing-plan)
  ${colors.yellow}--skills --frontend${colors.reset} Pull frontend skills (react-best-practices, web-design-guidelines)

${colors.bright}Other Options:${colors.reset}
  ${colors.yellow}--target, -t${colors.reset}      Target directory (default: current directory)
  ${colors.yellow}--overwrite${colors.reset}       Overwrite existing files

${colors.bright}Examples:${colors.reset}
  ${colors.dim}# Pull default resources (prompts with /save-memory)${colors.reset}
  npx memorize-mcp pull

  ${colors.dim}# Pull all resources to specific directory${colors.reset}
  npx memorize-mcp pull --all --target ./my-project

  ${colors.dim}# Pull basic skills only${colors.reset}
  npx memorize-mcp pull --skills --basic

  ${colors.dim}# Pull frontend skills with overwrite${colors.reset}
  npx memorize-mcp pull --skills --frontend --overwrite

  ${colors.dim}# Pull all skills${colors.reset}
  npx memorize-mcp pull --skills --all

${colors.bright}Resources:${colors.reset}
  📁 ${colors.cyan}.github/prompts/${colors.reset}  - AI agent prompts (e.g., /save-memory)
  📁 ${colors.cyan}.skills/${colors.reset}          - Reusable AI agent skills
     ├─ ${colors.magenta}basic:${colors.reset} brainstorming, executing-plans, writing-plan
     └─ ${colors.magenta}frontend:${colors.reset} react-best-practices, web-design-guidelines
`);
}

function printVersion() {
  console.log(`memorize-mcp v${VERSION}`);
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0]?.toLowerCase();

  // No command - show banner and help
  if (!command) {
    printBanner();
    printHelp();
    return;
  }

  switch (command) {
    case "help":
    case "--help":
    case "-h":
      printBanner();
      printHelp();
      break;

    case "version":
    case "--version":
    case "-v":
      printVersion();
      break;

    case "pull":
      await pullCommand(args.slice(1));
      break;

    default:
      console.error(
        `${colors.yellow}Unknown command: ${command}${colors.reset}`,
      );
      console.log(`Run 'npx memorize-mcp help' for usage information.`);
      process.exit(1);
  }
}

main().catch((error) => {
  console.error(`Error: ${error.message}`);
  process.exit(1);
});
