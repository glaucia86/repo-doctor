import { describe, expect, it } from "vitest";
import { createCreateJobRouteWithRunner } from "../../src/api/routes/createJobRoute.js";
import { createGetReportRoute } from "../../src/api/routes/getReportRoute.js";
import { createExportReportRoute } from "../../src/api/routes/exportReportRoute.js";
import { InMemoryJobRegistry } from "../../src/api/jobs/jobRegistry.js";
import { JobsClient } from "../../src/web/services/jobsClient.js";
import { AppStore } from "../../src/web/state/appStore.js";
import { copyJsonReport, copyMarkdownReport } from "../../src/web/components/CopyReportActions.js";
import { validateReportParity } from "../../src/web/pages/ReportPage.js";

describe("Web copy/export integration flow", () => {
  it("loads completed report and supports copy + export actions", async () => {
    const registry = new InMemoryJobRegistry();
    const runJob: Parameters<typeof createCreateJobRouteWithRunner>[1] = (jobRegistry, options) => {
      jobRegistry.startJob(options.jobId);
      jobRegistry.completeJob(options.jobId, {
        jobId: options.jobId,
        markdownContent: "# Analysis\n\nSummary: Healthy repository",
        jsonContent: { summary: "Healthy repository", score: 97 },
        generatedAt: new Date().toISOString(),
        sourceMode: options.analysisMode,
      });
      return Promise.resolve({ ok: true, report: jobRegistry.getReport(options.jobId)! });
    };

    const createRoute = createCreateJobRouteWithRunner(registry, runJob);
    const reportRoute = createGetReportRoute(registry);
    const exportRoute = createExportReportRoute(registry);

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

      const reportMatch = url.match(/\/jobs\/([^/]+)\/report/);
      if (reportMatch && method === "GET") {
        const response = await reportRoute({ params: { jobId: reportMatch[1] } });
        return new Response(JSON.stringify(response.body), { status: response.statusCode });
      }

      const exportMatch = url.match(/\/jobs\/([^/]+)\/export\?format=(md|json)/);
      if (exportMatch && method === "GET") {
        const response = await exportRoute({
          params: { jobId: exportMatch[1] },
          query: { format: exportMatch[2] as "md" | "json" },
        });
        if (response.statusCode !== 200) {
          return new Response(JSON.stringify(response.body), { status: response.statusCode });
        }
        const artifact = response.body as { content: Buffer; contentType: string };
        return new Response(artifact.content, {
          status: 200,
          headers: { "content-type": artifact.contentType },
        });
      }

      return new Response(JSON.stringify({ message: "Not found" }), { status: 404 });
    };

    const client = new JobsClient("http://local.test", fetchMock);
    const store = new AppStore(client);

    const running = await store.startAnalysis({
      repositoryInput: "owner/repo",
      analysisMode: "quick",
    });
    const completed = await store.loadCompletedReport(running.jobId);
    expect(completed.status).toBe("completed");

    const markdown = copyMarkdownReport({
      markdown: completed.markdownReport,
      json: completed.jsonReport,
    });
    const json = copyJsonReport({
      markdown: completed.markdownReport,
      json: completed.jsonReport,
    });
    expect(markdown).toContain("Summary");
    expect(json).toContain("Healthy repository");

    const mdExport = await client.exportReport(running.jobId, "md");
    const jsonExport = await client.exportReport(running.jobId, "json");
    expect(mdExport.size).toBeGreaterThan(0);
    expect(jsonExport.size).toBeGreaterThan(0);

    expect(
      validateReportParity({
        markdown: completed.markdownReport,
        json: completed.jsonReport,
      })
    ).toBe(true);
  });
});
