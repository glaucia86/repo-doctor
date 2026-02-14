import { describe, it, expect } from "vitest";
import { buildAnalysisPrompt } from "../../../src/application/core/agent/prompts/analysisPrompt.js";

describe("buildAnalysisPrompt", () => {
  describe("standard analysis", () => {
    it("should include the repository URL", () => {
      const prompt = buildAnalysisPrompt({ repoUrl: "owner/repo" });
      expect(prompt).toContain("owner/repo");
    });

    it("should include all 5 phases", () => {
      const prompt = buildAnalysisPrompt({ repoUrl: "test/repo" });
      expect(prompt).toContain("**PHASE 1 — RECONNAISSANCE**");
      expect(prompt).toContain("**PHASE 2 — STACK DETECTION**");
      expect(prompt).toContain("**PHASE 3 — STRATEGIC FILE READING**");
      expect(prompt).toContain("**PHASE 4 — ANALYSIS**");
      expect(prompt).toContain("**PHASE 5 — REPORT**");
    });

    it("should include tool call instructions", () => {
      const prompt = buildAnalysisPrompt({ repoUrl: "test/repo" });
      expect(prompt).toContain("get_repo_meta");
      expect(prompt).toContain("list_repo_files");
    });

    it("should NOT include deep analysis by default", () => {
      const prompt = buildAnalysisPrompt({ repoUrl: "test/repo" });
      expect(prompt).not.toContain("PHASE 6 — DEEP ANALYSIS");
      expect(prompt).not.toContain("pack_repository");
    });
  });

  describe("deep analysis", () => {
    it("should include PHASE 6 when deep=true", () => {
      const prompt = buildAnalysisPrompt({ repoUrl: "test/repo", deep: true });
      expect(prompt).toContain("**PHASE 6 — DEEP ANALYSIS (ENABLED)**");
    });

    it("should include pack_repository instruction", () => {
      const prompt = buildAnalysisPrompt({ repoUrl: "test/repo", deep: true });
      expect(prompt).toContain("pack_repository");
      expect(prompt).toContain('mode="deep"');
    });

    it("should include deep analysis section header", () => {
      const prompt = buildAnalysisPrompt({ repoUrl: "test/repo", deep: true });
      expect(prompt).toContain("🔬 Deep Analysis");
    });
  });

  describe("with full URLs", () => {
    it("should handle full GitHub URL", () => {
      const prompt = buildAnalysisPrompt({
        repoUrl: "https://github.com/vercel/next.js",
      });
      expect(prompt).toContain("https://github.com/vercel/next.js");
    });
  });
});
