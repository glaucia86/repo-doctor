import { printInfo } from "../../ui/index.js";

export interface CopyPayload {
  markdown?: string;
  json?: Record<string, unknown>;
}

export function copyMarkdownReport(payload: CopyPayload): string {
  const content = payload.markdown ?? "";
  printInfo("Report markdown copied.");
  return content;
}

export function copyJsonReport(payload: CopyPayload): string {
  const content = JSON.stringify(payload.json ?? {}, null, 2);
  printInfo("Report JSON copied.");
  return content;
}
