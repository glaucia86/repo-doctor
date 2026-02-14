import { createOctokit } from "./github.js";

export interface CreateCommentInput {
  owner: string;
  repo: string;
  issueNumber: number;
  body: string;
  token?: string;
}

export interface CreateIssueInput {
  owner: string;
  repo: string;
  title: string;
  body: string;
  labels?: string[];
  token?: string;
}

export async function createPrComment(input: CreateCommentInput): Promise<string> {
  const { owner, repo, issueNumber, body, token } = input;
  const octokit = createOctokit(token);
  const response = await octokit.issues.createComment({
    owner,
    repo,
    issue_number: issueNumber,
    body,
  });
  return response.data.html_url;
}

export async function createIssue(input: CreateIssueInput): Promise<string> {
  const { owner, repo, title, body, labels, token } = input;
  const octokit = createOctokit(token);
  const response = await octokit.issues.create({
    owner,
    repo,
    title,
    body,
    labels,
  });
  return response.data.html_url;
}
