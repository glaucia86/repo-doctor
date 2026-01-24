/**
 * History Handler
 * Single Responsibility: Handle /history and /last commands
 */

import { appState } from "../state/appState.js";
import {
  printWarning,
  clearScreen,
  printChatHeader,
  printChatStatusBar,
  c,
} from "../../ui/index.js";
import { showPostAnalysisOptions } from "./analyzeHandler.js";

// ════════════════════════════════════════════════════════════════════════════
// HANDLERS
// ════════════════════════════════════════════════════════════════════════════

/**
 * Handle /history command
 */
export function handleHistory(): void {
  if (appState.history.length === 0) {
    printWarning("No analysis history yet.");
    return;
  }

  console.log();
  console.log("  " + c.whiteBold("📜 Analysis History"));
  console.log("  " + c.border("─".repeat(50)));
  console.log();

  appState.history.forEach((entry, index) => {
    const num = c.info(`[${index + 1}]`);
    const date = new Date(entry.date).toLocaleDateString();
    const time = new Date(entry.date).toLocaleTimeString();
    console.log(`  ${num} ${c.brand(entry.repo)}`);
    console.log(`      ${c.dim(date + " " + time)}`);
  });

  console.log();
  console.log(
    "  " +
      c.dim("Use ") +
      c.info("/analyze <repo>") +
      c.dim(" to analyze again.")
  );
  console.log();
}

/**
 * Handle /last command - Show last analysis result
 */
export function handleLast(): void {
  if (!appState.lastAnalysis) {
    printWarning("No previous analysis. Run /analyze first.");
    return;
  }

  console.log();
  console.log("  " + c.whiteBold("📋 Last Analysis"));
  console.log("  " + c.border("─".repeat(50)));
  console.log();
  console.log("  " + c.dim("Repository: ") + c.brand(appState.lastRepo || "unknown"));
  console.log("  " + c.dim("Model: ") + c.info(appState.lastAnalysis.model));
  console.log(
    "  " +
      c.dim("Duration: ") +
      c.text(`${(appState.lastAnalysis.durationMs / 1000).toFixed(1)}s`)
  );
  console.log(
    "  " +
      c.dim("API Calls: ") +
      c.text(String(appState.lastAnalysis.toolCallCount))
  );
  console.log();
  console.log("  " + c.border("─".repeat(50)));
  console.log();

  // Re-display the full analysis content
  console.log(appState.lastAnalysis.content);

  // Show post-analysis options
  showPostAnalysisOptions();
}

/**
 * Handle /clear command
 */
export function handleClear(): void {
  clearScreen();
  printChatHeader();
  printChatStatusBar(
    appState.currentModel,
    appState.isPremium,
    appState.lastRepo || undefined
  );
}
