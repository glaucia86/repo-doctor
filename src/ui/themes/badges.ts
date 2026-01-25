/**
 * Badges and Progress Indicators
 * Single Responsibility: Visual status indicators
 */

import chalk from "chalk";
import { COLORS, c } from "./colors.js";
import { ICON } from "./icons.js";

// ════════════════════════════════════════════════════════════════════════════
// PROGRESS & STATUS HELPERS
// ════════════════════════════════════════════════════════════════════════════

/**
 * Create a progress bar
 */
export function progressBar(percent: number, width = 20): string {
  const filled = Math.round((percent / 100) * width);
  const empty = width - filled;

  let color = c.healthy;
  if (percent < 25) color = c.critical;
  else if (percent < 50) color = c.warning;
  else if (percent < 75) color = c.info;

  return color("█".repeat(filled)) + c.muted("░".repeat(empty));
}

/**
 * Create a health score display
 */
export function healthScore(score: number): string {
  let color = c.healthy;
  let label = "Healthy";
  let icon = ICON.healthy;

  if (score < 50) {
    color = c.critical;
    label = "Critical";
    icon = ICON.critical;
  } else if (score < 70) {
    color = c.warning;
    label = "Needs Work";
    icon = ICON.warning;
  } else if (score < 85) {
    color = c.info;
    label = "Good";
    icon = "👍";
  }

  return `${icon} ${color.bold(`${score}%`)} ${c.dim(label)}`;
}

/**
 * Create a category score bar
 */
export function categoryBar(
  label: string,
  score: number,
  icon: string,
  width = 30
): string {
  const barWidth = width - 2;
  const bar = progressBar(score, barWidth);
  return `${icon} ${c.text(label.padEnd(20))} ${bar} ${c.dim(`${score}%`)}`;
}

/**
 * Create a model badge
 */
export function modelBadge(name: string, isPremium: boolean): string {
  if (isPremium) {
    return c.bgInfo(` ${name} `) + " " + c.premium(ICON.bolt);
  }
  return chalk.bgHex(COLORS.border).hex(COLORS.text)(` ${name} `);
}

/**
 * Create a priority badge
 */
export function priorityBadge(priority: "P0" | "P1" | "P2"): string {
  switch (priority) {
    case "P0":
      return c.bgP0(` ${priority} `);
    case "P1":
      return c.bgP1(` ${priority} `);
    case "P2":
      return c.bgP2(` ${priority} `);
  }
}

/**
 * Create a key hint for help
 */
export function keyHint(key: string, label: string): string {
  return c.key(`[${key}]`) + " " + c.dim(label);
}
