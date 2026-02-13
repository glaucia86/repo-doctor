import { describe, bench } from "vitest";
import { analyzeRepositoryWithCopilot } from "../../../src/core/agent.js";

// Mock all dependencies for performance testing
import { vi } from "vitest";

vi.mock("@github/copilot-sdk", async (importOriginal) => {
  const actual = await importOriginal() as Record<string, any>;
  return {
    ...actual,
    CopilotClient: class {
      start = vi.fn().mockResolvedValue(undefined);
      createSession = vi.fn().mockResolvedValue({
        on: vi.fn(),
        sendAndWait: vi.fn().mockImplementation(async () => {
          // Simulate some processing time
          await new Promise(resolve => setTimeout(resolve, 10));
          return "Mocked analysis response";
        }),
        stop: vi.fn().mockResolvedValue(undefined),
      });
    },
  };
});

vi.mock("../../../src/ui/index.js", () => ({
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

vi.mock("../../../src/core/agent/index.js", () => ({
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

describe("Performance Benchmarks", () => {
  bench("analyzeRepositoryWithCopilot - quick analysis", async () => {
    const options = {
      repoUrl: "https://github.com/owner/repo",
      token: "mock-token",
      model: "claude-sonnet-4",
      verbosity: "silent" as const,
      format: "json" as const,
      deep: false,
    };

    await analyzeRepositoryWithCopilot(options);
  }, {
    time: 1000, // Run for 1 second
    iterations: 10, // Minimum iterations
  });

  bench("analyzeRepositoryWithCopilot - deep analysis", async () => {
    const options = {
      repoUrl: "https://github.com/owner/repo",
      token: "mock-token",
      model: "claude-sonnet-4",
      verbosity: "silent" as const,
      format: "json" as const,
      deep: true,
    };

    await analyzeRepositoryWithCopilot(options);
  }, {
    time: 1000,
    iterations: 10,
  });
});