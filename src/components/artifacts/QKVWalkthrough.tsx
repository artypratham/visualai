"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { mulberry32 } from "@/lib/prng";

/**
 * Attention with the hood fully open: the actual matrices, computed live.
 * Six steps from raw embeddings X to the attended output O = softmax(QKᵀ/√d)·V,
 * every number visible as a signed heatmap.
 */

const TOKENS = ["the", "cat", "sat"];
const D_MODEL = 4;
const D_K = 3;

type Mat = number[][];
const r2 = (n: number) => Math.round(n * 100) / 100;

function randMat(rows: number, cols: number, seed: number, scale = 1): Mat {
  const rng = mulberry32(seed);
  return Array.from({ length: rows }, () => Array.from({ length: cols }, () => r2((rng() * 2 - 1) * scale)));
}
function matmul(a: Mat, b: Mat): Mat {
  return a.map((row) => b[0].map((_, j) => r2(row.reduce((s, v, k) => s + v * b[k][j], 0))));
}
function softmaxRows(m: Mat): Mat {
  return m.map((row) => {
    const mx = Math.max(...row);
    const ex = row.map((v) => Math.exp(v - mx));
    const sum = ex.reduce((a, b) => a + b, 0);
    return ex.map((v) => r2(v / sum));
  });
}

function Matrix({ m, label, rowLabels, highlight }: { m: Mat; label: string; rowLabels?: string[]; highlight?: boolean }) {
  const maxAbs = Math.max(0.6, ...m.flat().map(Math.abs));
  return (
    <div className={highlight ? "rounded-xl ring-2 ring-accent/60 ring-offset-2 ring-offset-[var(--surface)]" : ""}>
      <p className="mb-1.5 text-center font-mono text-xs font-semibold text-foreground">{label}</p>
      <div className="inline-grid gap-0.5" style={{ gridTemplateColumns: `${rowLabels ? "auto " : ""}repeat(${m[0].length}, minmax(2.6rem, auto))` }}>
        {m.map((row, i) => (
          <Row key={i} row={row} label={rowLabels?.[i]} maxAbs={maxAbs} />
        ))}
      </div>
    </div>
  );
}
function Row({ row, label, maxAbs }: { row: number[]; label?: string; maxAbs: number }) {
  return (
    <>
      {label !== undefined && (
        <span className="flex items-center justify-end pr-1.5 font-mono text-[0.65rem] text-subtle">{label}</span>
      )}
      {row.map((v, j) => {
        const t = Math.min(1, Math.abs(v) / maxAbs);
        const col = v >= 0 ? "var(--teal)" : "var(--rose)";
        return (
          <span
            key={j}
            className="rounded-[5px] px-1 py-1.5 text-center font-mono text-[0.7rem] tabular-nums text-foreground"
            style={{ background: `color-mix(in srgb, ${col} ${Math.round(t * 55)}%, var(--surface-2))` }}
          >
            {v.toFixed(2)}
          </span>
        );
      })}
    </>
  );
}

