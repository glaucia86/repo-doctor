import { toHttpError } from "../errors/httpErrors.js";
import { buildExportArtifact } from "../jobs/exportService.js";
import { InMemoryJobRegistry } from "../jobs/jobRegistry.js";
import { CleanupService } from "../jobs/cleanupService.js";

interface RequestLike {
  params?: { jobId?: string };
  query?: { format?: "md" | "json" };
}

interface ResponseLike {
  statusCode: number;
  body: unknown;
}

export function createExportReportRoute(registry: InMemoryJobRegistry) {
  const cleanupService = new CleanupService();
  cleanupService.hookIntoRegistry(registry);
  return createExportReportRouteWithCleanup(registry, cleanupService);
}

export function createExportReportRouteWithCleanup(
  registry: InMemoryJobRegistry,
  cleanupService?: CleanupService
) {
  return function handleExportReport(request: RequestLike): ResponseLike {
    const jobId = request.params?.jobId;
    const format = request.query?.format;
    if (!jobId) {
      const error = toHttpError({ errorCode: "JOB_NOT_FOUND", message: "Job ID is required." });
      return { statusCode: error.statusCode, body: error };
    }
    if (format !== "md" && format !== "json") {
      const error = toHttpError({
        errorCode: "INVALID_EXPORT_FORMAT",
        message: "Export format must be md or json.",
        statusCode: 400,
      });
      return { statusCode: error.statusCode, body: error };
    }

    const job = registry.getJob(jobId);
    if (!job) {
      const error = toHttpError({ errorCode: "JOB_NOT_FOUND", message: "Job not found." });
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
        message: "Completed report is missing.",
      });
      return { statusCode: error.statusCode, body: error };
    }

    const artifact = buildExportArtifact(report, format);
    cleanupService?.registerArtifact(artifact);
    return {
      statusCode: 200,
      body: artifact,
    };
  };
}
