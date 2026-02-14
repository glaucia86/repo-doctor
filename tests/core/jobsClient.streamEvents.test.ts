import { describe, expect, it } from "vitest";
import { JobsClient } from "../../src/presentation/web/services/jobsClient.js";

describe("JobsClient.streamEvents", () => {
  it("parses seed events from SSE responses", async () => {
    const event = {
      eventId: "evt-1",
      jobId: "job-1",
      eventType: "progress",
      sequence: 1,
      timestamp: new Date().toISOString(),
      message: "Indexing repository...",
      percent: 25,
    };
    const sseBody = `data: ${JSON.stringify(event)}\n\n`;
    const fetchMock = (): Promise<Response> =>
      Promise.resolve(
        new Response(sseBody, {
          status: 200,
          headers: { "content-type": "text/event-stream" },
        })
      );

    const client = new JobsClient("http://local.test", fetchMock);
    const events = await client.streamEvents("job-1");

    expect(events).toEqual([event]);
  });

  it("falls back to JSON payload when endpoint is mocked as JSON", async () => {
    const event = {
      eventId: "evt-2",
      jobId: "job-2",
      eventType: "progress",
      sequence: 2,
      timestamp: new Date().toISOString(),
      message: "Analyzing files...",
      percent: 55,
    };
    const fetchMock = (): Promise<Response> =>
      Promise.resolve(new Response(JSON.stringify({ seedEvents: [event] }), { status: 200 }));

    const client = new JobsClient("http://local.test", fetchMock);
    const events = await client.streamEvents("job-2");

    expect(events).toEqual([event]);
  });

  it("throws API error messages for non-2xx responses", async () => {
    const fetchMock = (): Promise<Response> =>
      Promise.resolve(
        new Response(JSON.stringify({ message: "Job not found." }), {
          status: 404,
          headers: { "content-type": "application/json; charset=utf-8" },
        })
      );

    const client = new JobsClient("http://local.test", fetchMock);

    await expect(client.streamEvents("missing-job")).rejects.toThrow("Job not found.");
  });
});
