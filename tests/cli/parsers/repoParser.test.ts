/**
 * Tests for Repository URL Parser
 */

import { describe, it, expect } from "vitest";
import {
  parseRepoRef,
  buildRepoUrl,
  buildRepoSlug,
  validateRepoRef,
} from "../../../src/presentation/cli/parsers/repoParser.js";

describe("repoParser", () => {
  describe("parseRepoRef", () => {
    it("should parse HTTPS URL format", () => {
      const result = parseRepoRef("https://github.com/vercel/next.js");
      expect(result).toEqual({ owner: "vercel", repo: "next.js" });
    });

    it("should parse HTTPS URL without protocol", () => {
      const result = parseRepoRef("github.com/facebook/react");
      expect(result).toEqual({ owner: "facebook", repo: "react" });
    });

    it("should parse SSH URL format", () => {
      const result = parseRepoRef("git@github.com:microsoft/vscode.git");
      expect(result).toEqual({ owner: "microsoft", repo: "vscode" });
    });

    it("should parse owner/repo slug format", () => {
      const result = parseRepoRef("vercel/next.js");
      expect(result).toEqual({ owner: "vercel", repo: "next.js" });
    });

    it("should handle .git suffix", () => {
      const result = parseRepoRef("https://github.com/owner/repo.git");
      expect(result).toEqual({ owner: "owner", repo: "repo" });
    });

    it("should strip query strings from URLs", () => {
      const result = parseRepoRef("https://github.com/owner/repo?tab=readme");
      expect(result).toEqual({ owner: "owner", repo: "repo" });
    });

    it("should strip fragments from URLs", () => {
      const result = parseRepoRef("https://github.com/owner/repo#readme");
      expect(result).toEqual({ owner: "owner", repo: "repo" });
    });

    it("should handle both query string and fragment", () => {
      const result = parseRepoRef("https://github.com/owner/repo?tab=code#L10");
      expect(result).toEqual({ owner: "owner", repo: "repo" });
    });

    it("should return null for invalid formats", () => {
      expect(parseRepoRef("")).toBeNull();
      expect(parseRepoRef("invalid")).toBeNull();
      expect(parseRepoRef("just-a-name")).toBeNull();
      expect(parseRepoRef("http://example.com")).toBeNull();
    });

    it("should handle whitespace", () => {
      const result = parseRepoRef("  vercel/next.js  ");
      expect(result).toEqual({ owner: "vercel", repo: "next.js" });
    });

    it("should return null for null/undefined input", () => {
      expect(parseRepoRef(null as unknown as string)).toBeNull();
      expect(parseRepoRef(undefined as unknown as string)).toBeNull();
    });
  });

  describe("buildRepoUrl", () => {
    it("should build a full GitHub URL", () => {
      const url = buildRepoUrl({ owner: "vercel", repo: "next.js" });
      expect(url).toBe("https://github.com/vercel/next.js");
    });
  });

  describe("buildRepoSlug", () => {
    it("should build a repo slug", () => {
      const slug = buildRepoSlug({ owner: "vercel", repo: "next.js" });
      expect(slug).toBe("vercel/next.js");
    });
  });

  describe("validateRepoRef", () => {
    it("should return valid result for correct input", () => {
      const result = validateRepoRef("vercel/next.js");
      expect(result.valid).toBe(true);
      expect(result.parsed).toEqual({ owner: "vercel", repo: "next.js" });
      expect(result.url).toBe("https://github.com/vercel/next.js");
      expect(result.slug).toBe("vercel/next.js");
      expect(result.error).toBeUndefined();
    });

    it("should return invalid result for incorrect input", () => {
      const result = validateRepoRef("invalid");
      expect(result.valid).toBe(false);
      expect(result.parsed).toBeNull();
      expect(result.url).toBeNull();
      expect(result.slug).toBeNull();
      expect(result.error).toBeDefined();
    });
  });
});
