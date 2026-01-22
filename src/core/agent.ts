import { CopilotClient, type SessionEvent } from "@github/copilot-sdk";
import { repoTools } from "../tools/repoTools.js";
import type { AnalyzeOptions as BaseOptions } from "../types/schema.js";
import {
  startSpinner,
  updateSpinner,
  spinnerSuccess,
  spinnerFail,
  spinnerWarn,
  printSuccess,
  printError,
  printWarning,
  printHealthHeader,
  printCategoryScores,
  printFindings,
  printNextSteps,
  printGoodbye,
  printProgress,
  c,
  ICON,
  BOX,
  box,
} from "../ui/index.js";

// ════════════════════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════════════════════

export interface AnalyzeOptions {
  repoUrl: string;
  token?: string;
  maxFiles?: number;
  maxBytes?: number;
  timeout?: number;
  verbosity?: "silent" | "normal" | "verbose";
  format?: "pretty" | "json" | "minimal";
}

// ════════════════════════════════════════════════════════════════════════════
// ANALYSIS STATE TRACKING
// ════════════════════════════════════════════════════════════════════════════

interface AnalysisPhase {
  name: string;
  status: "pending" | "running" | "done" | "error";
}

const PHASES: AnalysisPhase[] = [
  { name: "Fetching repository metadata", status: "pending" },
  { name: "Indexing file tree", status: "pending" },
  { name: "Selecting target files", status: "pending" },
  { name: "Reading governance files", status: "pending" },
  { name: "Analyzing evidence", status: "pending" },
  { name: "Generating report", status: "pending" },
];

// ════════════════════════════════════════════════════════════════════════════
// SYSTEM PROMPT
// ════════════════════════════════════════════════════════════════════════════

const SYSTEM_PROMPT = `You are Repo Doctor, an AI-powered GitHub repository health analyzer.

## Your Role
You analyze GitHub repositories to diagnose issues and provide actionable recommendations.
You are methodical, thorough, and always provide evidence for your findings.

## Core Principles

1. **Minimal Reading**: Only read files that are essential for diagnosis.
   - Start with metadata and file tree
   - Prioritize governance files (README, LICENSE, CONTRIBUTING)
   - Read config files (package.json, tsconfig, workflows)
   - Never read source code files unless absolutely necessary

2. **Evidence-Based**: Every finding must have evidence.
   - Reference specific files or configurations
   - Quote relevant content when helpful
   - Explain why something matters

3. **Prioritization**: Classify findings by priority.
   - P0: Critical blockers (missing LICENSE, no CI, no README)
   - P1: High impact issues (CI without tests, no contributing guide)
   - P2: Nice-to-have improvements (badges, templates)

4. **Resilience**: Handle errors gracefully.
   - 404 means file is missing (evidence of absence)
   - Rate limits mean reduce scope, not fail
   - Timeout means generate partial report

5. **Actionability**: Recommendations must be specific.
   - Tell exactly what to create/change
   - Provide examples when helpful
   - Estimate effort/impact when possible

## Analysis Categories

1. **Docs & Onboarding**: README quality, setup instructions, contributing guidelines
2. **Developer Experience (DX)**: npm scripts, Node version, monorepo config
3. **CI/CD**: Workflow presence and quality, test automation
4. **Quality & Tests**: Test framework, linting, formatting, type checking
5. **Governance**: LICENSE, CODE_OF_CONDUCT, SECURITY, templates
6. **Security Basics**: Dependabot/Renovate, security policy

## Output Format

Structure your final report with:
1. Overall health score (0-100%)
2. Category scores
3. Findings grouped by P0, P1, P2 with:
   - Issue title
   - Evidence
   - Impact
   - Recommended action
4. Summary with next steps

## Constraints

- Do NOT execute any commands
- Do NOT download the entire repository
- Do NOT read more than 200KB per file
- Do NOT expose tokens or sensitive data

Begin by stating your analysis plan, then execute step by step.`;

// ════════════════════════════════════════════════════════════════════════════
// MAIN FUNCTION
// ════════════════════════════════════════════════════════════════════════════

