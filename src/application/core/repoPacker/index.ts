/**
 * Repomix Integration Module
 *
 * Uses Repomix as external tool to consolidate entire repository
 * into a single text file for comprehensive AI analysis.
 *
 * @see https://github.com/yamadashy/repomix
 */

// ─────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────

// Types
export type { PackOptions, PackResult, PackErrorReason } from "./types.js";

// Main function
export { packRemoteRepository } from "./packer.js";

// Patterns
export {
  getDefaultIncludePatterns,
  getDeepIncludePatterns,
} from "./patterns.js";

// Availability
export {
  isRepomixAvailable,
  clearRepomixAvailabilityCache,
} from "./availability.js";
