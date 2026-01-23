#!/usr/bin/env node

/**
 * Repo Doctor CLI v2.0
 * AI-Powered GitHub Repository Health Analyzer
 * 
 * Features:
 * - Chat-style interface with slash commands
 * - Markdown report generation
 * - Analysis history tracking
 */

// Ensure UTF-8 encoding for emojis on Windows
if (process.platform === "win32") {
  process.stdout.setDefaultEncoding?.("utf8");
  process.stderr.setDefaultEncoding?.("utf8");
}

import { Command } from "commander";
import * as readline from "readline";
import {
  clearScreen,
  printHeader,
  printChatHeader,
  printChatStatusBar,
  printCommandMenu,
  printRepo,
  printModel,
  printHelp,
  printSuccess,
  printError,
  printWarning,
  printInfo,
  printGoodbye,
  printWelcome,
  printPrompt,
  printHistory,
  printExportSuccess,
  printModelMenu,
  printUnknownCommand,
  startSpinner,
  spinnerSuccess,
  spinnerFail,
  c,
  ICON,
} from "./ui/index.js";
import { parseCommand, type CommandType } from "./ui/commands.js";
import { analyzeRepositoryWithCopilot, type AnalysisOutput } from "./core/agent.js";
import { saveMarkdownReport } from "./core/markdownReporter.js";
import type { AnalysisResult } from "./types/schema.js";

const program = new Command();

// ════════════════════════════════════════════════════════════════════════════
// APPLICATION STATE
// ════════════════════════════════════════════════════════════════════════════

interface AppState {
  currentModel: string;
  isPremium: boolean;
  lastResult: AnalysisResult | null;
  lastAnalysis: AnalysisOutput | null;
  lastRepo: string | null;
  history: Array<{
    repo: string;
    score: number;
    date: string;
    findings: number;
    result: AnalysisResult;
  }>;
  isRunning: boolean;
}

const state: AppState = {
  currentModel: "claude-sonnet-4",
  isPremium: true,
  lastResult: null,
  lastAnalysis: null,
  lastRepo: null,
  history: [],
  isRunning: true,
};

// Available models
const AVAILABLE_MODELS = [
  // Free models
  { id: "gpt-4o", name: "GPT-4o", premium: false },
  { id: "gpt-4.1", name: "GPT-4.1", premium: false },
  { id: "gpt-5-mini", name: "GPT-5 mini", premium: false },
  // Premium models
  { id: "claude-sonnet-4", name: "Claude Sonnet 4", premium: true },
  { id: "claude-sonnet-4.5", name: "Claude Sonnet 4.5", premium: true },
  { id: "claude-opus-4.5", name: "Claude Opus 4.5 (Rate Limit: 3x)", premium: true },
  { id: "gpt-5", name: "GPT-5 (Preview)", premium: true },
  { id: "gpt-5.1-codex", name: "GPT-5.1-Codex", premium: true },
  { id: "gpt-5.2-codex", name: "GPT-5.2-Codex", premium: true },
  { id: "o3", name: "o3 (Reasoning)", premium: true },
];

// ════════════════════════════════════════════════════════════════════════════// POST-ANALYSIS OPTIONS
// ════════════════════════════════════════════════════════════════════════════

/**
 * Show available actions after analysis completes
 */
function showPostAnalysisOptions(): void {
  console.log();
  console.log("  " + c.border("─".repeat(50)));
  console.log("  " + c.whiteBold("📋 What would you like to do?"));
  console.log();
  console.log("  " + c.info("/copy") + c.dim("   → Copy report to clipboard"));
  console.log("  " + c.info("/export") + c.dim(" → Save as markdown file"));
  console.log("  " + c.info("/analyze") + c.dim(" <repo> → Analyze another repo"));
  console.log("  " + c.info("/help") + c.dim("   → See all commands"));
  console.log();
}

// ════════════════════════════════════════════════════════════════════════════// ONBOARDING PROMPTS (readline-based to avoid inquirer conflicts)
// ════════════════════════════════════════════════════════════════════════════

/**
 * Prompt for repository URL using readline (one-shot)
 */
