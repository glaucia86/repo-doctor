/**
 * Repomix Integration Module
 *
 * Uses Repomix as external tool to consolidate entire repository
 * into a single text file for comprehensive AI analysis.
 *
 * @see https://github.com/yamadashy/repomix
 */

import { execSync, spawn } from "child_process";
import * as fs from "fs/promises";
import * as path from "path";
import * as os from "os";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

/**
 * Structured error reason codes for PackResult.
 * These provide reliable error categorization without fragile string matching.
 */
export type PackErrorReason =
  | "TIMEOUT"           // Execution exceeded timeout limit
  | "REPO_NOT_FOUND"    // Repository doesn't exist or is private (HTTP 404)
  | "RATE_LIMITED"      // GitHub rate limit hit (HTTP 403/429)
  | "CLONE_FAILED"      // Git clone operation failed
  | "NPX_NOT_FOUND"     // npx command not available
  | "EXECUTION_FAILED"  // Repomix exited with non-zero code
  | "UNKNOWN";          // Unclassified error

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
// Default Configuration
// ─────────────────────────────────────────────────────────────

/** Default patterns for governance and config analysis */
const DEFAULT_INCLUDE_PATTERNS = [
  // Documentation
  "README*",
  "*.md",
  "docs/**/*.md",
  // Governance
  "LICENSE*",
  "CONTRIBUTING*",
  "CODE_OF_CONDUCT*",
  "SECURITY*",
  "CHANGELOG*",
  // GitHub
  ".github/**",
  // Config files
  "package.json",
  "package-lock.json",
  "yarn.lock",
  "pnpm-lock.yaml",
  "tsconfig*.json",
  ".eslintrc*",
  ".prettierrc*",
  "turbo.json",
  "nx.json",
  "lerna.json",
  ".nvmrc",
  ".node-version",
  // Python
  "pyproject.toml",
  "setup.py",
  "setup.cfg",
  "requirements*.txt",
  "Pipfile*",
  "poetry.lock",
  // Rust
  "Cargo.toml",
  "Cargo.lock",
  // Go
  "go.mod",
  "go.sum",
  // Java/Kotlin
  "pom.xml",
  "build.gradle*",
  "settings.gradle*",
  // Ruby
  "Gemfile*",
  // .NET
  "*.csproj",
  "*.sln",
  "nuget.config",
  // Docker
  "Dockerfile*",
  "docker-compose*.yml",
  "docker-compose*.yaml",
  // CI/CD
  ".travis.yml",
  ".circleci/**",
  "azure-pipelines.yml",
  ".gitlab-ci.yml",
  "Jenkinsfile",
  // Test configs
  "jest.config*",
  "vitest.config*",
  "playwright.config*",
  "cypress.config*",
  ".mocharc*",
  // Misc configs
  ".editorconfig",
  ".gitignore",
  ".gitattributes",
  ".env.example",
];

/** Extended patterns for deep source code analysis */
const DEEP_INCLUDE_PATTERNS = [
  ...DEFAULT_INCLUDE_PATTERNS,
  // Source code (top-level and src/)
  "src/**",
  "lib/**",
  "app/**",
  "pages/**",
  "components/**",
  // Test files
  "test/**",
  "tests/**",
  "__tests__/**",
  "spec/**",
  // Scripts
  "scripts/**",
  "bin/**",
];

const DEFAULT_EXCLUDE_PATTERNS = [
  // Dependencies
  "node_modules/**",
  "vendor/**",
  ".venv/**",
  "venv/**",
  "__pycache__/**",
  // Build outputs
  "dist/**",
  "build/**",
  "out/**",
  ".next/**",
  ".nuxt/**",
  "target/**",
  // IDE
  ".idea/**",
  ".vscode/**",
  // Misc
  "coverage/**",
  ".git/**",
  "*.min.js",
  "*.min.css",
  "*.bundle.js",
  "*.map",
];

const DEFAULT_MAX_BYTES = 500 * 1024; // 500KB
const DEFAULT_TIMEOUT = 120000; // 2 minutes

// ─────────────────────────────────────────────────────────────
// Main Function
// ─────────────────────────────────────────────────────────────

