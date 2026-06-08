"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Circle } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/cn";
import { useLessonProgress } from "@/lib/progress";
import type { Lesson } from "@/lib/curriculum";

export function LessonFooter({
  slug,
  prev,
  next,
}: {
  slug: string;
  prev: Lesson | null;
  next: Lesson | null;
}) {
  const { isComplete, toggle } = useLessonProgress(slug);

  return (
    <div className="mx-auto mt-16 w-full max-w-[44rem]">
      {/* Mark complete */}
      <div className="flex flex-col items-center gap-3 rounded-3xl border border-border bg-surface-2/50 px-6 py-8 text-center">
        <p className="text-sm text-muted">Feel like you get it?</p>
        <button
          type="button"
          onClick={toggle}
          className={cn(
            "group inline-flex items-center gap-2.5 rounded-full px-6 py-3 text-[0.95rem] font-medium transition-all duration-200 active:scale-[0.98]",
            isComplete
              ? "bg-teal text-white shadow-[0_10px_30px_-10px_var(--teal)]"
              : "bg-accent text-accent-fg shadow-[var(--shadow-sm)] hover:bg-accent-hover hover:shadow-[0_10px_30px_-10px_var(--accent)]",
          )}
        >
          <motion.span
            key={isComplete ? "done" : "todo"}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 18 }}
            className="grid place-items-center"
          >
            {isComplete ? <Check size={18} strokeWidth={2.6} /> : <Circle size={18} strokeWidth={2.4} />}
          </motion.span>
          {isComplete ? "Completed — nice work" : "Mark as complete"}
        </button>
        {next && next.status === "ready" && (
          <Link href={`/learn/${next.slug}`} className="mt-1 text-sm font-medium text-accent hover:text-accent-hover">
            Continue to “{next.title}” →
          </Link>
        )}
      </div>

      {/* Prev / next */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {prev ? (
          <Link
            href={`/learn/${prev.slug}`}
            className="group flex flex-col gap-1 rounded-2xl border border-border bg-surface p-4 transition-all hover:border-border-strong hover:shadow-[var(--shadow-md)]"
          >
            <span className="flex items-center gap-1.5 text-xs font-medium text-subtle">
              <ArrowLeft size={13} /> Previous
            </span>
            <span className="font-medium text-foreground">{prev.title}</span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={`/learn/${next.slug}`}
            className="group flex flex-col items-end gap-1 rounded-2xl border border-border bg-surface p-4 text-right transition-all hover:border-border-strong hover:shadow-[var(--shadow-md)] sm:col-start-2"
          >
            <span className="flex items-center gap-1.5 text-xs font-medium text-subtle">
              Next <ArrowRight size={13} />
            </span>
            <span className="font-medium text-foreground">{next.title}</span>
          </Link>
        ) : (
          <Link
            href="/learn"
            className="group flex flex-col items-end gap-1 rounded-2xl border border-border bg-surface p-4 text-right transition-all hover:border-border-strong hover:shadow-[var(--shadow-md)] sm:col-start-2"
          >
            <span className="flex items-center gap-1.5 text-xs font-medium text-subtle">
              Back to <ArrowRight size={13} />
            </span>
            <span className="font-medium text-foreground">The roadmap</span>
          </Link>
        )}
      </div>
    </div>
  );
}
