"use client";

import { useState } from "react";
import { RotateCcw, GraduationCap, FileText } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Slider, SegmentedControl } from "@/components/ui/controls";
import { cn } from "@/lib/cn";

// Fine-tuning, felt: a *base* model only continues text — it ignores your
// instruction and rambles on with more of the same. Show it a handful of
// (instruction -> response) examples and it learns to *follow* instead of
// *continue*. The slider is "how many examples it has seen"; the course is the
// style you're tuning it toward. All outputs are hand-authored honest cartoons.

type Course = "assistant" | "pirate" | "lawyer" | "haiku";

const COURSES: { value: Course; label: string; blurb: string; example: string }[] = [
  {
    value: "assistant",
    label: "Helpful Assistant",
    blurb: "the real ChatGPT recipe — clear, direct, useful",
    example: "“Summarise this email.” → “Sure — here's the gist in two lines: …”",
  },
  {
    value: "pirate",
    label: "Pirate",
    blurb: "same model, a sillier dataset",
    example: "“Say hello.” → “Ahoy there, matey! Welcome aboard!”",
  },
  {
    value: "lawyer",
    label: "Lawyer",
    blurb: "formal, hedged, careful",
    example: "“Can I park here?” → “Subject to posted restrictions, parking may be permissible.”",
  },
  {
    value: "haiku",
    label: "Haiku Poet",
    blurb: "answers in 5–7–5",
    example: "“Describe rain.” → “Soft grey curtains fall / the street wears a second sky / shoes learn how to swim”",
  },
];

interface Instruction {
  id: string;
  text: string;
  base: string;
  tuned: Record<Course, string>;
}

const INSTRUCTIONS: Instruction[] = [
  {
    id: "translate",
    text: 'Translate to French: "I\'m so happy today."',
    base: 'Translate to French: "I\'m so excited for the weekend." Translate to French: "The weather is lovely." Translate to German: "Good morning." Translate to Spanish: …',
    tuned: {
      assistant: '"Je suis tellement heureux aujourd\'hui !"',
      pirate: 'Arr! In the tongue o\' France: "Je suis si heureux aujourd\'hui," matey!',
      lawyer:
        'Pursuant to your request, the foregoing translates as follows: "Je suis si heureux aujourd\'hui."',
      haiku: 'Heart light as spring air / "Je suis si heureux"—I say / joy in two languages',
    },
  },
  {
    id: "apology",
    text: "Write a short apology to a customer whose order arrived late.",
    base: "Write a short apology to a customer whose package was damaged. Write a thank-you note to a loyal customer. Write a follow-up email about a refund request. Write a …",
    tuned: {
      assistant:
        "Hi — I'm really sorry your order arrived late. That's not the experience we want for you, and I'd be glad to make it right with a refund or a discount on your next order. Thank you for your patience.",
      pirate:
        "Ahoy, valued shipmate! Me deepest apologies that yer cargo washed ashore late. The seas were cruel — but I'll see ye made whole with a chest o' refund doubloons. Fair winds!",
      lawyer:
        "Dear Valued Customer, We acknowledge that delivery did not occur within the represented timeframe. Without admission of liability, we regret any inconvenience and are prepared to offer a suitable remedy. Sincerely,",
      haiku: "Your parcel ran late / I bow my head in regret / let me make it right",
    },
  },
  {
    id: "blackhole",
    text: "Explain what a black hole is, in one sentence.",
    base: "Explain what a black hole is, in one sentence. Explain what dark matter is, in one sentence. Explain what a neutron star is, in one sentence. Explain what …",
    tuned: {
      assistant:
        "A black hole is a region of space where gravity is so strong that nothing — not even light — can escape it.",
      pirate:
        "Arr, a black hole be a whirlpool in the sky so greedy that not even light can sail free of its pull!",
      lawyer:
        "A black hole is, for present purposes, a region of spacetime exhibiting gravitational forces of such magnitude that no matter or radiation may escape its boundary.",
      haiku: "Gravity's deep well / not even light climbs back out / a hole in the night",
    },
  },
  {
    id: "hotdog",
    text: "Is a hot dog a sandwich?",
    base: "Is a hot dog a sandwich? Is a burrito a sandwich? Is cereal a soup? These are popular debate questions on internet forums, where users argue at length about how to …",
    tuned: {
      assistant:
        "Functionally, no — most people don't call a hot dog a sandwich, though by a strict “filling between bread” definition you could argue it technically qualifies.",
      pirate:
        "Aye, a hot dog be a sandwich the way a dinghy be a ship — technically afloat, but no true sailor would call it one!",
      lawyer:
        "The classification of a hot dog as a “sandwich” is a question of fact dependent upon the operative definition; absent a controlling definition, the matter remains subject to reasonable dispute.",
      haiku: "Bread cradles the meat / yet the bun hinges as one / the debate lives on",
    },
  },
];

