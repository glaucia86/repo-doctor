/**
 * Repomix Executor
 * Single Responsibility: Execute Repomix CLI commands
 */

import spawn from "cross-spawn";
import type { RepomixArgs } from "./types.js";

// ─────────────────────────────────────────────────────────────
// URL Normalization
// ─────────────────────────────────────────────────────────────

/**
 * Normalize repository URL to a format Repomix understands
 */
export function normalizeRepoUrl(url: string, ref?: string): string {
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

// ─────────────────────────────────────────────────────────────
// Repomix Arguments Builder
// ─────────────────────────────────────────────────────────────

/**
 * Build command-line arguments for Repomix
 */
export function buildRepomixArgs(opts: RepomixArgs): string[] {
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

// ─────────────────────────────────────────────────────────────
// Repomix Execution
// ─────────────────────────────────────────────────────────────

/**
 * Execute Repomix with the given arguments
 */
export async function executeRepomix(args: string[], timeout: number): Promise<void> {
  return new Promise((resolve, reject) => {
    // cross-spawn handles Windows .cmd files correctly without shell: true
    // This avoids the EINVAL error that occurs when spawn tries to execute
    // .cmd files directly on Windows

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
    const child = spawn("npx", args, {
      stdio: ["ignore", "ignore", "pipe"],
      env: {
        ...process.env,
        FORCE_COLOR: "0",
        // Suppress npm/node warnings in output
        NODE_NO_WARNINGS: "1",
      },
    });

    let stderr = "";
    let settled = false;

    child.stderr?.on("data", (data: Buffer | string) => {
      if (typeof data === "string") {
        stderr += data;
      } else {
        stderr += data.toString();
      }
    });

    child.on("error", (error) => {
      if (!settled) {
        settled = true;
        // Provide more context about the failure
        const errMsg = error.message.toLowerCase();
        if (errMsg.includes("enoent") || errMsg.includes("not found")) {
          reject(
            new Error(
              `npx command not found. Ensure Node.js is installed and in PATH.`
            )
          );
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
            new Error(
              `Repomix exited with code ${code}${stderrClean ? `: ${stderrClean}` : ""}`
            )
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
