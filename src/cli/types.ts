/**
 * CLI-specific types that extend core types
 */

import { type AnalyzeOptions as CoreAnalyzeOptions } from "../types/schema.js";

export interface CLIAnalyzeOptions extends CoreAnalyzeOptions {
  /** Enable deep analysis using Repomix for comprehensive codebase analysis */
  deep?: boolean;
  /** Publish analysis results as GitHub issues */
  issue?: boolean;
}