/**
 * Chat Loop
 * Single Responsibility: Interactive REPL for Repo Doctor
 */

import * as readline from "readline";
import { analyzeRepositoryWithCopilot } from "../core/agent.js";
import { parseCommand, type CommandType } from "../ui/commands.js";
import { parseRepoRef, buildRepoUrl, buildRepoSlug } from "./parsers/repoParser.js";
import {
  appState,
  AVAILABLE_MODELS,
  type ModelInfo,
} from "./state/appState.js";
import {
  handleAnalyze,
  handleExport,
  handleCopy,
  handleModel,
  handleHistory,
  handleLast,
  handleClear,
  handleSummary,
  handleHelp,
  showPostAnalysisOptions,
  type AnalyzeOptions,
} from "./handlers/index.js";
import {
  clearScreen,
  printChatHeader,
  printChatStatusBar,
  printWelcome,
  printQuickCommands,
  printPrompt,
  printRepo,
  printModel,
  printSuccess,
  printError,
  printWarning,
  printGoodbye,
  printUnknownCommand,
  c,
  ICON,
} from "../ui/index.js";

// ════════════════════════════════════════════════════════════════════════════
// ONBOARDING PROMPTS
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
function promptModelSelection(): Promise<ModelInfo> {
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
        resolve(AVAILABLE_MODELS.find((m) => m.id === "claude-sonnet-4")!);
        return;
      }

      const index = parseInt(trimmed, 10);
      if (!isNaN(index) && index >= 1 && index <= AVAILABLE_MODELS.length) {
        resolve(AVAILABLE_MODELS[index - 1]!);
      } else {
        // Try to find by name
        const found = AVAILABLE_MODELS.find(
          (m) =>
            m.id.toLowerCase() === trimmed.toLowerCase() ||
            m.name.toLowerCase().includes(trimmed.toLowerCase())
        );
        resolve(found || AVAILABLE_MODELS.find((m) => m.id === "claude-sonnet-4")!);
      }
    });
  });
}

// ════════════════════════════════════════════════════════════════════════════
// INITIAL ANALYSIS
// ════════════════════════════════════════════════════════════════════════════

async function runInitialAnalysis(
  repoRef: string,
  options: AnalyzeOptions
): Promise<void> {
  const parsed = parseRepoRef(repoRef);
  if (!parsed) {
    printError("Invalid repository format.");
    console.log(c.dim("  Use /analyze <repo> in chat to try again."));
    console.log();
    return;
  }

  const { owner, repo } = parsed;
  const repoUrl = buildRepoUrl(parsed);
  const repoSlug = buildRepoSlug(parsed);

  printRepo(owner, repo);
  printModel(appState.currentModel, appState.isPremium);
  console.log();

  try {
    const result = await analyzeRepositoryWithCopilot({
      repoUrl,
      token: options.token,
      model: appState.currentModel,
      maxFiles: options.maxFiles,
      maxBytes: options.maxBytes,
      timeout: options.timeout,
      verbosity: options.verbosity,
      format: options.format,
    });

    appState.setLastAnalysis(result, repoSlug);

    appState.addToHistory({
      repo: repoSlug,
      score: 0,
      date: new Date().toISOString(),
      findings: 0,
      result: null,
    });

    showPostAnalysisOptions();
  } catch (error) {
    printError(error instanceof Error ? error.message : "Analysis failed");
  }
}

// ════════════════════════════════════════════════════════════════════════════
// MAIN CHAT LOOP
// ════════════════════════════════════════════════════════════════════════════

/**
 * Run the interactive chat loop
 */
