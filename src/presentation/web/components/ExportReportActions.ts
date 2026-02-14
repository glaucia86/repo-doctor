import type { JobsClient } from "../services/jobsClient.js";

export function renderExportReportActions(): string {
  return `
    <section id="export-actions">
      <button data-export-format="md" type="button">Export Markdown</button>
      <button data-export-format="json" type="button">Export JSON</button>
    </section>
  `;
}

export async function requestReportExport(
  client: Pick<JobsClient, "exportReport">,
  jobId: string,
  format: "md" | "json"
): Promise<Blob> {
  return client.exportReport(jobId, format);
}
