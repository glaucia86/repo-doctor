/**
 * pack_repository tool
 * Single Responsibility: Pack entire repository using Repomix for deep analysis
 */

import { defineTool } from "@github/copilot-sdk";
import {
  packRemoteRepository,
  getDefaultIncludePatterns,
  getDeepIncludePatterns,
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
          return {
            success: false,
            error: result.error,
            suggestion:
              "Repomix failed. Fall back to standard file-by-file analysis using read_repo_file.",
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
        return {
          success: false,
          error: error.message?.slice(0, 500) ?? "Unknown error",
          suggestion:
            "Repomix failed. Fall back to standard file-by-file analysis using read_repo_file.",
        };
      }
    },
  });
}
