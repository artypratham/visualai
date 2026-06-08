"use client";

import { useMemo, useState } from "react";
import { RotateCcw, Sparkles } from "lucide-react";
import { Slider, StatPill } from "@/components/ui/controls";
import { Button } from "@/components/ui/Button";
import { useThemeColors } from "@/lib/useThemeColors";
import { mulberry32 } from "@/lib/prng";

const W = 600;
const H = 340;
const padL = 50;
const padR = 20;
const padT = 24;
const padB = 36;
const plotW = W - padL - padR;
const plotH = H - padT - padB;
const r2 = (n: number) => Math.round(n * 100) / 100;
const toX = (skill: number) => r2(padL + skill * plotW);
const bandY = (group: 0 | 1) => r2(padT + (group === 0 ? 0.28 : 0.72) * plotH);

interface App {
  skill: number;
  group: 0 | 1; // 0 = A, 1 = B
}

function makeApplicants(seed: number): App[] {
  const rng = mulberry32(seed);
  return Array.from({ length: 90 }, (_, i) => ({ skill: rng(), group: (i % 2) as 0 | 1 }));
}

const FAIR_BAR = 0.5;

export function BiasedMachine() {
  const [bias, setBias] = useState(0.22);
  const [seed, setSeed] = useState(7);
  const c = useThemeColors({ teal: "--teal", rose: "--rose", accent: "--accent" });

  const apps = useMemo(() => makeApplicants(seed), [seed]);

  const { tA, tB, rateA, rateB, wronged } = useMemo(() => {
    // Historical (biased) labels: B needs to be 'bias' more skilled to have been hired.
    const thr = (g: 0 | 1) => {
      const bar = g === 0 ? FAIR_BAR : FAIR_BAR + bias;
      const grp = apps.filter((a) => a.group === g);
      const hires = grp.filter((a) => a.skill > bar).map((a) => a.skill);
      const rejects = grp.filter((a) => a.skill <= bar).map((a) => a.skill);
      if (!hires.length || !rejects.length) return bar;
      return (Math.min(...hires) + Math.max(...rejects)) / 2;
    };
    const tA = thr(0);
    const tB = thr(1);
    const rate = (g: 0 | 1, t: number) => {
      const grp = apps.filter((a) => a.group === g);
      return grp.filter((a) => a.skill > t).length / grp.length;
    };
    const wronged = apps.filter((a) => a.group === 1 && a.skill > FAIR_BAR && a.skill <= tB).length;
    return { tA, tB, rateA: rate(0, tA), rateB: rate(1, tB), wronged };
  }, [apps, bias]);

  const threshold = (g: 0 | 1) => (g === 0 ? tA : tB);

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_15rem]">
      <div>
        <div className="relative overflow-hidden rounded-2xl border border-border bg-surface">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
            {/* band labels */}
            <text x={12} y={bandY(0) + 4} fontSize={13} fontWeight={600} fill="var(--muted)">A</text>
            <text x={12} y={bandY(1) + 4} fontSize={13} fontWeight={600} fill="var(--muted)">B</text>
            {/* fair bar */}
            <line x1={toX(FAIR_BAR)} y1={padT} x2={toX(FAIR_BAR)} y2={padT + plotH} stroke="var(--subtle)" strokeWidth={1.5} strokeDasharray="4 5" />
            <text x={toX(FAIR_BAR)} y={H - 12} fontSize={11} fill="var(--subtle)" textAnchor="middle">truly qualified →</text>

            {/* per-group model thresholds */}
            {[0, 1].map((g) => (
              <line key={g} x1={toX(threshold(g as 0 | 1))} y1={bandY(g as 0 | 1) - 34} x2={toX(threshold(g as 0 | 1))} y2={bandY(g as 0 | 1) + 34} stroke={c.accent} strokeWidth={2.5} />
            ))}

            {/* applicants */}
            {apps.map((a, i) => {
              const t = threshold(a.group);
              const hired = a.skill > t;
              const wrong = a.group === 1 && a.skill > FAIR_BAR && !hired;
              const jitter = ((i * 53) % 22) - 11;
              return (
                <circle
                  key={i}
                  cx={toX(a.skill)}
                  cy={r2(bandY(a.group) + jitter)}
                  r={5}
                  fill={hired ? c.teal : "var(--surface-2)"}
                  stroke={wrong ? c.rose : hired ? "white" : "var(--border-strong)"}
                  strokeWidth={wrong ? 2.5 : 1.5}
                />
              );
            })}
          </svg>
          <div className="pointer-events-none absolute right-3 top-3 flex flex-col items-end gap-1 text-xs">
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{ background: c.teal }} /> model hires</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full border-2" style={{ borderColor: c.rose }} /> qualified, rejected</span>
          </div>
        </div>
        <p className="mt-2.5 text-center text-xs text-muted">
          Same skill axis for both groups. The purple lines are the bar the model sets for each group to get hired.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <Slider label="Bias baked into the history" value={bias} min={0} max={0.4} step={0.01} onChange={setBias} format={(v) => (v === 0 ? "none" : v.toFixed(2))} accent="rose" />
        <div className="grid grid-cols-2 gap-2.5">
          <StatPill label="Group A hired" value={`${Math.round(rateA * 100)}%`} accent={c.teal} />
          <StatPill label="Group B hired" value={`${Math.round(rateB * 100)}%`} accent={c.rose} />
        </div>
        <StatPill label="Qualified people rejected for being in group B" value={wronged} accent={wronged > 0 ? c.rose : c.teal} />

        <Button onClick={() => setBias(0)} disabled={bias === 0}>
          <Sparkles size={15} /> Remove the bias
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setSeed((s) => s + 1)}>
          <RotateCcw size={14} /> New applicants
        </Button>
        <p className="text-xs text-subtle">
          The model never sees &ldquo;fairness&rdquo; — only the past. Skew the past and it faithfully learns to demand more from group B.
        </p>
      </div>
    </div>
  );
}
