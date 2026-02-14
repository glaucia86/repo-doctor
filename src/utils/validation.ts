import { z } from "zod";
import { AnalyzeOptionsSchema, type AnalyzeOptions } from "../domain/types/schema.js";
import { type CLIAnalyzeOptions } from "../presentation/cli/types.js";

/**
 * Validate and sanitize AnalyzeOptions using Zod schema
 * Throws detailed error if validation fails
 */
export function validateAnalyzeOptions(options: unknown): AnalyzeOptions {
  try {
    return AnalyzeOptionsSchema.parse(options);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues.map(issue =>
        `  • ${issue.path.join('.')}: ${issue.message}`
      ).join('\n');
      throw new Error(`Invalid analyze options:\n${issues}`);
    }
    throw error;
  }
}

/**
 * Validate CLI-specific options (extends core options with CLI flags)
 */
export function validateCLIAnalyzeOptions(options: unknown): CLIAnalyzeOptions {
  // CLI chat mode does not require repoUrl upfront.
  // The repository is provided later by user input or command arguments.
  const schema = AnalyzeOptionsSchema.partial({ repoUrl: true }).extend({
    deep: z.boolean().optional(),
    issue: z.boolean().optional(),
  });

  try {
    return schema.parse(options);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues.map(issue =>
        `  • ${issue.path.join('.')}: ${issue.message}`
      ).join('\n');
      throw new Error(`Invalid CLI analyze options:\n${issues}`);
    }
    throw error;
  }
}

/**
 * Safely validate AnalyzeOptions with fallback defaults
 * Returns validated options or throws with detailed error
 */
export function safeValidateAnalyzeOptions(
  options: unknown,
  defaults: Partial<AnalyzeOptions> = {}
): AnalyzeOptions {
  const merged = { ...defaults, ...(options as object) };
  return validateAnalyzeOptions(merged);
}

/**
 * Safely validate CLI AnalyzeOptions with fallback defaults
 */
export function safeValidateCLIAnalyzeOptions(
  options: unknown,
  defaults: Partial<CLIAnalyzeOptions> = {}
): CLIAnalyzeOptions {
  const merged = { ...defaults, ...(options as object) };
  return validateCLIAnalyzeOptions(merged);
}

