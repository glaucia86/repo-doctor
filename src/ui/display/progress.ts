/**
 * Progress and status display functions
 * Single Responsibility: Render progress bars and status information
 */

import {
  c,
  box,
  modelBadge,
  progressBar,
  ICON,
} from "../themes.js";

// ════════════════════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════════════════════

export interface AnalysisPhase {
  name: string;
  status: "pending" | "running" | "done" | "error";
}

// ════════════════════════════════════════════════════════════════════════════
// STATUS BAR
// ════════════════════════════════════════════════════════════════════════════

/**
 * Print a status bar with model and quota info
 */
export function printStatusBar(
  model: string,
  isPremium: boolean,
  quota?: { used: number; total: number; isUnlimited?: boolean }
): void {
  console.log();
  const modelDisplay = modelBadge(model, isPremium);

  let quotaDisplay = "";
  if (quota && !quota.isUnlimited) {
    const percent = Math.round((quota.used / quota.total) * 100);
    quotaDisplay =
      c.dim(" │ Quota: ") +
      progressBar(100 - percent, 10) +
      c.dim(` ${quota.used}/${quota.total}`);
  }

  console.log("  " + modelDisplay + quotaDisplay);
  console.log();
}

// ════════════════════════════════════════════════════════════════════════════
// ANALYSIS PROGRESS
// ════════════════════════════════════════════════════════════════════════════

/**
 * Print analysis progress with phases
 */
export function printProgress(phases: AnalysisPhase[], currentPercent: number): void {
  console.log();
  const lines = box(
    [
      "",
      ...phases.map((phase) => {
        let icon = c.muted("○");
        let text = c.dim(phase.name);

        if (phase.status === "running") {
          icon = c.info("◉");
          text = c.info(phase.name);
        } else if (phase.status === "done") {
          icon = c.healthy(ICON.check);
          text = c.text(phase.name);
        } else if (phase.status === "error") {
          icon = c.critical(ICON.cross);
          text = c.critical(phase.name);
        }

        return `  ${icon} ${text}`;
      }),
      "",
      `  ${progressBar(currentPercent, 50)} ${c.dim(`${currentPercent}%`)}`,
      "",
    ],
    {
      width: 70,
      title: `${ICON.analyze} ANALYSIS PROGRESS`,
    }
  );

  for (const line of lines) {
    console.log("  " + line);
  }
}
