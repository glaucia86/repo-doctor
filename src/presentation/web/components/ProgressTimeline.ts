import type { TimelineEvent } from "../state/appStore.js";

export function renderProgressTimeline(events: TimelineEvent[]): string {
  if (events.length === 0) {
    return `<section id="progress-timeline"><p>No progress yet.</p></section>`;
  }

  const items = events
    .map((event) => {
      const percent = typeof event.percent === "number" ? ` (${event.percent}%)` : "";
      return `<li>#${event.sequence} [${event.eventType}] ${event.message ?? ""}${percent}</li>`;
    })
    .join("");

  return `<section id="progress-timeline"><h3>Progress</h3><ol>${items}</ol></section>`;
}
