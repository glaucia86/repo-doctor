/**
 * Analyze Handler
 * Single Responsibility: Handle /analyze and /deep commands
 */

import { analyzeRepositoryWithCopilot } from "../../core/agent.js";
import { isRepomixAvailable } from "../../core/repoPacker.js";
import { parseRepoRef, buildRepoUrl, buildRepoSlug } from "../parsers/repoParser.js";
import { appState } from "../state/appState.js";
import {
  printRepo,
  printModel,
  printError,
  printWarning,
  c,
} from "../../ui/index.js";

// ════════════════════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════════════════════

export interface AnalyzeOptions {
  token?: string;
  maxFiles: number;
  maxBytes: number;
  timeout: number;
  verbosity: "silent" | "normal" | "verbose";
  format: "pretty" | "json" | "minimal";
  deep?: boolean;
}

// ════════════════════════════════════════════════════════════════════════════
// HANDLER
// ════════════════════════════════════════════════════════════════════════════

/**
 * Handle /analyze command
 */
export async function handleAnalyze(
  repoRef: string,
  options: AnalyzeOptions,
  deep: boolean = false
): Promise<void> {
  const parsed = parseRepoRef(repoRef);
  if (!parsed) {
    printError("Invalid repository reference.");
    console.log(c.dim("  Expected formats:"));
    console.log(c.dim("    • https://github.com/owner/repo"));
    console.log(c.dim("    • owner/repo"));
    console.log();
    return;
  }

  const { owner, repo } = parsed;
  const repoUrl = buildRepoUrl(parsed);
  const repoSlug = buildRepoSlug(parsed);

  console.log();
  printRepo(owner, repo);
  printModel(appState.currentModel, appState.isPremium);
  if (deep) {
    console.log("  " + c.warning("Mode: Deep Analysis (Repomix)"));
    
    // Check if Repomix is available before starting
    // Note: Result is cached per session to avoid repeated 30s timeout delays
    const repomixReady = await isRepomixAvailable();
    if (!repomixReady) {
      printWarning("Repomix not available. Deep analysis will use file-by-file fallback.");
      console.log(c.dim("  To enable full deep analysis, ensure Node.js and npx are working."));
      console.log(c.dim("  Test with: npx repomix --version"));
      console.log();
    }
  }
  console.log();

  try {
    // Run analysis with current model
    const result = await analyzeRepositoryWithCopilot({
      repoUrl,
      token: options.token,
      model: appState.currentModel,
      maxFiles: options.maxFiles,
      maxBytes: options.maxBytes,
      timeout: deep ? 300000 : options.timeout, // 5 min for deep analysis
      verbosity: options.verbosity,
      format: options.format,
      deep,
    });

    // Update state
    appState.setLastAnalysis(result, repoSlug);

    // Add to history
    appState.addToHistory({
      repo: repoSlug,
      score: 0, // Score would be parsed from result if needed
      date: new Date().toISOString(),
      findings: 0,
      result: null,
    });

    // Show post-analysis options
    showPostAnalysisOptions();

  } catch (error) {
    printError(error instanceof Error ? error.message : "Analysis failed");
  }
}

// ════════════════════════════════════════════════════════════════════════════
// UI HELPERS
// ════════════════════════════════════════════════════════════════════════════

/**
 * Show available actions after analysis completes
 */
export function showPostAnalysisOptions(): void {
  console.log();
  console.log("  " + c.border("─".repeat(50)));
  console.log("  " + c.whiteBold("📋 What would you like to do?"));
  console.log();
  console.log("  " + c.info("/copy") + c.dim("     → Copy report to clipboard"));
  console.log("  " + c.info("/export") + c.dim("   → Save as markdown file"));
  console.log("  " + c.info("/summary") + c.dim("  → Generate condensed summary"));
  console.log("  " + c.info("/analyze") + c.dim("  <repo> → Analyze another repo"));
  console.log("  " + c.info("/deep") + c.dim("     <repo> → Deep analysis with source code"));
  console.log("  " + c.info("/help") + c.dim("     → See all commands"));
  console.log();
}
