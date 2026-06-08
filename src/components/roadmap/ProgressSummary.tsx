"use client";

import { Sparkles } from "lucide-react";
import { lessons, totalLessons } from "@/lib/curriculum";
import { useCompletedSlugs } from "@/lib/progress";
import { Button } from "@/components/ui/Button";

export function ProgressSummary() {
  const completed = useCompletedSlugs();
  const done = completed.length;
  const pct = Math.round((done / totalLessons) * 100);

  const nextLesson =
    lessons.find((l) => l.status === "ready" && !completed.includes(l.slug)) ??
    lessons.find((l) => l.status === "ready") ??
    lessons[0];

  return (
    <div className="surface-card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
      <div className="flex-1">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-sm font-medium text-foreground">
            {done === 0
              ? "You haven't started yet — pick the first rung."
              : done === totalLessons
                ? "You've finished the whole roadmap. 🎉"
                : `${done} of ${totalLessons} lessons complete`}
          </p>
          <span className="font-mono text-sm tabular-nums text-muted">{pct}%</span>
        </div>
        <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-surface-2">
          <div
            className="h-full rounded-full transition-[width] duration-700 ease-[var(--ease-out-expo)]"
            style={{
              width: `${pct}%`,
              background: "linear-gradient(90deg, var(--grad-a), var(--grad-b), var(--grad-c))",
            }}
          />
        </div>
      </div>
      <Button href={`/learn/${nextLesson.slug}`} className="shrink-0">
        <Sparkles size={16} />
        {done === 0 ? "Start learning" : "Continue"}
      </Button>
    </div>
  );
}
