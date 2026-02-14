import { describe, expect, it } from "vitest";
import { createCreateJobRouteWithRunner } from "../../src/api/routes/createJobRoute.js";
import { createCancelJobRoute } from "../../src/api/routes/cancelJobRoute.js";
import { createStreamEventsRoute } from "../../src/api/routes/streamEventsRoute.js";
import { EventStreamHub } from "../../src/api/jobs/eventStreamHub.js";
import { InMemoryJobRegistry } from "../../src/api/jobs/jobRegistry.js";
import { AppStore } from "../../src/web/state/appStore.js";
import { JobsClient } from "../../src/web/services/jobsClient.js";

describe("Web stream/cancel integration flow", () => {
  it("streams job progress and cancels running job", async () => {
    const registry = new InMemoryJobRegistry();
    const hub = new EventStreamHub(registry);
    const stop = hub.start();

    const runJob: Parameters<typeof createCreateJobRouteWithRunner>[1] = (jobRegistry, options) => {
      jobRegistry.startJob(options.jobId);
      jobRegistry.appendEvent(options.jobId, {
        eventType: "progress",
        message: "Indexing repository...",
        percent: 35,
      });
      return Promise.resolve({
        ok: false,
        errorCode: "RUNNING",
        message: "Still running",
      });
    };

    const createRoute = createCreateJobRouteWithRunner(registry, runJob);
    const cancelRoute = createCancelJobRoute(registry);
    const streamRoute = createStreamEventsRoute(registry, hub);

    const fetchMock = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      const url =
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.toString()
            : input.url;
      const method = init?.method ?? "GET";

      if (url.endsWith("/jobs") && method === "POST") {
        const requestBody = typeof init?.body === "string" ? init.body : "{}";
        const body = JSON.parse(requestBody) as Record<string, unknown>;
        const response = await createRoute({ body });
        return new Response(JSON.stringify(response.body), { status: response.statusCode });
      }

      const eventsMatch = url.match(/\/jobs\/([^/]+)\/events/);
      if (eventsMatch && method === "GET") {
        const response = await streamRoute({ params: { jobId: eventsMatch[1] } });
        return new Response(JSON.stringify(response.body), { status: response.statusCode });
      }

      const cancelMatch = url.match(/\/jobs\/([^/]+)\/cancel/);
      if (cancelMatch && method === "POST") {
        const response = await cancelRoute({ params: { jobId: cancelMatch[1] } });
        return new Response(JSON.stringify(response.body), { status: response.statusCode });
      }

      return new Response(JSON.stringify({ message: "Not found" }), { status: 404 });
    };

    const client = new JobsClient("http://local.test", fetchMock);
    const store = new AppStore(client);

    const running = await store.startAnalysis({
      repositoryInput: "owner/repo",
      analysisMode: "quick",
    });
    expect(running.status).toBe("running");
    expect(running.jobId).toBeDefined();

    const withEvents = await store.refreshProgressEvents(running.jobId!);
    expect(withEvents.timeline?.some((event) => event.eventType === "progress")).toBe(true);

    const cancelled = await store.cancelRunningJob();
    expect(cancelled.status).toBe("cancelled");

    stop();
  });
});
