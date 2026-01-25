/**
 * Model Handler
 * Single Responsibility: Handle /model command
 */

import {
  appState,
  AVAILABLE_MODELS,
  findModel,
  findModelByIndex,
  type ModelInfo,
} from "../state/appState.js";
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
function promptModelSelection(): Promise<ModelInfo | null> {
  return new Promise((resolve) => {
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
    console.log("  " + c.dim("Enter number, name, or press Enter to cancel:"));
    console.log();
    process.stdout.write(c.brand("  ❯ "));

    // Resume stdin if paused (chatLoop pauses it)
    process.stdin.resume();
    process.stdin.setEncoding("utf8");

    let inputBuffer = "";

    const onData = (chunk: string) => {
      inputBuffer += chunk;
      
      // Check for newline (Enter pressed)
      if (inputBuffer.includes("\n") || inputBuffer.includes("\r")) {
        cleanup();
        const answer = inputBuffer.replace(/[\r\n]/g, "").trim();
        processAnswer(answer);
      }
    };

    const cleanup = () => {
      process.stdin.removeListener("data", onData);
    };

    const processAnswer = (trimmed: string) => {
      if (!trimmed) {
        resolve(null);
        return;
      }

      const index = parseInt(trimmed, 10);
      if (!isNaN(index) && index >= 1 && index <= AVAILABLE_MODELS.length) {
        resolve(AVAILABLE_MODELS[index - 1]!);
        return;
      }

      // Try to find by name or id
      const found = AVAILABLE_MODELS.find(
        (m) =>
          m.id.toLowerCase() === trimmed.toLowerCase() ||
          m.name.toLowerCase().includes(trimmed.toLowerCase())
      );
      
      resolve(found || null);
    };

    process.stdin.on("data", onData);
  });
}

// ════════════════════════════════════════════════════════════════════════════
// HANDLER
// ════════════════════════════════════════════════════════════════════════════

/**
 * Handle /model command - Model selection
 */
export async function handleModel(modelName?: string): Promise<void> {
  if (!modelName) {
    // Interactive model selection
    const selected = await promptModelSelection();
    
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
