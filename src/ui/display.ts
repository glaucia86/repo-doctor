/**
 * Display module for Repo Doctor CLI
 * Handles screen rendering, panels, and output formatting
 */

import ora, { type Ora } from "ora";
import {
  c,
  BOX,
  ICON,
  COLORS,
  renderLogo,
  renderCompactLogo,
  renderBigLogo,
  box,
  progressBar,
  healthScore,
  categoryBar,
  modelBadge,
  priorityBadge,
  stripAnsi,
  CATEGORY_ICONS,
  CATEGORY_LABELS,
  PRIORITY_ICONS,
  PRIORITY_LABELS,
} from "./themes.js";

// ════════════════════════════════════════════════════════════════════════════
// SPINNER STATE
// ════════════════════════════════════════════════════════════════════════════

let currentSpinner: Ora | null = null;

// ════════════════════════════════════════════════════════════════════════════
// SCREEN MANAGEMENT
// ════════════════════════════════════════════════════════════════════════════

/**
 * Clear the terminal screen
 */
export function clearScreen(): void {
  process.stdout.write("\x1B[2J\x1B[0f");
}

/**
 * Print the logo header
 */
export function printHeader(compact = false): void {
  console.log();
  const logo = compact ? renderCompactLogo() : renderLogo();
  for (const line of logo) {
    console.log("  " + line);
  }
  if (!compact) {
    console.log();
    console.log(
      "  " + c.dim("─".repeat(86))
    );
    console.log(
      "  " +
        c.brand(ICON.doctor) +
        " " +
        c.brandBold("GitHub Repository Health Analyzer") +
        "  " +
        c.dim("│") +
        "  " +
        c.dim("Powered by GitHub Copilot SDK")
    );
    console.log(
      "  " + c.dim("─".repeat(86))
    );
  }
  console.log();
}

// ════════════════════════════════════════════════════════════════════════════
// REPOSITORY INFO
// ════════════════════════════════════════════════════════════════════════════

/**
 * Print repository being analyzed
 */
export function printRepo(owner: string, repo: string): void {
  console.log(
    "  " +
      c.brand(ICON.github) +
      " " +
      c.text("Analyzing: ") +
      c.infoBold(`${owner}/${repo}`)
  );
}

/**
 * Print the current model
 */
