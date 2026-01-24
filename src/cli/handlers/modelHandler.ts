/**
 * Model Handler
 * Single Responsibility: Handle /model command
 */

import {
  appState,
  AVAILABLE_MODELS,
  findModel,
  findModelByIndex,
} from "../state/appState.js";
import {
  printSuccess,
  printWarning,
  printChatStatusBar,
  c,
  ICON,
} from "../../ui/index.js";

// ════════════════════════════════════════════════════════════════════════════
// HANDLER
// ════════════════════════════════════════════════════════════════════════════

/**
 * Handle /model command - Model selection
 */
export async function handleModel(modelName?: string): Promise<void> {
  if (!modelName) {
    // Show model menu with numbers for selection
    showModelMenu();
    return;
  }

  // Check if it's a number
  const modelIndex = parseInt(modelName, 10);
  let model = !isNaN(modelIndex)
    ? findModelByIndex(modelIndex)
    : findModel(modelName);

  if (!model) {
    printWarning(`Unknown model: ${modelName}`);
    console.log(
      "  " + c.dim("Use ") + c.info("/model") + c.dim(" to see available models")
    );
    console.log();
    return;
  }

  appState.setModel(model.id, model.premium);
  console.log();
  printSuccess(`Switched to ${model.name}`);
  printChatStatusBar(
    appState.currentModel,
    appState.isPremium,
    appState.lastRepo || undefined
  );
}

// ════════════════════════════════════════════════════════════════════════════
// UI HELPERS
// ════════════════════════════════════════════════════════════════════════════

/**
 * Show model selection menu
 */
function showModelMenu(): void {
  console.log();
  console.log("  " + c.whiteBold(ICON.model + " Select AI Model"));
  console.log("  " + c.border("─".repeat(50)));
  console.log();

  AVAILABLE_MODELS.forEach((model, index) => {
    const isCurrent = model.id === appState.currentModel;
    const num = c.info(`[${index + 1}]`);
    const premiumIcon = model.premium ? c.premium(" ⚡") : c.healthy(" ✓ FREE");
    const currentIndicator = isCurrent ? c.dim(" (current)") : "";
    const prefix = isCurrent ? c.healthy("● ") : "  ";

    console.log(
      `  ${prefix}${num} ${c.text(model.name)}${premiumIcon}${currentIndicator}`
    );
  });

  console.log();
  console.log(
    "  " +
      c.dim("Type: ") +
      c.info("/model <number>") +
      c.dim(" or ") +
      c.info("/model <name>")
  );
  console.log();
}
