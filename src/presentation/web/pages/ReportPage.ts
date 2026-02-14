export type ReportTab = "markdown" | "json";

export function validateReportParity(input: {
  markdown?: string;
  json?: Record<string, unknown>;
}): boolean {
  if (!input.markdown || !input.json) {
    return false;
  }

  const jsonText = JSON.stringify(input.json);
  const keyword = "summary";
  if (!jsonText.includes(keyword)) {
    return true;
  }

  const summaryValue = input.json.summary;
  const summary = typeof summaryValue === "string" ? summaryValue.trim() : "";
  if (!summary) {
    return true;
  }

  return input.markdown.toLowerCase().includes(summary.toLowerCase());
}

export function renderReportPage(input: {
  markdown?: string;
  json?: Record<string, unknown>;
  activeTab?: ReportTab;
}): string {
  const activeTab = input.activeTab ?? "markdown";
  const markdown = input.markdown ?? "No markdown report available.";
  const json = JSON.stringify(input.json ?? {}, null, 2);
  const parity = validateReportParity({ markdown: input.markdown, json: input.json });

  return `
    <section id="report-page">
      <h2>Analysis report</h2>
      <p id="report-parity">Parity check: ${parity ? "ok" : "mismatch"}</p>
      <div role="tablist">
        <button data-tab="markdown"${activeTab === "markdown" ? " aria-selected=\"true\"" : ""}>Markdown</button>
        <button data-tab="json"${activeTab === "json" ? " aria-selected=\"true\"" : ""}>JSON</button>
      </div>
      <article id="report-content">
        ${activeTab === "markdown" ? `<pre>${markdown}</pre>` : `<pre>${json}</pre>`}
      </article>
    </section>
  `;
}
