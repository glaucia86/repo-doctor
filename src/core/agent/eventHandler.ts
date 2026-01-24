/**
 * Event Handler for Copilot SDK Sessions
 * Single Responsibility: Handle session events and update state
 */

import type { SessionEvent } from "@github/copilot-sdk";
import {
  updateSpinner,
  c,
  ICON,
} from "../../ui/index.js";
import type { AgentGuardrails, GuardrailAction } from "./guardrails.js";

// ════════════════════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════════════════════

export interface AnalysisPhase {
  name: string;
  status: "pending" | "running" | "done" | "error";
}

export interface EventHandlerOptions {
  /** Verbose mode - log all events */
  verbose: boolean;
  /** Silent mode - no output */
  silent: boolean;
  /** JSON output format */
  json: boolean;
  /** Reference to spinner for updates */
  hasSpinner: boolean;
  /** Optional guardrails for loop detection */
  guardrails?: AgentGuardrails;
}

export interface EventHandlerState {
  /** Buffer to collect all output */
  outputBuffer: string;
  /** Count of tool calls made */
  toolCallCount: number;
  /** Current phase index */
  currentPhaseIndex: number;
  /** Analysis phases */
  phases: AnalysisPhase[];
  /** Whether analysis was aborted by guardrails */
  aborted: boolean;
  /** Reason for abort (if aborted) */
  abortReason: string;
}

// ════════════════════════════════════════════════════════════════════════════
// DEFAULT PHASES
// ════════════════════════════════════════════════════════════════════════════

export const DEFAULT_PHASES: AnalysisPhase[] = [
  { name: "Fetching repository metadata", status: "pending" },
  { name: "Indexing file tree", status: "pending" },
  { name: "Selecting target files", status: "pending" },
  { name: "Reading governance files", status: "pending" },
  { name: "Analyzing evidence", status: "pending" },
  { name: "Generating report", status: "pending" },
];

/**
 * Create a fresh copy of phases for a new analysis
 */
export function createPhases(): AnalysisPhase[] {
  return DEFAULT_PHASES.map((p) => ({ ...p }));
}

// ════════════════════════════════════════════════════════════════════════════
// EVENT HANDLER FACTORY
// ════════════════════════════════════════════════════════════════════════════

/**
 * Create an event handler for a Copilot session
 * Returns a handler function and the state object for reading results
 */
export function createEventHandler(options: EventHandlerOptions): {
  handler: (event: SessionEvent) => void;
  state: EventHandlerState;
} {
  const { verbose, silent, json, hasSpinner, guardrails } = options;

  // Mutable state that will be updated by the handler
  const state: EventHandlerState = {
    outputBuffer: "",
    toolCallCount: 0,
    currentPhaseIndex: 0,
    phases: createPhases(),
    aborted: false,
    abortReason: "",
  };

  const handler = (event: SessionEvent): void => {
    // If aborted, only process message events (for partial results)
    if (state.aborted && event.type !== "assistant.message_delta" && event.type !== "assistant.message") {
      return;
    }

    // Debug: log all events in verbose mode
    if (verbose && !json) {
      console.log(`\n  ${c.dim(`[EVENT] ${event.type}`)}`);
    }

    switch (event.type) {
      case "assistant.message_delta":
        if (!silent && !json) {
          process.stdout.write(event.data.deltaContent);
        }
        // Capture ALL delta content
        state.outputBuffer += event.data.deltaContent;
        break;

      case "assistant.message":
        // Full message event (non-streaming)
        if (event.data?.content) {
          if (!silent && !json) {
            console.log(event.data.content);
          }
          // IMPORTANT: Also add to output buffer for /copy and /export
          state.outputBuffer += event.data.content;
        }
        break;

      case "tool.execution_start":
        // Skip if aborted
        if (state.aborted) {
          return;
        }

        state.toolCallCount++;
        const toolName = event.data?.toolName || "tool";
        const toolArgs = event.data?.arguments || {};

        // Check guardrails for loop detection (if provided)
        if (guardrails) {
          const action = guardrails.onToolStart(toolName, toolArgs);
          handleGuardrailAction(action, state, { verbose, silent, json });
        }

        // Update phase based on tool being called
        updatePhaseFromTool(toolName, state);

        if (verbose && !json) {
          console.log(
            `\n  ${c.dim(`→ [${state.toolCallCount}] Calling ${toolName}...`)}`
          );
        } else if (!silent && !json && hasSpinner) {
          updateSpinner(`Analyzing... (${state.toolCallCount} API calls)`);
        }
        break;

      case "tool.execution_complete":
        if (verbose && !json) {
          const icon = c.healthy(ICON.check);
          console.log(`  ${icon} ${c.dim("Tool completed")}`);
        }
        break;

      case "session.idle":
        // Mark all phases as done
        for (const phase of state.phases) {
          if (phase.status !== "error") {
            phase.status = "done";
          }
        }
        if (!silent && !json) {
          console.log("\n");
        }
        break;

      default:
        // Log unknown events in verbose mode
        if (verbose && !json) {
          console.log(
            `  ${c.dim(`[UNKNOWN] ${JSON.stringify(event).slice(0, 100)}...`)}`
          );
        }
        break;
    }
  };

  return { handler, state };
}

// ════════════════════════════════════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════════════════════════════════════

/**
 * Handle guardrail action and update state accordingly
 */
function handleGuardrailAction(
  action: GuardrailAction,
  state: EventHandlerState,
  options: { verbose: boolean; silent: boolean; json: boolean }
): void {
  const { silent, json } = options;

  switch (action.type) {
    case "warn":
      if (!silent && !json) {
        console.log(`\n  ${c.warning(`⚠️ [Guardrail] ${action.message}`)}`);
      }
      break;

    case "inject-message":
      // Inject guidance message to help the agent replan
      if (!silent && !json) {
        console.log(`\n${c.warning(action.message)}`);
      }
      // Also add to buffer so it's visible in the report context
      state.outputBuffer += `\n\n${action.message}\n\n`;
      break;

    case "abort":
      // Set abort flag to prevent further tool executions
      state.aborted = true;
      state.abortReason = action.reason;
      if (!silent && !json) {
        console.log(`\n  ${c.error(`🛑 [Guardrail ABORT] ${action.reason}`)}`);
        console.log(`\n  ${c.dim("Stopping analysis. Partial results shown above.")}`);
      }
      // Add abort notice to output
      state.outputBuffer += `\n\n---\n⚠️ **Analysis stopped**: ${action.reason}\n---\n`;
      break;
  }
}

/**
 * Update phase status based on which tool is being called
 */
function updatePhaseFromTool(toolName: string, state: EventHandlerState): void {
  const { phases } = state;

  if (toolName.includes("meta") && state.currentPhaseIndex === 0) {
    if (phases[0]) phases[0].status = "running";
  } else if (toolName.includes("list") && state.currentPhaseIndex <= 1) {
    if (phases[0]) phases[0].status = "done";
    if (phases[1]) phases[1].status = "running";
    state.currentPhaseIndex = 1;
  } else if (toolName.includes("read") && state.currentPhaseIndex <= 3) {
    if (phases[1]) phases[1].status = "done";
    if (phases[2]) phases[2].status = "done";
    if (phases[3]) phases[3].status = "running";
    state.currentPhaseIndex = 3;
  } else if (toolName.includes("pack") && state.currentPhaseIndex <= 4) {
    // Deep analysis mode
    if (phases[3]) phases[3].status = "done";
    if (phases[4]) phases[4].status = "running";
    state.currentPhaseIndex = 4;
  }
}