function promptRepoUrl(): Promise<string> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    console.log();
    console.log("  " + c.whiteBold(ICON.github + " Repository to analyze"));
    console.log("  " + c.border("─".repeat(50)));
    console.log();
    console.log("  " + c.dim("Formats accepted:"));
    console.log("  " + c.dim("  • ") + c.info("owner/repo") + c.dim(" (e.g., vercel/next.js)"));
    console.log("  " + c.dim("  • ") + c.info("https://github.com/owner/repo"));
    console.log();

    rl.question(c.brand("  ❯ "), (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

/**
 * Show model menu and prompt for selection using readline
 */
function promptModelSelection(): Promise<typeof AVAILABLE_MODELS[0]> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    console.log();
    console.log("  " + c.whiteBold(ICON.model + " Select AI Model"));
    console.log("  " + c.border("─".repeat(50)));
    console.log();

    AVAILABLE_MODELS.forEach((model, index) => {
      const num = c.info(`[${index + 1}]`);
      const premiumIcon = model.premium ? c.premium(" ⚡") : c.healthy(" ✓ FREE");
      const isDefault = model.id === "claude-sonnet-4";
      const defaultIndicator = isDefault ? c.dim(" (default)") : "";
      console.log(`    ${num} ${c.text(model.name)}${premiumIcon}${defaultIndicator}`);
    });

    console.log();
    console.log("  " + c.dim("Press Enter for default, or type a number:"));
    console.log();

    rl.question(c.brand("  ❯ "), (answer) => {
      rl.close();
      const trimmed = answer.trim();
      
      if (!trimmed) {
        // Default: claude-sonnet-4
        resolve(AVAILABLE_MODELS.find(m => m.id === "claude-sonnet-4")!);
        return;
      }

      const index = parseInt(trimmed, 10);
      if (!isNaN(index) && index >= 1 && index <= AVAILABLE_MODELS.length) {
        resolve(AVAILABLE_MODELS[index - 1]!);
      } else {
        // Try to find by name
        const found = AVAILABLE_MODELS.find(
          m => m.id.toLowerCase() === trimmed.toLowerCase() ||
               m.name.toLowerCase().includes(trimmed.toLowerCase())
        );
        resolve(found || AVAILABLE_MODELS.find(m => m.id === "claude-sonnet-4")!);
      }
    });
  });
}

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
// COMMAND HANDLERS
// ════════════════════════════════════════════════════════════════════════════

/**
 * Handle /analyze command
 */
async function handleAnalyze(repoRef: string, options: AnalyzeOptions): Promise<void> {
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
  const repoUrl = `https://github.com/${owner}/${repo}`;
  
  console.log();
  printRepo(owner, repo);
  printModel(state.currentModel, state.isPremium);
  console.log();

  try {
    // Run analysis with current model
    const result = await analyzeRepositoryWithCopilot({
      repoUrl,
      token: options.token,
      model: state.currentModel,
      maxFiles: options.maxFiles,
      maxBytes: options.maxBytes,
      timeout: options.timeout,
      verbosity: options.verbosity,
      format: options.format,
    });

    // Update state
    state.lastRepo = `${owner}/${repo}`;
    state.lastAnalysis = result;
    
    // Add to history
    state.history.unshift({
      repo: `${owner}/${repo}`,
      score: 0, // Score would be parsed from result if needed
      date: new Date().toISOString(),
      findings: 0,
      result: null as any, // Legacy field
    });
    // Keep only last 10 analyses
    if (state.history.length > 10) state.history.pop();
    
    // Show post-analysis options
    showPostAnalysisOptions();
    
  } catch (error) {
    printError(
      error instanceof Error ? error.message : "Analysis failed"
    );
  }
}

/**
 * Handle /export command
 * Supports: /export, /export ~/Desktop, /export ./report.md, /export ~/Desktop json
 */
