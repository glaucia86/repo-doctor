/**
 * get_repo_meta tool
 * Single Responsibility: Fetch repository metadata from GitHub API
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

// ════════════════════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════════════════════

export interface GetRepoMetaOptions {
  token?: string;
}

// ════════════════════════════════════════════════════════════════════════════
// TOOL FACTORY
// ════════════════════════════════════════════════════════════════════════════

export function createGetRepoMeta(options: GetRepoMetaOptions = {}) {
  const { token } = options;

  return defineTool("get_repo_meta", {
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
          // Sanitize description to prevent injection via repo metadata
          description: data.description
            ? `[METADATA] ${data.description.slice(0, 500)}`
            : null,
          defaultBranch: data.default_branch,
          visibility: data.private ? "private" : "public",
          size: data.size,
          archived: data.archived,
          disabled: data.disabled,
          fork: data.fork,
          openIssuesCount: data.open_issues_count,
          // Sanitize topics (limit length to prevent abuse)
          topics: (data.topics || []).map((t) => t.slice(0, 50)).slice(0, 20),
          languages,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
          pushedAt: data.pushed_at,
          hasIssues: data.has_issues,
          hasWiki: data.has_wiki,
          hasPages: data.has_pages,
          // Sanitize homepage URL
          homepage: data.homepage ? data.homepage.slice(0, 200) : null,
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
            message:
              "Rate limited or authentication required. Try using --token.",
          };
        }
        throw error;
      }
    },
  });
}
