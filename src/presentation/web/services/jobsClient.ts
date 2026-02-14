import type { AnalysisMode } from "../../../domain/shared/contracts.js";

interface CreateJobPayload {
  repositoryInput: string;
  analysisMode: AnalysisMode;
  model?: string;
  maxFiles?: number;
  timeoutSeconds?: number;
}

interface CreateJobResponse {
  jobId: string;
  state: string;
}

interface ReportResponse {
  jobId: string;
  state: string;
  report: {
    markdown?: string;
    json?: Record<string, unknown>;
  };
}

interface CancelJobResponse {
  jobId: string;
  state: string;
}

type ProgressEvent = {
  eventId: string;
  jobId: string;
  eventType: string;
  sequence: number;
  timestamp: string;
  message?: string;
  step?: string;
  percent?: number;
};

type FetchLike = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

export class JobsClient {
  constructor(
    private readonly baseUrl: string,
    private readonly fetchImpl: FetchLike = fetch
  ) {}

  async createJob(payload: CreateJobPayload): Promise<CreateJobResponse> {
    const response = await this.fetchImpl(`${this.baseUrl}/jobs`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    return this.readJson<CreateJobResponse>(response);
  }

  async getReport(jobId: string, format?: "markdown" | "json"): Promise<ReportResponse> {
    const query = format ? `?format=${format}` : "";
    const response = await this.fetchImpl(`${this.baseUrl}/jobs/${jobId}/report${query}`, {
      method: "GET",
    });
    return this.readJson<ReportResponse>(response);
  }

  async cancelJob(jobId: string): Promise<CancelJobResponse> {
    const response = await this.fetchImpl(`${this.baseUrl}/jobs/${jobId}/cancel`, {
      method: "POST",
    });
    return this.readJson<CancelJobResponse>(response);
  }

  async streamEvents(jobId: string): Promise<ProgressEvent[]> {
    const response = await this.fetchImpl(`${this.baseUrl}/jobs/${jobId}/events`, {
      method: "GET",
    });
    const payload = await this.readJson<{ seedEvents?: ProgressEvent[] }>(response);
    return payload.seedEvents ?? [];
  }

  async exportReport(jobId: string, format: "md" | "json"): Promise<Blob> {
    const response = await this.fetchImpl(
      `${this.baseUrl}/jobs/${jobId}/export?format=${format}`,
      { method: "GET" }
    );
    if (!response.ok) {
      const body = (await response.json()) as { message?: string };
      throw new Error(body.message ?? "Export failed.");
    }
    return response.blob();
  }

  private async readJson<T>(response: Response): Promise<T> {
    const payload = (await response.json()) as T & { message?: string };
    if (!response.ok) {
      throw new Error(payload.message ?? "Request failed.");
    }
    return payload;
  }
}

