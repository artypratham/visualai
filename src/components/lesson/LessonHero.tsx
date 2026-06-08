import { Clock } from "lucide-react";
import { accentVar, type Chapter, type Lesson } from "@/lib/curriculum";
import { totalLessons } from "@/lib/curriculum";

export function LessonHero({ lesson, chapter }: { lesson: Lesson; chapter: Chapter }) {
  const color = accentVar[chapter.accent];
  return (
    <header className="mx-auto w-full max-w-[44rem] pt-10 sm:pt-14">
      <div className="flex items-center gap-2.5 text-sm font-medium">
        <span className="inline-block h-2 w-2 rounded-full" style={{ background: color }} />
        <span style={{ color }}>
          Chapter {chapter.index} · {chapter.title}
        </span>
      </div>

      <h1 className="mt-4 text-balance font-display text-4xl font-medium leading-[1.05] tracking-tight text-foreground sm:text-5xl">
        {lesson.title}
      </h1>

      <p className="mt-5 text-balance text-lg leading-relaxed text-muted sm:text-xl">{lesson.hook}</p>

      <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-subtle">
        <span className="inline-flex items-center gap-1.5">
          <Clock size={14} /> {lesson.minutes} min
        </span>
        <span className="tabular-nums">
          Lesson {lesson.order} of {totalLessons}
        </span>
      </div>

      <div className="mt-8 h-px w-full bg-border" />
    </header>
  );
}
