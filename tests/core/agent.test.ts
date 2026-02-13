import { describe, it, expect, vi, beforeEach } from "vitest";
import { analyzeRepositoryWithCopilot } from "../../src/core/agent.js";
import { CopilotClient } from "@github/copilot-sdk";

// Mock CopilotClient
vi.mock("@github/copilot-sdk", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    CopilotClient: class {
      start = vi.fn().mockResolvedValue(undefined);
      createSession = vi.fn().mockResolvedValue({
        on: vi.fn(),
        sendAndWait: vi.fn().mockResolvedValue("Mocked analysis response"),
      });
      stop = vi.fn().mockResolvedValue(undefined);
    },
  };
});

// Mock UI functions to avoid console output
vi.mock("../../src/ui/index.js", () => ({
  startSpinner: vi.fn().mockReturnValue({
    update: vi.fn(),
    success: vi.fn(),
    fail: vi.fn(),
  }),
  updateSpinner: vi.fn(),
  spinnerSuccess: vi.fn(),
  spinnerFail: vi.fn(),
  printWarning: vi.fn(),
  c: {
    dim: vi.fn((s) => s),
    brand: vi.fn((s) => s),
    info: vi.fn((s) => s),
    text: vi.fn((s) => s),
    warning: vi.fn((s) => s),
    healthy: vi.fn((s) => s),
    healthyBold: vi.fn((s) => s),
    warningBold: vi.fn((s) => s),
    check: vi.fn((s) => s),
    warn: vi.fn((s) => s),
  },
  ICON: {
    analyze: "🔍",
    check: "✅",
    warn: "⚠️",
  },
  box: vi.fn().mockReturnValue(["Mocked box output"]),
}));

// Mock extracted modules
vi.mock("../../src/core/agent/index.js", () => ({
  SYSTEM_PROMPT: "Mock system prompt",
  QUICK_SYSTEM_PROMPT: "Mock quick prompt",
  DEEP_SYSTEM_PROMPT: "Mock deep prompt",
  getSystemPrompt: vi.fn().mockReturnValue("Mock system prompt"),
  buildAnalysisPrompt: vi.fn().mockReturnValue("Mock analysis prompt"),
  createGuardrails: vi.fn().mockReturnValue({
    getStats: vi.fn().mockReturnValue({ warningCount: 0 }),
  }),
  createEventHandler: vi.fn().mockReturnValue({
    handler: vi.fn(),
    state: {
      outputBuffer: "Mocked analysis content",
      toolCallCount: 5,
      aborted: false,
      abortReason: null,
    },
  }),
}));

describe("analyzeRepositoryWithCopilot", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should analyze a repository successfully", async () => {
    const options = {
      repoUrl: "https://github.com/owner/repo",
      token: "mock-token",
      model: "claude-sonnet-4",
      verbosity: "normal" as const,
      format: "pretty" as const,
      deep: false,
    };

    const result = await analyzeRepositoryWithCopilot(options);

    expect(result).toEqual({
      content: "Mocked analysis content",
      toolCallCount: 5,
      durationMs: expect.any(Number),
      repoUrl: "https://github.com/owner/repo",
      model: "claude-sonnet-4",
    });
    expect(result.durationMs).toBeGreaterThanOrEqual(0);
  });

  it("should handle deep analysis mode", async () => {
    const options = {
      repoUrl: "https://github.com/owner/repo",
      deep: true,
    };

    const result = await analyzeRepositoryWithCopilot(options);

    expect(result.repoUrl).toBe("https://github.com/owner/repo");
    expect(result.model).toBe("claude-sonnet-4"); // default
  });

  it("should handle silent verbosity", async () => {
    const options = {
      repoUrl: "https://github.com/owner/repo",
      verbosity: "silent" as const,
    };

    const result = await analyzeRepositoryWithCopilot(options);

    expect(result).toBeDefined();
  });

  it("should handle JSON format", async () => {
    const options = {
      repoUrl: "https://github.com/owner/repo",
      format: "json" as const,
    };

    const result = await analyzeRepositoryWithCopilot(options);

    expect(result).toBeDefined();
  });
});