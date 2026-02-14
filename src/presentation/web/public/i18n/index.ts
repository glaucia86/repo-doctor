import type { Locale } from "../types.ts";
import type { MessageKey } from "./messages.ts";
import { messages } from "./messages.ts";

const STORAGE_KEY = "repo_doctor_locale";
const FALLBACK_LOCALE: Locale = "en-US";

const getStorage = (): Storage | undefined =>
  (globalThis as typeof globalThis & { localStorage?: Storage }).localStorage;

const getNavigatorLanguage = (): string | undefined =>
  (globalThis as typeof globalThis & { navigator?: Navigator }).navigator?.language;

export const getInitialLocale = (): Locale => {
  const storage = getStorage();
  if (storage) {
    try {
      const stored = storage.getItem(STORAGE_KEY);
      if (stored === "pt-BR" || stored === "en-US") return stored;
    } catch {
      return FALLBACK_LOCALE;
    }
  }

  const lang = getNavigatorLanguage();
  if (lang) {
    if (lang.toLowerCase().startsWith("pt")) return "pt-BR";
  }

  return FALLBACK_LOCALE;
};

export const persistLocale = (locale: Locale): void => {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.setItem(STORAGE_KEY, locale);
  } catch {
    return;
  }
};

export const t = (key: MessageKey, locale: Locale): string => {
  const table = messages[locale] || messages[FALLBACK_LOCALE];
  return table[key] || messages[FALLBACK_LOCALE][key];
};
