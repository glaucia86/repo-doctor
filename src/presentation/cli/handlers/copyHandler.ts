/**
 * Copy Handler
 * Single Responsibility: Handle /copy command (clipboard)
 *
 * Delegates clipboard operations to the shared clipboard service.
 */

import { appState } from "../state/appState.js";
import { extractReportOnly } from "../parsers/reportExtractor.js";
import { printSuccess, printWarning } from "../../ui/index.js";
import {
  copyToClipboard,
  isClipboardAvailable,
} from "../../../utils/clipboard.js";

// ════════════════════════════════════════════════════════════════════════════
// HANDLER
// ════════════════════════════════════════════════════════════════════════════

/**
 * Handle /copy command - Copy analysis to clipboard
 */
export async function handleCopy(): Promise<void> {
  if (!appState.lastAnalysis) {
    printWarning("No analysis to copy. Run /analyze first.");
    return;
  }

  // Check clipboard availability first
  if (!isClipboardAvailable()) {
    printWarning("Clipboard not available. Use /export to save to file.");
    return;
  }

  // Extract only the final report (without phase logs)
  const content = extractReportOnly(appState.lastAnalysis.content);

  // Delegate to shared clipboard service
  const result = await copyToClipboard(content);

  if (result.success) {
    console.log();
    printSuccess("Analysis copied to clipboard!");
    console.log();
  } else {
    printWarning(
      `Could not copy to clipboard: ${result.error ?? "Unknown error"}. Use /export instead.`
    );
  }
}

