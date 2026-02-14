import React from "https://esm.sh/react@18.3.1";

interface EmptyStateProps {
  title: string;
  body: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState = ({ title, body, actionLabel, onAction }: EmptyStateProps) => (
  <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-4 text-sm text-slate-600">
    <p className="font-semibold text-slate-700">{title}</p>
    <p className="mt-1">{body}</p>
    {actionLabel && onAction ? (
      <button
        type="button"
        onClick={onAction}
        className="mt-3 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      >
        {actionLabel}
      </button>
    ) : null}
  </div>
);
