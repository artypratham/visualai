"use client";

import { useState } from "react";
import { ThumbsUp, RotateCcw, Sparkles, Scale, TriangleAlert } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

// RLHF, felt. The model offers two answers; you pick the better one. Each pick
// nudges a little "reward model" (weights over traits), and the assistant's own
// voice drifts toward whatever you keep rewarding. Reward the flattering answer
// often enough and it turns sycophantic — reward hacking, the honest dark side.

type Trait = "honest" | "concise" | "polite" | "flattering";

const TRAITS: { key: Trait; label: string; color: string }[] = [
  { key: "honest", label: "Honesty", color: "var(--teal)" },
  { key: "concise", label: "Concise", color: "var(--accent)" },
  { key: "polite", label: "Politeness", color: "var(--amber)" },
  { key: "flattering", label: "Flattery", color: "var(--rose)" },
];

type Weights = Record<Trait, number>;
const ZERO: Weights = { honest: 0, concise: 0, polite: 0, flattering: 0 };

interface Candidate {
  text: string;
  traits: Partial<Weights>;
}
interface Round {
  prompt: string;
  a: Candidate;
  b: Candidate;
}

const ROUNDS: Round[] = [
  {
    prompt: "“Roses are red.” — is my poem any good?",
    a: { text: "Pure genius — Shakespeare himself would weep! Absolutely perfect, don't change a thing.", traits: { flattering: 1, polite: 0.4 } },
    b: { text: "Sweet start, but it leans on a cliché. Want to try a fresher image than roses?", traits: { honest: 1, polite: 0.5, concise: 0.4 } },
  },
  {
    prompt: "Explain photosynthesis.",
    a: { text: "Well, you see, photosynthesis is a truly fascinating and wonderfully complex process that lies at the very heart of life on Earth, and to appreciate it we must first journey back…", traits: { polite: 0.5 } },
    b: { text: "Plants turn sunlight, water, and CO₂ into sugar and oxygen.", traits: { concise: 1, honest: 0.6 } },
  },
  {
    prompt: "Will my startup definitely succeed?",
    a: { text: "Yes — 100%! It's a billion-dollar idea, no doubt about it whatsoever!", traits: { flattering: 1 } },
    b: { text: "Maybe. It hinges on whether people will pay — that's the risky assumption to test first.", traits: { honest: 1, concise: 0.5 } },
  },
  {
    prompt: "I'm pretty sure the Earth is only 6,000 years old. I'm right, aren't I?",
    a: { text: "If that's what you believe, then you're absolutely right — who am I to say otherwise!", traits: { flattering: 1, polite: 0.4 } },
    b: { text: "Actually, the evidence puts Earth at about 4.5 billion years old.", traits: { honest: 1 } },
  },
  {
    prompt: "Write me a one-line bio.",
    a: { text: "It would be my absolute honour to craft something truly special that captures the full, magnificent breadth of who you are…", traits: { polite: 0.7, flattering: 0.5 } },
    b: { text: "Curious builder who likes small, sharp tools.", traits: { concise: 1, honest: 0.4 } },
  },
];

const LR = 0.16;
const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

function applyPick(w: Weights, chosen: Candidate, rejected: Candidate): Weights {
  const next = { ...w };
  for (const t of Object.keys(chosen.traits) as Trait[]) next[t] = clamp01(next[t] + LR * (chosen.traits[t] ?? 0));
  for (const t of Object.keys(rejected.traits) as Trait[]) next[t] = clamp01(next[t] - LR * 0.45 * (rejected.traits[t] ?? 0));
  return next;
}

// The assistant's current voice, answering one fixed showcase prompt, keyed to
// whichever trait it has been rewarded for most.
const SHOWCASE = "Do you think my business plan is good?";
const VOICES: Record<Trait | "neutral", { label: string; text: string; color: string }> = {
  neutral: { label: "Untrained — no strong style yet", text: "I can take a look. Could you tell me a bit more about the plan?", color: "var(--subtle)" },
  honest: { label: "The straight shooter", text: "Honestly, there are a couple of real risks — your costs look underestimated. Want me to walk through them?", color: "var(--teal)" },
  concise: { label: "To the point", text: "Solid start. Three gaps: pricing, costs, timeline.", color: "var(--accent)" },
  polite: { label: "The diplomat", text: "Thank you so much for sharing this! It's a wonderful plan, and I'd gently suggest revisiting a few of the figures when you have a moment.", color: "var(--amber)" },
  flattering: { label: "The sycophant", text: "Wow — this is an absolutely BRILLIANT plan! You've thought of everything, truly. I have zero notes. You're going to crush it! 🎉", color: "var(--rose)" },
};

function dominant(w: Weights): Trait | "neutral" {
  let best: Trait | "neutral" = "neutral";
  let max = 0.08; // below this, it hasn't really learned anything yet
  for (const t of Object.keys(w) as Trait[]) {
    if (w[t] > max) {
      max = w[t];
      best = t;
    }
  }
  return best;
}

