/**
 * Agent Guardrails
 * Single Responsibility: Provide safety mechanisms for agent execution
 * 
 * This module provides guardrails that prevent the agent from getting stuck
 * in loops, exceeding limits, or behaving unexpectedly.
 */

import { ToolCallTracker, type LoopDetectionResult, type TrackerConfig } from "./toolCallTracker.js";

// ════════════════════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════════════════════

export type GuardrailAction = 
  | { type: "continue" }
  | { type: "warn"; message: string }
  | { type: "inject-message"; message: string }
  | { type: "abort"; reason: string };

export interface GuardrailsConfig extends TrackerConfig {
  /** Whether to log guardrail events */
  verbose: boolean;
  /** Action to take when loop is detected */
  onLoopAction: "warn" | "inject" | "abort";
}

// ════════════════════════════════════════════════════════════════════════════
// DEFAULT CONFIG
// ════════════════════════════════════════════════════════════════════════════

export const DEFAULT_GUARDRAILS_CONFIG: GuardrailsConfig = {
  maxToolCalls: 50,
  maxConsecutiveRepeats: 5,
  minSequenceLength: 3,
  timeWindowMs: 120000,
  verbose: false,
  onLoopAction: "warn",
};

// ════════════════════════════════════════════════════════════════════════════
// AGENT GUARDRAILS CLASS
// ════════════════════════════════════════════════════════════════════════════

export class AgentGuardrails {
  private tracker: ToolCallTracker;
  private config: GuardrailsConfig;
  private warningCount: number = 0;
  private lastLoopResult: LoopDetectionResult | null = null;

  constructor(config: Partial<GuardrailsConfig> = {}) {
    this.config = { ...DEFAULT_GUARDRAILS_CONFIG, ...config };
    this.tracker = new ToolCallTracker(this.config);
  }

  /**
   * Called when a tool execution starts
   * Returns an action to take based on guardrail checks
   */
  onToolStart(toolName: string, args: unknown): GuardrailAction {
    // Record the call
    this.tracker.recordCall(toolName, args);

    // Check for loop conditions
    const loopResult = this.tracker.detectLoop();
    this.lastLoopResult = loopResult;

    if (!loopResult.isLoop) {
      return { type: "continue" };
    }

    // Log if verbose
    if (this.config.verbose) {
      console.error(`[Guardrail] ${loopResult.type}: ${loopResult.message}`);
    }

    // Handle based on loop type and configured action
    return this.determineAction(loopResult);
  }

  /**
   * Determine what action to take based on loop detection
   */
  private determineAction(loopResult: LoopDetectionResult): GuardrailAction {
    // Step limit is always an abort
    if (loopResult.type === "step-limit") {
      return {
        type: "abort",
        reason: loopResult.message,
      };
    }

    this.warningCount++;

    // First occurrence: warn
    if (this.warningCount === 1) {
      return {
        type: "warn",
        message: loopResult.message,
      };
    }

    // Second occurrence: inject a replan message
    if (this.warningCount === 2 && this.config.onLoopAction !== "abort") {
      return {
        type: "inject-message",
        message: this.getReplanMessage(loopResult),
      };
    }

    // Third occurrence or configured to abort: abort
    return {
      type: "abort",
      reason: `Loop detected after ${this.warningCount} warnings: ${loopResult.message}`,
    };
  }

  /**
   * Generate a message to help the agent replan
   */
  private getReplanMessage(loopResult: LoopDetectionResult): string {
    const messages = {
      "exact-repeat": `
⚠️ LOOP DETECTED: You are repeating the same tool call with identical arguments.
This is not productive. Please:
1. Review what information you already have
2. Either proceed to generate the report with available data
3. Or try a DIFFERENT approach to get the missing information

Do NOT call the same tool with the same arguments again.`,

      "sequence-loop": `
⚠️ LOOP DETECTED: You are repeating the same sequence of tool calls.
This suggests you may be stuck. Please:
1. Stop and assess what you have learned so far
2. Generate the health report with the evidence you have collected
3. Note any limitations in your analysis due to missing information

Proceed to output the final report now.`,

      "none": "",
      "step-limit": "",
    };

    return messages[loopResult.type] || messages["exact-repeat"];
  }

  /**
   * Get current statistics
   */
  getStats(): {
    totalCalls: number;
    warningCount: number;
    lastLoopType: string | null;
    toolUsage: { tool: string; count: number }[];
  } {
    return {
      totalCalls: this.tracker.getCallCount(),
      warningCount: this.warningCount,
      lastLoopType: this.lastLoopResult?.type || null,
      toolUsage: this.tracker.getSummary(),
    };
  }

  /**
   * Check if we should abort
   */
  shouldAbort(): boolean {
    return this.warningCount >= 3 || 
           this.lastLoopResult?.type === "step-limit";
  }

  /**
   * Reset for a new session
   */
  reset(): void {
    this.tracker.reset();
    this.warningCount = 0;
    this.lastLoopResult = null;
  }
}

// ════════════════════════════════════════════════════════════════════════════
// FACTORY FUNCTION
// ════════════════════════════════════════════════════════════════════════════

/**
 * Create guardrails with sensible defaults for different scenarios
 */
export function createGuardrails(
  mode: "standard" | "deep" | "strict" = "standard"
): AgentGuardrails {
  const configs: Record<string, Partial<GuardrailsConfig>> = {
    standard: {
      maxToolCalls: 50,
      maxConsecutiveRepeats: 5,
      minSequenceLength: 3,
      onLoopAction: "warn",
    },
    deep: {
      maxToolCalls: 80,        // Allow more for deep analysis
      maxConsecutiveRepeats: 6,
      minSequenceLength: 4,
      onLoopAction: "warn",
    },
    strict: {
      maxToolCalls: 30,
      maxConsecutiveRepeats: 3,
      minSequenceLength: 2,
      onLoopAction: "abort",
    },
  };

  return new AgentGuardrails(configs[mode]);
}
