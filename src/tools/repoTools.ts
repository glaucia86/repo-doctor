/**
 * Repository analysis tools for Repo Doctor
 * Custom tools that the Copilot agent can use to analyze repositories
 */

import { defineTool } from "@github/copilot-sdk";
import { z } from "zod";
import { createOctokit, parseRepoUrl } from "../providers/github.js";

// ════════════════════════════════════════════════════════════════════════════
// SCHEMAS
// ════════════════════════════════════════════════════════════════════════════

const RepoInput = z.object({
  repoUrl: z
    .string()
    .describe("GitHub repository URL or slug (https://github.com/org/repo or org/repo)"),
});

const ReadFileInput = z.object({
  repoUrl: z.string(),
  path: z.string().describe("File path in repository (e.g., README.md, package.json)"),
});

// ════════════════════════════════════════════════════════════════════════════
// TOOL OPTIONS
// ════════════════════════════════════════════════════════════════════════════

export interface RepoToolsOptions {
  token?: string;
  maxFiles?: number;
  maxBytes?: number;
}

// ════════════════════════════════════════════════════════════════════════════
// TOOLS FACTORY
// ════════════════════════════════════════════════════════════════════════════

export function repoTools(options: RepoToolsOptions = {}) {
  const { token, maxFiles: defaultMaxFiles = 800, maxBytes = 204800 } = options;

  // ──────────────────────────────────────────────────────────────────────────
  // Tool: get_repo_meta
  // ──────────────────────────────────────────────────────────────────────────

  const getRepoMeta = defineTool("get_repo_meta", {
    description: `Fetches repository metadata from GitHub API.
Returns: owner, name, description, default_branch, visibility, size, 
archived, disabled, fork, open_issues_count, topics, languages, 
created_at, updated_at, pushed_at, license info.`,
    parameters: {
      type: "object",
      properties: {
        repoUrl: {
          type: "string",
          description: "GitHub repository URL or slug",
        },
      },
      required: ["repoUrl"],
    },

    handler: async (args: z.infer<typeof RepoInput>) => {
      try {
        const { repoUrl } = RepoInput.parse(args);
        const { owner, repo } = parseRepoUrl(repoUrl);
        const octokit = createOctokit(token);

        const { data } = await octokit.repos.get({ owner, repo });

        // Also get languages
        let languages: Record<string, number> = {};
        try {
          const langResp = await octokit.repos.listLanguages({ owner, repo });
          languages = langResp.data;
        } catch {
          // Languages might not be available
        }

        return {
          owner: data.owner.login,
          name: data.name,
          fullName: data.full_name,
          description: data.description,
          defaultBranch: data.default_branch,
          visibility: data.private ? "private" : "public",
          size: data.size,
          archived: data.archived,
          disabled: data.disabled,
          fork: data.fork,
          openIssuesCount: data.open_issues_count,
          topics: data.topics || [],
          languages,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
          pushedAt: data.pushed_at,
          hasIssues: data.has_issues,
          hasWiki: data.has_wiki,
          hasPages: data.has_pages,
          homepage: data.homepage,
          license: data.license
            ? { key: data.license.key, name: data.license.name }
            : null,
        };
      } catch (error: any) {
        if (error.status === 404) {
          return {
            error: "Repository not found",
            status: 404,
            message: "The repository does not exist or you don't have access.",
          };
        }
        if (error.status === 403) {
          return {
            error: "Access denied",
            status: 403,
            message: "Rate limited or authentication required. Try using --token.",
          };
        }
        throw error;
      }
    },
  });

  // ──────────────────────────────────────────────────────────────────────────
  // Tool: list_repo_files
  // ──────────────────────────────────────────────────────────────────────────

  const listRepoFiles = defineTool("list_repo_files", {
    description: `Lists repository file tree structure.
Returns array of file paths with sizes.
Use maxFiles to limit results (default based on options).
Automatically filters out common noise (node_modules, dist, .git, etc).`,
    parameters: {
      type: "object",
      properties: {
        repoUrl: {
          type: "string",
          description: "GitHub repository URL or slug",
        },
        maxFiles: {
          type: "number",
          description: "Maximum number of files to list",
        },
      },
      required: ["repoUrl"],
    },

    handler: async (args: { repoUrl: string; maxFiles?: number }) => {
      try {
        const { repoUrl } = RepoInput.parse({ repoUrl: args.repoUrl });
        const maxFilesLimit = Math.max(
          50,
          Math.min(args.maxFiles ?? defaultMaxFiles, 2000)
        );
        const { owner, repo } = parseRepoUrl(repoUrl);
        const octokit = createOctokit(token);

        // Get default branch
        const repoResp = await octokit.repos.get({ owner, repo });
        const branch = repoResp.data.default_branch;

        // Get tree
        const ref = await octokit.git.getRef({
          owner,
          repo,
          ref: `heads/${branch}`,
        });
        const commitSha = ref.data.object.sha;

        const commit = await octokit.git.getCommit({
          owner,
          repo,
          commit_sha: commitSha,
        });
        const treeSha = commit.data.tree.sha;

        const tree = await octokit.git.getTree({
          owner,
          repo,
          tree_sha: treeSha,
          recursive: "true",
        });

        // Filter and process files
        const allFiles = (tree.data.tree || [])
          .filter((n) => n.type === "blob" && typeof n.path === "string")
          .filter((n) => {
            const path = n.path!;
            // Filter out noise
            return (
              !path.includes("node_modules/") &&
              !path.includes("dist/") &&
              !path.includes(".git/") &&
              !path.includes("vendor/") &&
              !path.includes("__pycache__/") &&
              !path.includes(".next/") &&
              !path.includes("coverage/") &&
              !path.match(/\.(min|bundle)\.(js|css)$/) &&
              !path.match(/\.lock$/) &&
              !path.endsWith("package-lock.json") &&
              !path.endsWith("yarn.lock") &&
              !path.endsWith("pnpm-lock.yaml")
            );
          });

        const files = allFiles
          .slice(0, maxFilesLimit)
          .map((n) => ({ path: n.path!, size: n.size ?? null }));

        return {
          branch,
          totalUnfiltered: tree.data.tree?.length || 0,
          totalFiltered: allFiles.length,
          returned: files.length,
          truncated: allFiles.length > maxFilesLimit,
          files,
        };
      } catch (error: any) {
        if (error.status === 404) {
          return {
            error: "Repository not found",
            status: 404,
          };
        }
        if (error.status === 403) {
          return {
            error: "Rate limited or access denied",
            status: 403,
            message: "Try using --token for higher rate limits.",
          };
        }
        throw error;
      }
    },
  });

  // ──────────────────────────────────────────────────────────────────────────
  // Tool: read_repo_file
  // ──────────────────────────────────────────────────────────────────────────

  const readRepoFile = defineTool("read_repo_file", {
    description: `Reads file content from repository.
Returns file content as text.
Truncates at configured max bytes.
Returns 404 info if file not found (use as evidence of missing file).`,
    parameters: {
      type: "object",
      properties: {
        repoUrl: {
          type: "string",
          description: "GitHub repository URL or slug",
        },
        path: {
          type: "string",
          description: "File path (e.g., 'README.md', '.github/workflows/ci.yml')",
        },
      },
      required: ["repoUrl", "path"],
    },

    handler: async (args: z.infer<typeof ReadFileInput>) => {
      try {
        const { repoUrl, path } = ReadFileInput.parse(args);
        const { owner, repo } = parseRepoUrl(repoUrl);
        const octokit = createOctokit(token);

        const { data } = await octokit.repos.getContent({ owner, repo, path });

        // Directory
        if (Array.isArray(data)) {
          return {
            path,
            type: "directory",
            found: true,
            entries: data.map((e) => ({
              name: e.name,
              path: e.path,
              type: e.type,
              size: e.size,
            })),
          };
        }

        // File
        if ("content" in data && data.content) {
          const buff = Buffer.from(data.content, "base64");
          const text = buff.toString("utf8");

          // Truncate if too large
          const truncated = text.length > maxBytes;
          const content = truncated ? text.slice(0, maxBytes) : text;

          return {
            path,
            type: "file",
            found: true,
            size: data.size,
            truncated,
            truncatedAt: truncated ? maxBytes : undefined,
            content,
          };
        }

        // Other type (submodule, symlink)
        return {
          path,
          type: data.type,
          found: true,
          note: "Content not available for this type.",
        };
      } catch (error: any) {
        if (error.status === 404) {
          // This is not an error - it's evidence!
          return {
            path: args.path,
            found: false,
            type: "missing",
            note: "File not found in repository.",
          };
        }
        if (error.status === 403) {
          return {
            path: args.path,
            found: false,
            type: "error",
            error: "Access denied or rate limited",
          };
        }
        throw error;
      }
    },
  });

  return [getRepoMeta, listRepoFiles, readRepoFile];
}
