/**
 * Box Drawing Characters and Helpers
 * Single Responsibility: Box drawing utilities
 */

import { c } from "./colors.js";

// ════════════════════════════════════════════════════════════════════════════
// BOX DRAWING CHARACTERS
// ════════════════════════════════════════════════════════════════════════════

export const BOX = {
  // Rounded corners
  tl: "╭",
  tr: "╮",
  bl: "╰",
  br: "╯",
  // Lines
  h: "─",
  v: "│",
  // T-junctions
  lt: "├",
  rt: "┤",
  tt: "┬",
  bt: "┴",
  // Cross
  x: "┼",
  // Double lines
  dh: "═",
  dv: "║",
  dtl: "╔",
  dtr: "╗",
  dbl: "╚",
  dbr: "╝",
  // Heavy
  hh: "━",
  hv: "┃",
};

// ════════════════════════════════════════════════════════════════════════════
// STRING HELPERS
// ════════════════════════════════════════════════════════════════════════════

/**
 * Strip ANSI escape codes from a string
 */
export function stripAnsi(str: string): string {
  return str.replace(
    /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
    ""
  );
}

/**
 * Get the visible length of a string (without ANSI codes)
 */
export function visibleLength(str: string): number {
  return stripAnsi(str).length;
}

// ════════════════════════════════════════════════════════════════════════════
// BOX HELPERS
// ════════════════════════════════════════════════════════════════════════════

/**
 * Draw a horizontal line
 */
export function line(width: number, char = BOX.h): string {
  return c.border(char.repeat(width));
}

/**
 * Draw a box around content
 * @param content - Array of content lines
 * @param options - Box options
 * @param options.width - Fixed width (default: auto-calculated from content)
 * @param options.minWidth - Minimum width when auto-calculating
 * @param options.maxWidth - Maximum width when auto-calculating
 */
export function box(
  content: string[],
  options: {
    width?: number;
    minWidth?: number;
    maxWidth?: number;
    title?: string;
    titleAlign?: "left" | "center" | "right";
    padding?: number;
    borderColor?: typeof c.border;
  } = {}
): string[] {
  const {
    minWidth = 40,
    maxWidth = 100,
    title,
    titleAlign = "left",
    padding = 1,
    borderColor = c.border,
  } = options;

  // Calculate width dynamically if not specified
  let width = options.width;
  if (!width) {
    // Find the longest line in content
    let maxContentLength = 0;
    for (const line of content) {
      const len = visibleLength(line);
      if (len > maxContentLength) maxContentLength = len;
    }
    // Add padding and borders: 2 (borders) + padding*2 (left+right padding) + 2 (extra margin)
    const calculatedWidth = maxContentLength + 2 + padding * 2 + 2;

    // Also consider title length
    const titleLength = title ? visibleLength(title) + 6 : 0; // 6 = spaces + borders

    width = Math.max(
      minWidth,
      Math.min(maxWidth, Math.max(calculatedWidth, titleLength))
    );
  }

  const innerWidth = width - 2;
  const result: string[] = [];
  const pad = " ".repeat(padding);

  // Top border with optional title
  if (title) {
    const titleText = ` ${title} `;
    let topLine: string;

    if (titleAlign === "center") {
      const leftPad = Math.floor((innerWidth - titleText.length) / 2);
      const rightPad = innerWidth - leftPad - titleText.length;
      topLine =
        borderColor(BOX.tl + BOX.h.repeat(leftPad)) +
        c.whiteBold(titleText) +
        borderColor(BOX.h.repeat(rightPad) + BOX.tr);
    } else if (titleAlign === "right") {
      const leftPad = innerWidth - titleText.length - 2;
      topLine =
        borderColor(BOX.tl + BOX.h.repeat(leftPad)) +
        c.whiteBold(titleText) +
        borderColor(BOX.h.repeat(2) + BOX.tr);
    } else {
      topLine =
        borderColor(BOX.tl + BOX.h.repeat(2)) +
        c.whiteBold(titleText) +
        borderColor(BOX.h.repeat(innerWidth - titleText.length - 2) + BOX.tr);
    }
    result.push(topLine);
  } else {
    result.push(borderColor(BOX.tl + BOX.h.repeat(innerWidth) + BOX.tr));
  }

  // Empty line for top padding
  for (let i = 0; i < padding; i++) {
    result.push(
      borderColor(BOX.v) + " ".repeat(innerWidth) + borderColor(BOX.v)
    );
  }

  // Content lines
  for (const contentLine of content) {
    const stripped = stripAnsi(contentLine);
    const contentWidth = innerWidth - padding * 2;
    const rightPadding = contentWidth - stripped.length;
    result.push(
      borderColor(BOX.v) +
        pad +
        contentLine +
        " ".repeat(Math.max(0, rightPadding)) +
        pad +
        borderColor(BOX.v)
    );
  }

  // Empty line for bottom padding
  for (let i = 0; i < padding; i++) {
    result.push(
      borderColor(BOX.v) + " ".repeat(innerWidth) + borderColor(BOX.v)
    );
  }

  // Bottom border
  result.push(borderColor(BOX.bl + BOX.h.repeat(innerWidth) + BOX.br));

  return result;
}
