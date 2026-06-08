"use client";

import { useMemo, useState } from "react";
import { RotateCcw } from "lucide-react";
import { Slider, StatPill } from "@/components/ui/controls";
import { Button } from "@/components/ui/Button";
import { useThemeColors } from "@/lib/useThemeColors";
import { mulberry32, gaussian } from "@/lib/prng";

const W = 600;
const H = 400;
const padL = 16;
const padR = 16;
const padT = 16;
const padB = 16;
const plotW = W - padL - padR;
const plotH = H - padT - padB;

const truth = (x: number) => 0.5 + 0.33 * Math.sin(x * Math.PI * 2 * 1.1);
// Round rendered coords so 1-ULP differences in Math.sin/sqrt/log between the
// SSR (Node) and client (browser) engines don't trip a hydration mismatch.
const r2 = (n: number) => Math.round(n * 100) / 100;
const toPx = (x: number) => r2(padL + x * plotW);
const toPy = (y: number) => r2(padT + plotH - y * plotH);

interface Pt {
  x: number;
  y: number;
}

function makeData(seed: number, noise: number): { train: Pt[]; test: Pt[] } {
  const rng = mulberry32(seed);
  const gen = (n: number): Pt[] =>
    Array.from({ length: n }, () => {
      const x = 0.04 + rng() * 0.92;
      return { x, y: truth(x) + gaussian(rng) * noise };
    }).sort((a, b) => a.x - b.x);
  return { train: gen(10), test: gen(10) };
}

// Ridge least-squares polynomial fit on u = 2x-1 for conditioning.
function fitPoly(pts: Pt[], degree: number): number[] {
  const m = degree + 1;
  const A: number[][] = Array.from({ length: m }, () => new Array(m).fill(0));
  const b: number[] = new Array(m).fill(0);
  for (const p of pts) {
    const u = 2 * p.x - 1;
    const powers = [1];
    for (let j = 1; j < m; j++) powers.push(powers[j - 1] * u);
    for (let i = 0; i < m; i++) {
      b[i] += powers[i] * p.y;
      for (let j = 0; j < m; j++) A[i][j] += powers[i] * powers[j];
    }
  }
  for (let i = 0; i < m; i++) A[i][i] += 1e-7; // ridge
  return solve(A, b);
}

function solve(A: number[][], b: number[]): number[] {
  const n = b.length;
  const M = A.map((row, i) => [...row, b[i]]);
  for (let col = 0; col < n; col++) {
    let piv = col;
    for (let r = col + 1; r < n; r++) if (Math.abs(M[r][col]) > Math.abs(M[piv][col])) piv = r;
    [M[col], M[piv]] = [M[piv], M[col]];
    const d = M[col][col] || 1e-12;
    for (let j = col; j <= n; j++) M[col][j] /= d;
    for (let r = 0; r < n; r++) {
      if (r === col) continue;
      const f = M[r][col];
      for (let j = col; j <= n; j++) M[r][j] -= f * M[col][j];
    }
  }
  return M.map((row) => row[n]);
}

const evalPoly = (w: number[], x: number) => {
  const u = 2 * x - 1;
  let p = 1;
  let s = 0;
  for (const c of w) {
    s += c * p;
    p *= u;
  }
  return s;
};

const mse = (w: number[], pts: Pt[]) => pts.reduce((a, p) => a + (evalPoly(w, p.x) - p.y) ** 2, 0) / pts.length;

