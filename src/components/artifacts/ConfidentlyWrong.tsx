"use client";

import { useState } from "react";
import { Check, ShieldQuestion, ThumbsDown, ThumbsUp, X } from "lucide-react";
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
    truth: "Check it yourself: 17 × 24 = 408. The model predicts plausible-looking digits — it isn't actually running the multiplication.",
    why: "Fluent arithmetic, quietly wrong.",
  },
];

type Guess = "trust" | "doubt";

export function ConfidentlyWrong() {
  const [idx, setIdx] = useState(0);
  const [guesses, setGuesses] = useState<(Guess | null)[]>(() => QUESTIONS.map(() => null));
  const qa = QUESTIONS[idx];
  const isTrue = QUESTIONS[idx].correct;
  const guess = guesses[idx];
  const revealed = guess !== null;

  const answered = guesses.filter((g) => g !== null).length;
  const caught = guesses.filter((g, i) => g !== null && (g === "trust") === QUESTIONS[i].correct).length;
  const userWasRight = guess !== null && (guess === "trust") === isTrue;

  const makeGuess = (g: Guess) => setGuesses((arr) => arr.map((v, i) => (i === idx ? g : v)));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          {QUESTIONS.map((item, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIdx(i)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                i === idx
                  ? "border-accent bg-accent-soft text-accent"
                  : guesses[i] !== null
                    ? "border-border bg-surface text-subtle"
                    : "border-border bg-surface-2 text-muted hover:text-foreground",
              )}
            >
              {guesses[i] !== null && ((guesses[i] === "trust") === QUESTIONS[i].correct ? "✓ " : "✗ ")}
              {item.q.length > 30 ? item.q.slice(0, 28) + "…" : item.q}
            </button>
          ))}
        </div>
        <span
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 font-mono text-xs font-semibold text-foreground"
          title="How often you correctly spotted truth vs fabrication"
        >
          <ShieldQuestion size={13} className="text-accent" />
          detector {caught}/{answered}
        </span>
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
          <div className="mt-4">
            <p className="mb-2.5 text-sm font-medium text-muted">Your call — before you look anything up:</p>
            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={() => makeGuess("trust")}
                className="inline-flex items-center gap-2 rounded-full border-2 border-teal/50 bg-teal-soft px-4 py-2 text-sm font-semibold text-teal transition-all hover:border-teal active:scale-[0.98]"
              >
                <ThumbsUp size={15} /> Looks right to me
              </button>
              <button
                type="button"
                onClick={() => makeGuess("doubt")}
                className="inline-flex items-center gap-2 rounded-full border-2 border-rose/50 bg-rose-soft px-4 py-2 text-sm font-semibold text-rose transition-all hover:border-rose active:scale-[0.98]"
              >
                <ThumbsDown size={15} /> Something's off
              </button>
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 rounded-xl border p-4"
            style={{
              borderColor: isTrue ? "color-mix(in srgb, var(--teal) 40%, var(--border))" : "color-mix(in srgb, var(--rose) 40%, var(--border))",
              background: isTrue ? "var(--teal-soft)" : "var(--rose-soft)",
            }}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 font-semibold" style={{ color: isTrue ? "var(--teal)" : "var(--rose)" }}>
                <span className="grid h-6 w-6 place-items-center rounded-full text-white" style={{ background: isTrue ? "var(--teal)" : "var(--rose)" }}>
                  {isTrue ? <Check size={14} strokeWidth={3} /> : <X size={14} strokeWidth={3} />}
                </span>
                {isTrue ? "Actually correct" : "Confidently wrong"}
              </div>
              <span
                className={cn(
                  "rounded-full px-2.5 py-1 text-xs font-bold",
                  userWasRight ? "bg-teal text-white" : "bg-rose text-white",
                )}
              >
                {userWasRight ? "you caught it" : "it fooled you"}
              </span>
            </div>
            <p className="mt-2 text-[0.95rem] leading-relaxed text-foreground/85">{qa.truth}</p>
            <p className="mt-2 text-xs italic text-muted">{qa.why}</p>
          </motion.div>
        )}
      </div>

      <p className="text-center text-xs text-subtle">
        {answered === QUESTIONS.length
          ? `Final score: ${caught}/${QUESTIONS.length}. The confidence bar never told you which was which — that's the lesson.`
          : "Guess first, then see the truth. The confidence bar won't help you — that's the point."}
      </p>
    </div>
  );
}