export function printModel(model: string, isPremium: boolean): void {
  console.log(
    "  " + c.brand(ICON.model) + " " + c.text("Model: ") + modelBadge(model, isPremium)
  );
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

interface AnalysisPhase {
  name: string;
  status: "pending" | "running" | "done" | "error";
}

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

// ════════════════════════════════════════════════════════════════════════════
// HEALTH REPORT
// ════════════════════════════════════════════════════════════════════════════

interface CategoryScore {
  category: string;
  score: number;
}

/**
 * Print the health report header with score
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
 * Print category scores
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

// ════════════════════════════════════════════════════════════════════════════
// FINDINGS
// ════════════════════════════════════════════════════════════════════════════

export interface Finding {
  id: string;
  category: string;
  priority: "P0" | "P1" | "P2";
  title: string;
  evidence: string;
  impact: string;
  action: string;
}

/**
 * Print findings grouped by priority
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
 * Print a single finding
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

// ════════════════════════════════════════════════════════════════════════════
// NEXT STEPS
// ════════════════════════════════════════════════════════════════════════════

/**
 * Print next steps section
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

// ════════════════════════════════════════════════════════════════════════════
// MESSAGES
// ════════════════════════════════════════════════════════════════════════════

/**
 * Print success message
 */
export function printSuccess(message: string): void {
  console.log();
  console.log("  " + c.healthy(ICON.check) + " " + c.healthyBold(message));
  console.log();
}

/**
 * Print error message
 */
export function printError(message: string): void {
  console.log();
  console.log("  " + c.critical(ICON.cross) + " " + c.criticalBold(message));
  console.log();
}

/**
 * Print warning message
 */
export function printWarning(message: string): void {
  console.log();
  console.log("  " + c.warning(ICON.warn) + " " + c.warningBold(message));
  console.log();
}

/**
 * Print info message
 */
export function printInfo(message: string): void {
  console.log();
  console.log("  " + c.info(ICON.info) + " " + c.infoBold(message));
  console.log();
}

// ════════════════════════════════════════════════════════════════════════════
// SPINNERS
// ════════════════════════════════════════════════════════════════════════════

/**
 * Start a spinner
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
 * Update spinner text
 */
export function updateSpinner(text: string): void {
  if (currentSpinner) {
    currentSpinner.text = c.dim(text);
  }
}

/**
 * Stop spinner with success
 */
export function spinnerSuccess(text?: string): void {
  if (currentSpinner) {
    currentSpinner.succeed(text ? c.healthy(text) : undefined);
    currentSpinner = null;
  }
}

/**
 * Stop spinner with failure
 */
export function spinnerFail(text?: string): void {
  if (currentSpinner) {
    currentSpinner.fail(text ? c.critical(text) : undefined);
    currentSpinner = null;
  }
}

/**
 * Stop spinner with warning
 */
export function spinnerWarn(text?: string): void {
  if (currentSpinner) {
    currentSpinner.warn(text ? c.warning(text) : undefined);
    currentSpinner = null;
  }
}

// ════════════════════════════════════════════════════════════════════════════
// HELP
// ════════════════════════════════════════════════════════════════════════════

/**
 * Print help/usage information
 */
export function printHelp(): void {
  const lines = box(
    [
      "",
      c.whiteBold("Usage:"),
      `  ${c.brand("repo-doctor analyze")} ${c.dim("<repoRef>")} ${c.muted("[options]")}`,
      "",
      c.whiteBold("Repository Reference:"),
      `  ${c.text("https://github.com/owner/repo")}  ${c.dim("Full URL")}`,
      `  ${c.text("owner/repo")}                     ${c.dim("Short form")}`,
      `  ${c.text("git@github.com:owner/repo.git")}  ${c.dim("SSH URL")}`,
      "",
      c.whiteBold("Options:"),
      `  ${c.key("--token")} ${c.dim("<TOKEN>")}    ${c.text("GitHub token for private repos")}`,
      `  ${c.key("--deep")}               ${c.text("Deep analysis with full source code (Repomix)")}`,
      `  ${c.key("--max-files")} ${c.dim("<N>")}   ${c.text("Max files to list (default: 800)")}`,
      `  ${c.key("--max-bytes")} ${c.dim("<N>")}   ${c.text("Max bytes per file (default: 200KB)")}`,
      `  ${c.key("--timeout")} ${c.dim("<ms>")}     ${c.text("Analysis timeout (default: 120000)")}`,
      `  ${c.key("--verbose")}            ${c.text("Show detailed output")}`,
      "",
      c.whiteBold("Examples:"),
      `  ${c.brand("$")} repo-doctor analyze vercel/next.js`,
      `  ${c.brand("$")} repo-doctor analyze vercel/swr --deep`,
      `  ${c.brand("$")} repo-doctor analyze owner/private-repo --token ghp_xxx`,
      "",
    ],
    {
      width: 70,
      title: `${ICON.doctor} REPO DOCTOR HELP`,
    }
  );

  console.log();
  for (const line of lines) {
    console.log("  " + line);
  }
}

// ════════════════════════════════════════════════════════════════════════════
// GOODBYE
// ════════════════════════════════════════════════════════════════════════════

/**
 * Print goodbye message
 */
export function printGoodbye(): void {
  console.log();
  console.log(
    "  " + c.brand(ICON.sparkle) + " " + c.dim("Thanks for using Repo Doctor!")
  );
  console.log();
}

// ════════════════════════════════════════════════════════════════════════════
// CHAT INTERFACE
// ════════════════════════════════════════════════════════════════════════════

const CHAT_WIDTH = 80;

/**
 * Print the chat-style header with big colorful logo
 */
export function printChatHeader(): void {
  console.log();
  console.log();
  
  // Render the big colorful logo
  const logo = renderBigLogo();
  for (const line of logo) {
    console.log("  " + line);
  }
  
  console.log();
  
  // Separator line with gradient effect
  const separator = c.brand("━".repeat(55));
  console.log("  " + separator);
  
  // Tagline
  console.log(
    "  " +
      c.text("AI-Powered GitHub Repository Health Analyzer") +
      c.dim(" │ ") +
      c.premium("v2.0")
  );
  
  console.log("  " + separator);
  console.log();
}

/**
 * Print chat status bar with enhanced styling
 */
export function printChatStatusBar(
  model: string,
  isPremium: boolean,
  lastRepo?: string
): void {
  // Build content first to measure it
  const badge = modelBadge(model, isPremium);
  
  let repoDisplay = "";
  if (lastRepo) {
    repoDisplay = c.dim(" │ ") + c.muted("Last: ") + c.info(lastRepo);
  }
  
  const hint = c.dim(" │ ") + c.brand("/help");
  
  // Calculate content length
  const statusContent = " " + badge + repoDisplay + hint + " ";
  const contentLen = stripAnsi(statusContent).length;
  
  // Dynamic width: content + some padding, min 55, max 100
  const innerWidth = Math.max(55, Math.min(100, contentLen + 4));
  const padding = innerWidth - contentLen;
  
  // Top border with brand color
  console.log("  " + c.brand(BOX.tl + BOX.h.repeat(innerWidth) + BOX.tr));
  
  // Status content
  console.log("  " + c.brand(BOX.v) + statusContent + " ".repeat(Math.max(0, padding)) + c.brand(BOX.v));
  
  // Bottom border
  console.log("  " + c.brand(BOX.bl + BOX.h.repeat(innerWidth) + BOX.br));
  console.log();
}

/**
 * Print the command menu
 */
export function printCommandMenu(): void {
  console.log();
  console.log("  " + c.whiteBold(ICON.sparkle + " Available Commands"));
  console.log("  " + c.border("─".repeat(CHAT_WIDTH - 4)));
  console.log();
  
  // Analysis Commands
  console.log("  " + c.brand(ICON.analyze + " Analysis"));
  console.log(`   ${c.info("/analyze")} ${c.dim("<repo>")}  ${c.muted("Analyze a repository")}`);
  console.log(`   ${c.info("/deep")} ${c.dim("<repo>")}     ${c.muted("Deep analysis with source code (Repomix)")}`);
  console.log(`   ${c.info("/last")}            ${c.muted("Show last analysis")}`);
  console.log(`   ${c.info("/history")}         ${c.muted("Recent analyses")}`);
  console.log();
  
  // Output Commands
  console.log("  " + c.brand(ICON.save + " Output"));
  console.log(`   ${c.info("/export")} ${c.dim("[path]")}   ${c.muted("Export report to file")}`);
  console.log(`   ${c.info("/copy")}            ${c.muted("Copy report to clipboard")}`);
  console.log();
  
  // Utility Commands
  console.log("  " + c.brand("⚙️  Utility"));
  console.log(`   ${c.info("/model")} ${c.dim("[name]")}   ${c.muted("Switch AI model")}`);
  console.log(`   ${c.info("/clear")}           ${c.muted("Clear screen")}`);
  console.log(`   ${c.info("/help")}            ${c.muted("Show this help")}`);
  console.log(`   ${c.info("/quit")}            ${c.muted("Exit Repo Doctor")}`);
  console.log();
  
  console.log("  " + c.border("─".repeat(CHAT_WIDTH - 4)));
  console.log("  " + c.dim("💡 Tip: ") + c.muted("You can also paste a repo URL directly to analyze it"));
  console.log();
}

/**
 * Print analysis history
 */
export function printHistory(
  history: Array<{ repo: string; score: number; date: string; findings: number }>
): void {
  if (history.length === 0) {
    console.log();
    console.log("  " + c.muted("No analysis history yet."));
    console.log("  " + c.dim("Use /analyze <repo> to analyze a repository."));
    console.log();
    return;
  }

  console.log();
  console.log("  " + c.whiteBold(ICON.report + " Recent Analyses"));
  console.log("  " + c.border("─".repeat(CHAT_WIDTH - 4)));
  console.log();

  for (let i = 0; i < history.length; i++) {
    const item = history[i];
    if (!item) continue;
    
    const num = c.number(`  ${i + 1}.`);
    const scoreColor = item.score >= 70 ? c.healthy : item.score >= 50 ? c.warning : c.critical;
    
    console.log(
      `${num} ${c.info(item.repo)} ${c.dim("│")} ${scoreColor(`${item.score}%`)} ${c.dim("│")} ${c.muted(item.findings + " findings")} ${c.dim("│")} ${c.muted(item.date)}`
    );
  }
  console.log();
}

/**
 * Print export success message
 */
export function printExportSuccess(paths: { fullReportPath: string; summaryPath: string }): void {
  console.log();
  console.log("  " + c.healthy(ICON.check) + " " + c.healthyBold("Reports exported successfully!"));
  console.log();
  console.log("  " + c.dim("Full Report: ") + c.info(paths.fullReportPath));
  console.log("  " + c.dim("Summary:     ") + c.info(paths.summaryPath));
  console.log();
}

/**
 * Print model selection menu
 */
export function printModelMenu(
  models: Array<{ id: string; name: string; premium: boolean }>,
  currentModel: string
): void {
  console.log();
  console.log("  " + c.whiteBold(ICON.model + " Available Models"));
  console.log("  " + c.border("─".repeat(CHAT_WIDTH - 4)));
  console.log();

  for (const model of models) {
    const isCurrent = model.id === currentModel;
    const prefix = isCurrent ? c.healthy("● ") : c.muted("○ ");
    const badge = modelBadge(model.name, model.premium);
    const current = isCurrent ? c.dim(" (current)") : "";
    
    console.log(`  ${prefix}${badge}${current}`);
  }
  console.log();
  console.log("  " + c.dim("Use: ") + c.info("/model <model-name>") + c.dim(" to switch"));
  console.log();
}

/**
 * Print welcome message for chat mode
 */
export function printWelcome(): void {
  console.log(
    "  " + c.brand(ICON.doctor) + " " + c.brandBold("Enter Repository URL")
  );
  console.log();
}

/**
 * Print quick commands reference on startup
 */
export function printQuickCommands(): void {
  console.log("  " + c.dim("─".repeat(55)));
  console.log();
  console.log("  " + c.whiteBold("⚡ Quick Commands"));
  console.log();
  console.log(`    ${c.info("/analyze")} ${c.dim("<repo>")}  ${c.muted("Standard governance analysis")}`);
  console.log(`    ${c.info("/deep")} ${c.dim("<repo>")}     ${c.muted("Deep analysis with source code")}`);
  console.log(`    ${c.info("/model")}           ${c.muted("Switch AI model")}`);
  console.log(`    ${c.info("/help")}            ${c.muted("See all commands")}`);
  console.log();
  console.log("  " + c.dim("💡 Tip: Paste a GitHub URL directly to analyze"));
  console.log();
}

/**
 * Print prompt prefix with cursor
 */
export function printPrompt(): void {
  process.stdout.write(c.brand("  ❯ "));
}

/**
 * Print unknown command message
 */
export function printUnknownCommand(input: string): void {
  console.log();
  console.log(
    "  " + c.warning(ICON.warn) + " " + c.warningBold("Unknown command: ") + c.text(input)
  );
  console.log("  " + c.dim("Type /help to see available commands"));
  console.log();
}

// ════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ════════════════════════════════════════════════════════════════════════════

export * from "./themes.js";
