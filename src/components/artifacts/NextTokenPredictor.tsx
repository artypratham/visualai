"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Dice5, RotateCcw, Sparkles, Square, Trophy } from "lucide-react";
import { motion } from "motion/react";
import { Slider } from "@/components/ui/controls";
import { Button } from "@/components/ui/Button";

// A tiny hand-built "language model": last word -> weighted next words. Real LLMs
// learn billions of these probabilities; the mechanism you feel is identical.
const MODEL: Record<string, [string, number][]> = {
  the: [["mat", 5], ["sofa", 3], ["warm", 3], ["floor", 2], ["garden", 2], ["window", 2], ["sun", 2]],
  cat: [["sat", 4], ["purred", 3], ["slept", 2], ["yawned", 2], ["was", 2]],
  sat: [["on", 6], ["quietly", 2], ["down", 2]],
  on: [["the", 8], ["top", 1]],
  mat: [["and", 4], [".", 3], ["by", 2]],
  and: [["looked", 3], ["fell", 2], ["the", 3], ["purred", 2], ["stretched", 2]],
  looked: [["out", 3], ["around", 2], ["up", 2], ["at", 2]],
  out: [["of", 3], ["the", 2], ["at", 2]],
  of: [["the", 6], ["course", 1]],
  window: [["and", 3], [",", 2], [".", 2]],
  fell: [["asleep", 5], ["down", 1]],
  asleep: [[".", 5], ["quickly", 2]],
  warm: [["sun", 3], ["and", 2], [".", 2]],
  sun: [[".", 3], ["shone", 2], ["warmed", 2]],
  shone: [["brightly", 3], [".", 2]],
  brightly: [[".", 4], ["and", 2]],
  warmed: [["the", 4], ["up", 2]],
  purred: [["softly", 3], [".", 3], ["and", 2]],
  softly: [[".", 4], ["and", 2]],
  slept: [[".", 4], ["peacefully", 2]],
  peacefully: [[".", 5]],
  yawned: [["and", 3], [".", 3]],
  was: [["warm", 3], ["tired", 3], ["happy", 2], ["sunny", 2], ["soft", 2], ["quiet", 2]],
  tired: [[".", 4], ["and", 2]],
  happy: [[".", 4], ["and", 2]],
  sunny: [[".", 3], ["and", 2], ["today", 1]],
  soft: [["and", 2], [".", 3]],
  quiet: [[".", 3], ["and", 2]],
  garden: [[".", 3], [",", 2], ["where", 2]],
  where: [["the", 4], ["it", 2]],
  it: [["was", 4], ["slept", 2], ["purred", 2]],
  sofa: [["and", 3], [".", 2], ["by", 2]],
  floor: [[".", 3], ["and", 2]],
  by: [["the", 6]],
  down: [["on", 3], [".", 2], ["and", 2]],
  top: [["of", 6]],
  around: [["the", 4], [".", 2]],
  up: [["at", 3], [".", 2], ["and", 2]],
  at: [["the", 5], ["it", 2], ["me", 2]],
  me: [[".", 3]],
  quickly: [[".", 4]],
  stretched: [["and", 3], [".", 2]],
  course: [[".", 3]],
  weather: [["was", 4], ["today", 3], ["is", 3]],
  today: [["was", 3], ["is", 3], ["the", 2], ["it", 2]],
  is: [["warm", 3], ["sunny", 3], ["cold", 2], ["nice", 2], ["lovely", 2]],
  cold: [[".", 3], ["and", 2]],
  nice: [[".", 3], ["and", 2]],
  lovely: [[".", 3], ["and", 2]],
  ",": [["and", 3], ["the", 2], ["but", 2], ["so", 2]],
  but: [["the", 3], ["it", 2]],
  so: [["the", 2], ["it", 2], ["warm", 2]],
};

const PROMPTS: Record<string, string[]> = {
  "The cat sat on the": ["The", "cat", "sat", "on", "the"],
  "The weather today was": ["The", "weather", "today", "was"],
};

function candidatesFor(tokens: string[]): [string, number][] {
  const last = tokens[tokens.length - 1]?.toLowerCase() ?? "";
  return MODEL[last] ?? [];
}

function distribution(cands: [string, number][], T: number) {
  if (!cands.length) return [] as { t: string; p: number }[];
  const logits = cands.map(([t, w]) => [t, Math.log(w) / T] as [string, number]);
  const max = Math.max(...logits.map((l) => l[1]));
  const exps = logits.map(([t, l]) => [t, Math.exp(l - max)] as [string, number]);
  const sum = exps.reduce((a, [, e]) => a + e, 0);
  return exps.map(([t, e]) => ({ t, p: e / sum })).sort((a, b) => b.p - a.p);
}

