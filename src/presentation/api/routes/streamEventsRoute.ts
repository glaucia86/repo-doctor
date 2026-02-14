import type { ProgressEvent } from "../../../domain/shared/contracts.js";
import { toHttpError } from "../errors/httpErrors.js";
import { EventStreamHub } from "../jobs/eventStreamHub.js";
import { InMemoryJobRegistry } from "../jobs/jobRegistry.js";

interface RequestLike {
  params?: {
    jobId?: string;
  };
}

interface StreamResponse {
  statusCode: number;
  body: unknown;
}

export function createStreamEventsRoute(
  registry: InMemoryJobRegistry,
  hub: EventStreamHub
) {
  return function handleStreamEvents(request: RequestLike): StreamResponse {
    const jobId = request.params?.jobId;
    if (!jobId) {
      const error = toHttpError({ errorCode: "JOB_NOT_FOUND", message: "Job ID is required." });
      return { statusCode: error.statusCode, body: error };
    }

    const job = registry.getJob(jobId);
    if (!job) {
      const error = toHttpError({ errorCode: "JOB_NOT_FOUND", message: "Job not found." });
      return { statusCode: error.statusCode, body: error };
    }

    const seedEvents = registry.getEvents(jobId);
    return {
      statusCode: 200,
      body: {
        contentType: "text/event-stream",
        seedEvents,
        subscribe: (onEvent: (event: ProgressEvent) => void) => hub.subscribe(jobId, onEvent),
      },
    };
  };
}

