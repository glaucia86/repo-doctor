import { analyzeRepositoryWithCopilot } from "../../../application/core/agent.js";
import type { AnalysisMode, AnalysisReport } from "../../../domain/shared/contracts.js";
import { InMemoryJobRegistry } from "./jobRegistry.js";

interface RunOptions {
  jobId: string;
  repositoryUrl: string;
  analysisMode: AnalysisMode;
  model?: string;
  timeoutSeconds?: number;
  maxFiles?: number;
}

type RunResult =
  | { ok: true; report: AnalysisReport }
  | { ok: false; errorCode: string; message: string };

export async function runAnalysisJob(
  registry: InMemoryJobRegistry,
  options: RunOptions
): Promise<RunResult> {
  const start = registry.startJob(options.jobId);
  if (!start.ok) {
    return start;
  }

  registry.appendEvent(options.jobId, {
    eventType: "job_started",
    message: "Analysis started.",
  });

  try {
    const output = await analyzeRepositoryWithCopilot({
      repoUrl: options.repositoryUrl,
      model: options.model,
      deep: options.analysisMode === "deep",
      maxFiles: options.maxFiles,
      timeout: options.timeoutSeconds ? options.timeoutSeconds * 1000 : undefined,
      verbosity: "silent",
    });

    const report: AnalysisReport = {
      jobId: options.jobId,
      markdownContent: output.content,
      jsonContent: {
        content: output.content,
        toolCallCount: output.toolCallCount,
        durationMs: output.durationMs,
        repoUrl: output.repoUrl,
        model: output.model,
      },
      generatedAt: new Date().toISOString(),
      sourceMode: options.analysisMode,
    };

    if (registry.getJob(options.jobId)?.state === "cancelled") {
      return {
        ok: false,
        errorCode: "JOB_TERMINAL",
        message: "Job was cancelled before completion.",
      };
    }

    const completion = registry.completeJob(options.jobId, report);
    if (!completion.ok) {
      return completion;
    }

    registry.appendEvent(options.jobId, {
      eventType: "completed",
      message: "Analysis completed.",
      percent: 100,
    });

    return { ok: true, report };
  } catch (error) {
    const failure = registry.failJob(
      options.jobId,
      "ANALYSIS_FAILED",
      error instanceof Error ? error.message : "Analysis failed."
    );
    registry.appendEvent(options.jobId, {
      eventType: "error",
      message: failure.ok ? failure.job.errorMessage : "Analysis failed.",
    });

    if (!failure.ok) {
      return failure;
    }

    return {
      ok: false,
      errorCode: failure.job.errorCode ?? "ANALYSIS_FAILED",
      message: failure.job.errorMessage ?? "Analysis failed.",
    };
  }
}


