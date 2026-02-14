/**
 * Prompts module exports
 */

// Main system prompts (composed from modules)
export {
  SYSTEM_PROMPT,
  QUICK_SYSTEM_PROMPT,
  DEEP_SYSTEM_PROMPT,
  composeSystemPrompt,
  getSystemPrompt,
  buildSystemPrompt,
  type PromptOptions,
  type AnalysisMode,
  type PromptComposerOptions,
} from "./systemPrompt.js";

// Analysis prompt builder
export { buildAnalysisPrompt, type AnalysisPromptOptions } from "./analysisPrompt.js";

// Re-export base modules for advanced usage
export * from "./base/index.js";
export * from "./modes/index.js";
export * from "./composers/index.js";
