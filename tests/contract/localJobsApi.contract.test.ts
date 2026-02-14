import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  ANALYSIS_MODES,
  EVENT_TYPES,
  JOB_STATES,
} from "../../src/domain/shared/contracts.js";

const contractPath = "specs/001-local-web-ui/contracts/openapi.yaml";
const contract = readFileSync(contractPath, "utf8");

const extractInlineEnum = (pattern: RegExp): string[] => {
  const match = contract.match(pattern);
  if (!match || !match[1]) {
    return [];
  }
  return match[1]
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
};

describe("Local Jobs API contract compatibility", () => {
  it("contains required jobs resource paths", () => {
    expect(contract).toContain("/jobs:");
    expect(contract).toContain("/jobs/{jobId}/events:");
    expect(contract).toContain("/jobs/{jobId}/report:");
    expect(contract).toContain("/jobs/{jobId}/cancel:");
    expect(contract).toContain("/jobs/{jobId}/export:");
  });

  it("matches job state enum with shared contract", () => {
    const enumValues = extractInlineEnum(/JobState:[\s\S]*?enum:\s*\[([^\]]+)\]/m);
    expect(enumValues).toEqual([...JOB_STATES]);
  });

  it("matches progress event enum with shared contract", () => {
    const enumValues = extractInlineEnum(/eventType:[\s\S]*?enum:\s*\[([^\]]+)\]/m);
    expect(enumValues).toEqual([...EVENT_TYPES]);
  });

  it("matches analysis mode enum with shared contract", () => {
    const enumValues = extractInlineEnum(/analysisMode:[\s\S]*?enum:\s*\[([^\]]+)\]/m);
    expect(enumValues).toEqual([...ANALYSIS_MODES]);
  });
});