const HALF: Record<Course, string> = {
  assistant: "Sure, I can help with— wait, do you want me to keep going, or… Let me try: I think the answer is something like…",
  pirate: "Arr— I mean, hello? The answer be… er, I'm still learnin' me pirate tongue, matey…",
  lawyer: "Pursuant to— hm. The party hereby… (still finding the formal words) … the answer may be as follows…",
  haiku: "Five then seven syll— / I keep losing the count / close, but not quite yet",
};

type Stage = "base" | "half" | "tuned";
function stageFor(examples: number): Stage {
  if (examples <= 2) return "base";
  if (examples <= 9) return "half";
  return "tuned";
}

const STAGE_META: Record<Stage, { label: string; color: string }> = {
  base: { label: "Base behaviour — just autocompleting", color: "var(--subtle)" },
  half: { label: "Starting to follow…", color: "var(--amber)" },
  tuned: { label: "Following instructions ✓", color: "var(--teal)" },
};

export function FineTuning() {
  const [instrId, setInstrId] = useState(INSTRUCTIONS[0].id);
  const [course, setCourse] = useState<Course>("assistant");
  const [examples, setExamples] = useState(0);

  const instr = INSTRUCTIONS.find((i) => i.id === instrId)!;
  const courseMeta = COURSES.find((c) => c.value === course)!;
  const stage = stageFor(examples);
  const tunedText = stage === "base" ? instr.base : stage === "half" ? HALF[course] : instr.tuned[course];
  const trainPct = Math.min(100, (examples / 24) * 100);

  return (
    <div className="flex flex-col gap-5">
      {/* instruction picker */}
      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-subtle">Your instruction</p>
        <div className="flex flex-wrap gap-2">
          {INSTRUCTIONS.map((i) => (
            <button
              key={i.id}
              type="button"
              onClick={() => setInstrId(i.id)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                i.id === instrId
                  ? "border-accent bg-accent-soft text-accent"
                  : "border-border bg-surface-2 text-muted hover:text-foreground",
              )}
            >
              {i.text.length > 40 ? i.text.slice(0, 38) + "…" : i.text}
            </button>
          ))}
        </div>
      </div>

      {/* the two models, side by side */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* base */}
        <div className="flex flex-col rounded-2xl border border-border bg-surface-2/40 p-4">
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-border text-subtle">
              <FileText size={14} />
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground">Base model</p>
              <p className="text-[0.7rem] text-subtle">trained only to continue text</p>
            </div>
          </div>
          <p className="mt-3 flex-1 text-[0.95rem] leading-relaxed text-foreground/70">{instr.base}</p>
          <p className="mt-3 text-[0.7rem] italic text-subtle">It never answers — it just predicts more text.</p>
        </div>

        {/* fine-tuned */}
        <div
          className="flex flex-col rounded-2xl border bg-surface p-4 transition-colors"
          style={{ borderColor: `color-mix(in srgb, ${STAGE_META[stage].color} 45%, var(--border))` }}
        >
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-accent-soft text-accent">
              <GraduationCap size={14} />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">
                Fine-tuned model{stage === "tuned" && ` · ${courseMeta.label}`}
              </p>
              <p className="text-[0.7rem]" style={{ color: STAGE_META[stage].color }}>
                {STAGE_META[stage].label}
              </p>
            </div>
          </div>
          <div className="mt-3 flex-1">
            <AnimatePresence mode="wait">
              <motion.p
                key={stage + course + instrId}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25 }}
                className={cn(
                  "whitespace-pre-line text-[0.95rem] leading-relaxed",
                  stage === "base" ? "text-foreground/60" : "text-foreground",
                )}
              >
                {tunedText}
              </motion.p>
            </AnimatePresence>
          </div>
          {/* training progress */}
          <div className="mt-3">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
              <motion.div
                className="h-full rounded-full"
                style={{ background: STAGE_META[stage].color }}
                animate={{ width: `${trainPct}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* controls */}
      <div className="rounded-2xl border border-border bg-surface p-4">
        <Slider
          label={`Fine-tuning examples shown to it`}
          value={examples}
          min={0}
          max={24}
          step={1}
          accent="teal"
          onChange={(v) => setExamples(Math.round(v))}
          format={(v) => `${v}`}
        />
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-subtle">Fine-tune it into:</span>
            <SegmentedControl
              options={COURSES.map((c) => ({ value: c.value, label: c.label }))}
              value={course}
              onChange={setCourse}
            />
          </div>
          <button
            type="button"
            onClick={() => setExamples(0)}
            className="inline-flex items-center justify-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:text-foreground"
          >
            <RotateCcw size={13} /> Back to base
          </button>
        </div>
        <p className="mt-3 text-xs text-subtle">
          You taught it with examples like&nbsp;
          <span className="text-foreground/70">{courseMeta.example}</span>
        </p>
      </div>

      <p className="text-center text-xs text-subtle">
        Drag the slider up. The same model goes from rambling to <span className="text-foreground/80">obeying</span> —
        it didn&apos;t get smarter, it just learned the <span className="text-foreground/80">job</span>. That&apos;s
        fine-tuning.
      </p>
    </div>
  );
}
