import { toHttpError } from "../errors/httpErrors.js";
import { InMemoryJobRegistry } from "../jobs/jobRegistry.js";

interface RequestLike {
  params?: {
    jobId?: string;
  };
  query?: {
    format?: "markdown" | "json";
  };
}

interface ResponseLike {
  statusCode: number;
  body: unknown;
}

export function createGetReportRoute(registry: InMemoryJobRegistry) {
  return function handleGetReport(request: RequestLike): ResponseLike {
    const jobId = request.params?.jobId;
    if (!jobId) {
      const error = toHttpError({
        errorCode: "JOB_NOT_FOUND",
        message: "Job ID is required.",
      });
      return { statusCode: error.statusCode, body: error };
    }

    const job = registry.getJob(jobId);
    if (!job) {
      const error = toHttpError({
        errorCode: "JOB_NOT_FOUND",
        message: "Job not found.",
      });
      return { statusCode: error.statusCode, body: error };
    }

    if (job.state !== "completed") {
      const error = toHttpError({
        errorCode: "JOB_NOT_COMPLETED",
        message: "Job is not completed yet.",
      });
      return { statusCode: error.statusCode, body: error };
    }

    const report = registry.getReport(jobId);
    if (!report) {
      const error = toHttpError({
        errorCode: "JOB_NOT_COMPLETED",
        message: "Completed job report was not found.",
      });
      return { statusCode: error.statusCode, body: error };
    }

    const format = request.query?.format;
    const payload =
      format === "json"
        ? { json: report.jsonContent }
        : format === "markdown"
          ? { markdown: report.markdownContent }
          : { markdown: report.markdownContent, json: report.jsonContent };

    return {
      statusCode: 200,
      body: {
        jobId: job.jobId,
        state: job.state,
        report: payload,
      },
    };
  };
}