function renderText(tokens: string[]) {
  const s = tokens.reduce((acc, t, i) => (t === "." || t === "," ? acc + t : acc + (i === 0 ? "" : " ") + t), "");
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function NextTokenPredictor() {
  const [promptKey, setPromptKey] = useState("The cat sat on the");
  const [tokens, setTokens] = useState<string[]>(PROMPTS["The cat sat on the"]);
  const [temp, setTemp] = useState(0.8);
  const [auto, setAuto] = useState(false);
  const tokensRef = useRef(tokens);
  tokensRef.current = tokens;

  const dist = useMemo(() => distribution(candidatesFor(tokens), temp), [tokens, temp]);
  const ended = dist.length === 0;

  const append = useCallback((t: string) => setTokens((prev) => [...prev, t]), []);

  const sample = useCallback(() => {
    const d = distribution(candidatesFor(tokensRef.current), temp);
    if (!d.length) return null;
    let r = Math.random();
    for (const { t, p } of d) {
      r -= p;
      if (r <= 0) return t;
    }
    return d[d.length - 1].t;
  }, [temp]);

  // auto-write loop
  useEffect(() => {
    if (!auto) return;
    const id = setInterval(() => {
      const t = sample();
      if (!t || tokensRef.current.length > 38) {
        setAuto(false);
        return;
      }
      append(t);
      if (t === ".") setAuto(false);
    }, 420);
    return () => clearInterval(id);
  }, [auto, sample, append]);

  const reset = (key = promptKey) => {
    setAuto(false);
    setTokens(PROMPTS[key]);
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_17rem]">
      {/* Generated text */}
      <div className="flex flex-col">
        <div className="min-h-[8rem] flex-1 rounded-2xl border border-border bg-surface p-5 text-lg leading-relaxed">
          <span className="text-foreground">{renderText(tokens)}</span>
          {!ended && <span className="ml-0.5 inline-block h-5 w-[3px] translate-y-1 animate-pulse rounded bg-accent align-middle" />}
          {ended && <span className="ml-2 text-sm text-subtle">— the model predicted an ending.</span>}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-full border border-border bg-surface-2 p-1 text-sm">
            {Object.keys(PROMPTS).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => {
                  setPromptKey(k);
                  reset(k);
                }}
                className={`rounded-full px-3 py-1 font-medium transition-colors ${k === promptKey ? "bg-accent text-accent-fg" : "text-muted hover:text-foreground"}`}
              >
                {k}…
              </button>
            ))}
          </div>
          <Button variant="ghost" size="sm" onClick={() => reset()}>
            <RotateCcw size={14} /> Reset
          </Button>
        </div>
      </div>

      {/* Prediction panel */}
      <div className="flex flex-col gap-4">
        <div>
          <p className="mb-2.5 text-sm font-medium text-muted">
            {ended ? "No more predictions" : "What word comes next?"}
          </p>
          <div className="flex flex-col gap-1.5">
            {dist.slice(0, 6).map((d, i) => (
              <button
                key={d.t}
                type="button"
                onClick={() => append(d.t)}
                disabled={auto}
                className="group relative overflow-hidden rounded-lg border border-border bg-surface px-3 py-2 text-left transition-colors hover:border-accent disabled:opacity-60"
              >
                <motion.span
                  className="absolute inset-y-0 left-0 rounded-lg"
                  style={{ background: i === 0 ? "var(--accent-soft)" : "var(--surface-2)" }}
                  animate={{ width: `${Math.max(4, d.p * 100)}%` }}
                  transition={{ type: "spring", stiffness: 200, damping: 26 }}
                />
                <span className="relative flex items-center justify-between gap-2">
                  <span className="font-medium text-foreground">{d.t === "." ? "·  (end)" : d.t}</span>
                  <span className="font-mono text-xs tabular-nums text-muted">{Math.round(d.p * 100)}%</span>
                </span>
              </button>
            ))}
            {ended && <p className="rounded-lg border border-dashed border-border-strong px-3 py-4 text-center text-sm text-subtle">Reset to write again.</p>}
          </div>
        </div>

        <div className="flex gap-2">
          <Button className="flex-1" size="sm" onClick={() => append(sample()!)} disabled={ended || auto}>
            <Dice5 size={15} /> Sample
          </Button>
          <Button variant="secondary" size="sm" aria-label="Most likely" onClick={() => append(dist[0].t)} disabled={ended || auto}>
            <Trophy size={15} />
          </Button>
        </div>
        <Button variant="secondary" size="sm" onClick={() => setAuto((a) => !a)} disabled={ended && !auto}>
          {auto ? <Square size={14} /> : <Sparkles size={15} />}
          {auto ? "Stop" : "Auto-write"}
        </Button>

        <Slider label="Temperature" value={temp} min={0.2} max={2} step={0.05} onChange={setTemp} format={(v) => v.toFixed(2)} />
        <p className="text-xs text-subtle">
          Low → safe &amp; repetitive (always the top word). High → creative &amp; chaotic.
        </p>
      </div>
    </div>
  );
}
