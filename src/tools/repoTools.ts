import { defineTool } from "@github/copilot-sdk";
import { z } from "zod";
import { createOctokit, parseRepoUrl } from "../providers/github.js";

const RepoInput = z.object({
  repoUrl: z.string().describe("Link do repositório no GitHub (https://github.com/org/repo ou org/repo)."),
});

const ReadFileInput = z.object({
  repoUrl: z.string(),
  path: z.string().describe("Caminho do arquivo no repositório (ex: README.md, package.json)."),
});

export function repoTools() {
  const getRepoMeta = defineTool("get_repo_meta", {
    description: "Obtém metadados do repositório (default branch, descrição, linguagem principal, etc.).",
    parameters: {
      type: "object",
      properties: { repoUrl: { type: "string" } },
      required: ["repoUrl"],
    },

    handler: async (args: z.infer<typeof RepoInput>) => {
      const { repoUrl } = RepoInput.parse(args);
      const { owner, repo } = parseRepoUrl(repoUrl);
      const octokit = createOctokit();

      const { data } = await octokit.repos.get({ owner, repo });
      return {
        full_name: data.full_name,
        private: data.private,
        default_branch: data.default_branch,
        description: data.description,
        homepage: data.homepage,
        topics: data.topics,
        language: data.language,
        has_issues: data.has_issues,
        open_issues_count: data.open_issues_count,
      };
    },
  });

  const listRepoFiles = defineTool("list_repo_files", {
    description: "Lista arquivos do repositório (árvore do git) com limite para análise rápida.",
    parameters: {
      type: "object",
      properties: {
        repoUrl: { type: "string" },
        maxFiles: { type: "number", description: "Limite de arquivos retornados (ex: 200)." },
      },
      required: ["repoUrl"],
    },

    handler: async (args: { repoUrl: string; maxFiles?: number }) => {
      const { repoUrl } = RepoInput.parse({ repoUrl: args.repoUrl });
      const maxFiles = Math.max(50, Math.min(args.maxFiles ?? 200, 500));
      const { owner, repo } = parseRepoUrl(repoUrl);
      const octokit = createOctokit();

      const repoResp = await octokit.repos.get({ owner, repo });
      const branch = repoResp.data.default_branch;

      const ref = await octokit.git.getRef({ owner, repo, ref: `heads/${branch}` });
      const commitSha = ref.data.object.sha;

      const commit = await octokit.git.getCommit({ owner, repo, commit_sha: commitSha });
      const treeSha = commit.data.tree.sha;

      const tree = await octokit.git.getTree({ owner, repo, tree_sha: treeSha, recursive: "true" });

      const files = (tree.data.tree || [])
        .filter((n) => n.type === "blob" && typeof n.path === "string")
        .slice(0, maxFiles)
        .map((n) => ({ path: n.path!, size: n.size ?? null }));

      return { branch, total: files.length, files };
    },
  });

  const readRepoFile = defineTool("read_repo_file", {
    description: "Lê o conteúdo de um arquivo do repositório no GitHub.",
    parameters: {
      type: "object",
      properties: { repoUrl: { type: "string" }, path: { type: "string" } },
      required: ["repoUrl", "path"],
    },
    
    handler: async (args: z.infer<typeof ReadFileInput>) => {
      const { repoUrl, path } = ReadFileInput.parse(args);
      const { owner, repo } = parseRepoUrl(repoUrl);
      const octokit = createOctokit();

      const { data } = await octokit.repos.getContent({ owner, repo, path });
      if (Array.isArray(data)) {
        return { path, type: "directory", entries: data.map((e) => e.path) };
      }
      if ("content" in data && data.content) {
        const buff = Buffer.from(data.content, "base64");
        const text = buff.toString("utf8");

        // Evitar estourar contexto: truncar de forma segura
        const maxChars = 40_000;
        return { path, type: "file", truncated: text.length > maxChars, content: text.slice(0, maxChars) };
      }
      return { path, type: data.type, note: "Conteúdo indisponível." };
    },
  });

  return [getRepoMeta, listRepoFiles, readRepoFile];
}
