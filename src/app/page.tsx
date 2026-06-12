import Link from "next/link";
import { ArrowRight, FunctionSquare, Layers, MousePointerClick, Sparkles, Type } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { ArtifactFrame } from "@/components/lesson/ArtifactFrame";
import { TeachTheMachine } from "@/components/artifacts/TeachTheMachine";
import { chapters, lessonsByChapter, firstReadyLesson, accentVar, totalLessons } from "@/lib/curriculum";

const values = [
  {
    icon: MousePointerClick,
    title: "Tinker, don't memorise",
    body: "Every concept is something you can poke, drag, and break. Real intuition comes from your hands — not from a wall of text.",
  },
  {
    icon: Type,
    title: "Plain language, no gatekeeping",
    body: "We explain the idea first and name the jargon afterwards, only once you've felt what it means. Zero background assumed.",
  },
  {
    icon: Layers,
    title: "A real ladder",
    body: "Each lesson stands on the one before it — from “what is AI?” all the way to how ChatGPT works. Nothing skipped.",
  },
  {
    icon: FunctionSquare,
    title: "Two altitudes",
    body: "Every lesson ends with an optional Under-the-Hood section — the real math and the actual code — for when intuition isn't enough.",
  },
];

export default function Home() {
  return (
    <>
      {/* ---------------- Hero ---------------- */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-aurora opacity-70" aria-hidden />
        <div
          className="pointer-events-none absolute inset-0 bg-grid opacity-[0.5] [mask-image:radial-gradient(70%_55%_at_50%_30%,black,transparent)]"
          aria-hidden
        />
        <div className="relative mx-auto max-w-4xl px-5 pb-10 pt-20 text-center sm:px-8 sm:pt-28">
          <Reveal>
            <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-border bg-surface/70 px-3.5 py-1.5 text-sm font-medium text-muted backdrop-blur">
              <Sparkles size={15} className="text-accent" />
              Learn AI from first principles
            </div>
          </Reveal>

          <Reveal delay={0.06}>
            <h1 className="mx-auto mt-6 max-w-3xl text-balance font-display text-5xl font-medium leading-[1.02] tracking-tight text-foreground sm:text-7xl">
              Understand AI by <span className="text-gradient">playing with it</span>
            </h1>
          </Reveal>

          <Reveal delay={0.12}>
            <p className="mx-auto mt-6 max-w-xl text-balance text-lg leading-relaxed text-muted sm:text-xl">
              A visual, hands-on roadmap that takes you from total beginner to understanding language models — one
              interactive idea at a time. No maths degree. No account. No jargon walls.
            </p>
          </Reveal>

          <Reveal delay={0.18}>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button href={`/learn/${firstReadyLesson.slug}`} size="lg">
                <Sparkles size={17} />
                Start with lesson one
              </Button>
              <Button href="/learn" variant="secondary" size="lg">
                Explore the roadmap
                <ArrowRight size={17} />
              </Button>
            </div>
            <p className="mt-4 text-sm text-subtle">
              {totalLessons} lessons · free · runs entirely in your browser
            </p>
          </Reveal>
        </div>
      </section>

      {/* ---------------- Live demo ---------------- */}
      <section className="relative mx-auto max-w-4xl px-5 pb-8 sm:px-8">
        <Reveal delay={0.05}>
          <div className="mb-3 flex items-center justify-center gap-2 text-sm font-medium text-muted">
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-teal" />
            This is lesson one. Go on — touch it.
          </div>
          <ArtifactFrame
            title="Teach the Machine"
            hint="Click to add coloured examples"
            caption="You didn't write a single rule — you gave examples, and the machine drew the boundary. That's all AI really is."
          >
            <TeachTheMachine />
          </ArtifactFrame>
        </Reveal>
      </section>

      {/* ---------------- Values ---------------- */}
      <section className="mx-auto max-w-5xl px-5 py-16 sm:px-8 sm:py-24">
        <Reveal>
          <h2 className="text-balance text-center font-display text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
            Built for people who&apos;ve always found AI a little intimidating
          </h2>
        </Reveal>
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {values.map((v, i) => (
            <Reveal key={v.title} delay={i * 0.08}>
              <div className="surface-card h-full p-6 transition-shadow hover:shadow-[var(--shadow-md)]">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent-soft text-accent">
                  <v.icon size={20} />
                </span>
                <h3 className="mt-4 text-lg font-semibold tracking-tight text-foreground">{v.title}</h3>
                <p className="mt-2 text-[0.95rem] leading-relaxed text-muted">{v.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------------- Curriculum preview ---------------- */}
      <section className="mx-auto max-w-5xl px-5 pb-8 sm:px-8">
        <Reveal>
          <div className="text-center">
            <h2 className="text-balance font-display text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
              The whole journey, in {chapters.length} chapters
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-muted">
              Start at the very beginning and climb. Each rung unlocks the next idea.
            </p>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {chapters.map((chapter, ci) => {
            const color = accentVar[chapter.accent];
            return (
              <Reveal key={chapter.id} delay={ci * 0.08}>
                <div className="surface-card flex h-full flex-col p-6">
                  <span
                    className="grid h-10 w-10 place-items-center rounded-xl font-display text-base font-semibold text-white"
                    style={{ background: color }}
                  >
                    {chapter.index}
                  </span>
                  <h3 className="mt-4 font-display text-xl font-medium text-foreground">{chapter.title}</h3>
                  <p className="mt-1.5 text-sm text-muted">{chapter.blurb}</p>
                  <ul className="mt-5 space-y-2.5 border-t border-border pt-5">
                    {lessonsByChapter(chapter.id).map((l) => (
                      <li key={l.slug}>
                        <Link
                          href={`/learn/${l.slug}`}
                          className="group flex items-center gap-2 text-sm text-foreground/80 transition-colors hover:text-foreground"
                        >
                          <span
                            className="inline-block h-1.5 w-1.5 shrink-0 rounded-full"
                            style={{ background: l.status === "soon" ? "var(--border-strong)" : color }}
                          />
                          <span className="flex-1">{l.title}</span>
                          {l.status === "soon" && <span className="text-[0.7rem] text-subtle">soon</span>}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ---------------- CTA band ---------------- */}
      <section className="mx-auto max-w-5xl px-5 py-20 sm:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-border bg-surface px-6 py-14 text-center shadow-[var(--shadow-md)] sm:px-12">
            <div className="pointer-events-none absolute inset-0 bg-aurora opacity-80" aria-hidden />
            <div className="relative">
              <h2 className="mx-auto max-w-2xl text-balance font-display text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
                A few clicks from here, AI will stop feeling like magic.
              </h2>
              <p className="mx-auto mt-4 max-w-md text-muted">
                It&apos;ll start feeling like something you understand. Begin with a single click.
              </p>
              <div className="mt-8">
                <Button href={`/learn/${firstReadyLesson.slug}`} size="lg">
                  <Sparkles size={17} />
                  Start learning — it&apos;s free
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
