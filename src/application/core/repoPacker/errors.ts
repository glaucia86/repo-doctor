/**
 * Error Handling for Repomix Operations
 * Single Responsibility: Error categorization and sanitization
 */

import type { PackErrorReason } from "./types.js";

// ─────────────────────────────────────────────────────────────
// Error Categorization
// ─────────────────────────────────────────────────────────────

/**
 * Categorizes an error message into a structured error reason.
 *
 * This function uses specific patterns that are more robust than simple
 * substring matching. Patterns are designed to match:
 * - Explicit error codes/statuses (e.g., "HTTP 404", "status code 403")
 * - Well-known error messages from git/npm/repomix
 * - Structural patterns unlikely to appear in regular content
 */
export function categorizeError(message: string): PackErrorReason {
  const lower = message.toLowerCase();

  // Timeout errors - check for explicit timeout indicators
  if (
    lower.includes("timed out") ||
    lower.includes("timeout") ||
    lower.includes("etimedout") ||
    lower.includes("esockettimedout")
  ) {
    return "TIMEOUT";
  }

  // Repository not found - check for HTTP 404 or explicit "not found" patterns
  // Use more specific patterns to avoid false positives
  if (
    /\b(http\s*)?404\b/.test(lower) ||
    /status\s*(code\s*)?404/.test(lower) ||
    lower.includes("repository not found") ||
    lower.includes("repo not found") ||
    lower.includes("could not find repository") ||
    lower.includes("does not exist")
  ) {
    return "REPO_NOT_FOUND";
  }

  // Rate limiting - check for HTTP 403/429 or explicit rate limit messages
  if (
    /\b(http\s*)?403\b/.test(lower) ||
    /\b(http\s*)?429\b/.test(lower) ||
    /status\s*(code\s*)?(403|429)/.test(lower) ||
    lower.includes("rate limit") ||
    lower.includes("rate-limit") ||
    lower.includes("too many requests") ||
    lower.includes("api rate limit exceeded")
  ) {
    return "RATE_LIMITED";
  }

  // Clone failures - check for git clone specific errors
  if (
    lower.includes("failed to clone") ||
    lower.includes("clone failed") ||
    lower.includes("could not clone") ||
    lower.includes("git clone") ||
    lower.includes("fatal: repository") ||
    lower.includes("authentication failed for")
  ) {
    return "CLONE_FAILED";
  }

  // npx/command not found errors
  if (
    lower.includes("npx command not found") ||
    lower.includes("enoent") ||
    lower.includes("command not found") ||
    lower.includes("is not recognized as")
  ) {
    return "NPX_NOT_FOUND";
  }

  // Repomix execution failures (exited with non-zero code)
  if (
    /exited with code \d+/.test(lower) ||
    lower.includes("failed to execute repomix")
  ) {
    return "EXECUTION_FAILED";
  }

  return "UNKNOWN";
}

// ─────────────────────────────────────────────────────────────
// Error Sanitization
// ─────────────────────────────────────────────────────────────

/**
 * Sanitize error messages by removing sensitive information
 */
export function sanitizeError(message: string): string {
  // Remove potential sensitive information from error messages
  return message
    .replace(/ghp_[a-zA-Z0-9]+/g, "[REDACTED_TOKEN]")
    .replace(/github_pat_[a-zA-Z0-9]+/g, "[REDACTED_TOKEN]")
    .replace(/Bearer [a-zA-Z0-9\-._~+/]+=*/g, "Bearer [REDACTED]")
    .replace(/token=[a-zA-Z0-9]+/gi, "token=[REDACTED]")
    .slice(0, 1000); // Limit error message length
}
