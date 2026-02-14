import type { AnalysisJob, ProgressEvent } from "../../../domain/shared/contracts.js";
import { InMemoryJobRegistry } from "./jobRegistry.js";

type EventListener = (event: ProgressEvent) => void;

const redact = (value: string | undefined): string | undefined => {
  if (!value) return value;
  return value.replace(/gh[pousr]_[A-Za-z0-9_]+/g, "[redacted-token]");
};

export class EventStreamHub {
  private readonly listeners = new Map<string, Set<EventListener>>();

  constructor(private readonly registry: InMemoryJobRegistry) {}

  start(): () => void {
    return this.registry.subscribe((event, job) => this.broadcast(event, job));
  }

  subscribe(jobId: string, listener: EventListener): () => void {
    const byJob = this.listeners.get(jobId) ?? new Set<EventListener>();
    byJob.add(listener);
    this.listeners.set(jobId, byJob);
    return () => {
      byJob.delete(listener);
      if (byJob.size === 0) {
        this.listeners.delete(jobId);
      }
    };
  }

  private broadcast(event: ProgressEvent, _job: AnalysisJob): void {
    const subscribers = this.listeners.get(event.jobId);
    if (!subscribers || subscribers.size === 0) {
      return;
    }

    const safeEvent: ProgressEvent = {
      ...event,
      message: redact(event.message),
    };

    for (const listener of subscribers) {
      listener(safeEvent);
    }
  }
}

