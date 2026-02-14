export interface RouteDefinition {
  method: "GET" | "POST";
  path: string;
  handlerName: string;
}

export interface JobsRouter {
  readonly basePath: "/jobs";
  readonly routes: RouteDefinition[];
}

export function createJobsRouter(): JobsRouter {
  return {
    basePath: "/jobs",
    routes: [
      { method: "POST", path: "/jobs", handlerName: "createJobRoute" },
      { method: "GET", path: "/jobs/:jobId/report", handlerName: "getReportRoute" },
      { method: "GET", path: "/jobs/:jobId/events", handlerName: "streamEventsRoute" },
      { method: "POST", path: "/jobs/:jobId/cancel", handlerName: "cancelJobRoute" },
      { method: "GET", path: "/jobs/:jobId/export", handlerName: "exportReportRoute" },
    ],
  };
}
