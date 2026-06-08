"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type AccentToken = "accent" | "teal" | "rose" | "amber";
const accentColor: Record<AccentToken, string> = {
  accent: "var(--accent)",
  teal: "var(--teal)",
  rose: "var(--rose)",
  amber: "var(--amber)",
};

/** A labelled, on-brand range slider with a live value read-out. */
export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  format,
  accent = "accent",
  className,
}: {
  label?: ReactNode;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
  accent?: AccentToken;
  className?: string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  const color = accentColor[accent];
  return (
    <div className={cn("w-full", className)}>
      {label !== undefined && (
        <div className="mb-2 flex items-baseline justify-between gap-3">
          <span className="text-sm font-medium text-muted">{label}</span>
          <span className="font-mono text-sm tabular-nums text-foreground" style={{ color }}>
            {format ? format(value) : value}
          </span>
        </div>
      )}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className={cn(
          "h-2 w-full cursor-pointer appearance-none rounded-full outline-none transition-[background]",
          "[&::-webkit-slider-thumb]:h-[18px] [&::-webkit-slider-thumb]:w-[18px] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[var(--thumb)] [&::-webkit-slider-thumb]:bg-surface [&::-webkit-slider-thumb]:shadow-[var(--shadow-sm)] [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110",
          "[&::-moz-range-thumb]:h-[18px] [&::-moz-range-thumb]:w-[18px] [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[var(--thumb)] [&::-moz-range-thumb]:bg-surface",
        )}
        style={
          {
            background: `linear-gradient(to right, ${color} ${pct}%, var(--border-strong) ${pct}%)`,
            ["--thumb" as string]: color,
          } as React.CSSProperties
        }
      />
    </div>
  );
}

/** Pill segmented control for discrete choices. */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className,
}: {
  options: { value: T; label: ReactNode }[];
  value: T;
  onChange: (v: T) => void;
  className?: string;
}) {
  return (
    <div className={cn("inline-flex rounded-full border border-border bg-surface-2 p-1", className)}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "relative rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
              active ? "text-accent-fg" : "text-muted hover:text-foreground",
            )}
          >
            {active && (
              <span className="absolute inset-0 rounded-full bg-accent shadow-[var(--shadow-sm)]" aria-hidden />
            )}
            <span className="relative">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/** A compact metric read-out for artifacts. */
export function StatPill({
  label,
  value,
  accent,
  className,
}: {
  label: ReactNode;
  value: ReactNode;
  accent?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-0.5 rounded-xl border border-border bg-surface px-3.5 py-2.5",
        className,
      )}
    >
      <span className="text-[0.7rem] font-medium uppercase tracking-wider text-subtle">{label}</span>
      <span className="font-mono text-lg font-medium tabular-nums" style={accent ? { color: accent } : undefined}>
        {value}
      </span>
    </div>
  );
}
