/**
 * Tests for AgentGuardrails
 */
import { describe, it, expect, beforeEach } from "vitest";
import { AgentGuardrails, createGuardrails } from "../../../src/core/agent/guardrails.js";

describe("AgentGuardrails", () => {
  let guardrails: AgentGuardrails;

  beforeEach(() => {
    guardrails = new AgentGuardrails({
      maxToolCalls: 10,
      maxConsecutiveRepeats: 3,
      minSequenceLength: 2,
      timeWindowMs: 60000,
      verbose: false,
      onLoopAction: "warn",
    });
  });

  describe("onToolStart", () => {
    it("should return continue for normal calls", () => {
      const action = guardrails.onToolStart("get_repo_meta", { repoUrl: "owner/repo" });
      expect(action.type).toBe("continue");
    });

    it("should return warn on first loop detection", () => {
      const args = { path: "README.md" };
      guardrails.onToolStart("read_repo_file", args);
      guardrails.onToolStart("read_repo_file", args);
      const action = guardrails.onToolStart("read_repo_file", args);
      
      expect(action.type).toBe("warn");
    });

    it("should return inject-message on second loop detection", () => {
      const args = { path: "README.md" };
      
      // First loop detection (3 calls)
      guardrails.onToolStart("read_repo_file", args);
      guardrails.onToolStart("read_repo_file", args);
      guardrails.onToolStart("read_repo_file", args); // First warn
      
      // Second loop detection
      const action = guardrails.onToolStart("read_repo_file", args);
      expect(action.type).toBe("inject-message");
    });

    it("should return abort on step limit", () => {
      // Fill up to maxToolCalls
      for (let i = 0; i < 10; i++) {
        guardrails.onToolStart(`tool${i}`, { index: i });
      }
      
      const stats = guardrails.getStats();
      expect(stats.totalCalls).toBe(10);
      expect(guardrails.shouldAbort()).toBe(true);
    });
  });

  describe("getStats", () => {
    it("should return correct statistics", () => {
      guardrails.onToolStart("tool_a", {});
      guardrails.onToolStart("tool_b", {});
      guardrails.onToolStart("tool_a", {});
      
      const stats = guardrails.getStats();
      expect(stats.totalCalls).toBe(3);
      expect(stats.warningCount).toBe(0);
      expect(stats.toolUsage).toContainEqual({ tool: "tool_a", count: 2 });
      expect(stats.toolUsage).toContainEqual({ tool: "tool_b", count: 1 });
    });
  });

  describe("shouldAbort", () => {
    it("should return false initially", () => {
      expect(guardrails.shouldAbort()).toBe(false);
    });

    it("should return true after 3 warnings", () => {
      const args = { path: "README.md" };
      
      // Generate warnings by repeating calls
      for (let i = 0; i < 12; i++) {
        guardrails.onToolStart("read_repo_file", args);
      }
      
      expect(guardrails.shouldAbort()).toBe(true);
    });
  });

  describe("reset", () => {
    it("should clear all state", () => {
      guardrails.onToolStart("tool", {});
      guardrails.onToolStart("tool", {});
      guardrails.onToolStart("tool", {}); // Triggers warning
      
      const statsBefore = guardrails.getStats();
      expect(statsBefore.totalCalls).toBe(3);
      expect(statsBefore.warningCount).toBe(1);
      
      guardrails.reset();
      
      const statsAfter = guardrails.getStats();
      expect(statsAfter.totalCalls).toBe(0);
      expect(statsAfter.warningCount).toBe(0);
    });
  });
});

describe("createGuardrails", () => {
  it("should create standard guardrails", () => {
    const guardrails = createGuardrails("standard");
    expect(guardrails).toBeInstanceOf(AgentGuardrails);
  });

  it("should create deep guardrails with higher limits", () => {
    const guardrails = createGuardrails("deep");
    
    // Deep mode allows more calls - fill up standard limit
    for (let i = 0; i < 50; i++) {
      guardrails.onToolStart(`tool${i}`, { index: i });
    }
    
    // Should not abort yet in deep mode (limit is 80)
    expect(guardrails.shouldAbort()).toBe(false);
  });

  it("should create strict guardrails with lower limits", () => {
    const guardrails = createGuardrails("strict");
    
    // Strict mode has lower limit (30)
    for (let i = 0; i < 30; i++) {
      guardrails.onToolStart(`tool${i}`, { index: i });
    }
    
    expect(guardrails.shouldAbort()).toBe(true);
  });
});
