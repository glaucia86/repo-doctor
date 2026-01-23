/**
 * Vitest Setup File
 * Global test configuration and utilities
 */

import { beforeAll, afterAll, vi } from "vitest";

// Mock console to reduce noise in tests
beforeAll(() => {
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterAll(() => {
  vi.restoreAllMocks();
});
