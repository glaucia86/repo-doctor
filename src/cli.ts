#!/usr/bin/env node

/**
 * Repo Doctor CLI v2.0
 * AI-Powered GitHub Repository Health Analyzer
 * 
 * This is the main entry point that sets up Commander and delegates
 * to the modular components in src/cli/
 */

// Ensure UTF-8 encoding for emojis on Windows
if (process.platform === "win32") {
  process.stdout.setDefaultEncoding?.("utf8");
  process.stderr.setDefaultEncoding?.("utf8");
}

import { Command } from "commander";
import {
  clearScreen,
  printHeader,
  printHelp,
  printError,
  printSuccess,
  printWarning,
  printRepo,
  printModel,
  c,
  ICON,
} from "./ui/index.js";
import { analyzeRepositoryWithCopilot } from "./core/agent.js";
import { publishReport } from "./core/publish/index.js";

// Import from refactored modules
import {
  appState,
  findModel,
  parseRepoRef,
  type AnalyzeOptions,
} from "./cli/index.js";
import { runChatMode } from "./cli/chatLoop.js";

// ════════════════════════════════════════════════════════════════════════════
// DEFAULT OPTIONS
// ════════════════════════════════════════════════════════════════════════════

const defaultOptions: AnalyzeOptions = {
  maxFiles: 800,
  maxBytes: 204800,
  timeout: 120000,
  verbosity: "normal",
  format: "pretty",
  issue: false,
};

// ════════════════════════════════════════════════════════════════════════════
// DIRECT ANALYZE MODE
// ════════════════════════════════════════════════════════════════════════════

async function runDirectAnalyze(
  repoRef: string,
  options: AnalyzeOptions
): Promise<void> {
  const isJson = options.format === "json";
  
  // Show header (skip for JSON output)
  if (!isJson) {
    clearScreen();
    await printHeader();
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
    printModel(appState.currentModel, appState.isPremium);
    if (options.deep) {
      console.log("  " + c.warning("Mode: Deep Analysis (Repomix)"));
    }
    console.log();
  }

  // Run analysis
  try {
    const repoUrl = `https://github.com/${owner}/${repo}`;
    const result = await analyzeRepositoryWithCopilot({ 
      repoUrl,
      token: options.token,
      model: appState.currentModel,
      maxFiles: options.maxFiles,
      maxBytes: options.maxBytes,
      timeout: options.deep ? 300000 : options.timeout,
      verbosity: options.verbosity,
      format: options.format,
      deep: options.deep,
    });

    const target = options.issue ? "issue" : undefined;

    if (target) {
      const publishResult = await publishReport({
        target,
        repo: {
          owner,
          name: repo,
          fullName: `${owner}/${repo}`,
          url: repoUrl,
        },
        analysisContent: result.content,
        token: options.token,
      });

      if (!isJson) {
        if (publishResult?.ok) {
          if (publishResult.targetUrls && publishResult.targetUrls.length > 0) {
            printSuccess(`Report published: ${publishResult.targetUrls.length} issues created.`);
            publishResult.targetUrls.forEach((url: string) => {
              console.log(c.dim(`  ${url}`));
            });
          } else {
            printSuccess(
              publishResult.targetUrl
                ? `Report published: ${publishResult.targetUrl}`
                : "Report published successfully."
            );
          }
        } else if (publishResult?.error) {
          printWarning(`Publish skipped: ${publishResult.error.message}`);
        }
      }
    }
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

const program = new Command();

program
  .name("repo-doctor")
  .description(
    `${ICON.doctor} AI-Powered GitHub Repository Health Analyzer`
  )
  .version("2.0.0");

// Interactive chat mode (default)
program
  .command("chat", { isDefault: true })
  .description("Start interactive chat mode")
  .argument("[repoRef]", "Optional repository URL or slug to analyze immediately")
  .option("--token <TOKEN>", "GitHub token for private repositories")
  .option("--model <name>", "AI model to use", "claude-sonnet-4")
  .action(async (repoRef: string | undefined, opts) => {
    // Set model if provided
    if (opts.model) {
      const model = findModel(opts.model);
      if (model) {
        appState.setModel(model.id, model.premium);
      }
    }

    const options: AnalyzeOptions = {
      ...defaultOptions,
      token: opts.token || process.env.GITHUB_TOKEN,
    };
    await runChatMode(options, repoRef);
  });

// Direct analyze command
program
  .command("analyze")
  .description("Analyze a GitHub repository directly")
  .argument("<repoRef>", "Repository URL, SSH, or owner/repo slug")
  .option("--token <TOKEN>", "GitHub token for private repositories")
  .option("--issue", "Publish report as a GitHub issue", false)
  .option("--max-files <N>", "Maximum files to list", "800")
  .option("--max-bytes <N>", "Maximum bytes per file", "204800")
  .option("--timeout <ms>", "Analysis timeout in milliseconds", "120000")
  .option("--verbosity <level>", "Output verbosity (silent|normal|verbose)", "normal")
  .option("--format <type>", "Output format (pretty|json|minimal)", "pretty")
  .option("--model <name>", "AI model to use", "claude-sonnet-4")
  .option("--deep", "Enable deep analysis with full source code review", false)
  .option("--export", "Export report to markdown after analysis", false)
  .action(async (repoRef: string, opts) => {
    // Set model from CLI option
    if (opts.model) {
      const model = findModel(opts.model);
      if (model) {
        appState.setModel(model.id, model.premium);
      }
    }
    
    const options: AnalyzeOptions = {
      token: opts.token || process.env.GITHUB_TOKEN,
      maxFiles: parseInt(opts.maxFiles, 10),
      maxBytes: parseInt(opts.maxBytes, 10),
      timeout: parseInt(opts.timeout, 10),
      verbosity: opts.verbosity as AnalyzeOptions["verbosity"],
      format: opts.format as AnalyzeOptions["format"],
      deep: opts.deep || false,
      issue: opts.issue || false,
    };
    await runDirectAnalyze(repoRef, options);
  });

// Help command with custom formatting
program
  .command("help")
  .description("Show detailed help")
  .action(async () => {
    clearScreen();
    await printHeader(true, false); // compact and no animation
    printHelp();
  });

// Parse and run
program.parse();
