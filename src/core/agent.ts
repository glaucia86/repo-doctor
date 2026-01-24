import { CopilotClient } from "@github/copilot-sdk";
import { repoTools, deepAnalysisTools } from "../tools/repoTools.js";
import {
  startSpinner,
  updateSpinner,
  spinnerSuccess,
  spinnerFail,
  printWarning,
  c,
  ICON,
  box,
} from "../ui/index.js";

// Import extracted modules (SOLID refactoring)
import {
  SYSTEM_PROMPT,
  buildAnalysisPrompt,
  createGuardrails,
  createEventHandler,
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

    // Set up event handling using shared handler (SOLID - single source of truth)
    const { handler, state } = createEventHandler({
      verbose: isVerbose,
      silent: isSilent,
      json: isJson,
      hasSpinner: !!spinner,
      guardrails,
    });

    session.on(handler);

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
      
      if (state.aborted) {
        console.log(
          "  " +
            c.warning(ICON.warn) +
            " " +
            c.warningBold("Analysis stopped by guardrails")
        );
        console.log(
          "  " +
            c.dim(`Reason: ${state.abortReason}`)
        );
      } else {
        console.log(
          "  " +
            c.healthy(ICON.check) +
            " " +
            c.healthyBold("Analysis completed successfully!")
        );
      }
      
      console.log(
        "  " +
          c.dim(`Made ${state.toolCallCount} API calls in ${(durationMs / 1000).toFixed(1)}s`)
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
      content: state.outputBuffer,
      toolCallCount: state.toolCallCount,
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
