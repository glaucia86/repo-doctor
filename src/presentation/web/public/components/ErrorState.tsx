import React from "https://esm.sh/react@18.3.1";

interface ErrorStateProps {
  title: string;
  message: string;
  retryLabel?: string;
  onRetry?: () => void;
}

export const ErrorState = ({ title, message, retryLabel, onRetry }: ErrorStateProps) => (
  <div className="rounded-2xl border border-red-300 bg-red-50 p-3 text-sm text-red-900" role="alert" aria-live="assertive">
    <p className="font-semibold">{title}</p>
    <p className="mt-1">{message}</p>
    {retryLabel && onRetry ? (
      <button
        type="button"
        onClick={onRetry}
        className="mt-2 rounded-xl border border-red-300 bg-white px-3 py-1.5 text-xs font-semibold text-red-900 transition hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
      >
        {retryLabel}
      </button>
    ) : null}
  </div>
);