/**
 * Packs a remote repository into a single text file using Repomix.
 *
 * @param options - Pack configuration
 * @returns Pack result with content or error
 */
export async function packRemoteRepository(
  options: PackOptions
): Promise<PackResult> {
  const {
    url,
    ref,
    include = DEFAULT_INCLUDE_PATTERNS,
    exclude = DEFAULT_EXCLUDE_PATTERNS,
    style = "plain",
    compress = false,
    maxBytes = DEFAULT_MAX_BYTES,
    timeout = DEFAULT_TIMEOUT,
  } = options;

  // Normalize URL
  const repoUrl = normalizeRepoUrl(url, ref);

  // Create temp directory for output
  let tempDir: string | undefined;

  try {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "repo-doctor-pack-"));
    const outputPath = path.join(tempDir, "packed-repo.txt");

    // Build Repomix command
    const args = buildRepomixArgs({
      url: repoUrl,
      outputPath,
      include,
      exclude,
      style,
      compress,
    });

    // Execute Repomix
    await executeRepomix(args, timeout);

    // Read and process output
    const rawContent = await fs.readFile(outputPath, "utf-8");
    
    // Clean output first (remove debug messages, warnings, etc.)
    const content = cleanRepomixOutput(rawContent);
    const originalSize = Buffer.byteLength(content, "utf-8");
    const truncated = originalSize > maxBytes;

    // Extract metadata from Repomix output
    const metadata = extractMetadata(content);

    // Truncate if necessary (already cleaned)
    const finalContent = truncated
      ? truncateContent(content, maxBytes)
      : content;

    return {
      success: true,
      content: finalContent,
      truncated,
      originalSize,
      metadata,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    
    // Categorize the error at the source for reliable error handling
    const errorReason = categorizeError(message);
    
    return {
      success: false,
      truncated: false,
      originalSize: 0,
      error: sanitizeError(message),
      errorReason,
    };
  } finally {
    // Cleanup temp directory
    if (tempDir) {
      try {
        await fs.rm(tempDir, { recursive: true, force: true });
      } catch {
        // Ignore cleanup errors
      }
    }
  }
}

// ─────────────────────────────────────────────────────────────
// Repomix Availability Cache
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

/**
 * Get default include patterns for governance analysis.
 */
export function getDefaultIncludePatterns(): string[] {
  return [...DEFAULT_INCLUDE_PATTERNS];
}

/**
 * Get deep include patterns for source code analysis.
 */
export function getDeepIncludePatterns(): string[] {
  return [...DEEP_INCLUDE_PATTERNS];
}

// ─────────────────────────────────────────────────────────────
// Helper Functions
// ─────────────────────────────────────────────────────────────

function normalizeRepoUrl(url: string, ref?: string): string {
  // Handle owner/repo shorthand
  if (/^[\w-]+\/[\w.-]+$/.test(url)) {
    const base = `https://github.com/${url}`;
    return ref ? `${base}/tree/${ref}` : base;
  }

  // Already a full URL
  if (ref && !url.includes("/tree/") && !url.includes("/blob/")) {
    // Append ref to URL
    const cleanUrl = url.replace(/\/$/, "");
    return `${cleanUrl}/tree/${ref}`;
  }

  return url;
}

interface RepomixArgs {
  url: string;
  outputPath: string;
  include: string[];
  exclude: string[];
  style: string;
  compress: boolean;
}

function buildRepomixArgs(opts: RepomixArgs): string[] {
  const args = [
    "repomix",
    "--remote",
    opts.url,
    "--output",
    opts.outputPath,
    "--style",
    opts.style,
  ];

  // Include patterns
  if (opts.include.length > 0) {
    args.push("--include", opts.include.join(","));
  }

  // Exclude patterns
  if (opts.exclude.length > 0) {
    args.push("--ignore", opts.exclude.join(","));
  }

  // Compression
  if (opts.compress) {
    args.push("--compress");
  }

  // Suppress interactive prompts
  args.push("--no-security-check");

  return args;
}