export function QKVWalkthrough() {
  const data = useMemo(() => {
    const X = randMat(TOKENS.length, D_MODEL, 11, 0.9);
    const Wq = randMat(D_MODEL, D_K, 21, 0.8);
    const Wk = randMat(D_MODEL, D_K, 22, 0.8);
    const Wv = randMat(D_MODEL, D_K, 23, 0.8);
    const Q = matmul(X, Wq);
    const K = matmul(X, Wk);
    const S = matmul(Q, K.map((_, j) => K.map((row) => row[j]))); // Q · Kᵀ
    const Sc = S.map((row) => row.map((v) => r2(v / Math.sqrt(D_K))));
    const A = softmaxRows(Sc);
    const V = matmul(X, Wv);
    const O = matmul(A, V);
    return { X, Q, K, V, S, Sc, A, O };
  }, []);

  const steps = [
    {
      title: "1 · Start: each token is a vector",
      body: "Three tokens, each a row of 4 numbers — their embeddings from the Words-as-Numbers lesson. This matrix X is all the model knows.",
      view: <Matrix m={data.X} label={`X  (${TOKENS.length}×${D_MODEL})`} rowLabels={TOKENS} highlight />,
    },
    {
      title: "2 · Three learned projections: Q, K, V",
      body: "Multiply X by three learned weight matrices to get a query (what am I looking for?), a key (what do I offer?), and a value (what do I carry?) for every token.",
      view: (
        <div className="flex flex-wrap items-start justify-center gap-5">
          <Matrix m={data.Q} label="Q = X·Wq" rowLabels={TOKENS} highlight />
          <Matrix m={data.K} label="K = X·Wk" rowLabels={TOKENS} highlight />
          <Matrix m={data.V} label="V = X·Wv" rowLabels={TOKENS} highlight />
        </div>
      ),
    },
    {
      title: "3 · Compare every query with every key",
      body: "Q·Kᵀ — a dot product between each token's query and each token's key. Cell (i, j) = how much token i's question matches token j's offer. Bigger dot product, stronger match.",
      view: <Matrix m={data.S} label="S = Q·Kᵀ  (3×3)" rowLabels={TOKENS} highlight />,
    },
    {
      title: "4 · Scale it down by √dₖ",
      body: "Divide by √3. With longer vectors the dot products grow, which would push softmax into saturated all-or-nothing territory. The √dₖ keeps the scores in a workable range — this is the 'scaled' in scaled dot-product attention.",
      view: <Matrix m={data.Sc} label="S / √dₖ" rowLabels={TOKENS} highlight />,
    },
    {
      title: "5 · Softmax each row → attention weights",
      body: "Each row becomes a probability distribution that sums to 1: how token i divides its attention across all tokens. These are exactly the percentages you saw in the main artifact.",
      view: <Matrix m={data.A} label="A = softmax(S/√dₖ)" rowLabels={TOKENS} highlight />,
    },
    {
      title: "6 · Blend the values: O = A·V",
      body: "Each token's output is a weighted average of every token's value vector, weighted by its attention row. Context has now been mixed in: this O goes on to the next layer.",
      view: (
        <div className="flex flex-wrap items-start justify-center gap-5">
          <Matrix m={data.A} label="A" rowLabels={TOKENS} />
          <Matrix m={data.V} label="V" rowLabels={TOKENS} />
          <Matrix m={data.O} label="O = A·V" rowLabels={TOKENS} highlight />
        </div>
      ),
    },
  ];

  const [step, setStep] = useState(0);
  const s = steps[step];

  return (
    <div className="w-full">
      <div className="rounded-2xl border border-border bg-surface p-5">
        <p className="font-display text-lg font-medium text-foreground">{s.title}</p>
        <p className="mt-1.5 text-sm leading-relaxed text-muted">{s.body}</p>
        <div className="mt-5 flex justify-center overflow-x-auto py-2">{s.view}</div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <Button variant="secondary" size="sm" onClick={() => setStep((v) => Math.max(0, v - 1))} disabled={step === 0}>
          <ArrowLeft size={14} /> Back
        </Button>
        <div className="flex gap-1.5">
          {steps.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Step ${i + 1}`}
              onClick={() => setStep(i)}
              className="h-2 rounded-full transition-all"
              style={{ width: i === step ? 22 : 8, background: i === step ? "var(--accent)" : "var(--border-strong)" }}
            />
          ))}
        </div>
        <Button size="sm" onClick={() => setStep((v) => Math.min(steps.length - 1, v + 1))} disabled={step === steps.length - 1}>
          Next <ArrowRight size={14} />
        </Button>
      </div>
      <p className="mt-3 text-center text-xs text-subtle">
        Real numbers, computed live — teal = positive, rose = negative. One head; real models run dozens in parallel.
      </p>
    </div>
  );
}
