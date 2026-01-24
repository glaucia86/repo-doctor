/**
 * pack_repository tool
 * Single Responsibility: Pack entire repository using Repomix for deep analysis
 */

import { defineTool } from "@github/copilot-sdk";
import {
  packRemoteRepository,
  getDefaultIncludePatterns,
  getDeepIncludePatterns,
  isRepomixAvailable,
} from "../core/repoPacker.js";

// ════════════════════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════════════════════

export interface PackRepositoryOptions {
  maxBytes?: number;
}

// ════════════════════════════════════════════════════════════════════════════
// TOOL FACTORY
// ════════════════════════════════════════════════════════════════════════════

export function createPackRepository(options: PackRepositoryOptions = {}) {
  const { maxBytes = 512000 } = options; // 500KB default for packed content

  return defineTool("pack_repository", {
    description: `Packs entire repository into a single consolidated text file using Repomix.
This is useful for deep analysis when you need to understand the full codebase.
WARNING: This is resource-intensive. Only use when:
- Standard file-by-file analysis is insufficient
- User explicitly requested deep/comprehensive analysis
- You need to understand code patterns across many files
Returns consolidated content with file markers and structure.`,
    parameters: {
      type: "object",
      properties: {
        repoUrl: {
          type: "string",
          description: "GitHub repository URL or owner/repo shorthand",
        },
        ref: {
          type: "string",
          description:
            "Branch, tag, or commit (optional, uses default branch if omitted)",
        },
        mode: {
          type: "string",
          enum: ["governance", "deep"],
          description:
            "Analysis mode: 'governance' for config/docs only, 'deep' for full source code",
        },
        compress: {
          type: "boolean",
          description:
            "Enable token compression for very large repos (default: false)",
        },
      },
      required: ["repoUrl"],
    },

    handler: async (args: {
      repoUrl: string;
      ref?: string;
      mode?: "governance" | "deep";
      compress?: boolean;
    }) => {
      const { repoUrl, ref, mode = "governance", compress = false } = args;

      try {
        // Pre-check: verify Repomix is available
        const repomixReady = await isRepomixAvailable();
        if (!repomixReady) {
          return {
            success: false,
            error: "Repomix is not available. npx repomix --version failed.",
            reason: "REPOMIX_NOT_AVAILABLE",
            suggestion:
              "Fall back to standard file-by-file analysis using read_repo_file. Ensure Node.js >= 18 and npx are working correctly.",
          };
        }

        // Select include patterns based on mode
        const include =
          mode === "deep"
            ? getDeepIncludePatterns()
            : getDefaultIncludePatterns();

        const result = await packRemoteRepository({
          url: repoUrl,
          ref,
          include,
          compress,
          maxBytes,
          timeout: 180000, // 3 minutes for deep analysis
        });

        if (!result.success) {
          // Categorize the error for better diagnostics
          const errorLower = (result.error || "").toLowerCase();
          let reason = "UNKNOWN";
          let suggestion =
            "Repomix failed. Fall back to standard file-by-file analysis using read_repo_file.";

          if (errorLower.includes("timeout")) {
            reason = "TIMEOUT";
            suggestion =
              "Repository too large or network too slow. Use standard file-by-file analysis instead.";
          } else if (
            errorLower.includes("404") ||
            errorLower.includes("not found")
          ) {
            reason = "REPO_NOT_FOUND";
            suggestion =
              "Repository not found or is private. Check the URL and ensure you have access.";
          } else if (
            errorLower.includes("403") ||
            errorLower.includes("rate limit")
          ) {
            reason = "RATE_LIMITED";
            suggestion =
              "GitHub rate limit hit. Wait a few minutes or use a token with higher limits.";
          } else if (
            errorLower.includes("clone") ||
            errorLower.includes("git")
          ) {
            reason = "CLONE_FAILED";
            suggestion =
              "Failed to clone repository. Check network connection and repository accessibility.";
          }

          return {
            success: false,
            error: result.error,
            reason,
            suggestion,
          };
        }

        return {
          success: true,
          mode,
          truncated: result.truncated,
          originalSize: result.originalSize,
          returnedSize: result.content?.length ?? 0,
          metadata: result.metadata,
          content: result.content,
          note: result.truncated
            ? "Content was truncated to fit context limits. Most important files are included based on patterns."
            : "Full repository content included.",
        };
      } catch (error: any) {
        const errorMsg = error.message?.slice(0, 500) ?? "Unknown error";
        return {
          success: false,
          error: errorMsg,
          reason: "EXCEPTION",
          suggestion:
            "Repomix failed unexpectedly. Fall back to standard file-by-file analysis using read_repo_file.",
        };
      }
    },
  });
}