async function handleExport(customPath?: string, format?: "md" | "json"): Promise<void> {
  if (!state.lastAnalysis) {
    printWarning("No analysis to export. Run /analyze first.");
    return;
  }

  const fs = await import("fs");
  const path = await import("path");
  const os = await import("os");
  
  const timestamp = new Date().toISOString().slice(0, 10);
  const repoSlug = state.lastRepo?.replace("/", "_") || "report";
  const ext = format === "json" ? "json" : "md";
  const defaultFilename = `${repoSlug}_${timestamp}.${ext}`;
  
  let targetPath: string;
  
  if (customPath) {
    // Expand ~ to home directory
    const expandedPath = customPath.startsWith("~") 
      ? path.join(os.homedir(), customPath.slice(1))
      : customPath;
    
    // Check if path looks like a directory (ends with / or \) or has no extension
    const hasExtension = /\.(md|json)$/i.test(expandedPath);
    
    if (hasExtension) {
      // Full file path provided
      targetPath = expandedPath;
    } else {
      // Directory path provided - append default filename
      targetPath = path.join(expandedPath, defaultFilename);
    }
  } else {
    // Default: ~/repo-doctor/reports/
    const defaultDir = path.join(os.homedir(), "repo-doctor", "reports");
    targetPath = path.join(defaultDir, defaultFilename);
  }
  
  // Get absolute path for display
  const absolutePath = path.resolve(targetPath);
  const targetDir = path.dirname(absolutePath);
  
  // Ensure directory exists
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  
  if (format === "json") {
    // JSON export: include full content for debugging/analysis purposes
    fs.writeFileSync(absolutePath, JSON.stringify({
      repo: state.lastRepo,
      model: state.lastAnalysis.model,
      date: new Date().toISOString(),
      content: state.lastAnalysis.content, // Full content including phases
      report: extractReportOnly(state.lastAnalysis.content), // Clean report only
      toolCallCount: state.lastAnalysis.toolCallCount,
      durationMs: state.lastAnalysis.durationMs,
    }, null, 2), { encoding: "utf8" });
    
    console.log();
    printSuccess(`Report exported to ${absolutePath}`);
    console.log();
    return;
  }

  // Default to markdown - extract only the report (no phase logs)
  const BOM = "\uFEFF";
  const reportContent = extractReportOnly(state.lastAnalysis.content);
  fs.writeFileSync(absolutePath, BOM + reportContent, { encoding: "utf8" });
  
  console.log();
  printSuccess(`Report exported to ${absolutePath}`);
  console.log();
}

/**
 * Extract only the final report from analysis output
 * Removes phase logs and keeps only the health report
 */
function extractReportOnly(content: string): string {
  // Try to find the start of the health report section
  // Common patterns: "## 🩺", "# Repository Health", "## Repository Health", "# Health Report"
  const reportPatterns = [
    /^##?\s*🩺\s*Repository Health Report/m,
    /^##?\s*Repository Health Report/mi,
    /^##?\s*Health Report/mi,
    /^---\s*\n+##?\s*🩺/m,
  ];

  for (const pattern of reportPatterns) {
    const match = content.match(pattern);
    if (match && match.index !== undefined) {
      // Include content from the match onwards
      // If there's a "---" before, include it for proper markdown formatting
      let startIndex = match.index;
      const beforeMatch = content.slice(Math.max(0, startIndex - 10), startIndex);
      if (beforeMatch.includes("---")) {
        startIndex = content.lastIndexOf("---", startIndex);
      }
      return content.slice(startIndex).trim();
    }
  }

  // Fallback: if no report header found, return everything
  return content;
}

/**
 * Handle /copy command - Copy analysis to clipboard
 */
