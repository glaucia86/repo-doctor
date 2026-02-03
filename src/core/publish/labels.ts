import type { Category } from "../../types/schema.js";

const CATEGORY_LABEL_MAP: Record<Category, string> = {
  docs: "documentation",
  dx: "dx",
  ci: "ci",
  tests: "tests",
  governance: "governance",
  security: "security",
};

export const BASE_LABEL = "repo-doctor";

export function buildIssueLabels(categories: Category[] = []): string[] {
  const labels = new Set<string>();
  labels.add(BASE_LABEL);

  for (const category of categories) {
    const label = CATEGORY_LABEL_MAP[category];
    if (label) labels.add(label);
  }

  return Array.from(labels);
}
