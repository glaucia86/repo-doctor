/**
 * Agent module exports
 */

// Prompts
export {
  SYSTEM_PROMPT,
  buildSystemPrompt,
  buildAnalysisPrompt,
  type PromptOptions,
  type AnalysisPromptOptions,
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