export async function analyzeRepositoryWithCopilot(options: AnalyzeOptions): Promise<void> {
  const startTime = Date.now();
  
  const {
    repoUrl,
    token,
    maxFiles = 800,
    maxBytes = 204800,
    timeout = 120000,
    verbosity = "normal",
    format = "pretty",
  } = options;

  const isVerbose = verbosity === "verbose";
  const isSilent = verbosity === "silent";
  const isJson = format === "json";

  // Clone phases for state tracking
  const phases = PHASES.map((p) => ({ ...p }));
  let currentPhaseIndex = 0;

  // Start spinner
  let spinner = !isSilent && !isJson ? startSpinner("Initializing Copilot...") : null;

  try {
    // Create client
    const client = new CopilotClient();

    if (spinner) {
      updateSpinner("Creating analysis session...");
    }

    // Create session with tools
    const session = await client.createSession({
      model: "gpt-4o",
      streaming: true,
      tools: repoTools({ token, maxFiles, maxBytes }),
      systemMessage: {
        mode: "append",
        content: SYSTEM_PROMPT,
      },
    });

    if (spinner) {
      spinnerSuccess("Session created");
      spinner = null;
    }

    // Set up event handling
    let outputBuffer = "";
    let toolCallCount = 0;

    session.on((event: SessionEvent) => {
      switch (event.type) {
        case "assistant.message_delta":
          if (!isSilent && !isJson) {
            process.stdout.write(event.data.deltaContent);
          }
          outputBuffer += event.data.deltaContent;
          break;

        case "tool.execution_start":
          toolCallCount++;
          const toolName = (event as unknown as { tool_name?: string }).tool_name || "tool";
          
          // Update phase based on tool being called
          if (toolName.includes("meta") && currentPhaseIndex === 0) {
            if (phases[0]) phases[0].status = "running";
          } else if (toolName.includes("list") && currentPhaseIndex <= 1) {
            if (phases[0]) phases[0].status = "done";
            if (phases[1]) phases[1].status = "running";
            currentPhaseIndex = 1;
          } else if (toolName.includes("read") && currentPhaseIndex <= 3) {
            if (phases[1]) phases[1].status = "done";
            if (phases[2]) phases[2].status = "done";
            if (phases[3]) phases[3].status = "running";
            currentPhaseIndex = 3;
          }

          if (isVerbose && !isJson) {
            console.log(`\n  ${c.dim(`→ [${toolCallCount}] Calling ${toolName}...`)}`);
          } else if (!isSilent && !isJson && spinner) {
            updateSpinner(`Analyzing... (${toolCallCount} API calls)`);
          }
          break;

        case "session.idle":
          // Mark all phases as done
          for (const phase of phases) {
            if (phase.status !== "error") {
              phase.status = "done";
            }
          }
          if (!isSilent && !isJson) {
            console.log("\n");
          }
          break;

        default:
          // Handle other events like tool.execution_end
          if ((event as unknown as { type: string }).type === "tool.execution_end") {
            const success = (event as unknown as { success?: boolean }).success;
            if (isVerbose && !isJson) {
              const icon = success ? c.healthy(ICON.check) : c.warning(ICON.warn);
              console.log(`  ${icon} ${c.dim("Tool completed")}`);
            }
          }
          break;
      }
    });

    // Build the analysis prompt
    const prompt = `Analyze the GitHub repository: ${repoUrl}

Follow this plan:
1. First, get repository metadata using get_repo_meta
2. List the file tree using list_repo_files to understand structure
3. Read essential files:
   - README.md (or readme alternatives)
   - LICENSE
   - package.json
   - .github/workflows/*.yml
4. Check for governance files:
   - CONTRIBUTING.md
   - CODE_OF_CONDUCT.md
   - SECURITY.md
   - .github/dependabot.yml
5. Analyze all evidence and generate prioritized findings
6. Produce a comprehensive health report with scores and recommendations

Important:
- If a file returns 404, that's evidence of absence (not an error)
- Limit file reads to essential files only
- Group findings by P0/P1/P2 priority

Begin the analysis now.`;

    // Start analysis spinner
    if (!isSilent && !isJson) {
      // Print analysis info box
      const analysisInfoLines = box(
        [
          "",
          `${c.dim("Repository:")} ${c.brand(repoUrl)}`,
          `${c.dim("Model:")} ${c.info("gpt-4o")}`,
          `${c.dim("Max Files:")} ${c.text(String(maxFiles))}`,
          "",
        ],
        {
          width: 70,
          title: `${ICON.analyze} ANALYSIS`,
        }
      );
      for (const line of analysisInfoLines) {
        console.log("  " + line);
      }
      console.log();
    }

    // Run analysis with timeout
    // sendAndWait accepts a second parameter for timeout in milliseconds
    try {
      const response = await session.sendAndWait({ prompt }, timeout);
      
      if (!response && !isSilent && !isJson) {
        printWarning("No response received from Copilot");
      }
    } catch (error) {
      if (error instanceof Error && error.message.toLowerCase().includes("timeout")) {
        printWarning(`Analysis timed out after ${timeout / 1000}s. Partial results shown above.`);
      } else {
        throw error;
      }
    }

    // Cleanup
    await client.stop();

    // Final message
    if (!isSilent && !isJson) {
      // Print completion summary
      console.log();
      console.log(
        "  " +
          c.healthy(ICON.check) +
          " " +
          c.healthyBold("Analysis completed successfully!")
      );
      console.log(
        "  " +
          c.dim(`Made ${toolCallCount} API calls in ${((Date.now() - startTime) / 1000).toFixed(1)}s`)
      );
      printGoodbye();
    }

    process.exit(0);
  } catch (error) {
    if (spinner) {
      spinnerFail("Analysis failed");
    }
    throw error;
  }
}
