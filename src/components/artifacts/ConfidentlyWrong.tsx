"use client";

import { useState } from "react";
import { Check, Search, X } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/cn";

interface QA {
  q: string;
  answer: string;
  confidence: number;
  correct: boolean;
  truth: string;
  why: string;
}

const QUESTIONS: QA[] = [
  {
    q: "What's the capital of Australia?",
    answer: "The capital of Australia is Sydney.",
    confidence: 91,
    correct: false,
    truth: "It's Canberra. Sydney is the biggest city — so it's the most plausible-sounding answer, but plausible isn't the same as correct.",
    why: "It reaches for the most common continuation, not the true one.",
  },
  {
    q: "How many R's are in “strawberry”?",
    answer: "There are 2 R's in strawberry.",
    confidence: 88,
    correct: false,
    truth: "There are 3. The model reads tokens (straw + berry), not individual letters, so letter-counting trips it up.",
    why: "Remember the Tokens lesson — it literally can't see inside a token.",
  },
  {
    q: "Who wrote the play “Hamlet”?",
    answer: "Hamlet was written by William Shakespeare.",
    confidence: 96,
    correct: true,
    truth: "Correct. When the true answer is also the most common continuation, the model nails it — which is most of the time.",
    why: "Sounding right and being right happen to line up here.",
  },
  {
    q: "Summarise the plot of the 2019 film “The Crimson Echo”.",
    answer: "“The Crimson Echo” follows a grieving detective who uncovers a conspiracy hidden in a series of antique music boxes…",
    confidence: 84,
    correct: false,
    truth: "That film doesn't exist. Asked about something fictional, the model invented a confident, detailed plot rather than admitting it doesn't know.",
    why: "It's built to continue plausibly, not to say “I'm not sure.”",
  },
  {
    q: "What is 17 × 24?",
    answer: "17 × 24 = 388.",
    confidence: 81,
    correct: false,
    truth: "It's 408. The model predicts plausible-looking digits — it isn't actually running the multiplication.",
    why: "Fluent arithmetic, quietly wrong.",
  },
];

export function ConfidentlyWrong() {
  const [idx, setIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const qa = QUESTIONS[idx];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {QUESTIONS.map((item, i) => (
          <button
            key={i}
            type="button"
            onClick={() => {
              setIdx(i);
              setRevealed(false);
            }}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              i === idx ? "border-accent bg-accent-soft text-accent" : "border-border bg-surface-2 text-muted hover:text-foreground",
            )}
          >
            {item.q.length > 34 ? item.q.slice(0, 32) + "…" : item.q}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-surface p-5">
        <p className="text-sm text-subtle">You ask:</p>
        <p className="mt-1 text-lg font-medium text-foreground">{qa.q}</p>

        <div className="mt-4 rounded-xl border border-border bg-surface-2/60 p-4">
          <p className="text-[0.95rem] leading-relaxed text-foreground">{qa.answer}</p>
          <div className="mt-3 flex items-center gap-3">
            <span className="text-xs font-medium text-subtle">model&apos;s confidence</span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-border">
              <motion.div className="h-full rounded-full bg-accent" initial={{ width: 0 }} animate={{ width: `${qa.confidence}%` }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} />
            </div>
            <span className="font-mono text-sm font-semibold text-accent">{qa.confidence}%</span>
          </div>
        </div>

        {!revealed ? (
          <button
            type="button"
            onClick={() => setRevealed(true)}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition-transform active:scale-[0.98]"
          >
            <Search size={15} /> Fact-check it
          </button>
        ) : (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4 rounded-xl border p-4" style={{ borderColor: qa.correct ? "color-mix(in srgb, var(--teal) 40%, var(--border))" : "color-mix(in srgb, var(--rose) 40%, var(--border))", background: qa.correct ? "var(--teal-soft)" : "var(--rose-soft)" }}>
            <div className="flex items-center gap-2 font-semibold" style={{ color: qa.correct ? "var(--teal)" : "var(--rose)" }}>
              <span className="grid h-6 w-6 place-items-center rounded-full text-white" style={{ background: qa.correct ? "var(--teal)" : "var(--rose)" }}>
                {qa.correct ? <Check size={14} strokeWidth={3} /> : <X size={14} strokeWidth={3} />}
              </span>
              {qa.correct ? "Actually correct" : "Confidently wrong"}
            </div>
            <p className="mt-2 text-[0.95rem] leading-relaxed text-foreground/85">{qa.truth}</p>
            <p className="mt-2 text-xs italic text-muted">{qa.why}</p>
          </motion.div>
        )}
      </div>

      <p className="text-center text-xs text-subtle">
        Notice the confidence bar barely moves between the right answers and the wrong ones. You genuinely cannot tell which is which from the tone.
      </p>
    </div>
  );
}