export function OverfitPlayground() {
  const [degree, setDegree] = useState(3);
  const [noise, setNoise] = useState(0.07);
  const [seed, setSeed] = useState(11);
  const [showTruth, setShowTruth] = useState(true);

  const c = useThemeColors({ teal: "--teal", rose: "--rose", accent: "--accent", grid: "--border" });
  const { train, test } = useMemo(() => makeData(seed, noise), [seed, noise]);
  const w = useMemo(() => fitPoly(train, degree), [train, degree]);

  const trainErr = mse(w, train);
  const testErr = mse(w, test);

  const curve = useMemo(() => {
    const pts: string[] = [];
    for (let i = 0; i <= 200; i++) {
      const x = i / 200;
      pts.push(`${toPx(x).toFixed(1)},${toPy(evalPoly(w, x)).toFixed(1)}`);
    }
    return pts.join(" ");
  }, [w]);

  const ratio = testErr / (trainErr + 1e-6);
  const verdict =
    trainErr > 0.02 && ratio < 2.2
      ? { label: "Underfitting — too simple", color: c.accent }
      : ratio > 3 && testErr > 0.01
        ? { label: "Overfitting — memorising the noise", color: c.rose }
        : { label: "Good fit — it learned the pattern", color: c.teal };

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_15rem]">
      <div>
        <div className="relative overflow-hidden rounded-2xl border border-border bg-surface">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
            <defs>
              <clipPath id="ofplot">
                <rect x={padL} y={padT} width={plotW} height={plotH} />
              </clipPath>
            </defs>
            {[0.25, 0.5, 0.75].map((t) => (
              <line key={t} x1={padL} y1={toPy(t)} x2={padL + plotW} y2={toPy(t)} stroke={c.grid} strokeWidth={1} opacity={0.5} />
            ))}

            {showTruth && (
              <polyline
                points={Array.from({ length: 101 }, (_, i) => `${toPx(i / 100).toFixed(1)},${toPy(truth(i / 100)).toFixed(1)}`).join(" ")}
                fill="none"
                stroke="var(--subtle)"
                strokeWidth={2}
                strokeDasharray="5 6"
                clipPath="url(#ofplot)"
              />
            )}

            <polyline points={curve} fill="none" stroke={c.accent} strokeWidth={3} clipPath="url(#ofplot)" />

            {/* test points (hollow) */}
            {test.map((p, i) => (
              <circle key={`te${i}`} cx={toPx(p.x)} cy={toPy(p.y)} r={5.5} fill="var(--surface)" stroke={c.rose} strokeWidth={2.5} />
            ))}
            {/* train points (solid) */}
            {train.map((p, i) => (
              <circle key={`tr${i}`} cx={toPx(p.x)} cy={toPy(p.y)} r={5.5} fill={c.teal} stroke="white" strokeWidth={1.5} />
            ))}
          </svg>
          <div className="pointer-events-none absolute left-3 top-3 flex flex-col gap-1 text-xs">
            <span className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: c.teal }} /> training data (it learns from)</span>
            <span className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded-full border-2" style={{ borderColor: c.rose, background: "var(--surface)" }} /> test data (it&apos;s graded on)</span>
          </div>
        </div>
        <div className="mt-3 rounded-xl px-4 py-2.5 text-center text-sm font-semibold" style={{ background: `color-mix(in srgb, ${verdict.color} 14%, transparent)`, color: verdict.color }}>
          {verdict.label}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <Slider label="Model complexity (polynomial degree)" value={degree} min={1} max={12} step={1} onChange={(v) => setDegree(Math.round(v))} />
        <div className="grid grid-cols-2 gap-2.5">
          <StatPill label="Training error" value={trainErr.toFixed(3)} accent={c.teal} />
          <StatPill label="Test error" value={testErr.toFixed(3)} accent={c.rose} />
        </div>
        <Slider label="Noise in the data" value={noise} min={0} max={0.16} step={0.005} onChange={setNoise} format={(v) => v.toFixed(3)} />

        <button
          type="button"
          onClick={() => setShowTruth((s) => !s)}
          className="flex items-center justify-between rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-border-strong"
        >
          Show the true pattern
          <span className={`relative h-5 w-9 rounded-full transition-colors ${showTruth ? "bg-accent" : "bg-border-strong"}`}>
            <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${showTruth ? "left-[1.125rem]" : "left-0.5"}`} />
          </span>
        </button>

        <Button variant="ghost" size="sm" className="mt-auto" onClick={() => setSeed((s) => s + 1)}>
          <RotateCcw size={14} /> New random data
        </Button>
        <p className="text-xs text-subtle">
          Push the degree to 10+ and watch the curve thread every training dot perfectly — while the test error explodes.
        </p>
      </div>
    </div>
  );
}
