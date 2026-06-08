import type { Metadata } from "next";
import { BookOpen, Hand, Languages, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { firstReadyLesson } from "@/lib/curriculum";

export const metadata: Metadata = {
  title: "How it works",
  description: "The teaching philosophy behind VisualAI — tinker first, plain language, and a ladder that skips nothing.",
};

const principles = [
  {
    icon: Hand,
    title: "Tinker before telling",
    body: "On every page the interactive comes first. You drag, click, and break something — and only then do we explain what you just felt. Intuition is earned through the hands, then named with words.",
  },
  {
    icon: Languages,
    title: "Plain language, jargon last",
    body: "We never open with a definition. We build the idea in everyday words, and only once it makes sense do we attach the technical term — so the vocabulary lands on something you already understand.",
  },
  {
    icon: BookOpen,
    title: "A ladder with no missing rungs",
    body: "Each lesson assumes only the ones before it. We start at “what even is AI?” and climb, deliberately, all the way to how a large language model predicts the next word.",
  },
  {
    icon: ShieldCheck,
    title: "No account, no tracking",
    body: "There's nothing to sign up for. Your progress is saved privately in your own browser, and the whole thing runs locally. Just open it and learn.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-14 sm:px-8 sm:py-20">
      <div className="flex items-center gap-2 text-sm font-medium text-accent">
        <span className="inline-block h-2 w-2 rounded-full bg-accent" />
        How it works
      </div>
      <h1 className="mt-3 text-balance font-display text-4xl font-medium tracking-tight text-foreground sm:text-5xl">
        Most AI explainers start with the maths. We start with your curiosity.
      </h1>
      <p className="mt-5 text-lg leading-relaxed text-muted">
        VisualAI is built on a simple bet: you don&apos;t understand something because you read the right
        paragraph — you understand it because you played with it until it clicked. So every idea here ships as a
        small machine you can operate yourself.
      </p>

      <div className="mt-12 grid gap-5 sm:grid-cols-2">
        {principles.map((p) => (
          <div key={p.title} className="surface-card p-6">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent-soft text-accent">
              <p.icon size={20} />
            </span>
            <h2 className="mt-4 text-lg font-semibold tracking-tight text-foreground">{p.title}</h2>
            <p className="mt-2 text-[0.95rem] leading-relaxed text-muted">{p.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-14 rounded-3xl border border-border bg-surface-2/50 p-8 text-center">
        <h2 className="font-display text-2xl font-medium text-foreground">Who is this for?</h2>
        <p className="mx-auto mt-3 max-w-xl text-muted">
          Anyone who&apos;s felt that AI is a little out of reach — the curious beginner, the manager who keeps
          nodding along in meetings, the student, the parent, the artist. If you can use a mouse, you can do
          this.
        </p>
        <div className="mt-7">
          <Button href={`/learn/${firstReadyLesson.slug}`} size="lg">
            Start with lesson one
          </Button>
        </div>
      </div>
    </div>
  );
}
