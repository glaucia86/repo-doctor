#!/usr/bin/env node

/**
 * Repo Doctor CLI v1.0
 * AI-Powered GitHub Repository Health Analyzer
 *
 * Uses GitHub Copilot SDK for intelligent repository analysis
 */

import { Command } from "commander";
import {
  clearScreen,
  printHeader,
  printRepo,
  printModel,
  printHelp,
  printSuccess,
  printError,
  printWarning,
  printGoodbye,
  startSpinner,
  spinnerSuccess,
  spinnerFail,
  c,
  ICON,
} from "./ui/index.js";
import { analyzeRepositoryWithCopilot } from "./core/agent.js";

const program = new Command();

// ════════════════════════════════════════════════════════════════════════════
// REPO URL PARSING
// ════════════════════════════════════════════════════════════════════════════

interface ParsedRepo {
  owner: string;
  repo: string;
}

/**
 * Parse repository reference (URL, SSH, or slug)
 */
function parseRepoRef(repoRef: string): ParsedRepo | null {
  // HTTPS URL: https://github.com/owner/repo
  const httpsMatch = repoRef.match(
    /(?:https?:\/\/)?github\.com\/([^\/]+)\/([^\/\s]+)/
  );
  if (httpsMatch) {
    return {
      owner: httpsMatch[1]!,
      repo: httpsMatch[2]!.replace(/\.git$/, ""),
    };
  }

  // SSH URL: git@github.com:owner/repo.git
  const sshMatch = repoRef.match(/git@github\.com:([^\/]+)\/([^\/\s]+)/);
  if (sshMatch) {
    return {
      owner: sshMatch[1]!,
      repo: sshMatch[2]!.replace(/\.git$/, ""),
    };
  }

  // Slug: owner/repo
  const slugMatch = repoRef.match(/^([^\/]+)\/([^\/\s]+)$/);
  if (slugMatch) {
    return {
      owner: slugMatch[1]!,
      repo: slugMatch[2]!,
    };
  }

  return null;
}

// ════════════════════════════════════════════════════════════════════════════
// OPTIONS
// ════════════════════════════════════════════════════════════════════════════

interface AnalyzeOptions {
  token?: string;
  maxFiles: number;
  maxBytes: number;
  timeout: number;
  verbosity: "silent" | "normal" | "verbose";
  format: "pretty" | "json" | "minimal";
}

// ════════════════════════════════════════════════════════════════════════════
// MAIN FLOW
// ════════════════════════════════════════════════════════════════════════════

async function runAnalyze(
  repoRef: string,
  options: AnalyzeOptions
): Promise<void> {
  const isJson = options.format === "json";
  
  // Show header (skip for JSON output)
  if (!isJson) {
    clearScreen();
    printHeader();
  }

  // Parse repository reference
  const parsed = parseRepoRef(repoRef);
  if (!parsed) {
    if (isJson) {
      console.log(JSON.stringify({ error: "Invalid repository reference", repoRef }));
    } else {
      printError("Invalid repository reference.");
      console.log(c.dim("  Expected formats:"));
      console.log(c.dim("    • https://github.com/owner/repo"));
      console.log(c.dim("    • git@github.com:owner/repo.git"));
      console.log(c.dim("    • owner/repo"));
    }
    process.exit(1);
  }

  const { owner, repo } = parsed;

  // Display analysis info (skip for JSON output)
  if (!isJson) {
    printRepo(owner, repo);
    printModel("claude-sonnet-4.5", false);
    console.log();
  }

  // Run analysis
  try {
    const repoUrl = `https://github.com/${owner}/${repo}`;
    await analyzeRepositoryWithCopilot({ 
      repoUrl,
      token: options.token,
      maxFiles: options.maxFiles,
      maxBytes: options.maxBytes,
      timeout: options.timeout,
      verbosity: options.verbosity,
      format: options.format,
    });
  } catch (error) {
    if (isJson) {
      console.log(JSON.stringify({ 
        error: error instanceof Error ? error.message : "Analysis failed",
        repoRef 
      }));
    } else {
      printError(
        error instanceof Error ? error.message : "Analysis failed"
      );
    }
    process.exit(1);
  }
}

// ════════════════════════════════════════════════════════════════════════════
// CLI SETUP
// ════════════════════════════════════════════════════════════════════════════

program
  .name("repo-doctor")
  .description(
    `${ICON.doctor} AI-Powered GitHub Repository Health Analyzer`
  )
  .version("1.0.0");

program
  .command("analyze")
  .description("Analyze a GitHub repository for health issues")
  .argument("<repoRef>", "Repository URL, SSH, or owner/repo slug")
  .option(
    "--token <TOKEN>",
    "GitHub token for private repositories"
  )
  .option(
    "--max-files <N>",
    "Maximum files to list",
    "800"
  )
  .option(
    "--max-bytes <N>",
    "Maximum bytes per file",
    "204800"
  )
  .option(
    "--timeout <ms>",
    "Analysis timeout in milliseconds",
    "120000"
  )
  .option(
    "--verbosity <level>",
    "Output verbosity (silent|normal|verbose)",
    "normal"
  )
  .option(
    "--format <type>",
    "Output format (pretty|json|minimal)",
    "pretty"
  )
  .action(async (repoRef: string, opts) => {
    const options: AnalyzeOptions = {
      token: opts.token || process.env.GITHUB_TOKEN,
      maxFiles: parseInt(opts.maxFiles, 10),
      maxBytes: parseInt(opts.maxBytes, 10),
      timeout: parseInt(opts.timeout, 10),
      verbosity: opts.verbosity as AnalyzeOptions["verbosity"],
      format: opts.format as AnalyzeOptions["format"],
    };
    await runAnalyze(repoRef, options);
  });

// Help command with custom formatting
program
  .command("help")
  .description("Show detailed help")
  .action(() => {
    clearScreen();
    printHeader(true);
    printHelp();
  });

// Handle no command - show help
program.action(() => {
  clearScreen();
  printHeader();
  printHelp();
});

// Parse and run
program.parse();

