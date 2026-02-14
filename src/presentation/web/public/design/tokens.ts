export const colorTokens = {
  primary: "#0B5FFF",
  primaryHover: "#0047D6",
  primarySoft: "#EAF1FF",
  secondary: "#0F766E",
  secondaryHover: "#0B5E58",
  secondarySoft: "#E6F7F5",
  accent: "#C2410C",
  accentHover: "#9A3412",
  accentSoft: "#FFF1E8",
  neutral900: "#0F172A",
  neutral700: "#334155",
  neutral500: "#64748B",
  border: "#CBD5E1",
  surface: "#FFFFFF",
  page: "#F8FAFC",
  success: "#15803D",
  warning: "#B45309",
  error: "#B91C1C",
  info: "#1D4ED8",
} as const;

export const focusRingClass = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40";

export const buttonClassByVariant = {
  primary:
    "inline-flex items-center rounded-2xl bg-gradient-to-r from-primary to-primaryHover px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50",
  secondary:
    "inline-flex items-center rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50",
  warning:
    "inline-flex items-center rounded-2xl border border-amber-300 bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-900 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50",
  accent:
    "inline-flex items-center rounded-2xl bg-accent px-3 py-2 text-sm font-semibold text-white transition hover:bg-accentHover disabled:cursor-not-allowed disabled:opacity-50",
} as const;
