/**
 * Theme system for Repo Doctor CLI
 * Beautiful terminal styling with gradients and box drawing
 * Inspired by Video Promo's design system
 */

import chalk from "chalk";

// ════════════════════════════════════════════════════════════════════════════
// COLOR PALETTE
// ════════════════════════════════════════════════════════════════════════════

export const COLORS = {
  // Brand gradient (teal to blue - medical theme)
  brand1: "#00d4aa", // Teal/Verde saúde
  brand2: "#00a8cc", // Azul médico
  brand3: "#0077b6", // Azul escuro

  // UI colors
  bg: "#0d1117",
  bgLight: "#161b22",
  bgPanel: "#21262d",

  // Text hierarchy
  text: "#e6edf3",
  textDim: "#8b949e",
  textMuted: "#484f58",

  // Semantic - Health status
  healthy: "#3fb950", // Verde - saudável
  warning: "#d29922", // Amarelo - atenção
  critical: "#f85149", // Vermelho - crítico
  info: "#58a6ff", // Azul - informativo

  // Prioridades
  p0: "#ff4757", // Vermelho intenso
  p1: "#ffa502", // Laranja
  p2: "#7bed9f", // Verde claro

  // Premium/Special
  premium: "#a371f7",

  // Borders
  border: "#30363d",
  borderFocus: "#58a6ff",
};

// ════════════════════════════════════════════════════════════════════════════
// CHALK SHORTCUTS
// ════════════════════════════════════════════════════════════════════════════

export const c = {
  // Brand
  brand: chalk.hex(COLORS.brand1),
  brandBold: chalk.hex(COLORS.brand1).bold,
  brand2: chalk.hex(COLORS.brand2),
  brand3: chalk.hex(COLORS.brand3),

  // Text
  text: chalk.hex(COLORS.text),
  dim: chalk.hex(COLORS.textDim),
  muted: chalk.hex(COLORS.textMuted),
  white: chalk.white,
  whiteBold: chalk.white.bold,

  // Health status
  healthy: chalk.hex(COLORS.healthy),
  healthyBold: chalk.hex(COLORS.healthy).bold,
  warning: chalk.hex(COLORS.warning),
  warningBold: chalk.hex(COLORS.warning).bold,
  critical: chalk.hex(COLORS.critical),
  criticalBold: chalk.hex(COLORS.critical).bold,
  info: chalk.hex(COLORS.info),
  infoBold: chalk.hex(COLORS.info).bold,

  // Priority colors
  p0: chalk.hex(COLORS.p0),
  p0Bold: chalk.hex(COLORS.p0).bold,
  p1: chalk.hex(COLORS.p1),
  p1Bold: chalk.hex(COLORS.p1).bold,
  p2: chalk.hex(COLORS.p2),
  p2Bold: chalk.hex(COLORS.p2).bold,

  // Aliases for compatibility
  success: chalk.hex(COLORS.healthy),
  successBold: chalk.hex(COLORS.healthy).bold,
  error: chalk.hex(COLORS.critical),
  errorBold: chalk.hex(COLORS.critical).bold,

  // Special
  border: chalk.hex(COLORS.border),
  premium: chalk.hex(COLORS.premium),
  premiumBold: chalk.hex(COLORS.premium).bold,
  number: chalk.yellow,
  key: chalk.cyan,

  // Backgrounds
  bgHealthy: chalk.bgHex(COLORS.healthy).hex(COLORS.bg).bold,
  bgWarning: chalk.bgHex(COLORS.warning).hex(COLORS.bg).bold,
  bgCritical: chalk.bgHex(COLORS.critical).hex(COLORS.bg).bold,
  bgInfo: chalk.bgHex(COLORS.info).hex(COLORS.bg).bold,
  bgBrand: chalk.bgHex(COLORS.brand1).hex(COLORS.bg).bold,
  bgP0: chalk.bgHex(COLORS.p0).hex("#fff").bold,
  bgP1: chalk.bgHex(COLORS.p1).hex(COLORS.bg).bold,
  bgP2: chalk.bgHex(COLORS.p2).hex(COLORS.bg).bold,
};

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
// ICONS
// ════════════════════════════════════════════════════════════════════════════

