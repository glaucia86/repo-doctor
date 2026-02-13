/**
 * Model Handler
 * Single Responsibility: Handle /model command
 */

import {
  appState,
  getAvailableModels,
  findModel,
  findModelByIndex,
  type ModelInfo,
} from "../state/appState.js";
import * as readline from "readline";
import {
  printSuccess,
  printWarning,
  printChatStatusBar,
  c,
  ICON,
} from "../../ui/index.js";

// ════════════════════════════════════════════════════════════════════════════
// INTERACTIVE MODEL PROMPT
// ════════════════════════════════════════════════════════════════════════════

/**
 * Show model menu and prompt for selection using stdin directly
 * Works even when chatLoop's readline is paused
 */
function promptModelSelection(models: ModelInfo[]): Promise<ModelInfo | null> {
  return new Promise((resolve) => {
    console.log();
    console.log("  " + c.whiteBold(ICON.model + " Select AI Model"));
    console.log("  " + c.border("─".repeat(50)));
    console.log();

    models.forEach((model, index) => {
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
    console.log("  " + c.dim("Enter number, name, or press Enter to cancel:"));
    console.log();

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: true,
    });
    rl.resume();

    rl.question(c.brand("  ❯ "), (answer) => {
      rl.close();
      const trimmed = answer.trim();
      if (!trimmed) {
        resolve(null);
        return;
      }

      const index = parseInt(trimmed, 10);
      if (!isNaN(index) && index >= 1 && index <= models.length) {
        resolve(models[index - 1]!);
        return;
      }

      const found = models.find(
        (m) =>
          m.id.toLowerCase() === trimmed.toLowerCase() ||
          m.name.toLowerCase().includes(trimmed.toLowerCase())
      );

      resolve(found || null);
    });
  });
}

// ════════════════════════════════════════════════════════════════════════════
// HANDLER
// ════════════════════════════════════════════════════════════════════════════

/**
 * Handle /model command - Model selection
 */
export async function handleModel(modelName?: string): Promise<void> {
  const models = getAvailableModels();

  if (!modelName) {
    // Interactive model selection
    const selected = await promptModelSelection(models);
    
    if (!selected) {
      console.log();
      printWarning("Model selection cancelled.");
      console.log();
      return;
    }

    appState.setModel(selected.id, selected.premium);
    console.log();
    printSuccess(`Switched to ${selected.name}`);
    printChatStatusBar(
      appState.currentModel,
      appState.isPremium,
      appState.lastRepo || undefined
    );
    return;
  }

  // Check if it's a number
  const modelIndex = parseInt(modelName, 10);
  const model = !isNaN(modelIndex)
    ? findModelByIndex(modelIndex, models)
    : findModel(modelName, models);

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
