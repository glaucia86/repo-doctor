import { randomUUID } from "node:crypto";
import {
  type AnalysisJob,
  type AnalysisReport,
  type ProgressEvent,
  type ProgressEventType,
  type RunConfiguration,
} from "../../../domain/shared/contracts.js";

type TransitionResult =
  | { ok: true; job: AnalysisJob }
  | { ok: false; errorCode: string; message: string };

const TERMINAL_STATES = new Set(["completed", "error", "cancelled"]);

const isTerminalState = (state: AnalysisJob["state"]): boolean =>
  TERMINAL_STATES.has(state);

const nowIso = (): string => new Date().toISOString();

export class InMemoryJobRegistry {
  private readonly jobs = new Map<string, AnalysisJob>();
  private readonly reports = new Map<string, AnalysisReport>();
  private readonly events = new Map<string, ProgressEvent[]>();
  private readonly listeners = new Set<(event: ProgressEvent, job: AnalysisJob) => void>();

  createJob(configuration: RunConfiguration): AnalysisJob {
    const jobId = randomUUID();
    const job: AnalysisJob = {
      jobId,
      configuration,
      state: "idle",
      createdAt: nowIso(),
    };
    this.jobs.set(jobId, job);
    this.events.set(jobId, []);
    return job;
  }

  getJob(jobId: string): AnalysisJob | undefined {
    return this.jobs.get(jobId);
  }

  getReport(jobId: string): AnalysisReport | undefined {
    return this.reports.get(jobId);
  }

  getEvents(jobId: string): ProgressEvent[] {
    return [...(this.events.get(jobId) ?? [])];
  }

  startJob(jobId: string): TransitionResult {
    return this.transition(jobId, "running", (job) => ({
      ...job,
      startedAt: job.startedAt ?? nowIso(),
    }));
  }

  completeJob(jobId: string, report: AnalysisReport): TransitionResult {
    const transition = this.transition(jobId, "completed", (job) => ({
      ...job,
      finishedAt: nowIso(),
      reportRef: report.jobId,
      errorCode: undefined,
      errorMessage: undefined,
    }));

    if (transition.ok) {
      this.reports.set(jobId, report);
    }

    return transition;
  }

  failJob(jobId: string, errorCode: string, errorMessage: string): TransitionResult {
    return this.transition(jobId, "error", (job) => ({
      ...job,
      finishedAt: nowIso(),
      errorCode,
      errorMessage,
    }));
  }

  cancelJob(jobId: string): TransitionResult {
    return this.transition(jobId, "cancelled", (job) => ({
      ...job,
      cancelRequestedAt: job.cancelRequestedAt ?? nowIso(),
      finishedAt: nowIso(),
    }));
  }

  appendEvent(
    jobId: string,
    event: Omit<ProgressEvent, "eventId" | "jobId" | "sequence" | "timestamp"> & {
      eventType: ProgressEventType;
    }
  ): ProgressEvent | undefined {
    const job = this.jobs.get(jobId);
    if (!job) {
      return undefined;
    }

    const existingEvents = this.events.get(jobId) ?? [];
    const nextEvent: ProgressEvent = {
      eventId: randomUUID(),
      jobId,
      eventType: event.eventType,
      sequence: existingEvents.length + 1,
      timestamp: nowIso(),
      message: event.message,
      step: event.step,
      percent: event.percent,
    };

    existingEvents.push(nextEvent);
    this.events.set(jobId, existingEvents);
    this.notify(nextEvent, job);
    return nextEvent;
  }

  subscribe(listener: (event: ProgressEvent, job: AnalysisJob) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private transition(
    jobId: string,
    targetState: AnalysisJob["state"],
    buildJob: (job: AnalysisJob) => AnalysisJob
  ): TransitionResult {
    const current = this.jobs.get(jobId);
    if (!current) {
      return {
        ok: false,
        errorCode: "JOB_NOT_FOUND",
        message: `Job ${jobId} was not found.`,
      };
    }

    if (current.state === targetState) {
      return { ok: true, job: current };
    }

    if (isTerminalState(current.state)) {
      return {
        ok: false,
        errorCode: "JOB_TERMINAL",
        message: `Job ${jobId} is already in terminal state ${current.state}.`,
      };
    }

    const allowed = this.isAllowedTransition(current.state, targetState);
    if (!allowed) {
      return {
        ok: false,
        errorCode: "INVALID_JOB_TRANSITION",
        message: `Cannot transition job ${jobId} from ${current.state} to ${targetState}.`,
      };
    }

    const updated = buildJob({ ...current, state: targetState });
    this.jobs.set(jobId, updated);
    this.appendEvent(jobId, {
      eventType: targetState === "running" ? "job_started" : targetState === "completed" ? "completed" : targetState === "error" ? "error" : "step_update",
      message: `Job moved to ${targetState}.`,
    });
    return { ok: true, job: updated };
  }

  private isAllowedTransition(
    from: AnalysisJob["state"],
    to: AnalysisJob["state"]
  ): boolean {
    if (from === "idle" && to === "running") return true;
    if (from === "running" && (to === "completed" || to === "error" || to === "cancelled")) {
      return true;
    }
    return false;
  }

  private notify(event: ProgressEvent, job: AnalysisJob): void {
    for (const listener of this.listeners) {
      listener(event, job);
    }
  }
}

