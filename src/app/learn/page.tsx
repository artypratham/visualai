import type { Metadata } from "next";
import { Roadmap } from "@/components/roadmap/Roadmap";
import { ProgressSummary } from "@/components/roadmap/ProgressSummary";
import { totalLessons } from "@/lib/curriculum";

export const metadata: Metadata = {
  title: "The Roadmap",
  description: `The full first-principles path through AI — ${totalLessons} tinkerable lessons, from zero to language models.`,
};

export default function LearnPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-12 sm:px-8 sm:py-16">
      <div className="flex items-center gap-2 text-sm font-medium text-accent">
        <span className="inline-block h-2 w-2 rounded-full bg-accent" />
        The Roadmap
      </div>
      <h1 className="mt-3 text-balance font-display text-4xl font-medium tracking-tight text-foreground sm:text-5xl">
        From zero to language models
      </h1>
      <p className="mt-4 max-w-xl text-lg text-muted">
        A path of {totalLessons} lessons, each built on the one before it. No prior knowledge assumed — just
        curiosity and a mouse. Your progress saves automatically in this browser.
      </p>

      <div className="mt-8">
        <ProgressSummary />
      </div>

      <div className="mt-14">
        <Roadmap />
      </div>
    </div>
  );
}
