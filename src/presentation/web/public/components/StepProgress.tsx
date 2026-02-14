import React from "https://esm.sh/react@18.3.1";
import type { JobState, Locale } from "../types.ts";
import { t } from "../i18n/index.ts";

const labelByStep = {
  setup: "stepsSetup",
  running: "stepsRunning",
  review: "stepsReview",
  export: "stepsExport",
} as const;

const activeIndexByState: Record<JobState, number> = {
  idle: 0,
  running: 1,
  completed: 3,
  cancelled: 1,
  error: 1,
};

export const StepProgress = ({ state, locale }: { state: JobState; locale: Locale }) => {
  const steps = ["setup", "running", "review", "export"] as const;
  const activeIndex = activeIndexByState[state] ?? 0;

  return (
    <ol className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-4" aria-label="Analysis progress steps">
      {steps.map((step, index) => {
        const active = index <= activeIndex;
        return (
          <li
            key={step}
            className={`glass rounded-2xl border px-3 py-2 text-xs font-semibold transition ${
              active ? "border-primary/35 text-primary" : "border-slate-200 text-slate-600"
            }`}
            aria-current={index === activeIndex ? "step" : undefined}
          >
            {index + 1}. {t(labelByStep[step], locale)}
          </li>
        );
      })}
    </ol>
  );
};
