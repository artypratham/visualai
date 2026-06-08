"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Pause, Play, RotateCcw, StepForward } from "lucide-react";
import { Slider, StatPill } from "@/components/ui/controls";
import { Button } from "@/components/ui/Button";
import { useThemeColors } from "@/lib/useThemeColors";
import { mulberry32, gaussian } from "@/lib/prng";

const S = 440;
type P = { x: number; y: number };

function makePoints(): P[] {
  const rng = mulberry32(99);
  const centers = [[0.26, 0.3], [0.72, 0.26], [0.3, 0.73], [0.73, 0.72]];
  const pts: P[] = [];
  for (const [cx, cy] of centers)
    for (let i = 0; i < 30; i++)
      pts.push({
        x: Math.min(0.97, Math.max(0.03, cx + gaussian(rng) * 0.07)),
        y: Math.min(0.97, Math.max(0.03, cy + gaussian(rng) * 0.07)),
      });
  return pts;
}

function initCentroids(points: P[], k: number, seed: number): P[] {
  const rng = mulberry32(seed);
  const idxs = new Set<number>();
  while (idxs.size < k) idxs.add(Math.floor(rng() * points.length));
  return [...idxs].map((i) => ({ ...points[i] }));
}

// Round rendered coords so 1-ULP differences in Math.sqrt/log/cos between the
// SSR (Node) and client (browser) engines don't trip a hydration mismatch.
const r2 = (n: number) => Math.round(n * 100) / 100;
const toX = (x: number) => r2(x * S);
const toY = (y: number) => r2(y * S);

export function KMeansLive() {
  const points = useMemo(makePoints, []);
  const [k, setK] = useState(4);
  const [seed, setSeed] = useState(3);
  const [centroids, setCentroids] = useState<P[]>(() => initCentroids(makePoints(), 4, 3));
  const [assign, setAssign] = useState<number[] | null>(null);
  const [iter, setIter] = useState(0);
  const [running, setRunning] = useState(false);
  const [converged, setConverged] = useState(false);

  const cc = useThemeColors({ teal: "--teal", rose: "--rose", accent: "--accent", amber: "--amber" });
  const palette = [cc.teal, cc.rose, cc.accent, cc.amber, "#3b82f6"];

  const reset = useCallback(
    (kk: number, sd: number) => {
      setCentroids(initCentroids(points, kk, sd));
      setAssign(null);
      setIter(0);
      setConverged(false);
      setRunning(false);
    },
    [points],
  );

  // re-init when k changes
  useEffect(() => {
    reset(k, seed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [k]);

  const step = useCallback(() => {
    setCentroids((cents) => {
      // assign
      const a = points.map((p) => {
        let best = 0;
        let bd = Infinity;
        cents.forEach((c, ci) => {
          const d = (c.x - p.x) ** 2 + (c.y - p.y) ** 2;
          if (d < bd) {
            bd = d;
            best = ci;
          }
        });
        return best;
      });
      setAssign(a);
      // update
      const next = cents.map((c, ci) => {
        const members = points.filter((_, i) => a[i] === ci);
        if (members.length === 0) return c;
        return {
          x: members.reduce((s, m) => s + m.x, 0) / members.length,
          y: members.reduce((s, m) => s + m.y, 0) / members.length,
        };
      });
      const moved = next.reduce((s, n, i) => s + Math.hypot(n.x - cents[i].x, n.y - cents[i].y), 0);
      if (moved < 0.001) {
        setConverged(true);
        setRunning(false);
      }
      return next;
    });
    setIter((i) => i + 1);
  }, [points]);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(step, 650);
    return () => clearInterval(id);
  }, [running, step]);

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_15rem]">
      <div>
        <div className="relative mx-auto aspect-square w-full max-w-[440px] overflow-hidden rounded-2xl border border-border bg-surface-2">
          <svg viewBox={`0 0 ${S} ${S}`} className="h-full w-full">
            {points.map((p, i) => (
              <circle
                key={i}
                cx={toX(p.x)}
                cy={toY(p.y)}
                r={4.5}
                fill={assign ? palette[assign[i]] : "var(--subtle)"}
                opacity={assign ? 0.95 : 0.6}
                style={{ transition: "fill 0.35s" }}
              />
            ))}
            {centroids.map((c, i) => (
              <g key={i} style={{ transition: "transform 0.5s var(--ease-out-expo)" }}>
                <circle cx={toX(c.x)} cy={toY(c.y)} r={13} fill={palette[i]} stroke="white" strokeWidth={3} style={{ transition: "cx 0.5s, cy 0.5s" }} />
                <circle cx={toX(c.x)} cy={toY(c.y)} r={5} fill="white" style={{ transition: "cx 0.5s, cy 0.5s" }} />
              </g>
            ))}
          </svg>
          {!assign && (
            <div className="pointer-events-none absolute inset-x-0 top-3 text-center text-xs text-muted">
              120 points, zero labels. Press <span className="font-semibold text-foreground">Step</span> to find the groups.
            </div>
          )}
        </div>
        <p className="mt-2.5 text-center text-xs text-muted">
          Big markers are cluster centres. Each step: colour every point by its nearest centre, then move each centre to the middle of its colour.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <Slider label="Number of clusters (k)" value={k} min={2} max={5} step={1} onChange={(v) => setK(Math.round(v))} />
        <div className="grid grid-cols-2 gap-2.5">
          <StatPill label="Iteration" value={iter} />
          <StatPill label="Status" value={converged ? "settled" : assign ? "learning" : "ready"} accent={converged ? cc.teal : undefined} />
        </div>

        <div className="flex gap-2">
          <Button className="flex-1" onClick={() => setRunning((r) => !r)} disabled={converged}>
            {running ? <Pause size={15} /> : <Play size={15} />}
            {running ? "Pause" : "Auto-run"}
          </Button>
          <Button variant="secondary" size="md" aria-label="Step" onClick={step} disabled={running || converged}>
            <StepForward size={15} />
          </Button>
        </div>
        <Button variant="ghost" size="sm" onClick={() => { const s = Math.floor(Math.random() * 1e6); setSeed(s); reset(k, s); }}>
          <RotateCcw size={14} /> Re-seed the centres
        </Button>
        <p className="text-xs text-subtle">
          No one labelled these points. The algorithm finds structure on its own — that&apos;s unsupervised learning.
        </p>
      </div>
    </div>
  );
}
