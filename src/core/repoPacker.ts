/**
 * Repomix Integration Module (Backward Compatibility)
 *
 * This file re-exports from the refactored repoPacker/ module.
 * For new imports, prefer importing from './repoPacker/index.js'
 *
 * @see https://github.com/yamadashy/repomix
 * @deprecated Use imports from './repoPacker/index.js' directly
 */

// Re-export everything from the refactored module
export {
  // Types
  type PackOptions,
  type PackResult,
  type PackErrorReason,
  // Main function
  packRemoteRepository,
  // Patterns
  getDefaultIncludePatterns,
  getDeepIncludePatterns,
  // Availability
  isRepomixAvailable,
  clearRepomixAvailabilityCache,
} from "./repoPacker/index.js";
