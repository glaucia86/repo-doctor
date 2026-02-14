/**
 * Agent module exports
 */

// Prompts
export {
  SYSTEM_PROMPT,
  QUICK_SYSTEM_PROMPT,
  DEEP_SYSTEM_PROMPT,
  composeSystemPrompt,
  getSystemPrompt,
  buildSystemPrompt,
  buildAnalysisPrompt,
  type PromptOptions,
  type AnalysisPromptOptions,
  type AnalysisMode,
  type PromptComposerOptions,
} from "./prompts/index.js";

// Event handling
export {
  createEventHandler,
  createPhases,
  DEFAULT_PHASES,
  type AnalysisPhase,
  type EventHandlerOptions,
  type EventHandlerState,
} from "./eventHandler.js";

// Guardrails (loop detection, step limits)
export {
  ToolCallTracker,
  type ToolCall,
  type LoopDetectionResult,
  type TrackerConfig,
  DEFAULT_TRACKER_CONFIG,
} from "./toolCallTracker.js";

export {
  AgentGuardrails,
  createGuardrails,
  type GuardrailAction,
  type GuardrailsConfig,
  DEFAULT_GUARDRAILS_CONFIG,
} from "./guardrails.js";