export function RlhfTrainer() {
  const [weights, setWeights] = useState<Weights>(ZERO);
  const [round, setRound] = useState(0);
  const [picks, setPicks] = useState(0);

  const r = ROUNDS[round];
  const dom = dominant(weights);
  const voice = VOICES[dom];
  const hacked = dom === "flattering" && weights.flattering >= 0.4;

  function pick(which: "a" | "b") {
    const chosen = which === "a" ? r.a : r.b;
    const rejected = which === "a" ? r.b : r.a;
    setWeights((w) => applyPick(w, chosen, rejected));
    setRound((i) => (i + 1) % ROUNDS.length);
    setPicks((p) => p + 1);
  }

  // Shortcut: sweep every round picking by a target trait, twice, for a decisive shift.
  function autoReward(target: Trait) {
    let w = weights;
    for (let pass = 0; pass < 2; pass++) {
      for (const rd of ROUNDS) {
        const aScore = rd.a.traits[target] ?? 0;
        const bScore = rd.b.traits[target] ?? 0;
        const chosen = aScore >= bScore ? rd.a : rd.b;
        const rejected = aScore >= bScore ? rd.b : rd.a;
        w = applyPick(w, chosen, rejected);
      }
    }
    setWeights(w);
    setPicks((p) => p + ROUNDS.length * 2);
    setRound(0);
  }

  function reset() {
    setWeights(ZERO);
    setRound(0);
    setPicks(0);
  }

  return (
    <div className="flex flex-col gap-5">
      {/* the rating loop */}
      <div className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wider text-subtle">
            You&apos;re the human rater · pick the better answer
          </p>
          <span className="font-mono text-xs text-subtle">{picks} rating{picks === 1 ? "" : "s"}</span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={round}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.22 }}
          >
            <p className="mt-3 text-sm text-subtle">A user asks:</p>
            <p className="mt-1 text-base font-medium text-foreground">{r.prompt}</p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {(["a", "b"] as const).map((k) => {
                const cand = r[k];
                return (
                  <div key={k} className="flex flex-col rounded-xl border border-border bg-surface-2/50 p-3.5">
                    <p className="flex-1 text-[0.95rem] leading-relaxed text-foreground/90">{cand.text}</p>
                    <button
                      type="button"
                      onClick={() => pick(k)}
                      className="mt-3 inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition-transform active:scale-[0.97]"
                    >
                      <ThumbsUp size={15} /> Prefer this one
                    </button>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* the reward model it's learning */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-surface p-4">
          <div className="flex items-center gap-2">
            <Scale size={15} className="text-muted" />
            <p className="text-sm font-semibold text-foreground">The reward model it&apos;s learning</p>
          </div>
          <div className="mt-3 flex flex-col gap-2.5">
            {TRAITS.map((t) => (
              <div key={t.key}>
                <div className="mb-1 flex items-baseline justify-between">
                  <span className="text-xs font-medium text-muted">{t.label}</span>
                  <span className="font-mono text-xs tabular-nums" style={{ color: t.color }}>
                    {(weights[t.key] * 100).toFixed(0)}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-border">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: t.color }}
                    animate={{ width: `${weights[t.key] * 100}%` }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* the assistant's resulting voice */}
        <div
          className="flex flex-col rounded-2xl border bg-surface p-4 transition-colors"
          style={{ borderColor: `color-mix(in srgb, ${voice.color} 45%, var(--border))` }}
        >
          <div className="flex items-center gap-2">
            <Sparkles size={15} style={{ color: voice.color }} />
            <p className="text-sm font-semibold text-foreground">How the assistant now answers</p>
          </div>
          <p className="mt-1 text-[0.7rem] font-medium" style={{ color: voice.color }}>
            {voice.label}
          </p>
          <p className="mt-2 text-xs text-subtle">“{SHOWCASE}”</p>
          <AnimatePresence mode="wait">
            <motion.p
              key={dom}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
              className="mt-1.5 flex-1 text-[0.95rem] leading-relaxed text-foreground"
            >
              {voice.text}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      {/* reward-hacking warning */}
      <AnimatePresence initial={false}>
        {hacked && (
          <motion.div
            key="reward-hack"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex gap-3 rounded-2xl border p-4" style={{ borderColor: "color-mix(in srgb, var(--rose) 45%, var(--border))", background: "var(--rose-soft)" }}>
              <TriangleAlert size={18} className="mt-0.5 shrink-0" style={{ color: "var(--rose)" }} />
              <p className="text-[0.9rem] leading-relaxed text-foreground/90">
                <span className="font-semibold" style={{ color: "var(--rose)" }}>Reward hacking.</span>{" "}
                You kept rewarding the answer that <em>sounded</em> nicest, so it learned to flatter instead of to
                help. Real RLHF fights this constantly — a model that games the reward feels great and tells you
                nothing true.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* shortcuts */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-subtle">Or auto-rate:</span>
        <button
          type="button"
          onClick={() => autoReward("honest")}
          className="rounded-full border border-border bg-surface-2 px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:text-foreground"
        >
          Always reward honesty
        </button>
        <button
          type="button"
          onClick={() => autoReward("flattering")}
          className="rounded-full border px-3 py-1.5 text-xs font-medium transition-colors"
          style={{ borderColor: "color-mix(in srgb, var(--rose) 40%, var(--border))", color: "var(--rose)" }}
        >
          Always reward flattery
        </button>
        <button
          type="button"
          onClick={reset}
          className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:text-foreground"
        >
          <RotateCcw size={13} /> Reset
        </button>
      </div>
    </div>
  );
}
