import { existsSync } from "node:fs";
import { dirname } from "node:path";
import { describe, expect, it } from "vitest";
import { InMemoryJobRegistry } from "../../src/presentation/api/jobs/jobRegistry.js";
import { createExportReportRoute } from "../../src/presentation/api/routes/exportReportRoute.js";
import type { AnalysisReport } from "../../src/domain/shared/contracts.js";

const createReport = (jobId: string): AnalysisReport => ({
  jobId,
  markdownContent: "# Report",
  jsonContent: { score: 99 },
  generatedAt: new Date().toISOString(),
  sourceMode: "quick",
});

describe("createExportReportRoute cleanup wiring", () => {
  it("registers export artifacts for cleanup via default route factory", () => {
    const registry = new InMemoryJobRegistry();
    const route = createExportReportRoute(registry);

    const job = registry.createJob({
      repositoryInput: "owner/repo",
      analysisMode: "quick",
    });
    registry.startJob(job.jobId);
    registry.completeJob(job.jobId, createReport(job.jobId));

    const response = route({ params: { jobId: job.jobId }, query: { format: "md" } });
    expect(response.statusCode).toBe(200);

    const artifact = response.body as { filePath: string };
    const artifactDir = dirname(artifact.filePath);
    expect(existsSync(artifactDir)).toBe(true);

    const laterJob = registry.createJob({
      repositoryInput: "owner/other",
      analysisMode: "quick",
    });
    registry.startJob(laterJob.jobId);
    registry.cancelJob(laterJob.jobId);

    expect(existsSync(artifactDir)).toBe(false);
  });
});