export const ICON = {
  // Medical/Doctor theme
  doctor: "🩺",
  pulse: "💓",
  health: "🏥",
  pill: "💊",
  syringe: "💉",
  dna: "🧬",
  microscope: "🔬",

  // Categories
  docs: "📚",
  dx: "⚡",
  ci: "🔄",
  tests: "🧪",
  governance: "📋",
  security: "🔐",

  // Priorities
  p0: "🚨",
  p1: "⚠️",
  p2: "💡",

  // Status
  check: "✓",
  cross: "✗",
  warn: "⚠",
  info: "ℹ",
  dot: "●",
  healthy: "✅",
  warning: "⚡",
  critical: "❌",

  // Actions
  analyze: "🔍",
  report: "📊",
  fix: "🔧",
  copy: "📋",
  save: "💾",
  refresh: "🔄",

  // Misc
  rocket: "🚀",
  sparkle: "✨",
  fire: "🔥",
  bolt: "⚡",
  star: "★",
  heart: "♥",
  model: "🤖",
  github: "🐙",
  folder: "📁",
  file: "📄",
  lock: "🔒",
};

// ════════════════════════════════════════════════════════════════════════════
// ASCII ART HEADER
// ════════════════════════════════════════════════════════════════════════════

const LOGO_LINES = [
  "██████╗ ███████╗██████╗  ██████╗     ██████╗  ██████╗  ██████╗████████╗ ██████╗ ██████╗ ",
  "██╔══██╗██╔════╝██╔══██╗██╔═══██╗    ██╔══██╗██╔═══██╗██╔════╝╚══██╔══╝██╔═══██╗██╔══██╗",
  "██████╔╝█████╗  ██████╔╝██║   ██║    ██║  ██║██║   ██║██║        ██║   ██║   ██║██████╔╝",
  "██╔══██╗██╔══╝  ██╔═══╝ ██║   ██║    ██║  ██║██║   ██║██║        ██║   ██║   ██║██╔══██╗",
  "██║  ██║███████╗██║     ╚██████╔╝    ██████╔╝╚██████╔╝╚██████╗   ██║   ╚██████╔╝██║  ██║",
  "╚═╝  ╚═╝╚══════╝╚═╝      ╚═════╝     ╚═════╝  ╚═════╝  ╚═════╝   ╚═╝    ╚═════╝ ╚═╝  ╚═╝",
];

// Big stylized ASCII art logo for chat mode - REPO DOCTOR side by side
const BIG_LOGO_LINES = [
  "██████╗ ███████╗██████╗  ██████╗     ██████╗  ██████╗  ██████╗████████╗ ██████╗ ██████╗ ",
  "██╔══██╗██╔════╝██╔══██╗██╔═══██╗    ██╔══██╗██╔═══██╗██╔════╝╚══██╔══╝██╔═══██╗██╔══██╗",
  "██████╔╝█████╗  ██████╔╝██║   ██║    ██║  ██║██║   ██║██║        ██║   ██║   ██║██████╔╝",
  "██╔══██╗██╔══╝  ██╔═══╝ ██║   ██║    ██║  ██║██║   ██║██║        ██║   ██║   ██║██╔══██╗",
  "██║  ██║███████╗██║     ╚██████╔╝    ██████╔╝╚██████╔╝╚██████╗   ██║   ╚██████╔╝██║  ██║",
  "╚═╝  ╚═╝╚══════╝╚═╝      ╚═════╝     ╚═════╝  ╚═════╝  ╚═════╝   ╚═╝    ╚═════╝ ╚═╝  ╚═╝",
];

// Gradient from teal to blue
const GRADIENT_COLORS = [
  "#00d4aa",
  "#00c4b0",
  "#00b4b6",
  "#00a4bc",
  "#0094c2",
  "#0084c8",
];