async function handleCopy(): Promise<void> {
  if (!state.lastAnalysis) {
    printWarning("No analysis to copy. Run /analyze first.");
    return;
  }

  // Extract only the final report (without phase logs)
  const content = extractReportOnly(state.lastAnalysis.content);
  const isWindows = process.platform === "win32";
  const isMac = process.platform === "darwin";

  if (isWindows) {
    // Windows: clip.exe doesn't handle UTF-8 via stdin properly
    // Use a temp file with BOM to preserve emojis
    const fs = await import("fs");
    const os = await import("os");
    const path = await import("path");
    const { exec } = await import("child_process");
    
    const tempFile = path.join(os.tmpdir(), `repo-doctor-clipboard-${Date.now()}.txt`);
    const BOM = "\uFEFF";
    
    fs.writeFileSync(tempFile, BOM + content, { encoding: "utf8" });
    
    // Use PowerShell to read UTF-8 file and set clipboard
    const psCommand = `Get-Content -Path "${tempFile}" -Encoding UTF8 -Raw | Set-Clipboard`;
    
    exec(`powershell -Command "${psCommand}"`, (error) => {
      // Clean up temp file
      try { fs.unlinkSync(tempFile); } catch {}
      
      if (error) {
        printWarning("Could not copy to clipboard. Use /export instead.");
      } else {
        console.log();
        printSuccess("Analysis copied to clipboard!");
        console.log();
      }
    });
    return;
  }

  // macOS and Linux - spawn approach works fine
  const { spawn } = await import("child_process");

  return new Promise((resolve) => {
    let proc;
    
    if (isMac) {
      proc = spawn("pbcopy", [], { stdio: ["pipe", "ignore", "ignore"] });
    } else {
      proc = spawn("xclip", ["-selection", "clipboard"], { stdio: ["pipe", "ignore", "ignore"] });
    }

    proc.stdin?.write(content);
    proc.stdin?.end();

    proc.on("close", (code) => {
      if (code === 0) {
        console.log();
        printSuccess("Analysis copied to clipboard!");
        console.log();
      } else {
        printWarning("Could not copy to clipboard.");
      }
      resolve();
    });

    proc.on("error", () => {
      printWarning("Clipboard not available. Use /export to save to file.");
      resolve();
    });
  });
}

/**
 * Handle /history command
 */
function handleHistory(): void {
  if (state.history.length === 0) {
    printWarning("No analysis history yet.");
    return;
  }

  console.log();
  console.log("  " + c.whiteBold("📜 Analysis History"));
  console.log("  " + c.border("─".repeat(50)));
  console.log();
  
  state.history.forEach((entry, index) => {
    const num = c.info(`[${index + 1}]`);
    const date = new Date(entry.date).toLocaleDateString();
    const time = new Date(entry.date).toLocaleTimeString();
    console.log(`  ${num} ${c.brand(entry.repo)}`);
    console.log(`      ${c.dim(date + " " + time)}`);
  });
  
  console.log();
  console.log("  " + c.dim("Use ") + c.info("/analyze <repo>") + c.dim(" to analyze again."));
  console.log();
}

/**
 * Handle /model command - Model selection
 */
async function handleModel(modelName?: string): Promise<void> {
  if (!modelName) {
    // Show model menu with numbers for selection
    console.log();
    console.log("  " + c.whiteBold(ICON.model + " Select AI Model"));
    console.log("  " + c.border("─".repeat(50)));
    console.log();
    
    AVAILABLE_MODELS.forEach((model, index) => {
      const isCurrent = model.id === state.currentModel;
      const num = c.info(`[${index + 1}]`);
      const premiumIcon = model.premium ? c.premium(" ⚡") : c.healthy(" ✓ FREE");
      const currentIndicator = isCurrent ? c.dim(" (current)") : "";
      const prefix = isCurrent ? c.healthy("● ") : "  ";
      
      console.log(`  ${prefix}${num} ${c.text(model.name)}${premiumIcon}${currentIndicator}`);
    });
    
    console.log();
    console.log("  " + c.dim("Type: ") + c.info("/model <number>") + c.dim(" or ") + c.info("/model <name>"));
    console.log();
    return;
  }

  // Check if it's a number
  const modelIndex = parseInt(modelName, 10);
  let model: typeof AVAILABLE_MODELS[0] | undefined;
  
  if (!isNaN(modelIndex) && modelIndex >= 1 && modelIndex <= AVAILABLE_MODELS.length) {
    model = AVAILABLE_MODELS[modelIndex - 1];
  } else {
    // Search by name
    model = AVAILABLE_MODELS.find(
      (m) => m.id.toLowerCase() === modelName.toLowerCase() ||
             m.name.toLowerCase().includes(modelName.toLowerCase())
    );
  }

  if (!model) {
    printWarning(`Unknown model: ${modelName}`);
    console.log("  " + c.dim("Use ") + c.info("/model") + c.dim(" to see available models"));
    console.log();
    return;
  }

  state.currentModel = model.id;
  state.isPremium = model.premium;
  console.log();
  printSuccess(`Switched to ${model.name}`);
  printChatStatusBar(state.currentModel, state.isPremium, state.lastRepo || undefined);
}

/**
 * Handle /last command - Show last analysis result
 */
