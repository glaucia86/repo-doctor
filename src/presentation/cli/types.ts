/**
 * CLI-specific types that extend core types
 */

import { type AnalyzeOptions as CoreAnalyzeOptions } from "../../domain/types/schema.js";

export interface CLIAnalyzeOptions extends Omit<CoreAnalyzeOptions, "repoUrl"> {
  /** Optional in interactive chat mode; resolved when user provides repo input */
  repoUrl?: string;
  /** Enable deep analysis using Repomix for comprehensive codebase analysis */
  deep?: boolean;
  /** Publish analysis results as GitHub issues */
  issue?: boolean;
}
