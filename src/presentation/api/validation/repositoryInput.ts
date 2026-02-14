import { validateRepoRef } from "../../cli/parsers/repoParser.js";
import { sanitizeMetadata } from "../../../utils/sanitizer.js";

export interface NormalizedRepositoryInput {
  normalizedInput: string;
  repositoryUrl: string;
  repositorySlug: string;
}

export type ValidationResult =
  | { ok: true; value: NormalizedRepositoryInput }
  | { ok: false; errorCode: string; message: string };

const REPOSITORY_INPUT_MAX = 512;

const sanitizeInput = (value: string): string => {
  const trimmed = value.trim().slice(0, REPOSITORY_INPUT_MAX);
  const sanitized = sanitizeMetadata({ repositoryInput: trimmed }).repositoryInput;
  return typeof sanitized === "string" ? sanitized : trimmed;
};

export function normalizeRepositoryInput(input: string): ValidationResult {
  if (!input || typeof input !== "string") {
    return {
      ok: false,
      errorCode: "INVALID_REPOSITORY_INPUT",
      message: "Repository input is required.",
    };
  }

  const normalizedInput = sanitizeInput(input);
  const validation = validateRepoRef(normalizedInput);
  if (!validation.valid || !validation.url || !validation.slug) {
    return {
      ok: false,
      errorCode: "INVALID_REPOSITORY_INPUT",
      message: "Repository input must be owner/repo or a valid GitHub URL.",
    };
  }

  return {
    ok: true,
    value: {
      normalizedInput,
      repositoryUrl: validation.url,
      repositorySlug: validation.slug,
    },
  };
}

