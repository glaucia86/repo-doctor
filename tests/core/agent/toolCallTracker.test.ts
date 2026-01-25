/**
 * Tests for ToolCallTracker
 */
import { describe, it, expect, beforeEach } from "vitest";
import { ToolCallTracker } from "../../../src/core/agent/toolCallTracker.js";

describe("ToolCallTracker", () => {
  let tracker: ToolCallTracker;

  beforeEach(() => {
    tracker = new ToolCallTracker({
      maxToolCalls: 10,
      maxConsecutiveRepeats: 3,
      minSequenceLength: 2,
      timeWindowMs: 60000,
    });
  });

  describe("recordCall", () => {
    it("should record tool calls", () => {
      tracker.recordCall("get_repo_meta", { repoUrl: "owner/repo" });
      expect(tracker.getCallCount()).toBe(1);
    });

    it("should increment call count", () => {
      tracker.recordCall("tool1", {});
      tracker.recordCall("tool2", {});
      tracker.recordCall("tool3", {});
      expect(tracker.getCallCount()).toBe(3);
    });
  });

  describe("detectLoop - step limit", () => {
    it("should detect step limit reached", () => {
      // Fill up to maxToolCalls
      for (let i = 0; i < 10; i++) {
        tracker.recordCall(`tool${i}`, { index: i });
      }
      
      const result = tracker.detectLoop();
      expect(result.isLoop).toBe(true);
      expect(result.type).toBe("step-limit");
    });

    it("should not trigger before limit", () => {
      for (let i = 0; i < 9; i++) {
        tracker.recordCall(`tool${i}`, { index: i });
      }
      
      const result = tracker.detectLoop();
      expect(result.isLoop).toBe(false);
      expect(result.type).toBe("none");
    });
  });

  describe("detectLoop - exact repeats", () => {
    it("should detect consecutive identical calls", () => {
      const args = { path: "README.md" };
      tracker.recordCall("read_repo_file", args);
      tracker.recordCall("read_repo_file", args);
      tracker.recordCall("read_repo_file", args);
      
      const result = tracker.detectLoop();
      expect(result.isLoop).toBe(true);
      expect(result.type).toBe("exact-repeat");
      expect(result.consecutiveRepeats).toBe(3);
    });

    it("should not trigger for different args", () => {
      tracker.recordCall("read_repo_file", { path: "README.md" });
      tracker.recordCall("read_repo_file", { path: "LICENSE" });
      tracker.recordCall("read_repo_file", { path: "package.json" });
      
      const result = tracker.detectLoop();
      expect(result.isLoop).toBe(false);
    });

    it("should not trigger for different tools", () => {
      tracker.recordCall("get_repo_meta", {});
      tracker.recordCall("list_repo_files", {});
      tracker.recordCall("read_repo_file", {});
      
      const result = tracker.detectLoop();
      expect(result.isLoop).toBe(false);
    });
  });

  describe("detectLoop - sequence loops", () => {
    it("should detect A→B→A→B pattern with same args", () => {
      tracker.recordCall("tool_a", {});
      tracker.recordCall("tool_b", {});
      tracker.recordCall("tool_a", {});
      tracker.recordCall("tool_b", {});
      
      const result = tracker.detectLoop();
      expect(result.isLoop).toBe(true);
      expect(result.type).toBe("sequence-loop");
    });

    it("should detect A→B→C→A→B→C pattern with same args", () => {
      tracker.recordCall("tool_a", {});
      tracker.recordCall("tool_b", {});
      tracker.recordCall("tool_c", {});
      tracker.recordCall("tool_a", {});
      tracker.recordCall("tool_b", {});
      tracker.recordCall("tool_c", {});
      
      const result = tracker.detectLoop();
      expect(result.isLoop).toBe(true);
      expect(result.type).toBe("sequence-loop");
    });

    it("should NOT trigger when same tool reads different files (expected behavior)", () => {
      // This simulates the agent reading multiple files during analysis
      // which is expected behavior and should NOT be flagged as a loop
      tracker.recordCall("read_repo_file", { path: "README.md" });
      tracker.recordCall("read_repo_file", { path: "LICENSE" });
      tracker.recordCall("read_repo_file", { path: "package.json" });
      tracker.recordCall("read_repo_file", { path: "CONTRIBUTING.md" });
      
      const result = tracker.detectLoop();
      expect(result.isLoop).toBe(false);
      expect(result.type).toBe("none");
    });

    it("should NOT trigger for sequence with different args", () => {
      // Same tool sequence but with different arguments
      tracker.recordCall("read_repo_file", { path: "file1" });
      tracker.recordCall("list_repo_files", { dir: "/" });
      tracker.recordCall("read_repo_file", { path: "file2" });
      tracker.recordCall("list_repo_files", { dir: "/src" });
      
      const result = tracker.detectLoop();
      expect(result.isLoop).toBe(false);
    });

    it("should not trigger for non-repeating sequences", () => {
      tracker.recordCall("tool_a", {});
      tracker.recordCall("tool_b", {});
      tracker.recordCall("tool_c", {});
      tracker.recordCall("tool_d", {});
      
      const result = tracker.detectLoop();
      expect(result.isLoop).toBe(false);
    });
  });

  describe("getSummary", () => {
    it("should return tool usage counts", () => {
      tracker.recordCall("read_repo_file", { path: "a" });
      tracker.recordCall("read_repo_file", { path: "b" });
      tracker.recordCall("get_repo_meta", {});
      tracker.recordCall("read_repo_file", { path: "c" });
      
      const summary = tracker.getSummary();
      expect(summary).toContainEqual({ tool: "read_repo_file", count: 3 });
      expect(summary).toContainEqual({ tool: "get_repo_meta", count: 1 });
    });

    it("should sort by count descending", () => {
      tracker.recordCall("tool_a", {});
      tracker.recordCall("tool_b", {});
      tracker.recordCall("tool_b", {});
      tracker.recordCall("tool_c", {});
      tracker.recordCall("tool_c", {});
      tracker.recordCall("tool_c", {});
      
      const summary = tracker.getSummary();
      expect(summary[0]?.tool).toBe("tool_c");
      expect(summary[0]?.count).toBe(3);
    });
  });

  describe("reset", () => {
    it("should clear all recorded calls", () => {
      tracker.recordCall("tool1", {});
      tracker.recordCall("tool2", {});
      expect(tracker.getCallCount()).toBe(2);
      
      tracker.reset();
      expect(tracker.getCallCount()).toBe(0);
    });
  });
});
