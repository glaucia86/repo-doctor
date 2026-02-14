import { describe, expect, it } from "vitest";
import { toHttpError } from "../../src/presentation/api/errors/httpErrors.js";
import { EventStreamHub } from "../../src/presentation/api/jobs/eventStreamHub.js";
import { InMemoryJobRegistry } from "../../src/presentation/api/jobs/jobRegistry.js";

describe("sanitized logging and events", () => {
  it("redacts token-like data in HTTP error messages", () => {
    const error = toHttpError({
      errorCode: "INTERNAL_ERROR",
      message: "failed with ghp_secretToken123 and should be redacted",
    });

    expect(error.message).not.toContain("ghp_secretToken123");
    expect(error.message).toContain("[redacted-token]");
  });

  it("redacts token-like data in streamed job events", () => {
    const registry = new InMemoryJobRegistry();
    const hub = new EventStreamHub(registry);
    const stop = hub.start();

    const job = registry.createJob({
      repositoryInput: "owner/repo",
      analysisMode: "quick",
    });

    let capturedMessage = "";
    const unsubscribe = hub.subscribe(job.jobId, (event) => {
      capturedMessage = event.message ?? "";
    });

    registry.appendEvent(job.jobId, {
      eventType: "progress",
      message: "token leaked ghp_secretToken123",
      percent: 20,
    });

    expect(capturedMessage).toContain("[redacted-token]");
    expect(capturedMessage).not.toContain("ghp_secretToken123");

    unsubscribe();
    stop();
  });
});
