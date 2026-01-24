import { CopilotClient, type SessionEvent } from "@github/copilot-sdk";
import { repoTools, deepAnalysisTools } from "../tools/repoTools.js";
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

// Import extracted modules (SOLID refactoring)
import {
  SYSTEM_PROMPT,
  buildAnalysisPrompt,
  createEventHandler,
  createPhases,
  createGuardrails,
  type AnalysisPhase,
} from "./agent/index.js";

// Re-export for backward compatibility
export { SYSTEM_PROMPT };

// ════════════════════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════════════════════

export interface AnalyzeOptions {
  repoUrl: string;
  token?: string;
  model?: string;
  maxFiles?: number;
  maxBytes?: number;
  timeout?: number;
  verbosity?: "silent" | "normal" | "verbose";
  format?: "pretty" | "json" | "minimal";
  /** Enable deep analysis using Repomix for comprehensive codebase analysis */
  deep?: boolean;
}

export interface AnalysisOutput {
  content: string;
  toolCallCount: number;
  durationMs: number;
  repoUrl: string;
  model: string;
}

// ════════════════════════════════════════════════════════════════════════════
// NOTE: SYSTEM_PROMPT, PHASES, and AnalysisPhase moved to ./agent/ (SOLID)
// ════════════════════════════════════════════════════════════════════════════

// ════════════════════════════════════════════════════════════════════════════
// MAIN FUNCTION
// ════════════════════════════════════════════════════════════════════════════

export async function analyzeRepositoryWithCopilot(options: AnalyzeOptions): Promise<AnalysisOutput> {
  const startTime = Date.now();
  
  const {
    repoUrl,
    token,
    model = "claude-sonnet-4",
    maxFiles = 800,
    maxBytes = 204800,
    timeout = 120000,
    verbosity = "normal",
    format = "pretty",
    deep = false,
  } = options;

  const isVerbose = verbosity === "verbose";
  const isSilent = verbosity === "silent";
  const isJson = format === "json";
  const isDeep = deep;

  // Use extracted phase management (SOLID refactoring)
  const phases = createPhases();
  let currentPhaseIndex = 0;

  // Initialize guardrails for loop detection and step limits
  const guardrails = createGuardrails(isDeep ? "deep" : "standard");

  // Start spinner
  let spinner = !isSilent && !isJson ? startSpinner("Initializing Copilot...") : null;

  try {
    // Create and start client
    const client = new CopilotClient();
    await client.start();

    if (spinner) {
      updateSpinner("Creating analysis session...");
    }

    // Create session with tools
    const baseTools = repoTools({ token, maxFiles, maxBytes });
    const tools = isDeep 
      ? [...baseTools, ...deepAnalysisTools({ maxBytes: 512000 })]
      : baseTools;

    const session = await client.createSession({
      model: model,
      streaming: true,
      tools,
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
      // Debug: log all events in verbose mode
      if (isVerbose && !isJson) {
        console.log(`\n  ${c.dim(`[EVENT] ${event.type}`)}`);
      }

      switch (event.type) {
        case "assistant.message_delta":
          if (!isSilent && !isJson) {
            process.stdout.write(event.data.deltaContent);
          }
          // Capture ALL delta content
          outputBuffer += event.data.deltaContent;
          break;

        case "assistant.message":
          // Full message event (non-streaming)
          if (event.data?.content) {
            if (!isSilent && !isJson) {
              console.log(event.data.content);
            }
            // IMPORTANT: Also add to output buffer for /copy and /export
            outputBuffer += event.data.content;
          }
          break;

        case "tool.execution_start":
          toolCallCount++;
          const toolName = event.data?.toolName || "tool";
          const toolArgs = event.data?.arguments || {};
          
          // Check guardrails for loop detection
          const guardrailAction = guardrails.onToolStart(toolName, toolArgs);
          if (guardrailAction.type === "warn" && isVerbose && !isJson) {
            console.log(`\n  ${c.warning(`⚠️ [Guardrail] ${guardrailAction.message}`)}`);
          } else if (guardrailAction.type === "abort") {
            // Log abort reason but don't throw - let timeout handle graceful exit
            if (!isSilent && !isJson) {
              console.log(`\n  ${c.error(`🛑 [Guardrail] ${guardrailAction.reason}`)}`);
            }
          }
          
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

        case "tool.execution_complete":
          if (isVerbose && !isJson) {
            const icon = c.healthy(ICON.check);
            console.log(`  ${icon} ${c.dim("Tool completed")}`);
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
          // Log unknown events in verbose mode
          if (isVerbose && !isJson) {
            console.log(`  ${c.dim(`[UNKNOWN] ${JSON.stringify(event).slice(0, 100)}...`)}`);
          }
          break;
      }
    });

    // Build the analysis prompt using extracted function (SOLID refactoring)
    const prompt = buildAnalysisPrompt({ repoUrl, deep: isDeep });

    // Start analysis spinner
    if (!isSilent && !isJson) {
      // Print analysis info box
      const analysisInfoLines = box(
        [
          "",
          `${c.dim("Repository:")} ${c.brand(repoUrl)}`,
          `${c.dim("Model:")} ${c.info(model)}`,
          `${c.dim("Max Files:")} ${c.text(String(maxFiles))}`,
          isDeep ? `${c.dim("Mode:")} ${c.warning("Deep Analysis (Repomix)")}` : "",
          "",
        ].filter(Boolean),
        {
          minWidth: 50,
          maxWidth: 100,
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

    const durationMs = Date.now() - startTime;

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
          c.dim(`Made ${toolCallCount} API calls in ${(durationMs / 1000).toFixed(1)}s`)
      );
      
      // Log guardrail stats in verbose mode
      if (isVerbose) {
        const stats = guardrails.getStats();
        if (stats.warningCount > 0) {
          console.log(
            "  " +
              c.warning(`Guardrail warnings: ${stats.warningCount}`)
          );
        }
      }
      console.log();
    }

    // Return analysis result (DO NOT call process.exit!)
    return {
      content: outputBuffer,
      toolCallCount,
      durationMs,
      repoUrl,
      model,
    };
  } catch (error) {
    if (spinner) {
      spinnerFail("Analysis failed");
    }
    throw error;
  }
}
