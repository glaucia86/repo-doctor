import type { ModelOption } from "./types.ts";
import { colorTokens } from "./design/tokens.ts";

const getApiBase = (): string => {
  const maybeWindow = globalThis as typeof globalThis & {
    __REPO_DOCTOR_API_BASE__?: string;
  };
  return maybeWindow.__REPO_DOCTOR_API_BASE__ ?? "http://localhost:3001";
};

export const apiBase = getApiBase();

export const DEFAULT_MODEL_OPTIONS: ModelOption[] = [
  { id: "claude-sonnet-4", name: "Claude Sonnet 4", premium: true },
  { id: "gpt-4o", name: "GPT-4o", premium: false },
  { id: "gpt-4.1", name: "GPT-4.1", premium: false },
  { id: "gpt-5.3-codex", name: "GPT-5.3-Codex", premium: true },
  { id: "o3", name: "o3", premium: true },
];

export const toneByState: Record<string, string> = {
  idle: "text-slate-700 bg-slate-100 border border-slate-200",
  running: "text-amber-900 bg-amber-100 border border-amber-200",
  completed: "text-emerald-900 bg-emerald-100 border border-emerald-200",
  cancelled: "text-slate-800 bg-slate-200 border border-slate-300",
  error: "text-rose-900 bg-rose-100 border border-rose-200",
};

export const cardClass = "glass spotlight-card rounded-3xl p-5 shadow-panel";
export const selectShellClass =
  "group relative overflow-hidden rounded-2xl border border-slate-300 bg-white/90 transition focus-within:border-cobalt focus-within:ring-2 focus-within:ring-cobalt/20";
export const selectClass =
  "w-full appearance-none bg-transparent px-3 py-2.5 pr-10 text-sm font-medium text-slate-800 outline-none";

export const semanticColors = colorTokens;
