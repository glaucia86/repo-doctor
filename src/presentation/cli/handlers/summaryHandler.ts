/**
 * Summary Handler
 * Single Responsibility: Handle /summary command
 */

import { appState } from "../state/appState.js";
import {
  extractReportOnly,
  generateCondensedSummary,
} from "../parsers/reportExtractor.js";
import { printWarning } from "../../ui/index.js";

// ════════════════════════════════════════════════════════════════════════════
// HANDLER
// ════════════════════════════════════════════════════════════════════════════

/**
 * Handle /summary command - Generate condensed summary of last analysis
 */
export function handleSummary(): void {
  if (!appState.lastAnalysis) {
    printWarning("No analysis to summarize. Run /analyze or /deep first.");
    return;
  }

  const content = extractReportOnly(appState.lastAnalysis.content);
  const summary = generateCondensedSummary(
    content,
    appState.lastRepo || "unknown"
  );

  console.log();
  console.log(summary);
  console.log();
}