export async function runChatMode(
  options: AnalyzeOptions,
  initialRepoRef?: string
): Promise<void> {
  clearScreen();
  printChatHeader();
  printWelcome();
  printQuickCommands();

  // ═══════════════════════════════════════════════════════════════════════════
  // ONBOARDING: If no repo provided, ask for one
  // ═══════════════════════════════════════════════════════════════════════════
  if (!initialRepoRef) {
    const repoRef = await promptRepoUrl();

    if (!repoRef) {
      console.log();
      printWarning("No repository provided. Use /analyze <repo> in chat.");
      console.log();
    } else if (repoRef.startsWith("/")) {
      // User entered a command - parse and execute it
      const command = parseCommand(repoRef);
      
      if (command.type === "analyze") {
        // Run analysis with the repo ref from the command
        const selectedModel = await promptModelSelection();
        appState.setModel(selectedModel.id, selectedModel.premium);
        console.log();
        printSuccess(`Model: ${selectedModel.name}`);
        console.log();
        await runInitialAnalysis(command.repoRef, options);
      } else if (command.type === "deep") {
        // Run deep analysis
        const selectedModel = await promptModelSelection();
        appState.setModel(selectedModel.id, selectedModel.premium);
        console.log();
        printSuccess(`Model: ${selectedModel.name}`);
        console.log();
        await handleAnalyze(command.repoRef, options, true);
      } else {
        // Other commands - skip to chat loop
        console.log();
        printWarning(`Command "${repoRef}" will be processed in chat mode.`);
        console.log();
      }
    } else {
      const parsed = parseRepoRef(repoRef);
      if (!parsed) {
        console.log();
        printError("Invalid repository format.");
        console.log(c.dim("  Use /analyze <repo> in chat to try again."));
        console.log();
      } else {
        // Ask for model
        const selectedModel = await promptModelSelection();
        appState.setModel(selectedModel.id, selectedModel.premium);

        console.log();
        printSuccess(`Model: ${selectedModel.name}`);
        console.log();

        // Run initial analysis
        await runInitialAnalysis(repoRef, options);
      }
    }
  } else {
    // Repo provided via argument - analyze directly
    await runInitialAnalysis(initialRepoRef, options);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CHAT LOOP
  // ═══════════════════════════════════════════════════════════════════════════
  printChatStatusBar(
    appState.currentModel,
    appState.isPremium,
    appState.lastRepo || undefined
  );

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true,
    prompt: c.brand("  ❯ "),
  });

  // Prevent readline from closing when stdin pauses
  process.stdin.on("end", () => {
    // Do nothing - keep readline alive
  });

  // Ensure stdin is in flowing mode for readline
  if (process.stdin.isPaused()) {
    process.stdin.resume();
  }

  const promptUser = (): void => {
    // Use rl.prompt() instead of manual stdout.write for proper readline integration
    rl.prompt();
  };

  // Flag to prevent re-entrance during async operations
  let isProcessing = false;

  rl.on("line", async (input) => {
    // Prevent multiple simultaneous command executions
    if (isProcessing) {
      return;
    }
    
    const command = parseCommand(input);

    // For async commands, pause readline to prevent input issues during analysis
    if (command.type === "analyze" || command.type === "deep" || 
        command.type === "export" || command.type === "copy" || 
        command.type === "model") {
      isProcessing = true;
      rl.pause();
    }

    try {
      switch (command.type) {
        case "analyze":
          await handleAnalyze(command.repoRef, options, false);
          break;

        case "deep":
          await handleAnalyze(command.repoRef, options, true);
          break;

        case "export":
          await handleExport(command.path, command.format);
          break;

        case "copy":
          await handleCopy();
          break;

        case "summary":
          handleSummary();
          break;

        case "history":
          handleHistory();
          break;

        case "model":
          await handleModel(command.modelName);
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
          appState.setRunning(false);
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
    } finally {
      // Resume readline after async operations complete
      if (isProcessing) {
        isProcessing = false;
        rl.resume();
      }
    }

    if (appState.isRunning) {
      promptUser();
    }
  });

  rl.on("close", () => {
    if (appState.isRunning) {
      printGoodbye();
      process.exit(0);
    }
  });

  // Start prompting
  promptUser();
}
