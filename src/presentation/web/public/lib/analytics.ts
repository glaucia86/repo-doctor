import type { UiEvent, UiEventName } from "../types.ts";

const KEY = "repo_doctor_ui_events";
const LIMIT = 300;

const nowIso = () => new Date().toISOString();
const getStorage = (): Storage | undefined =>
  (globalThis as typeof globalThis & { localStorage?: Storage }).localStorage;

export const trackUiEvent = (name: UiEventName, context?: UiEvent["context"]): void => {
  const storage = getStorage();
  if (!storage) return;
  try {
    const raw = storage.getItem(KEY);
    const current = raw ? (JSON.parse(raw) as UiEvent[]) : [];
    const event: UiEvent = { name, timestamp: nowIso(), context };
    const next = [...current, event].slice(-LIMIT);
    storage.setItem(KEY, JSON.stringify(next));
  } catch {
    return;
  }
};

export const readUiEvents = (): UiEvent[] => {
  const storage = getStorage();
  if (!storage) return [];
  try {
    const raw = storage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as UiEvent[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};
