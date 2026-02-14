import type { Category } from "./schema.js";

export type PublishTarget = "issue";

export interface PublishRepo {
  owner: string;
  name: string;
  fullName: string;
  url: string;
}

export interface PublishableReport {
  summary: string[];
  keyFindings: string[];
  recommendedActions: string[];
  generatedAt: string;
  source: string;
}

export interface PublishContext {
  prNumber?: number;
}

export interface PublishInput {
  target: PublishTarget;
  repo: PublishRepo;
  report: PublishableReport;
  context?: PublishContext;
  categories?: Category[];
}

export interface PublishError {
  type:
    | "missing_token"
    | "permission"
    | "rate_limited"
    | "not_found"
    | "invalid_context"
    | "unknown";
  message: string;
}

export interface PublishResult {
  ok: boolean;
  target: PublishTarget;
  targetUrl?: string;
  targetUrls?: string[];
  error?: PublishError;
}
