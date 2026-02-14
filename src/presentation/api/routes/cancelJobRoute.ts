import { toHttpError } from "../errors/httpErrors.js";
import { InMemoryJobRegistry } from "../jobs/jobRegistry.js";

interface RequestLike {
  params?: {
    jobId?: string;
  };
}

interface ResponseLike {
  statusCode: number;
  body: unknown;
}

export function createCancelJobRoute(registry: InMemoryJobRegistry) {
  return function handleCancelJob(request: RequestLike): ResponseLike {
    const jobId = request.params?.jobId;
    if (!jobId) {
      const error = toHttpError({ errorCode: "JOB_NOT_FOUND", message: "Job ID is required." });
      return { statusCode: error.statusCode, body: error };
    }

    const result = registry.cancelJob(jobId);
    if (!result.ok) {
      const error = toHttpError(result);
      return { statusCode: error.statusCode, body: error };
    }

    return {
      statusCode: 202,
      body: {
        jobId: result.job.jobId,
        state: result.job.state,
      },
    };
  };
}
