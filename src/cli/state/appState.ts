/**
 * Application State Management
 * Single Responsibility: Manages global application state
 */

import type { AnalysisResult } from "../../types/schema.js";
import type { AnalysisOutput } from "../../core/agent.js";

// ════════════════════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════════════════════

export interface HistoryEntry {
  repo: string;
  score: number;
  date: string;
  findings: number;
  result: AnalysisResult | null;
}

export interface ModelInfo {
  id: string;
  name: string;
  premium: boolean;
}

export interface IAppState {
  readonly currentModel: string;
  readonly isPremium: boolean;
  readonly lastResult: AnalysisResult | null;
  readonly lastAnalysis: AnalysisOutput | null;
  readonly lastRepo: string | null;
  readonly history: HistoryEntry[];
  readonly isRunning: boolean;

  setModel(modelId: string, isPremium: boolean): void;
  setLastAnalysis(analysis: AnalysisOutput, repo: string): void;
  setLastResult(result: AnalysisResult): void;
  addToHistory(entry: HistoryEntry): void;
  setRunning(running: boolean): void;
  reset(): void;
}

// ════════════════════════════════════════════════════════════════════════════
// AVAILABLE MODELS
// ════════════════════════════════════════════════════════════════════════════

export const AVAILABLE_MODELS: ModelInfo[] = [
  // Free models
  { id: "gpt-4o", name: "GPT-4o", premium: false },
  { id: "gpt-4.1", name: "GPT-4.1", premium: false },
  { id: "gpt-5-mini", name: "GPT-5 mini", premium: false },
  // Premium models
  { id: "claude-sonnet-4", name: "Claude Sonnet 4", premium: true },
  { id: "claude-sonnet-4.5", name: "Claude Sonnet 4.5", premium: true },
  { id: "claude-opus-4.5", name: "Claude Opus 4.5 (Rate Limit: 3x)", premium: true },
  { id: "gpt-5", name: "GPT-5 (Preview)", premium: true },
  { id: "gpt-5.1-codex", name: "GPT-5.1-Codex", premium: true },
  { id: "gpt-5.2-codex", name: "GPT-5.2-Codex", premium: true },
  { id: "o3", name: "o3 (Reasoning)", premium: true },
];

export const DEFAULT_MODEL = "claude-sonnet-4";
export const MAX_HISTORY_SIZE = 10;

// ════════════════════════════════════════════════════════════════════════════
// APP STATE CLASS
// ════════════════════════════════════════════════════════════════════════════

export class AppState implements IAppState {
  private _currentModel: string = DEFAULT_MODEL;
  private _isPremium: boolean = true;
  private _lastResult: AnalysisResult | null = null;
  private _lastAnalysis: AnalysisOutput | null = null;
  private _lastRepo: string | null = null;
  private _history: HistoryEntry[] = [];
  private _isRunning: boolean = true;

  // Getters (readonly access)
  get currentModel(): string {
    return this._currentModel;
  }

  get isPremium(): boolean {
    return this._isPremium;
  }

  get lastResult(): AnalysisResult | null {
    return this._lastResult;
  }

  get lastAnalysis(): AnalysisOutput | null {
    return this._lastAnalysis;
  }

  get lastRepo(): string | null {
    return this._lastRepo;
  }

  get history(): HistoryEntry[] {
    return [...this._history]; // Return copy to prevent mutation
  }

  get isRunning(): boolean {
    return this._isRunning;
  }

  // Mutations
  setModel(modelId: string, isPremium: boolean): void {
    this._currentModel = modelId;
    this._isPremium = isPremium;
  }

  setLastAnalysis(analysis: AnalysisOutput, repo: string): void {
    this._lastAnalysis = analysis;
    this._lastRepo = repo;
  }

  setLastResult(result: AnalysisResult): void {
    this._lastResult = result;
  }

  addToHistory(entry: HistoryEntry): void {
    this._history.unshift(entry);
    // Keep only last N entries
    if (this._history.length > MAX_HISTORY_SIZE) {
      this._history.pop();
    }
  }

  setRunning(running: boolean): void {
    this._isRunning = running;
  }

  reset(): void {
    this._currentModel = DEFAULT_MODEL;
    this._isPremium = true;
    this._lastResult = null;
    this._lastAnalysis = null;
    this._lastRepo = null;
    this._history = [];
    this._isRunning = true;
  }
}

// ════════════════════════════════════════════════════════════════════════════
// SINGLETON INSTANCE (for backward compatibility)
// ════════════════════════════════════════════════════════════════════════════

export const appState = new AppState();

// ════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ════════════════════════════════════════════════════════════════════════════

/**
 * Find a model by ID or name
 */
export function findModel(query: string): ModelInfo | undefined {
  const normalizedQuery = query.toLowerCase();
  
  // Try exact ID match first
  const exactMatch = AVAILABLE_MODELS.find(
    m => m.id.toLowerCase() === normalizedQuery
  );
  if (exactMatch) return exactMatch;
  
  // Try partial name match
  return AVAILABLE_MODELS.find(
    m => m.name.toLowerCase().includes(normalizedQuery)
  );
}

/**
 * Find a model by index (1-based for user display)
 */
export function findModelByIndex(index: number): ModelInfo | undefined {
  if (index >= 1 && index <= AVAILABLE_MODELS.length) {
    return AVAILABLE_MODELS[index - 1];
  }
  return undefined;
}
