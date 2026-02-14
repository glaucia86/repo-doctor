/**
 * Screen management for CLI
 * Single Responsibility: Handle screen clearing and header rendering
 */

import {
  c,
  renderLogo,
  renderCompactLogo,
  modelBadge,
} from "../themes.js";

// ════════════════════════════════════════════════════════════════════════════
// SCREEN FUNCTIONS
// ════════════════════════════════════════════════════════════════════════════

/**
 * Clear the terminal screen
 */
export function clearScreen(): void {
  process.stdout.write("\x1B[2J\x1B[0f");
}

/**
 * Print the logo header with optional animation
 */
export async function printHeader(compact = false, animated = true): Promise<void> {
  console.log();
  const logo = compact ? renderCompactLogo() : renderLogo();
  const isInteractive = Boolean(process.stdout.isTTY) && !process.env.CI;

  if (animated && !compact && isInteractive) {
    // Animated version - show lines one by one with async timing
    for (const line of logo) {
      console.log("  " + line);
      // Force flush and wait 200ms between lines
      process.stdout.write('');
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  } else {
    // Static version - show all at once
    for (const line of logo) {
      console.log("  " + line);
    }
  }

  if (!compact) {
    console.log();
    console.log("  " + c.dim("─".repeat(86)));
    console.log(
      "  " +
        c.dim("Your AI-powered GitHub repository health analyzer. ") +
        c.text("Type ") +
        c.brand("/help") +
        c.text(" for commands.")
    );
    console.log("  " + c.dim("─".repeat(86)));
    console.log();
  }
}

/**
 * Print repository info
 */
export function printRepo(owner: string, repo: string): void {
  console.log();
  console.log(
    "  " +
      c.dim("┌─ Repository ") +
      c.dim("─".repeat(67))
  );
  console.log(
    "  " +
      c.dim("│ ") +
      c.brand(`${owner}/${repo}`)
  );
  console.log("  " + c.dim("└" + "─".repeat(80)));
  console.log();
}

/**
 * Print model info
 */
export function printModel(model: string, isPremium: boolean): void {
  console.log();
  console.log(
    "  " +
      c.dim("┌─ Model ") +
      c.dim("─".repeat(72))
  );
  console.log("  " + c.dim("│ ") + modelBadge(model, isPremium));
  console.log("  " + c.dim("└" + "─".repeat(80)));
  console.log();
}
