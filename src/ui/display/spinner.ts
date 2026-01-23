/**
 * Spinner management for CLI
 * Single Responsibility: Handle loading spinners
 */

import ora, { type Ora } from "ora";
import { c } from "../themes.js";

// ════════════════════════════════════════════════════════════════════════════
// SPINNER STATE
// ════════════════════════════════════════════════════════════════════════════

let currentSpinner: Ora | null = null;

// ════════════════════════════════════════════════════════════════════════════
// SPINNER FUNCTIONS
// ════════════════════════════════════════════════════════════════════════════

/**
 * Start a spinner with the given text
 */
export function startSpinner(text: string): Ora {
  currentSpinner = ora({
    text: c.dim(text),
    spinner: "dots",
    color: "cyan",
    prefixText: "  ",
  }).start();
  return currentSpinner;
}

/**
 * Update the current spinner's text
 */
export function updateSpinner(text: string): void {
  if (currentSpinner) {
    currentSpinner.text = c.dim(text);
  }
}

/**
 * Stop spinner with success state
 */
export function spinnerSuccess(text?: string): void {
  if (currentSpinner) {
    currentSpinner.succeed(text ? c.healthy(text) : undefined);
    currentSpinner = null;
  }
}

/**
 * Stop spinner with failure state
 */
export function spinnerFail(text?: string): void {
  if (currentSpinner) {
    currentSpinner.fail(text ? c.critical(text) : undefined);
    currentSpinner = null;
  }
}

/**
 * Stop spinner with warning state
 */
export function spinnerWarn(text?: string): void {
  if (currentSpinner) {
    currentSpinner.warn(text ? c.warning(text) : undefined);
    currentSpinner = null;
  }
}

/**
 * Get the current spinner instance (for testing)
 */
export function getCurrentSpinner(): Ora | null {
  return currentSpinner;
}
