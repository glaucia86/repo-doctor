/**
 * Repository URL Parser
 * Single Responsibility: Parse and validate GitHub repository references
 */

// ════════════════════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════════════════════

export interface ParsedRepo {
  owner: string;
  repo: string;
}

// ════════════════════════════════════════════════════════════════════════════
// PARSER
// ════════════════════════════════════════════════════════════════════════════

/**
 * Parse repository reference (URL, SSH, or slug)
 * 
 * Supported formats:
 * - HTTPS URL: https://github.com/owner/repo
 * - SSH URL: git@github.com:owner/repo.git
 * - Slug: owner/repo
 * 
 * @param repoRef - Repository reference string
 * @returns Parsed repository info or null if invalid
 */
export function parseRepoRef(repoRef: string): ParsedRepo | null {
  if (!repoRef || typeof repoRef !== "string") {
    return null;
  }

  const trimmed = repoRef.trim();

  // HTTPS URL: https://github.com/owner/repo
  // Stop at query string (?), fragment (#), or whitespace
  const httpsMatch = trimmed.match(
    /(?:https?:\/\/)?github\.com\/([^\/]+)\/([^\/\s?#]+)/
  );
  if (httpsMatch) {
    return {
      owner: httpsMatch[1]!,
      repo: httpsMatch[2]!.replace(/\.git$/, ""),
    };
  }

  // SSH URL: git@github.com:owner/repo.git
  const sshMatch = trimmed.match(/git@github\.com:([^\/]+)\/([^\/\s]+)/);
  if (sshMatch) {
    return {
      owner: sshMatch[1]!,
      repo: sshMatch[2]!.replace(/\.git$/, ""),
    };
  }

  // Slug: owner/repo
  const slugMatch = trimmed.match(/^([^\/]+)\/([^\/\s]+)$/);
  if (slugMatch) {
    return {
      owner: slugMatch[1]!,
      repo: slugMatch[2]!,
    };
  }

  return null;
}

/**
 * Build a full GitHub URL from parsed repo
 */
export function buildRepoUrl(parsed: ParsedRepo): string {
  return `https://github.com/${parsed.owner}/${parsed.repo}`;
}

/**
 * Build a repo slug from parsed repo
 */
export function buildRepoSlug(parsed: ParsedRepo): string {
  return `${parsed.owner}/${parsed.repo}`;
}

/**
 * Validate and parse a repo reference, returning URL and slug
 */
export function validateRepoRef(repoRef: string): {
  valid: boolean;
  parsed: ParsedRepo | null;
  url: string | null;
  slug: string | null;
  error?: string;
} {
  const parsed = parseRepoRef(repoRef);
  
  if (!parsed) {
    return {
      valid: false,
      parsed: null,
      url: null,
      slug: null,
      error: "Invalid repository reference. Use: owner/repo or https://github.com/owner/repo",
    };
  }

  return {
    valid: true,
    parsed,
    url: buildRepoUrl(parsed),
    slug: buildRepoSlug(parsed),
  };
}
