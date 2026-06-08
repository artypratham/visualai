"use client";

import { useMemo, useState } from "react";
import { Slider, SegmentedControl } from "@/components/ui/controls";
import { cn } from "@/lib/cn";

interface Sentence {
  id: string;
  label: string;
  tokens: string[];
  /** scores[query][key] — affinity before softmax. Missing pairs use BASE. */
  scores: Record<number, Record<number, number>>;
  defaultQuery: number;
}

const BASE = 0.7;

// Hand-authored attention patterns. A real transformer computes these numbers
// from the words; we've set them to reveal the patterns a trained model learns.
const SENTENCES: Sentence[] = [
  {
    id: "cat",
    label: "The tired cat",
    // 0 The 1 cat 2 sat 3 on 4 the 5 mat 6 because 7 it 8 was 9 tired 10 .
    tokens: ["The", "cat", "sat", "on", "the", "mat", "because", "it", "was", "tired", "."],
    scores: {
      2: { 1: 5, 5: 2.5 },
      5: { 3: 3, 4: 2.5, 1: 1.5 },
      7: { 1: 5.5, 5: 2, 9: 2 },
      9: { 1: 4.5, 7: 4 },
    },
    defaultQuery: 7,
  },
  {
    id: "big",
    label: "…because it was big",
    // 0 The 1 trophy 2 did 3 not 4 fit 5 in 6 the 7 suitcase 8 because 9 it 10 was 11 too 12 big 13 .
    tokens: ["The", "trophy", "did", "not", "fit", "in", "the", "suitcase", "because", "it", "was", "too", "big", "."],
    scores: {
      4: { 1: 4, 7: 4 },
      9: { 1: 5.5, 7: 1.8 },
      12: { 1: 5, 9: 2 },
    },
    defaultQuery: 9,
  },
  {
    id: "small",
    label: "…because it was small",
    tokens: ["The", "trophy", "did", "not", "fit", "in", "the", "suitcase", "because", "it", "was", "too", "small", "."],
    scores: {
      4: { 1: 4, 7: 4 },
      9: { 7: 5.5, 1: 1.8 },
      12: { 7: 5, 9: 2 },
    },
    defaultQuery: 9,
  },
];

function attentionRow(s: Sentence, q: number, temp: number): number[] {
  const row = s.tokens.map((_, k) => {
    const sc = s.scores[q]?.[k] ?? (k === q ? 1.5 : BASE);
    return Math.exp(sc / temp);
  });
  const sum = row.reduce((a, b) => a + b, 0);
  return row.map((v) => v / sum);
}

export function AttentionVisualizer() {
  const [sid, setSid] = useState("cat");
  const [temp, setTemp] = useState(1);
  const [view, setView] = useState<"flow" | "matrix">("flow");
  const sentence = SENTENCES.find((s) => s.id === sid)!;
  const [query, setQuery] = useState(sentence.defaultQuery);

  // keep query valid + reset to the interesting word when sentence changes
  const activeQuery = query < sentence.tokens.length ? query : sentence.defaultQuery;

  const weights = useMemo(() => attentionRow(sentence, activeQuery, temp), [sentence, activeQuery, temp]);
  const maxW = Math.max(...weights);

  const matrix = useMemo(
    () => sentence.tokens.map((_, q) => attentionRow(sentence, q, temp)),
    [sentence, temp],
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SegmentedControl
          value={sid}
          onChange={(v) => {
            setSid(v);
            const s = SENTENCES.find((x) => x.id === v)!;
            setQuery(s.defaultQuery);
          }}
          options={SENTENCES.map((s) => ({ value: s.id, label: s.label }))}
        />
        <SegmentedControl
          value={view}
          onChange={setView}
          options={[
            { value: "flow", label: "Words" },
            { value: "matrix", label: "Grid" },
          ]}
        />
      </div>

      {view === "flow" ? (
        <div className="rounded-2xl border border-border bg-surface p-6">
          <p className="mb-4 text-sm text-muted">
            Click any word to make it the <span className="font-medium text-foreground">query</span> — the other
            words light up by how much it pays attention to them.
          </p>
          <div className="flex flex-wrap gap-1.5 text-lg">
            {sentence.tokens.map((tok, k) => {
              const isQuery = k === activeQuery;
              const w = weights[k];
              const rel = w / maxW;
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => setQuery(k)}
                  className={cn(
                    "relative rounded-lg px-2.5 py-1 transition-all",
                    isQuery ? "ring-2 ring-accent" : "hover:ring-1 hover:ring-border-strong",
                  )}
                  style={{
                    backgroundColor: isQuery
                      ? "var(--accent-soft)"
                      : `color-mix(in srgb, var(--accent) ${Math.round(rel * 80)}%, transparent)`,
                    color: !isQuery && rel > 0.55 ? "var(--accent-fg)" : "var(--foreground)",
                  }}
                >
                  {tok}
                  {!isQuery && (
                    <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 font-mono text-[0.6rem] text-subtle">
                      {Math.round(w * 100)}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <p className="mt-8 text-sm text-muted">
            <span className="font-semibold text-accent">{sentence.tokens[activeQuery]}</span> attends most to{" "}
            <span className="font-semibold text-foreground">
              {sentence.tokens[weights.indexOf(maxW)]}
            </span>
            . The small numbers are attention percentages.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-surface p-5">
          <div className="inline-grid gap-1" style={{ gridTemplateColumns: `auto repeat(${sentence.tokens.length}, 1.6rem)` }}>
            <div />
            {sentence.tokens.map((t, i) => (
              <div key={`c${i}`} className="flex h-16 items-end justify-center">
                <span className="origin-bottom -rotate-90 whitespace-nowrap text-[0.7rem] text-muted">{t}</span>
              </div>
            ))}
            {matrix.map((row, q) => (
              <Row key={q} label={sentence.tokens[q]} row={row} q={q} active={q === activeQuery} onPick={() => setQuery(q)} />
            ))}
          </div>
          <p className="mt-4 text-xs text-muted">
            Each row is one word&apos;s attention across all the others. Brighter = more attention.
          </p>
        </div>
      )}

      <div className="rounded-2xl border border-border bg-surface-2/50 p-4">
        <Slider
          label="Attention sharpness (temperature)"
          value={temp}
          min={0.3}
          max={3}
          step={0.05}
          onChange={setTemp}
          format={(v) => v.toFixed(2)}
        />
        <p className="mt-2 text-xs text-subtle">
          Low = lock onto one word. High = spread attention thinly across everything.
        </p>
      </div>
    </div>
  );
}

function Row({ label, row, active, onPick }: { label: string; row: number[]; q: number; active: boolean; onPick: () => void }) {
  return (
    <>
      <button
        type="button"
        onClick={onPick}
        className={cn("pr-2 text-right text-[0.7rem] font-medium", active ? "text-accent" : "text-muted hover:text-foreground")}
      >
        {label}
      </button>
      {row.map((w, k) => (
        <div
          key={k}
          className="h-6 w-[1.6rem] rounded-[3px]"
          title={`${Math.round(w * 100)}%`}
          style={{ backgroundColor: `color-mix(in srgb, var(--accent) ${Math.round(w * 100)}%, var(--surface-2))` }}
        />
      ))}
    </>
  );
}