// Gradient for big logo (coral/pink to teal - vibrant medical theme)
const BIG_LOGO_GRADIENT = [
  "#ff6b6b",  // Line 1 - coral
  "#ff8e72",  // Line 2 - coral-orange
  "#ffa07a",  // Line 3 - light coral
  "#00d4aa",  // Line 4 - teal
  "#00c8a8",  // Line 5 - teal
  "#00bca6",  // Line 6 - teal
];

export function renderLogo(): string[] {
  return LOGO_LINES.map((line, i) => {
    const color = GRADIENT_COLORS[i] ?? GRADIENT_COLORS[GRADIENT_COLORS.length - 1] ?? "#00d4aa";
    return chalk.hex(color)(line);
  });
}

/**
 * Render the big colorful logo for chat mode
 * REPO in coral gradient, DOCTOR in teal gradient
 */
export function renderBigLogo(): string[] {
  // Split position - where "REPO" ends and space before "DOCTOR" begins
  const splitPos = 36; // After "██████╗ " (REPO O ends here)
  
  return BIG_LOGO_LINES.map((line, i) => {
    const repoColor = BIG_LOGO_GRADIENT[i] ?? "#ff6b6b";
    const doctorColor = GRADIENT_COLORS[i] ?? "#00d4aa";
    
    const repoPart = line.slice(0, splitPos);
    const doctorPart = line.slice(splitPos);
    
    return chalk.hex(repoColor).bold(repoPart) + chalk.hex(doctorColor).bold(doctorPart);
  });
}

/**
 * Render a compact version of the logo for smaller terminals
 */
export function renderCompactLogo(): string[] {
  return [
    c.brand("╭─────────────────────────────────────────╮"),
    c.brand("│") + c.brandBold("  🩺 REPO DOCTOR ") + c.dim("v2.0") + c.brand("                  │"),
    c.brand("│") + c.dim("     GitHub Repository Health Analyzer") + c.brand(" │"),
    c.brand("╰─────────────────────────────────────────╯"),
  ];
}

// ════════════════════════════════════════════════════════════════════════════
// BOX HELPERS
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

/**
 * Draw a horizontal line
 */
export function line(width: number, char = BOX.h): string {
  return c.border(char.repeat(width));
}

/**
 * Draw a box around content
 */
export function box(
  content: string[],
  options: {
    width?: number;
    title?: string;
    titleAlign?: "left" | "center" | "right";
    padding?: number;
    borderColor?: typeof c.border;
  } = {}
): string[] {
  const {
    width = 80,
    title,
    titleAlign = "left",
    padding = 1,
    borderColor = c.border,
  } = options;

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
    result.push(borderColor(BOX.v) + " ".repeat(innerWidth) + borderColor(BOX.v));
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
    result.push(borderColor(BOX.v) + " ".repeat(innerWidth) + borderColor(BOX.v));
  }

  // Bottom border
  result.push(borderColor(BOX.bl + BOX.h.repeat(innerWidth) + BOX.br));

  return result;
}

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
export function categoryBar(label: string, score: number, icon: string, width = 30): string {
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

// ════════════════════════════════════════════════════════════════════════════
// CATEGORY HELPERS
// ════════════════════════════════════════════════════════════════════════════

export const CATEGORY_ICONS: Record<string, string> = {
  docs: ICON.docs,
  dx: ICON.dx,
  ci: ICON.ci,
  tests: ICON.tests,
  governance: ICON.governance,
  security: ICON.security,
};

export const CATEGORY_LABELS: Record<string, string> = {
  docs: "Docs & Onboarding",
  dx: "Developer Experience",
  ci: "CI/CD",
  tests: "Quality & Tests",
  governance: "Governance",
  security: "Security",
};

export const PRIORITY_ICONS: Record<string, string> = {
  P0: ICON.p0,
  P1: ICON.p1,
  P2: ICON.p2,
};

export const PRIORITY_LABELS: Record<string, string> = {
  P0: "Critical Issues",
  P1: "High Priority",
  P2: "Suggestions",
};
