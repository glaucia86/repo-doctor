/**
 * Repomix Availability Check
 * Single Responsibility: Check if Repomix is available via npx
 */

import { execSync } from "child_process";

// ─────────────────────────────────────────────────────────────
// Availability Cache
// ─────────────────────────────────────────────────────────────

/** Cached result for Repomix availability check (null = not yet checked) */
let repomixAvailabilityCache: boolean | null = null;

/**
 * Quick check if Repomix is available via npx.
 * Result is cached for the duration of the CLI session to avoid
 * repeated 30-second timeout delays on consecutive deep analyses.
 *
 * @param forceRefresh - If true, bypasses the cache and re-checks availability
 */
export async function isRepomixAvailable(forceRefresh = false): Promise<boolean> {
  // Return cached result if available and not forcing refresh
  if (repomixAvailabilityCache !== null && !forceRefresh) {
    return repomixAvailabilityCache;
  }

  try {
    execSync("npx repomix --version", {
      timeout: 30000,
      stdio: "pipe",
    });
    repomixAvailabilityCache = true;
    return true;
  } catch {
    repomixAvailabilityCache = false;
    return false;
  }
}

/**
 * Clear the Repomix availability cache.
 * Useful for testing or when environment changes.
 */
export function clearRepomixAvailabilityCache(): void {
  repomixAvailabilityCache = null;
}
