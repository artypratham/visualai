"use client";

import Link from "next/link";
import { ArrowRight, Check, Clock, Lock } from "lucide-react";
import { motion } from "motion/react";
import { chapters, lessonsByChapter, accentVar, type Lesson } from "@/lib/curriculum";
import { useCompletedSlugs } from "@/lib/progress";
import { cn } from "@/lib/cn";

export function Roadmap() {
  const completed = useCompletedSlugs();

  return (
    <div className="flex flex-col gap-16">
      {chapters.map((chapter) => {
        const color = accentVar[chapter.accent];
        const items = lessonsByChapter(chapter.id);
        return (
          <section key={chapter.id}>
            <div className="mb-7 flex items-start gap-4">
              <span
                className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl font-display text-lg font-semibold text-white shadow-[var(--shadow-sm)]"
                style={{ background: color }}
              >
                {chapter.index}
              </span>
              <div>
                <h2 className="font-display text-2xl font-medium tracking-tight text-foreground">{chapter.title}</h2>
                <p className="mt-1 max-w-xl text-[0.95rem] text-muted">{chapter.blurb}</p>
              </div>
            </div>

            <ol className="relative flex flex-col gap-3 pl-[1.4rem]">
              {/* rail */}
              <span className="absolute bottom-4 left-[1.4rem] top-4 w-px -translate-x-1/2 bg-border" aria-hidden />
              {items.map((lesson, i) => (
                <RoadmapItem
                  key={lesson.slug}
                  lesson={lesson}
                  color={color}
                  done={completed.includes(lesson.slug)}
                  index={i}
                />
              ))}
            </ol>
          </section>
        );
      })}
    </div>
  );
}

function RoadmapItem({
  lesson,
  color,
  done,
  index,
}: {
  lesson: Lesson;
  color: string;
  done: boolean;
  index: number;
}) {
  const soon = lesson.status === "soon";
  return (
    <motion.li
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
      className="relative"
    >
      <Link
        href={`/learn/${lesson.slug}`}
        className={cn(
          "group flex items-center gap-4 rounded-2xl border border-border bg-surface p-4 pr-5 transition-all duration-200",
          "hover:border-border-strong hover:shadow-[var(--shadow-md)] hover:-translate-y-0.5",
        )}
      >
        {/* node */}
        <span
          className={cn(
            "relative z-10 grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-semibold transition-transform group-hover:scale-105",
          )}
          style={
            done
              ? { background: color, color: "white" }
              : soon
                ? { background: "var(--surface-2)", color: "var(--subtle)", boxShadow: "inset 0 0 0 1.5px var(--border-strong)" }
                : { background: "var(--surface)", color, boxShadow: `inset 0 0 0 2px ${color}` }
          }
        >
          {done ? <Check size={16} strokeWidth={2.8} /> : soon ? <Lock size={14} /> : lesson.order}
        </span>

        {/* body */}
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className="font-medium text-foreground">{lesson.title}</span>
            {lesson.advanced && (
              <span
                title="Includes an Under-the-Hood section: the math and the code"
                className="rounded-full bg-accent-soft px-2 py-0.5 font-mono text-[0.65rem] font-semibold text-accent"
              >
                ∑ deep dive
              </span>
            )}
            {done && (
              <span className="rounded-full bg-teal-soft px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-teal">
                Done
              </span>
            )}
            {soon && (
              <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-subtle">
                Soon
              </span>
            )}
          </span>
          <span className="mt-0.5 line-clamp-2 block text-sm text-muted">{lesson.takeaway}</span>
        </span>

        {/* meta */}
        <span className="hidden shrink-0 items-center gap-1.5 text-xs text-subtle sm:flex">
          <Clock size={13} /> {lesson.minutes}m
        </span>
        <ArrowRight
          size={17}
          className="shrink-0 text-subtle transition-all group-hover:translate-x-0.5 group-hover:text-foreground"
        />
      </Link>
    </motion.li>
  );
}
