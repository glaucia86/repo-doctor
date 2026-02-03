import { existsSync, readFileSync } from "node:fs";

export interface PrContext {
  prNumber: number;
  source: string;
}

function parsePrNumber(value: string | undefined, source: string): PrContext | null {
  if (!value) return null;
  const match = value.match(/refs\/pull\/(\d+)\/(?:merge|head)/i);
  if (match) {
    return { prNumber: Number(match[1]), source };
  }
  return null;
}

export function resolvePrContext(): PrContext | null {
  // Allow local testing with PR_NUMBER env var
  const testPr = process.env.PR_NUMBER || process.env.TEST_PR_NUMBER;
  if (testPr && process.env.NODE_ENV !== 'production') {
    const prNumber = Number(testPr);
    if (Number.isInteger(prNumber) && prNumber > 0) {
      return { prNumber, source: "test_env" };
    }
  }

  const eventPath = process.env.GITHUB_EVENT_PATH?.trim();
  if (eventPath && existsSync(eventPath)) {
    try {
      const raw = readFileSync(eventPath, "utf8");
      const payload = JSON.parse(raw);
      const prNumber = payload?.pull_request?.number;
      if (typeof prNumber === "number" && prNumber > 0) {
        return { prNumber, source: "github_event" };
      }
    } catch {
      // ignore parse errors and fall through
    }
  }

  const refContext =
    parsePrNumber(process.env.GITHUB_REF, "github_ref") ||
    parsePrNumber(process.env.GITHUB_REF_NAME, "github_ref_name");
  if (refContext) return refContext;

  const envPr =
    process.env.PR_NUMBER ||
    process.env.PULL_REQUEST_NUMBER ||
    process.env.GITHUB_PR_NUMBER;
  if (envPr) {
    const prNumber = Number(envPr);
    if (Number.isInteger(prNumber) && prNumber > 0) {
      return { prNumber, source: "env" };
    }
  }

  return null;
}
