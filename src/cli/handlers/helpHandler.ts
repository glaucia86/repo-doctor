/**
 * Help Handler
 * Single Responsibility: Handle /help command
 */

import { printCommandMenu } from "../../ui/index.js";

// ════════════════════════════════════════════════════════════════════════════
// HANDLER
// ════════════════════════════════════════════════════════════════════════════

/**
 * Handle /help command
 */
export function handleHelp(): void {
  printCommandMenu();
}
