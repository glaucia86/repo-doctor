/**
 * Color Palette and Chalk Shortcuts
 * Single Responsibility: Color definitions and chalk instances
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
