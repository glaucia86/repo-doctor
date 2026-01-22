import { Octokit } from "@octokit/rest";
import { execSync } from "node:child_process";

function getToken(): string | undefined {
  const envToken = process.env.GITHUB_TOKEN?.trim();
  if (envToken) return envToken;

  try {
    const token = execSync("gh auth token", { 
      stdio: ["ignore", "pipe", "ignore"] 
    })
      .toString()
      .trim();
    return token || undefined;
  } catch {
    return undefined;
  }
}

export function createOctokit(): Octokit {
  const token = getToken();
  return new Octokit(token ? { auth: token } : {});
}

export function parseRepoUrl(repoUrl: string): { owner: string; repo: string } {
  // Aceita: https://github.com/OWNER/REPO, git@github.com:OWNER/REPO.git, OWNER/REPO
  const trimmed = repoUrl.trim();

  // Formato: OWNER/REPO
  const shortMatch = trimmed.match(/^([\w-]+)\/([\w.-]+)$/);
  if (shortMatch) {
    return { 
      owner: shortMatch[1]!, 
      repo: shortMatch[2]!.replace(/\.git$/i, "") 
    };
  }

  // Formato: https://github.com/OWNER/REPO
  const httpsMatch = trimmed.match(/^https?:\/\/github\.com\/([^/]+)\/([^/]+?)(?:\.git)?(?:\/)?$/i);
  if (httpsMatch) {
    return { 
      owner: httpsMatch[1]!, 
      repo: httpsMatch[2]!.replace(/\.git$/i, "") 
    };
  }

  // Formato: git@github.com:OWNER/REPO.git
  const sshMatch = trimmed.match(/^git@github\.com:([^/]+)\/([^/]+)$/i);
  if (sshMatch) {
    return { 
      owner: sshMatch[1]!, 
      repo: sshMatch[2]!.replace(/\.git$/i, "") 
    };
  }

  throw new Error(`URL de repositório inválida: ${repoUrl}`);
}
