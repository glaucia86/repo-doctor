import { describe, expect, it } from "vitest";
import { InMemoryJobRegistry } from "../../src/presentation/api/jobs/jobRegistry.js";
import type { AnalysisReport } from "../../src/domain/shared/contracts.js";

const createReport = (jobId: string): AnalysisReport => ({
  jobId,
  markdownContent: "# Report",
  jsonContent: { score: 92 },
  generatedAt: new Date().toISOString(),
  sourceMode: "quick",
});

describe("InMemoryJobRegistry state transitions", () => {
  it("creates jobs in idle state", () => {
    const registry = new InMemoryJobRegistry();
    const job = registry.createJob({
      repositoryInput: "owner/repo",
      analysisMode: "quick",
    });

    expect(job.state).toBe("idle");
    expect(registry.getJob(job.jobId)?.state).toBe("idle");
  });

  it("transitions idle -> running -> completed", () => {
    const registry = new InMemoryJobRegistry();
    const job = registry.createJob({
      repositoryInput: "owner/repo",
      analysisMode: "quick",
    });

    const started = registry.startJob(job.jobId);
    expect(started.ok).toBe(true);
    if (!started.ok) return;
    expect(started.job.state).toBe("running");

    const completed = registry.completeJob(job.jobId, createReport(job.jobId));
    expect(completed.ok).toBe(true);
    if (!completed.ok) return;
    expect(completed.job.state).toBe("completed");
    expect(registry.getReport(job.jobId)?.jobId).toBe(job.jobId);
  });

  it("rejects invalid transition idle -> completed", () => {
    const registry = new InMemoryJobRegistry();
    const job = registry.createJob({
      repositoryInput: "owner/repo",
      analysisMode: "quick",
    });

    const result = registry.completeJob(job.jobId, createReport(job.jobId));
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errorCode).toBe("INVALID_JOB_TRANSITION");
  });

  it("blocks transitions from terminal states", () => {
    const registry = new InMemoryJobRegistry();
    const job = registry.createJob({
      repositoryInput: "owner/repo",
      analysisMode: "quick",
    });

    registry.startJob(job.jobId);
    registry.cancelJob(job.jobId);

    const afterTerminal = registry.failJob(job.jobId, "LATE_FAILURE", "Should not change state");
    expect(afterTerminal.ok).toBe(false);
    if (afterTerminal.ok) return;
    expect(afterTerminal.errorCode).toBe("JOB_TERMINAL");
  });
});
