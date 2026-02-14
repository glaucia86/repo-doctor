/**
 * Health report display functions
 * Single Responsibility: Render health reports, scores, and findings
 */

import {
  c,
  box,
  healthScore,
  categoryBar,
  ICON,
  CATEGORY_ICONS,
  CATEGORY_LABELS,
  PRIORITY_ICONS,
  PRIORITY_LABELS,
} from "../themes.js";

// ════════════════════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════════════════════

export interface CategoryScore {
  category: string;
  score: number;
}

export interface Finding {
  id: string;
  category: string;
  priority: "P0" | "P1" | "P2";
  title: string;
  evidence: string;
  impact: string;
  action: string;
}

// ════════════════════════════════════════════════════════════════════════════
// HEALTH REPORT FUNCTIONS
// ════════════════════════════════════════════════════════════════════════════

/**
 * Print the health report header with overall score
 */
export function printHealthHeader(score: number): void {
  const lines = box(
    [
      "",
      `  ${healthScore(score)}`,
      "",
    ],
    {
      width: 70,
      title: `${ICON.report} HEALTH REPORT`,
    }
  );

  console.log();
  for (const line of lines) {
    console.log("  " + line);
  }
}

/**
 * Print category scores as bars
 */
export function printCategoryScores(categories: CategoryScore[]): void {
  const lines = box(
    [
      "",
      ...categories.map((cat) =>
        categoryBar(
          CATEGORY_LABELS[cat.category] || cat.category,
          cat.score,
          CATEGORY_ICONS[cat.category] || "📦",
          40
        )
      ),
      "",
    ],
    {
      width: 70,
      padding: 0,
    }
  );

  console.log();
  for (const line of lines) {
    console.log("  " + line);
  }
}

/**
 * Print findings grouped by priority (P0, P1, P2)
 */
export function printFindings(findings: Finding[]): void {
  const priorities: Array<"P0" | "P1" | "P2"> = ["P0", "P1", "P2"];

  for (const priority of priorities) {
    const priorityFindings = findings.filter((f) => f.priority === priority);
    if (priorityFindings.length === 0) continue;

    // Priority header
    const icon = PRIORITY_ICONS[priority];
    const label = PRIORITY_LABELS[priority];
    const count = priorityFindings.length;

    console.log();
    const headerLines = box([], {
      width: 70,
      title: `${icon} ${priority} - ${label} (${count})`,
    });
    console.log("  " + headerLines[0]);

    // Findings
    for (const finding of priorityFindings) {
      console.log();
      printFinding(finding);
    }
  }
}

/**
 * Print a single finding with evidence, impact, and action
 */
export function printFinding(finding: Finding): void {
  const priorityColor =
    finding.priority === "P0"
      ? c.critical
      : finding.priority === "P1"
        ? c.warning
        : c.p2;

  const icon =
    finding.priority === "P0"
      ? ICON.critical
      : finding.priority === "P1"
        ? ICON.warning
        : ICON.p2;

  console.log(`  ${icon} ${priorityColor.bold(finding.title)}`);
  console.log(`     ${c.dim("Evidence:")} ${c.text(finding.evidence)}`);
  console.log(`     ${c.dim("Impact:")} ${c.text(finding.impact)}`);
  console.log(`     ${c.dim("Action:")} ${c.info(finding.action)}`);
}

/**
 * Print recommended next steps
 */
export function printNextSteps(steps: string[]): void {
  const lines = box(
    [
      "",
      ...steps.map((step, i) => `  ${c.number(`${i + 1}.`)} ${c.text(step)}`),
      "",
      `  ${c.brand(ICON.sparkle)} ${c.dim("Run with --verbose for detailed evidence")}`,
      "",
    ],
    {
      width: 70,
      title: `📈 Next Steps`,
    }
  );

  console.log();
  for (const line of lines) {
    console.log("  " + line);
  }
}
