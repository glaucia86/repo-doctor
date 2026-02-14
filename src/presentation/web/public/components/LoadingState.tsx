import React from "https://esm.sh/react@18.3.1";

export const LoadingState = ({ label }: { label: string }) => (
  <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-4" aria-live="polite">
    <p className="text-sm font-medium text-slate-700">{label}</p>
    <div className="h-3 w-4/5 animate-pulse rounded bg-slate-200" />
    <div className="h-3 w-3/5 animate-pulse rounded bg-slate-200" />
    <div className="h-3 w-2/3 animate-pulse rounded bg-slate-200" />
  </div>
);