async function executeRepomix(args: string[], timeout: number): Promise<void> {
  return new Promise((resolve, reject) => {
    // SECURITY: Use shell: false with direct executable to avoid shell injection
    // vulnerabilities. When shell: true, special characters like & | ; could be
    // interpreted as command separators even inside quotes.
    const isWindows = process.platform === "win32";
    const npxExecutable = isWindows ? "npx.cmd" : "npx";

    // Validate arguments to ensure no obviously malicious patterns
    // This is defense-in-depth since we're using shell: false
    for (const arg of args) {
      if (arg.includes("\0") || arg.includes("\r") || arg.includes("\n")) {
        reject(new Error("Invalid characters in argument"));
        return;
      }
    }

    // stdio configuration:
    // - stdin: "ignore" - no interactive input needed
    // - stdout: "ignore" - Repomix writes packed content to --output file, not stdout.
    //   Progress messages go to stderr. Safe to ignore stdout completely.
    // - stderr: "pipe" - capture for error diagnostics and progress info
    const child = spawn(npxExecutable, args, {
      shell: false,
      stdio: ["ignore", "ignore", "pipe"],
      windowsHide: true,
      env: { 
        ...process.env, 
        FORCE_COLOR: "0",
        // Suppress npm/node warnings in output
        NODE_NO_WARNINGS: "1",
      },
    });

    let stderr = "";
    let settled = false;

    child.stderr?.on("data", (data) => {
      stderr += data.toString();
    });

    child.on("error", (error) => {
      if (!settled) {
        settled = true;
        // Provide more context about the failure
        const errMsg = error.message.toLowerCase();
        if (errMsg.includes("enoent") || errMsg.includes("not found")) {
          reject(new Error(`npx command not found. Ensure Node.js is installed and in PATH.`));
        } else {
          reject(new Error(`Failed to execute Repomix: ${error.message}`));
        }
      }
    });

    child.on("close", (code) => {
      if (!settled) {
        settled = true;
        if (code === 0) {
          resolve();
        } else {
          // Include relevant parts of stderr for diagnostics
          const stderrClean = stderr
            .replace(/npm warn.*\n?/gi, "")
            .replace(/npm notice.*\n?/gi, "")
            .replace(/\(node:\d+\).*Warning:.*\n?/gi, "")
            .replace(/DeprecationWarning:.*\n?/gi, "")
            .trim()
            .slice(0, 800);
          
          reject(
            new Error(`Repomix exited with code ${code}${stderrClean ? `: ${stderrClean}` : ""}`)
          );
        }
      }
    });

    // Handle timeout - clear timeout when process ends
    const timeoutId = setTimeout(() => {
      if (!settled) {
        settled = true;
        child.kill("SIGTERM");
        reject(new Error("Repomix execution timed out"));
      }
    }, timeout);

    // Clear timeout when process ends
    child.on("exit", () => {
      clearTimeout(timeoutId);
    });
  });
}

function extractMetadata(content: string): { files: number; tokens?: number } {
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

/**
 * Clean Repomix output by removing debug messages and noise
 */
function cleanRepomixOutput(content: string): string {
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
    .replace(/\x1b\[[0-9;]*m/g, "")
    // Remove carriage returns (Windows line endings artifacts)
    .replace(/\r/g, "")
    // Collapse multiple blank lines
    .replace(/\n{3,}/g, "\n\n");
}

function truncateContent(content: string, maxBytes: number): string {
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

function sanitizeError(message: string): string {
  // Remove potential sensitive information from error messages
  return message
    .replace(/ghp_[a-zA-Z0-9]+/g, "[REDACTED_TOKEN]")
    .replace(/github_pat_[a-zA-Z0-9]+/g, "[REDACTED_TOKEN]")
    .replace(/Bearer [a-zA-Z0-9\-._~+/]+=*/g, "Bearer [REDACTED]")
    .replace(/token=[a-zA-Z0-9]+/gi, "token=[REDACTED]")
    .slice(0, 1000); // Limit error message length
}

/**
 * Categorizes an error message into a structured error reason.
 * 
 * This function uses specific patterns that are more robust than simple
 * substring matching. Patterns are designed to match:
 * - Explicit error codes/statuses (e.g., "HTTP 404", "status code 403")
 * - Well-known error messages from git/npm/repomix
 * - Structural patterns unlikely to appear in regular content
 */
function categorizeError(message: string): PackErrorReason {
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
