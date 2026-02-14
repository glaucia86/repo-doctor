/**
 * Tests for Report Extractor
 */

import { describe, it, expect } from "vitest";
import {
  extractReportOnly,
  removeDuplicateSections,
  generateCondensedSummary,
} from "../../../src/presentation/cli/parsers/reportExtractor.js";

describe("reportExtractor", () => {
  describe("extractReportOnly", () => {
    it("should extract health report from full output", () => {
      const input = `
**PHASE 1 — RECONNAISSANCE**
Some debug output here

## 🩺 Repository Health Report

**Repository:** vercel/next.js
**Health Score:** 85%

Some findings here
`;
      const result = extractReportOnly(input);
      expect(result).toContain("🩺 Repository Health Report");
      expect(result).toContain("vercel/next.js");
      expect(result).not.toContain("PHASE 1");
    });

    it("should remove npm warnings and noise", () => {
      const input = `
npm warn deprecated package@1.0.0
npm WARN old warning
(node:12345) ExperimentalWarning: feature is experimental

## 🩺 Repository Health Report
Clean content here
`;
      const result = extractReportOnly(input);
      expect(result).not.toContain("npm warn");
      expect(result).not.toContain("npm WARN");
      expect(result).not.toContain("ExperimentalWarning");
      expect(result).toContain("Clean content here");
    });

    it("should remove phase markers", () => {
      const input = `
**PHASE 1 — RECONNAISSANCE**
**PHASE 2 — STACK DETECTION**
## 🩺 Repository Health Report
Content
`;
      const result = extractReportOnly(input);
      expect(result).not.toMatch(/\*\*PHASE \d+/);
    });

    it("should handle deep analysis output", () => {
      const input = `
## Evidence Extraction

Some evidence here

## 🔬 Deep Analysis

Deep findings
`;
      const result = extractReportOnly(input);
      expect(result).toContain("Evidence Extraction");
    });
  });

  describe("removeDuplicateSections", () => {
    it("should keep section with more content when duplicates exist", () => {
      const input = `
## Section A
Short

## Section B
Some content

## Section A
Longer content with more details (should keep this)
`;
      const result = removeDuplicateSections(input);
      // Should keep the longer content
      expect(result).toContain("Longer content with more details");
      expect(result).not.toContain("Short\n");
    });

    it("should preserve original document order for first occurrence", () => {
      const input = `
## First
Content 1

## Second
Content 2

## First
Content 1 again (duplicate, uses first position but better content if longer)
`;
      const result = removeDuplicateSections(input);
      // Section A should still appear before Section B (original order)
      const firstIndex = result.indexOf("## First");
      const secondIndex = result.indexOf("## Second");
      expect(firstIndex).toBeLessThan(secondIndex);
    });

    it("should preserve section order", () => {
      const input = `
## First
Content 1

## Second
Content 2

## Third
Content 3
`;
      const result = removeDuplicateSections(input);
      const firstIndex = result.indexOf("First");
      const secondIndex = result.indexOf("Second");
      const thirdIndex = result.indexOf("Third");
      expect(firstIndex).toBeLessThan(secondIndex);
      expect(secondIndex).toBeLessThan(thirdIndex);
    });
  });

  describe("generateCondensedSummary", () => {
    it("should generate summary with repo name", () => {
      const content = "## 🩺 Repository Health Report\n**Health Score:** 85%";
      const result = generateCondensedSummary(content, "vercel/next.js");
      expect(result).toContain("Quick Summary: vercel/next.js");
    });

    it("should extract health score", () => {
      const content = "Health Score: 75%";
      const result = generateCondensedSummary(content, "test/repo");
      expect(result).toContain("75%");
    });

    it("should include issues count section", () => {
      const content = "🚨 Critical issue\n⚠️ Warning\n💡 Suggestion";
      const result = generateCondensedSummary(content, "test/repo");
      expect(result).toContain("Issues Found");
    });
  });
});
