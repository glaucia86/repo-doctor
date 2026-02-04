/**
 * Output Cleaning and Truncation for Repomix
 * Single Responsibility: Clean and format Repomix output
 */

// ─────────────────────────────────────────────────────────────
// Output Cleaning
// ─────────────────────────────────────────────────────────────

/**
 * Clean Repomix output by removing debug messages and noise
 */
export function cleanRepomixOutput(content: string): string {
  const esc = String.fromCharCode(27);
  const ansiRegex = new RegExp(`${esc}\\[[0-9;]*m`, "g");

  return content
    // Remove npm warnings
    .replace(/npm warn.*\n?/gi, "")
    .replace(/npm notice.*\n?/gi, "")
    .replace(/npm WARN.*\n?/gi, "")
    // Remove Node.js warnings
    .replace(/\(node:\d+\).*Warning:.*\n?/gi, "")
    .replace(/ExperimentalWarning:.*\n?/gi, "")
    .replace(/DeprecationWarning:.*\n?/gi, "")
    // Remove repomix progress messages
    .replace(/Repomix.*processing.*\n?/gi, "")
    .replace(/\[INFO\].*\n?/gi, "")
    .replace(/\[WARN\].*\n?/gi, "")
    // Remove ANSI escape codes
    .replace(ansiRegex, "")
    // Remove carriage returns (Windows line endings artifacts)
    .replace(/\r/g, "")
    // Collapse multiple blank lines
    .replace(/\n{3,}/g, "\n\n");
}

// ─────────────────────────────────────────────────────────────
// Content Truncation
// ─────────────────────────────────────────────────────────────

/**
 * Truncate content to fit within maxBytes limit
 * Tries to find a good truncation point (end of a file section)
 */
export function truncateContent(content: string, maxBytes: number): string {
  // First clean the content
  const cleaned = cleanRepomixOutput(content);

  // Find a good truncation point (end of a file section)
  const truncationTarget = maxBytes - 200; // Leave room for truncation message

  // Try to find file boundary
  const sectionBreak = cleaned.lastIndexOf(
    "\n================",
    truncationTarget
  );
  const cutPoint =
    sectionBreak > truncationTarget * 0.8 ? sectionBreak : truncationTarget;

  const truncated = cleaned.slice(0, cutPoint);
  const remaining = Buffer.byteLength(cleaned, "utf-8") - cutPoint;

  return `${truncated}

────────────────────────────────────────────────────────────────────
⚠️  OUTPUT TRUNCATED
────────────────────────────────────────────────────────────────────
The repository content was truncated to fit within context limits.
Approximately ${Math.round(remaining / 1024)}KB of content was omitted.
The analysis above represents the most important files based on patterns.
────────────────────────────────────────────────────────────────────`;
}

// ─────────────────────────────────────────────────────────────
// Metadata Extraction
// ─────────────────────────────────────────────────────────────

/**
 * Extract metadata (file count, token count) from Repomix output
 */
export function extractMetadata(content: string): { files: number; tokens?: number } {
  const result: { files: number; tokens?: number } = { files: 0 };

  // Try to find file count from Repomix output
  const filesMatch = content.match(
    /(?:Total files|Files processed|File Count)[:\s]+(\d+)/i
  );
  if (filesMatch?.[1]) {
    result.files = parseInt(filesMatch[1], 10);
  }

  // Try to find token count
  const tokensMatch = content.match(/(?:Total tokens|Token Count)[:\s]+(\d+)/i);
  if (tokensMatch?.[1]) {
    result.tokens = parseInt(tokensMatch[1], 10);
  }

  return result;
}
