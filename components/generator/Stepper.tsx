"use client";

import React, { useEffect, useState } from "react";
import { Check, Lock } from "lucide-react";
import { STEPS } from "@/lib/invoice/schema";
import { cn } from "@/lib/utils";

export function Stepper({
  current,
  reachable,
  complete,
  onSelect,
}: {
  current: number;
  /** Highest step index the user may jump to. */
  reachable: number;
  complete: boolean[];
  onSelect: (index: number) => void;
}) {
  const progress = (current / (STEPS.length - 1)) * 100;
  return (
    <nav aria-label="Invoice steps">
      <div className="relative">
        <div className="absolute left-5 right-5 top-5 h-0.5 bg-slate-200" aria-hidden>
          <div className="h-full bg-brand transition-[width] duration-300" style={{ width: `${progress}%` }} />
        </div>
        <ol className="relative grid grid-cols-4">
          {STEPS.map((step, i) => {
            const isCurrent = i === current;
            const locked = i > reachable;
            // The last step is the download itself, so it's never shown as "done".
            const done = complete[i] && !isCurrent && !locked && i < STEPS.length - 1;
            return (
              <li key={step.id} className="flex flex-col items-center text-center first:items-start first:text-left last:items-end last:text-right">
                <button
                  type="button"
                  onClick={() => onSelect(i)}
                  disabled={locked}
                  aria-current={isCurrent ? "step" : undefined}
                  aria-label={`Step ${i + 1}: ${step.label}${done ? " (complete)" : ""}${locked ? " (locked until earlier steps are complete)" : ""}`}
                  className={cn(
                    "grid size-10 place-items-center rounded-full border-2 text-sm font-semibold transition focus-visible:ring-3 focus-visible:ring-brand/30",
                    isCurrent && "border-brand bg-brand text-white shadow-md shadow-brand/25",
                    done && "border-brand bg-white text-brand hover:bg-brand-tint",
                    !isCurrent && !done && !locked && "border-slate-300 bg-white text-slate-700 hover:border-brand",
                    locked && "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400",
                  )}
                >
                  {done ? <Check className="size-5" aria-hidden /> : locked ? <Lock className="size-4" aria-hidden /> : i + 1}
                </button>
                <span
                  className={cn(
                    "mt-2 hidden text-xs font-medium sm:block sm:text-sm",
                    isCurrent ? "text-ink" : locked ? "text-slate-500" : "text-slate-600",
                  )}
                  aria-hidden
                >
                  {step.label}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
      <p className="mt-3 text-sm font-medium text-slate-700 sm:hidden">
        Step {current + 1} of {STEPS.length}: {STEPS[current].label}
      </p>
    </nav>
  );
}

function relative(ms: number): string {
  const s = Math.round(ms / 1000);
  if (s < 45) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} h ago`;
  return `${Math.round(h / 24)} d ago`;
}

export function SaveIndicator({ savedAt }: { savedAt: number | null }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 20_000);
    return () => window.clearInterval(t);
  }, []);
  if (!savedAt) return <span className="text-xs text-slate-600">Saved in this browser as you type</span>;
  return (
    <span className="flex items-center gap-1.5 text-xs text-slate-600" title="Your draft is saved in this browser">
      <span className="size-1.5 rounded-full bg-emerald-500" aria-hidden />
      Saved · {relative(Math.max(0, now - savedAt))}
    </span>
  );
}