function handleLast(): void {
  if (!state.lastAnalysis) {
    printWarning("No previous analysis. Run /analyze first.");
    return;
  }

  console.log();
  console.log("  " + c.whiteBold("📋 Last Analysis"));
  console.log("  " + c.border("─".repeat(50)));
  console.log();
  console.log("  " + c.dim("Repository: ") + c.brand(state.lastRepo || "unknown"));
  console.log("  " + c.dim("Model: ") + c.info(state.lastAnalysis.model));
  console.log("  " + c.dim("Duration: ") + c.text(`${(state.lastAnalysis.durationMs / 1000).toFixed(1)}s`));
  console.log("  " + c.dim("API Calls: ") + c.text(String(state.lastAnalysis.toolCallCount)));
  console.log();
  console.log("  " + c.border("─".repeat(50)));
  console.log();
  
  // Re-display the full analysis content
  console.log(state.lastAnalysis.content);
  
  // Show post-analysis options
  showPostAnalysisOptions();
}

/**
 * Handle /clear command
 */
function handleClear(): void {
  clearScreen();
  printChatHeader();
  printChatStatusBar(state.currentModel, state.isPremium, state.lastRepo || undefined);
}

/**
 * Handle /help command
 */
function handleHelp(): void {
  printCommandMenu();
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

const defaultOptions: AnalyzeOptions = {
  token: process.env.GITHUB_TOKEN,
  maxFiles: 800,
  maxBytes: 204800,
  timeout: 120000,
  verbosity: "normal",
  format: "pretty",
};

// ════════════════════════════════════════════════════════════════════════════
// CHAT LOOP
// ════════════════════════════════════════════════════════════════════════════

/**
 * Run the interactive chat loop
 */
async function runChatMode(options: AnalyzeOptions, initialRepoRef?: string): Promise<void> {
  clearScreen();
  printChatHeader();
  printWelcome();

  // ═══════════════════════════════════════════════════════════════════════════
  // ONBOARDING: If no repo provided, ask for one
  // ═══════════════════════════════════════════════════════════════════════════
  if (!initialRepoRef) {
    // Step 1: Ask for repository
    const repoRef = await promptRepoUrl();
    
    if (!repoRef) {
      console.log();
      printWarning("No repository provided. Use /analyze <repo> in chat.");
      console.log();
    } else {
      // Validate repo format
      const parsed = parseRepoRef(repoRef);
      if (!parsed) {
        console.log();
        printError("Invalid repository format.");
        console.log(c.dim("  Use /analyze <repo> in chat to try again."));
        console.log();
      } else {
        // Step 2: Ask for model
        const selectedModel = await promptModelSelection();
        state.currentModel = selectedModel.id;
        state.isPremium = selectedModel.premium;

        console.log();
        printSuccess(`Model: ${selectedModel.name}`);
        console.log();

        // Step 3: Run initial analysis
        const { owner, repo } = parsed;
        const repoUrl = `https://github.com/${owner}/${repo}`;
        
        printRepo(owner, repo);
        printModel(state.currentModel, state.isPremium);
        console.log();

        try {
          const result = await analyzeRepositoryWithCopilot({
            repoUrl,
            token: options.token,
            model: state.currentModel,
            maxFiles: options.maxFiles,
            maxBytes: options.maxBytes,
            timeout: options.timeout,
            verbosity: options.verbosity,
            format: options.format,
          });

          state.lastRepo = `${owner}/${repo}`;
          state.lastAnalysis = result;
          
          // Add to history
          state.history.unshift({
            repo: `${owner}/${repo}`,
            score: 0,
            date: new Date().toISOString(),
            findings: 0,
            result: null as any,
          });
          if (state.history.length > 10) state.history.pop();
          
          // Show post-analysis options
          showPostAnalysisOptions();
        } catch (error) {
          printError(error instanceof Error ? error.message : "Analysis failed");
        }
      }
    }
  } else {
    // Repo provided via argument - analyze directly
    const parsed = parseRepoRef(initialRepoRef);
    if (parsed) {
      const { owner, repo } = parsed;
      const repoUrl = `https://github.com/${owner}/${repo}`;
      
      printRepo(owner, repo);
      printModel(state.currentModel, state.isPremium);
      console.log();

      try {
        const result = await analyzeRepositoryWithCopilot({
          repoUrl,
          token: options.token,
          model: state.currentModel,
          maxFiles: options.maxFiles,
          maxBytes: options.maxBytes,
          timeout: options.timeout,
          verbosity: options.verbosity,
          format: options.format,
        });

        state.lastRepo = `${owner}/${repo}`;
        state.lastAnalysis = result;
        
        // Add to history
        state.history.unshift({
          repo: `${owner}/${repo}`,
          score: 0,
          date: new Date().toISOString(),
          findings: 0,
          result: null as any,
        });
        if (state.history.length > 10) state.history.pop();
        
        // Show post-analysis options
        showPostAnalysisOptions();
      } catch (error) {
        printError(error instanceof Error ? error.message : "Analysis failed");
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CHAT LOOP
  // ═══════════════════════════════════════════════════════════════════════════
  printChatStatusBar(state.currentModel, state.isPremium, state.lastRepo || undefined);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const promptUser = (): void => {
    printPrompt();
  };

  rl.on("line", async (input) => {
    const command = parseCommand(input);

    switch (command.type) {
      case "analyze":
        await handleAnalyze(command.repoRef, options);
        break;

      case "export":
        await handleExport(command.path, command.format);
        break;

      case "copy":
        await handleCopy();
        break;

      case "history":
        handleHistory();
        break;

      case "model":
        handleModel(command.modelName);
        break;

      case "last":
        handleLast();
        break;

      case "clear":
        handleClear();
        break;

      case "help":
        handleHelp();
        break;

      case "quit":
        state.isRunning = false;
        printGoodbye();
        rl.close();
        process.exit(0);
        return;

      case "unknown":
        if (command.input.trim()) {
          printUnknownCommand(command.input);
        }
        break;
    }

    if (state.isRunning) {
      promptUser();
    }
  });

  rl.on("close", () => {
    if (state.isRunning) {
      printGoodbye();
      process.exit(0);
    }
  });

  // Start prompting
  promptUser();
}

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
    printModel(state.currentModel, state.isPremium);
    console.log();
  }

  // Run analysis
  try {
    const repoUrl = `https://github.com/${owner}/${repo}`;
    await analyzeRepositoryWithCopilot({ 
      repoUrl,
      token: options.token,
      model: state.currentModel,
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
  .version("2.0.0");

// Interactive chat mode (default)
program
  .command("chat", { isDefault: true })
  .description("Start interactive chat mode")
  .argument("[repoRef]", "Optional repository URL or slug to analyze immediately")
  .option(
    "--token <TOKEN>",
    "GitHub token for private repositories"
  )
  .option(
    "--model <name>",
    "AI model to use",
    "claude-sonnet-4"
  )
  .action(async (repoRef: string | undefined, opts) => {
    // Set model if provided
    if (opts.model) {
      const model = AVAILABLE_MODELS.find(
        (m) => m.id.toLowerCase() === opts.model.toLowerCase() ||
               m.name.toLowerCase().includes(opts.model.toLowerCase())
      );
      if (model) {
        state.currentModel = model.id;
        state.isPremium = model.premium;
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
  .option(
    "--model <name>",
    "AI model to use (gpt-4o|gpt-4.1|claude-sonnet-4|gpt-5|o3)",
    "claude-sonnet-4"
  )
  .option(
    "--export",
    "Export report to markdown after analysis",
    false
  )
  .action(async (repoRef: string, opts) => {
    // Set model from CLI option
    if (opts.model) {
      const model = AVAILABLE_MODELS.find(
        (m) => m.id.toLowerCase() === opts.model.toLowerCase() ||
               m.name.toLowerCase().includes(opts.model.toLowerCase())
      );
      if (model) {
        state.currentModel = model.id;
        state.isPremium = model.premium;
      }
    }
    
    const options: AnalyzeOptions = {
      token: opts.token || process.env.GITHUB_TOKEN,
      maxFiles: parseInt(opts.maxFiles, 10),
      maxBytes: parseInt(opts.maxBytes, 10),
      timeout: parseInt(opts.timeout, 10),
      verbosity: opts.verbosity as AnalyzeOptions["verbosity"],
      format: opts.format as AnalyzeOptions["format"],
    };
    await runDirectAnalyze(repoRef, options);
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

// Parse and run
program.parse();
