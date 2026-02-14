/**
 * Types for Repomix Integration
 * Single Responsibility: Type definitions for the repoPacker module
 */

// ─────────────────────────────────────────────────────────────
// Error Types
// ─────────────────────────────────────────────────────────────

/**
 * Structured error reason codes for PackResult.
 * These provide reliable error categorization without fragile string matching.
 */
export type PackErrorReason =
  | "TIMEOUT"               // Execution exceeded timeout limit
  | "REPO_NOT_FOUND"        // Repository doesn't exist or is private (HTTP 404)
  | "RATE_LIMITED"          // GitHub rate limit hit (HTTP 403/429)
  | "CLONE_FAILED"          // Git clone operation failed
  | "NPX_NOT_FOUND"         // npx command not available
  | "REPOMIX_NOT_AVAILABLE" // npx exists but repomix --version failed
  | "EXECUTION_FAILED"      // Repomix exited with non-zero code
  | "EXCEPTION"             // Unexpected exception during execution
  | "UNKNOWN";              // Unclassified error

// ─────────────────────────────────────────────────────────────
// Options & Results
// ─────────────────────────────────────────────────────────────

export interface PackOptions {
  /** GitHub URL or owner/repo shorthand */
  url: string;
  /** Branch, tag, or commit ref (optional) */
  ref?: string;
  /** Glob patterns to include (default: config files, docs, source) */
  include?: string[];
  /** Glob patterns to exclude */
  exclude?: string[];
  /** Output style: plain, markdown, xml */
  style?: "plain" | "markdown" | "xml";
  /** Enable token compression for larger repos */
  compress?: boolean;
  /** Max output size in bytes (default: 500KB) */
  maxBytes?: number;
  /** Timeout in milliseconds (default: 120s) */
  timeout?: number;
}

export interface PackResult {
  success: boolean;
  content?: string;
  truncated: boolean;
  originalSize: number;
  error?: string;
  /** Structured error reason code for reliable error handling */
  errorReason?: PackErrorReason;
  metadata?: {
    files: number;
    tokens?: number;
  };
}

// ─────────────────────────────────────────────────────────────
// Internal Types
// ─────────────────────────────────────────────────────────────

export interface RepomixArgs {
  url: string;
  outputPath: string;
  include: string[];
  exclude: string[];
  style: string;
  compress: boolean;
}
